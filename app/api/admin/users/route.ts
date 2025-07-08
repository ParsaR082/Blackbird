import { NextRequest, NextResponse } from 'next/server'  
import connectToDatabase from '@/lib/mongodb'
import { getUserFromRequest } from '@/lib/server-utils'  
import mongoose from 'mongoose'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
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
      role: String,
      isVerified: Boolean,
      avatarUrl: String,
      createdAt: Date,
      updatedAt: Date
    })
    
    const User = mongoose.models.User || mongoose.model('User', UserSchema)
    
    // Fetch all users (exclude password field)
    const users = await User.find({}).select('-password').sort({ createdAt: -1 })

    // Transform the data to match the expected format
    const transformedUsers = users.map(user => ({
      id: user._id.toString(),
      student_id: user._id.toString().slice(-8), // Use last 8 chars as student ID
      username: user.email.split('@')[0], // Extract username from email
      full_name: user.fullName || 'Unknown',
      mobile_phone: 'N/A', // Not available in current schema
      role: user.role?.toLowerCase() || 'user',
      is_verified: user.isVerified || false,
      created_at: user.createdAt?.toISOString() || new Date().toISOString(),
      last_login: null // Not tracked yet
    }))

    return NextResponse.json(transformedUsers)
  } catch (error) {
    console.error('Fetch users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 