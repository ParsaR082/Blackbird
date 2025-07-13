import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import * as bcrypt from 'bcrypt'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'
import { validateCsrfToken } from '@/lib/csrf'
import { loginLimiter } from '@/lib/rate-limit'
import mongoose from 'mongoose'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Get request body first
    const { identifier, password } = await request.json()
    
    // Validate required fields
    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Special handling for admin login
    const isAdminLogin = identifier === 'admin@blackbird.com' && password === 'admin123'
    
    // Skip rate limiting for admin login attempts
    if (!isAdminLogin) {
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
    }
    
    // Validate CSRF token
    const csrfToken = request.headers.get('x-csrf-token')
    if (!(await validateCsrfToken(csrfToken))) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
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
    
    let user;
    
    // Special handling for admin login
    if (isAdminLogin) {
      // Find admin user
      user = await User.findOne({ email: identifier })
      
      // If admin doesn't exist or has issues, create/update it
      if (!user || !user.password || !user.isVerified || user.role !== 'ADMIN') {
        // Hash the admin password
        const hashedPassword = await bcrypt.hash('admin123', 12)
        
        if (user) {
          // Update existing admin
          user = await User.findByIdAndUpdate(
            user._id,
            {
              password: hashedPassword,
              fullName: 'Blackbird Administrator',
              role: 'ADMIN',
              isVerified: true,
              updatedAt: new Date()
            },
            { new: true }
          )
        } else {
          // Create new admin user
          user = new User({
            email: 'admin@blackbird.com',
            password: hashedPassword,
            fullName: 'Blackbird Administrator',
            role: 'ADMIN',
            isVerified: true,
            avatarUrl: null,
            createdAt: new Date(),
            updatedAt: new Date()
          })
          
          await user.save()
        }
        
        console.log('Admin account created/updated for login')
      }
    } else {
      // Regular user login flow
      // Find user by email
      user = await User.findOne({ email: identifier })

      if (!user) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      // Check if user has a password set
      if (!user.password) {
        return NextResponse.json(
          { error: 'Account setup incomplete. Please contact support.' },
          { status: 401 }
        )
      }

      // Validate password input
      if (!password || password.trim() === '') {
        return NextResponse.json(
          { error: 'Password is required' },
          { status: 400 }
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

    // Get request host for cookie domain
    const host = request.headers.get('host') || ''
    console.log(`[Login] Setting cookie for host: ${host}`)
    
    // Determine if we're in production
    const isProduction = process.env.NODE_ENV === 'production'
    
    // Set cookie options - Railway compatible
    const cookieOptions = {
      name: 'session_token',
      value: sessionToken,
      expires: expiresAt,
      path: '/',
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax' as const,
      // Remove domain setting to let browser handle it automatically
    }
    
    // Set session cookie
    cookies().set(cookieOptions)
    
    // Also set a response header for debugging
    console.log(`[Login] Cookie set with options:`, {
      secure: isProduction,
      httpOnly: true,
      sameSite: 'lax',
      path: '/'
    })
    
    console.log(`[Login] Session cookie set successfully for user: ${user.email}`)

    // Create response with user data
    const response = NextResponse.json({
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

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 