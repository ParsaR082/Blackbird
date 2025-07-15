import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { getUserFromRequest } from '@/lib/server-utils'
import mongoose from 'mongoose'
import * as bcrypt from 'bcrypt'

export const dynamic = 'force-dynamic'

export async function PUT(request: NextRequest) {
  try {
    // Verify the current user is an admin
    const currentUser = await getUserFromRequest(request)
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    await connectToDatabase()
    
    // Define User schema
    const UserSchema = new mongoose.Schema({
      email: String,
      password: String,
      fullName: String,
      username: String,
      mobilePhone: String,
      bio: String,
      studentId: String,
      role: String,
      isVerified: Boolean,
      isActive: Boolean,
      avatarUrl: String,
      createdAt: Date,
      updatedAt: Date,
      lastLogin: Date
    })
    
    const User = mongoose.models.User || mongoose.model('User', UserSchema)

    // Parse form data
    const formData = await request.formData()
    const userId = formData.get('userId') as string
    const email = formData.get('email') as string
    const fullName = formData.get('fullName') as string
    const role = formData.get('role') as string
    const isVerified = formData.get('isVerified') === 'true'
    const isActive = formData.get('isActive') === 'true'
    const mobilePhone = formData.get('mobilePhone') as string
    const bio = formData.get('bio') as string
    const studentId = formData.get('studentId') as string
    const username = formData.get('username') as string
    const avatarFile = formData.get('avatar') as File

    // Validate required fields
    if (!userId || !email || !fullName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await User.findById(userId)
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if email is already taken by another user
    if (email !== existingUser.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: userId } })
      if (emailExists) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        )
      }
    }

    // Handle avatar upload (in a real app, you'd upload to cloud storage)
    let avatarUrl = existingUser.avatarUrl
    if (avatarFile) {
      // For now, we'll just store a placeholder
      // In production, you'd upload to AWS S3, Cloudinary, etc.
      avatarUrl = `/uploads/avatars/${userId}-${Date.now()}.jpg`
      console.log('Avatar upload would be processed here:', avatarFile.name)
    }

    // Prepare update data
    const updateData: any = {
      email,
      fullName,
      role,
      isVerified,
      isActive,
      updatedAt: new Date()
    }

    // Add optional fields if provided
    if (mobilePhone !== null) updateData.mobilePhone = mobilePhone
    if (bio !== null) updateData.bio = bio
    if (studentId !== null) updateData.studentId = studentId
    if (username !== null) updateData.username = username
    if (avatarUrl) updateData.avatarUrl = avatarUrl

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password')

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      )
    }

    // Transform the response to match frontend expectations
    const transformedUser = {
      id: updatedUser._id.toString(),
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      username: updatedUser.username,
      mobilePhone: updatedUser.mobilePhone,
      bio: updatedUser.bio,
      studentId: updatedUser.studentId,
      role: updatedUser.role,
      isVerified: updatedUser.isVerified,
      isActive: updatedUser.isActive,
      avatarUrl: updatedUser.avatarUrl,
      createdAt: updatedUser.createdAt?.toISOString(),
      lastLogin: updatedUser.lastLogin?.toISOString()
    }

    return NextResponse.json(transformedUser)
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 