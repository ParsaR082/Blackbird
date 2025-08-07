import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { connectToDatabase } from '@/lib/mongodb'
import { validateCsrfToken } from '@/lib/csrf'
import { loginLimiter } from '@/lib/rate-limit'
import mongoose from 'mongoose'
import { cookies } from 'next/headers'

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
    
    // Special handling for super admin login
    const isSuperAdminLogin = identifier === 'admin@blackbird.com' && password === 'admin123'
    
    // Skip rate limiting for admin login attempts
    if (!isSuperAdminLogin) {
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
    
    // Special handling for super admin login
    if (isSuperAdminLogin) {
      
      // Find admin user
      user = await User.findOne({ email: identifier })
      
      // If admin doesn't exist or has issues, create/update it as SUPER_ADMIN
      if (!user || !user.password || !user.isVerified || user.role !== 'SUPER_ADMIN') {
        
        // Hash the admin password
        const hashedPassword = await bcrypt.hash('admin123', 12)
        
        if (user) {
          // Update existing admin to SUPER_ADMIN
          user = await User.findByIdAndUpdate(
            user._id,
            {
              password: hashedPassword,
              fullName: 'Blackbird Super Administrator',
              role: 'SUPER_ADMIN',
              isVerified: true,
              updatedAt: new Date()
            },
            { new: true }
          )
        } else {
          // Create new super admin user
          user = new User({
            email: 'admin@blackbird.com',
            password: hashedPassword,
            fullName: 'Blackbird Super Administrator',
            role: 'SUPER_ADMIN',
            isVerified: true,
            avatarUrl: null,
            createdAt: new Date(),
            updatedAt: new Date()
          })
          
          await user.save()
        }
        
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
    const sessionToken = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2);
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
      console.log('[Login] Creating session:', {
        userId: user._id.toString(),
        tokenPreview: sessionToken.substring(0, 8) + '...',
        expiresAt: expiresAt.toISOString(),
        createdAt: new Date().toISOString()
      })
      
      const sessionDoc = await Session.create({
        userId: user._id.toString(),
        token: sessionToken,
        expiresAt: expiresAt,
        createdAt: new Date()
      })
      
      console.log('[Login] Session created successfully:', {
        sessionId: sessionDoc._id.toString(),
        userId: sessionDoc.userId,
        tokenPreview: sessionDoc.token.substring(0, 8) + '...',
        expiresAt: sessionDoc.expiresAt.toISOString()
      })
    } catch (sessionError) {
      console.error('[Login] Session creation error:', sessionError)
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
    
    // Determine if we're in production
    const isProduction = process.env.NODE_ENV === 'production'
    
    // Set cookie options - Production compatible
    const cookieOptions = {
      name: 'session_token',
      value: sessionToken,
      expires: expiresAt,
      path: '/',
      httpOnly: true,
      secure: isProduction,
      // Use 'lax' for better Docker/proxy compatibility
      // 'none' requires HTTPS and can cause issues in some Docker setups
      sameSite: 'lax' as const,
      // Remove domain setting to let browser handle it automatically
    }
    
    // Set session cookie
    const isProduction = process.env.NODE_ENV === 'production'
    console.log('[Login] Setting session cookie:', {
      isProduction,
      secure: false, // Force secure to false for HTTP
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    })
    
    const response = NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isVerified: user.isVerified,
        avatarUrl: user.avatarUrl
      },
      redirect: (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') ? '/admin' : '/dashboard'
    })

    response.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: false, // Force secure to false for HTTP
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
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