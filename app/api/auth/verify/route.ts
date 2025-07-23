export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { getUserFromRequest } from '@/lib/server-utils'
import mongoose from 'mongoose'

export async function POST(request: NextRequest) {
  try {
    // Verify the current user is an admin
    const currentUser = await getUserFromRequest(request)
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { user_id, verification_notes } = await request.json()
    
    if (!user_id) {
      return NextResponse.json(
        { error: 'Missing user ID' },
        { status: 400 }
      )
    }

    await connectToDatabase()
    
    // Define schemas
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
    
    const UserVerificationSchema = new mongoose.Schema({
      userId: String,
      verifiedBy: String,
      verificationNotes: String,
      verifiedAt: Date
    })
    
    const User = mongoose.models.User || mongoose.model('User', UserSchema)
    const UserVerification = mongoose.models.UserVerification || mongoose.model('UserVerification', UserVerificationSchema)

    // Check if user exists
    const userExists = await User.findById(user_id)

    if (!userExists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (userExists.isVerified) {
      return NextResponse.json(
        { error: 'User is already verified' },
        { status: 400 }
      )
    }

    // Update user verified status
    try {
      await User.findByIdAndUpdate(user_id, { 
        isVerified: true,
        updatedAt: new Date()
      })
    } catch (updateError) {
      console.error('User verification error:', updateError)
      return NextResponse.json(
        { error: 'Failed to verify user' },
        { status: 500 }
      )
    }

    // Add verification record
    try {
      await UserVerification.create({
        userId: user_id,
        verifiedBy: currentUser.id,
        verificationNotes: verification_notes || null,
        verifiedAt: new Date()
      })
    } catch (verificationError) {
      console.error('Verification record error:', verificationError)
      // Don't return error here as the user is already verified
    }

    return NextResponse.json({ 
      message: 'User verified successfully' 
    })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 