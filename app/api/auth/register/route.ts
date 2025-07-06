import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import * as bcrypt from 'bcrypt'
import { z } from 'zod'
import { validateCsrfToken } from '@/lib/csrf'
import { registerLimiter } from '@/lib/rate-limit'

// Input validation schema
const registerSchema = z.object({
  student_id: z.string().min(3).max(50),
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/),
  mobile_phone: z.string().regex(/^\+?[0-9]{8,15}$/),
  full_name: z.string().min(2).max(255),
  password: z.string().min(8).max(100)
})

export async function POST(request: NextRequest) {
  try {
    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'anonymous'
    
    // Check rate limit
    const rateLimit = await registerLimiter.limit(ip)
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.floor((rateLimit.reset - Date.now()) / 1000)),
            'X-RateLimit-Limit': String(rateLimit.limit),
            'X-RateLimit-Remaining': String(rateLimit.remaining),
          }
        }
      )
    }
    
    // Validate CSRF token
    const csrfToken = request.headers.get('x-csrf-token')
    if (!validateCsrfToken(csrfToken)) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      )
    }

    const data = await request.json()
    
    // Validate input data
    const result = registerSchema.safeParse(data)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation error', details: result.error.format() },
        { status: 400 }
      )
    }

    const { student_id, username, mobile_phone, full_name, password } = result.data
    
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

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, 10)

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