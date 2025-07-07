import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import connectToDatabase from '@/lib/mongodb'
import mongoose from 'mongoose'

export async function POST(request: NextRequest) {
  try {
    // Get session token from cookie
    const sessionToken = cookies().get('session_token')?.value
    
    if (sessionToken) {
      await connectToDatabase()
      
      // Define Session schema
      const SessionSchema = new mongoose.Schema({
        userId: String,
        token: String,
        expiresAt: Date,
        createdAt: Date
      })
      
      const Session = mongoose.models.Session || mongoose.model('Session', SessionSchema)
      
      // Delete session from database
      await Session.deleteOne({ token: sessionToken })
    }
    
    // Delete cookie
    const response = NextResponse.json({ message: 'Logged out successfully' })
    response.cookies.delete('session_token')
    
    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 