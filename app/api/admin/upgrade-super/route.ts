import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { getUserFromRequest } from '@/lib/server-utils'
import mongoose from 'mongoose'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('[Super Admin Upgrade] Starting upgrade process')
    
    // Get the current user
    const currentUser = await getUserFromRequest(request)
    console.log('[Super Admin Upgrade] Current user:', currentUser)

    if (!currentUser) {
      console.log('[Super Admin Upgrade] No user found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (currentUser.role !== 'ADMIN') {
      console.log('[Super Admin Upgrade] User is not an admin')
      return NextResponse.json(
        { error: 'Only admins can be upgraded to super admin' },
        { status: 403 }
      )
    }

    await connectToDatabase()
    console.log('[Super Admin Upgrade] Connected to database')

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

    // Update the current admin to super admin
    await User.findByIdAndUpdate(currentUser.id, {
      role: 'SUPER_ADMIN',
      updatedAt: new Date()
    })

    console.log('[Super Admin Upgrade] Successfully upgraded to super admin')

    return NextResponse.json({
      message: 'Successfully upgraded to super admin. Please refresh the page.',
      user: {
        ...currentUser,
        role: 'SUPER_ADMIN'
      }
    })

  } catch (error) {
    console.error('[Super Admin Upgrade] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 