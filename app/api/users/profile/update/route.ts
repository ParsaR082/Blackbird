import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import connectToDatabase from '@/lib/mongodb'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import { validateCsrfToken } from '@/lib/csrf'
import { RateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Get session token from cookie
    const sessionToken = cookies().get('session_token')?.value
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'No session token found' },
        { status: 401 }
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

    const body = await request.json()
    const { fullName, email, username, currentPassword, newPassword } = body

    // Basic validation
    if (!fullName?.trim()) {
      return NextResponse.json(
        { error: 'Full name is required' },
        { status: 400 }
      )
    }

    if (!email?.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Username validation (if provided)
    if (username) {
      if (username.length < 3) {
        return NextResponse.json(
          { error: 'Username must be at least 3 characters long' },
          { status: 400 }
        )
      }
      
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return NextResponse.json(
          { error: 'Username can only contain letters, numbers, and underscores' },
          { status: 400 }
        )
      }
    }

    // Password validation if changing password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Current password is required to change password' },
          { status: 400 }
        )
      }

      if (newPassword.length < 8) {
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
        return NextResponse.json(
          { error: 'Password must contain uppercase, lowercase, number, and special character' },
          { status: 400 }
        )
      }
    }

    await connectToDatabase()

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
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      )
    }

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
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if email is already taken by another user
    if (email !== user.email) {
      const existingUser = await User.findOne({ 
        email: email,
        _id: { $ne: session.userId }
      })
      
      if (existingUser) {
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
      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        )
      }

      // Hash new password
      const saltRounds = 12
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds)
      updateData.password = hashedNewPassword
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      session.userId,
      updateData,
      { new: true, select: '-password' }
    )

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
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 