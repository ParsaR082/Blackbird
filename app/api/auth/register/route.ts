import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import * as bcrypt from 'bcrypt'
import { z } from 'zod'
import { validateCsrfToken } from '@/lib/csrf'
import { registerLimiter } from '@/lib/rate-limit'
import mongoose from 'mongoose'

// Input validation schema
const registerSchema = z.object({
  studentId: z.string().min(1).max(50),
  phoneNumber: z.string().regex(/^\+98\d{10}$/),
  fullName: z.string().min(2).max(255),
  username: z.string().min(3).max(50),
  email: z.string().email().refine(email => email.endsWith('@gmail.com'), {
    message: 'Email must be a Gmail address'
  }),
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
    if (!(await validateCsrfToken(csrfToken))) {
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

        const { studentId, phoneNumber, fullName, username, email, password } = result.data

    await connectToDatabase()

    // Define User schema
    const UserSchema = new mongoose.Schema({
      studentId: String,
      phoneNumber: String,
      username: String,
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

    // Check if email, username, studentId, or phoneNumber already exists
    const existingUser = await User.findOne({
      $or: [
        { email },
        { username },
        { studentId },
        { phoneNumber }
      ]
    })

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 409 }
        )
      }
      if (existingUser.username === username) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 409 }
        )
      }
      if (existingUser.studentId === studentId) {
        return NextResponse.json(
          { error: 'Student ID already registered' },
          { status: 409 }
        )
      }
      if (existingUser.phoneNumber === phoneNumber) {
        return NextResponse.json(
          { error: 'Phone number already registered' },
          { status: 409 }
        )
      }
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, 12)

    // Insert new user
    try {
      const newUser = await User.create({
        studentId,
        phoneNumber,
        username,
        email,
        password: passwordHash,
        fullName,
        role: 'USER',
        isVerified: false,
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      return NextResponse.json(
        {
          message: 'User registered successfully',
          user: {
            id: newUser._id.toString(),
            studentId: newUser.studentId,
            phoneNumber: newUser.phoneNumber,
            username: newUser.username,
            email: newUser.email,
            fullName: newUser.fullName,
            role: newUser.role,
            isVerified: newUser.isVerified
          }
        },
        { status: 201 }
      )
    } catch (error) {
      console.error('Registration error:', error)
      
      // Handle MongoDB duplicate key errors (race condition protection)
      if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
        const mongoError = error as any
        const duplicateField = Object.keys(mongoError.keyPattern || {})[0]
        
        switch (duplicateField) {
          case 'email':
            return NextResponse.json(
              { error: 'Email already registered' },
              { status: 409 }
            )
          case 'username':
            return NextResponse.json(
              { error: 'Username already taken' },
              { status: 409 }
            )
          case 'studentId':
            return NextResponse.json(
              { error: 'Student ID already registered' },
              { status: 409 }
            )
          case 'phoneNumber':
            return NextResponse.json(
              { error: 'Phone number already registered' },
              { status: 409 }
            )
          default:
            return NextResponse.json(
              { error: 'A user with these details already exists' },
              { status: 409 }
            )
        }
      }
      
      return NextResponse.json(
        { error: 'Failed to register user' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 