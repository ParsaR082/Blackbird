import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import connectToDatabase from '@/lib/mongodb'
import mongoose from 'mongoose'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get session token from cookie
    const sessionToken = cookies().get('session_token')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'No session token found' },
        { status: 401 }
      )
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
      password: String,
      fullName: String,
      role: String,
      isVerified: Boolean,
      avatarUrl: String,
      createdAt: Date,
      updatedAt: Date
    })
    
    const User = mongoose.models.User || mongoose.model('User', UserSchema)

    // Find user by session userId
    const user = await User.findById(session.userId)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      )
    }

    // Return user data without sensitive information
    return NextResponse.json({
      id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isVerified: user.isVerified,
      avatarUrl: user.avatarUrl
    })
  } catch (error) {
    console.error('Session validation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 