import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createHash } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { student_id, username, mobile_phone, full_name, password } = await request.json()
    
    // Validate required fields
    if (!student_id || !username || !mobile_phone || !full_name || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if student ID already exists
    const { data: existingStudentId } = await supabase
      .from('users')
      .select('student_id')
      .eq('student_id', student_id)
      .single()

    if (existingStudentId) {
      return NextResponse.json(
        { error: 'Student ID already registered' },
        { status: 409 }
      )
    }

    // Check if username already exists
    const { data: existingUsername } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single()

    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      )
    }

    // Check if mobile phone already exists
    const { data: existingMobilePhone } = await supabase
      .from('users')
      .select('mobile_phone')
      .eq('mobile_phone', mobile_phone)
      .single()

    if (existingMobilePhone) {
      return NextResponse.json(
        { error: 'Mobile phone already registered' },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = createHash('sha256')
      .update(password)
      .digest('hex')

    // Insert new user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        student_id,
        username,
        mobile_phone,
        full_name,
        password_hash: passwordHash,
        role: 'user',
        is_verified: false
      })
      .select('id, student_id, username, full_name, role, is_verified')
      .single()

    if (error) {
      console.error('Registration error:', error)
      return NextResponse.json(
        { error: 'Failed to register user' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: 'User registered successfully',
        user: {
          id: newUser.id,
          student_id: newUser.student_id,
          username: newUser.username,
          full_name: newUser.full_name,
          role: newUser.role,
          is_verified: newUser.is_verified
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 