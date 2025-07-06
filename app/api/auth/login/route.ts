import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createHash } from 'crypto'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const { identifier, password } = await request.json()
    
    // Validate required fields
    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Find user by student_id, username, or mobile_phone
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .or(`student_id.eq.${identifier},username.eq.${identifier},mobile_phone.eq.${identifier}`)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const passwordHash = createHash('sha256')
      .update(password)
      .digest('hex')

    if (user.password_hash !== passwordHash) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate session token
    const sessionToken = uuidv4()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // Token expires in 7 days

    // Store session in database
    const { error: sessionError } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        token: sessionToken,
        expires_at: expiresAt.toISOString()
      })

    if (sessionError) {
      console.error('Session creation error:', sessionError)
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      )
    }

    // Update last login timestamp
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id)

    // Set session cookie
    cookies().set({
      name: 'session_token',
      value: sessionToken,
      expires: expiresAt,
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })

    // Return user data
    return NextResponse.json({
      user: {
        id: user.id,
        student_id: user.student_id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        is_verified: user.is_verified,
        avatar_url: user.avatar_url
      },
      redirect: user.role === 'admin' ? '/admin' : '/dashboard'
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 