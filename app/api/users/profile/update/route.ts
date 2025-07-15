import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { connectToDatabase } from '@/lib/mongodb'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import { validateCsrfToken } from '@/lib/csrf'
import { RateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('[Profile Update] Starting profile update request')
    
    // Get session token from cookie
    const sessionToken = cookies().get('session_token')?.value
    
    if (!sessionToken) {
      console.log('[Profile Update] No session token found')
      return NextResponse.json(
        { error: 'No session token found' },
        { status: 401 }
      )
    }

    console.log('[Profile Update] Session token found:', sessionToken.substring(0, 10) + '...')

    // Validate CSRF token
    const csrfToken = request.headers.get('x-csrf-token')
    console.log('[Profile Update] CSRF token received:', csrfToken ? 'yes' : 'no')
    
    if (!(await validateCsrfToken(csrfToken))) {
      console.log('[Profile Update] CSRF validation failed')
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      )
    }

    console.log('[Profile Update] CSRF validation passed')

    const body = await request.json()
    console.log('[Profile Update] Request body:', { 
      fullName: body.fullName,
      email: body.email,
      username: body.username,
      hasPassword: !!body.newPassword
    })

    const { fullName, email, username, currentPassword, newPassword } = body

    // Basic validation
    if (!fullName?.trim()) {
      console.log('[Profile Update] Full name validation failed')
      return NextResponse.json(
        { error: 'Full name is required' },
        { status: 400 }
      )
    }

    if (!email?.trim()) {
      console.log('[Profile Update] Email validation failed')
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log('[Profile Update] Email format validation failed')
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Username validation (if provided)
    if (username) {
      if (username.length < 3) {
        console.log('[Profile Update] Username length validation failed')
        return NextResponse.json(
          { error: 'Username must be at least 3 characters long' },
          { status: 400 }
        )
      }
      
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        console.log('[Profile Update] Username format validation failed')
        return NextResponse.json(
          { error: 'Username can only contain letters, numbers, and underscores' },
          { status: 400 }
        )
      }
    }

    // Password validation if changing password
    if (newPassword) {
      if (!currentPassword) {
        console.log('[Profile Update] Current password required for password change')
        return NextResponse.json(
          { error: 'Current password is required to change password' },
          { status: 400 }
        )
      }

      if (newPassword.length < 8) {
        console.log('[Profile Update] Password length validation failed')
        return NextResponse.json(
          { error: 'New password must be at least 8 characters long' },
          { status: 400 }
        )
      }

      // Password strength validation
      const hasUpperCase = /[A-Z]/.test(newPassword)
      const hasLowerCase = /[a-z]/.test(newPassword)
      const hasNumbers = /\d/.test(newPassword)
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)

      if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
        console.log('[Profile Update] Password strength validation failed')
        return NextResponse.json(
          { error: 'Password must contain uppercase, lowercase, number, and special character' },
          { status: 400 }
        )
      }
    }

    console.log('[Profile Update] Connecting to database...')
    await connectToDatabase()
    console.log('[Profile Update] Database connected')

    // Define Session schema
    const SessionSchema = new mongoose.Schema({
      userId: String,
      token: String,
      expiresAt: Date,
      createdAt: Date
    })
    
    const Session = mongoose.models.Session || mongoose.model('Session', SessionSchema)

    // Find valid session
    const session = await Session.findOne({
      token: sessionToken,
      expiresAt: { $gt: new Date() }
    })

    if (!session) {
      console.log('[Profile Update] Invalid or expired session')
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      )
    }

    console.log('[Profile Update] Session found for user:', session.userId)

    // Define User schema
    const UserSchema = new mongoose.Schema({
      email: String,
      username: String,
      password: String,
      fullName: String,
      role: String,
      avatarUrl: String,
      isVerified: Boolean,
      createdAt: Date,
      updatedAt: Date
    })

    const User = mongoose.models.User || mongoose.model('User', UserSchema)

    // Get current user
    const user = await User.findById(session.userId)
    if (!user) {
      console.log('[Profile Update] User not found in database')
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('[Profile Update] User found:', user.email)

    // Check if email is already taken by another user
    if (email !== user.email) {
      const existingUser = await User.findOne({ 
        email: email,
        _id: { $ne: session.userId }
      })
      
      if (existingUser) {
        console.log('[Profile Update] Email already taken by another user')
        return NextResponse.json(
          { error: 'Email is already taken' },
          { status: 409 }
        )
      }
    }

    // Check if username is already taken by another user (if username is being changed)
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ 
        username: username,
        _id: { $ne: session.userId }
      })
      
      if (existingUser) {
        console.log('[Profile Update] Username already taken by another user')
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 409 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {
      fullName: fullName.trim(),
      email: email.trim(),
      updatedAt: new Date()
    }

    // Add username if provided
    if (username) {
      updateData.username = username.trim()
    }

    // Handle password change
    if (newPassword && currentPassword) {
      console.log('[Profile Update] Processing password change')
      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
      if (!isCurrentPasswordValid) {
        console.log('[Profile Update] Current password verification failed')
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        )
      }

      // Hash new password
      const saltRounds = 12
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds)
      updateData.password = hashedNewPassword
      console.log('[Profile Update] Password hashed successfully')
    }

    console.log('[Profile Update] Updating user with data:', updateData)

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      session.userId,
      updateData,
      { new: true, select: '-password' }
    )

    console.log('[Profile Update] User updated successfully')

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        username: updatedUser.username,
        fullName: updatedUser.fullName,
        role: updatedUser.role,
        avatarUrl: updatedUser.avatarUrl,
        isVerified: updatedUser.isVerified,
        updatedAt: updatedUser.updatedAt
      }
    })

  } catch (error) {
    console.error('[Profile Update] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 