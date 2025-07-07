import { cookies } from "next/headers"
import connectToDatabase from './mongodb'
import { UserAuth } from '@/types'
import { NextRequest } from 'next/server'
import mongoose from 'mongoose'

/**
 * Gets the authenticated user from a request - SERVER SIDE ONLY
 */
export async function getUserFromRequest(request: NextRequest): Promise<UserAuth | null> {
  try {
    // Try to get the session token from cookie
    const sessionToken = cookies().get('session_token')?.value
    
    if (!sessionToken) {
      return null
    }
    
    await connectToDatabase()
    
    // Define schemas
    const SessionSchema = new mongoose.Schema({
      userId: String,
      expiresAt: Date,
      createdAt: Date
    })
    
    const UserSchema = new mongoose.Schema({
      email: String,
      fullName: String,
      role: String,
      isVerified: Boolean,
      avatarUrl: String
    })
    
    const Session = mongoose.models.Session || mongoose.model('Session', SessionSchema)
    const User = mongoose.models.User || mongoose.model('User', UserSchema)
    
    // Find session in database
    const session = await Session.findOne({ token: sessionToken })
    
    if (!session) {
      return null
    }
    
    // Check if session is expired
    if (new Date(session.expiresAt) < new Date()) {
      return null
    }
    
    // Get user data
    const user = await User.findById(session.userId)
    
    if (!user) {
      return null
    }
    
    return {
      id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isVerified: user.isVerified,
      avatarUrl: user.avatarUrl
    }
  } catch (error) {
    console.error('Error getting user from request:', error)
    return null
  }
} 