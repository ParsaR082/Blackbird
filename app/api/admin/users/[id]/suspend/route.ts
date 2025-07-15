import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { getUserFromRequest } from '@/lib/server-utils'
import mongoose from 'mongoose'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify the current user is an admin
    const currentUser = await getUserFromRequest(request)
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { id } = params
    const { isActive } = await request.json()

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

    // Update user status
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { 
        isActive,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).select('-password')

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
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
    console.error('Suspend user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 