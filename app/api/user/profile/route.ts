import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import { RateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

// Rate limiting: 5 requests per minute
const limiter = new RateLimit({
  interval: 60 * 1000, // 1 minute
  limit: 5, // Max 5 requests per minute
})

export async function GET(request: NextRequest) {
  try {
    // Check rate limit
    const identifier = request.ip ?? 'anonymous'
    const { success } = await limiter.limit(identifier)
    if (!success) {
      return NextResponse.json({ message: 'Too many requests' }, { status: 429 })
    }

    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    // Define User schema
    const UserSchema = new mongoose.Schema({
      email: String,
      password: String,
      fullName: String,
      role: String,
      avatarUrl: String,
      isVerified: Boolean,
      createdAt: Date,
      updatedAt: Date
    })

    const User = mongoose.models.User || mongoose.model('User', UserSchema)

    // Get user profile
    const user = await User.findById(session.user.id).select('-password')
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      avatarUrl: user.avatarUrl,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    })

  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check rate limit
    const identifier = request.ip ?? 'anonymous'
    const { success } = await limiter.limit(identifier)
    if (!success) {
      return NextResponse.json({ message: 'Too many requests' }, { status: 429 })
    }

    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { fullName, email, currentPassword, newPassword } = body

    // Basic validation
    if (!fullName?.trim() || !email?.trim()) {
      return NextResponse.json(
        { message: 'Full name and email are required' },
        { status: 400 }
      )
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Password validation if changing password
    if (newPassword && newPassword.length < 8) {
      return NextResponse.json(
        { message: 'New password must be at least 8 characters long' },
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
      avatarUrl: String,
      isVerified: Boolean,
      createdAt: Date,
      updatedAt: Date
    })

    const User = mongoose.models.User || mongoose.model('User', UserSchema)

    // Get current user
    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Check if email is already taken by another user
    if (email !== user.email) {
      const existingUser = await User.findOne({ 
        email: email,
        _id: { $ne: session.user.id }
      })
      
      if (existingUser) {
        return NextResponse.json(
          { message: 'Email is already taken' },
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

    // Handle password change
    if (newPassword && currentPassword) {
      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { message: 'Current password is incorrect' },
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
      session.user.id,
      updateData,
      { new: true, select: '-password' }
    )

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
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
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 