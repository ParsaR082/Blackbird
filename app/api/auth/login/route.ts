import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import * as bcrypt from 'bcrypt'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'
import { validateCsrfToken } from '@/lib/csrf'
import { loginLimiter } from '@/lib/rate-limit'
import mongoose from 'mongoose'

export async function POST(request: NextRequest) {
  try {
    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'anonymous'
    
    // Check rate limit
    const rateLimit = await loginLimiter.limit(ip)
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
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
    if (!(await validateCsrfToken(csrfToken))) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      )
    }

    const { identifier, password } = await request.json()
    
    // Validate required fields
    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    await connectToDatabase()
    
    // Define User schema
    const UserSchema = new mongoose.Schema({
      email: String,
      password: String,
      fullName: String,
      role: String,
      isVerified: Boolean,
      avatarUrl: String,
      createdAt: Date,
      updatedAt: Date
    })
    
    const User = mongoose.models.User || mongoose.model('User', UserSchema)
    
    // Find user by email (since we're using email-based auth now)
    const user = await User.findOne({ email: identifier })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password using bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate session token
    const sessionToken = uuidv4()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // Token expires in 7 days

    // Define Session schema
    const SessionSchema = new mongoose.Schema({
      userId: String,
      token: String,
      expiresAt: Date,
      createdAt: Date
    })
    
    const Session = mongoose.models.Session || mongoose.model('Session', SessionSchema)

    // Store session in database
    try {
      await Session.create({
        userId: user._id.toString(),
        token: sessionToken,
        expiresAt: expiresAt,
        createdAt: new Date()
      })
    } catch (sessionError) {
      console.error('Session creation error:', sessionError)
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      )
    }

    // Update last login timestamp
    await User.findByIdAndUpdate(user._id, { 
      updatedAt: new Date() 
    })

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
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isVerified: user.isVerified,
        avatarUrl: user.avatarUrl
      },
      redirect: user.role === 'ADMIN' ? '/admin' : '/dashboard'
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 