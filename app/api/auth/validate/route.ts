import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { connectToDatabase } from '@/lib/mongodb'
import mongoose from 'mongoose'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get session token from cookie
    const sessionToken = cookies().get('session_token')?.value
    const requestUrl = request.url
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    console.log(`[Validate] Validating session at ${requestUrl}`)
    console.log(`[Validate] User-Agent: ${userAgent}`)

    if (!sessionToken) {
      console.log('[Validate] No session token found')
      return NextResponse.json(
        { error: 'No session token found' },
        { status: 401 }
      )
    }

    console.log(`[Validate] Session token found: ${sessionToken.substring(0, 8)}...`)

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
    console.log(`[Validate] Looking for session with token: ${sessionToken.substring(0, 8)}...`)
    console.log(`[Validate] Current time: ${new Date().toISOString()}`)
    
    const session = await Session.findOne({
      token: sessionToken,
      expiresAt: { $gt: new Date() }
    })

    if (!session) {
      console.log('[Validate] Session not found or expired')
      
      // Check if session exists but is expired
      const expiredSession = await Session.findOne({ token: sessionToken })
      if (expiredSession) {
        console.log(`[Validate] Found expired session: expires at ${expiredSession.expiresAt.toISOString()}, current time: ${new Date().toISOString()}`)
      } else {
        console.log('[Validate] No session found with this token')
      }
      
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      )
    }
    
    console.log(`[Validate] Found valid session for user ID: ${session.userId}`)

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
      console.log('[Validate] User not found for session')
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      )
    }
    
    console.log(`[Validate] User validated successfully: ${user.email}`)

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
    console.error('[Validate] Session validation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}