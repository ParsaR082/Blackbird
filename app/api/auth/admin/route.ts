export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { getUserFromRequest } from '@/lib/server-utils'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

export async function POST(request: NextRequest) {
  try {
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

    // Get the current user
    const currentUser = await getUserFromRequest(request)
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get request data
    const { action, user_id } = await request.json()

    // Special case for self-upgrade to super admin using admin credentials
    if (action === 'self_upgrade' && currentUser.role === 'ADMIN') {
      const adminPassword = request.headers.get('x-admin-password')
      if (adminPassword === 'admin123') {
        // Update the current admin to super admin
        await User.findByIdAndUpdate(currentUser.id, {
          role: 'SUPER_ADMIN',
          updatedAt: new Date()
        })
        return NextResponse.json({
          message: 'Successfully upgraded to super admin'
        })
      }
    }

    // Regular admin management logic
    if (!user_id) {
      return NextResponse.json(
        { error: 'Missing user ID' },
        { status: 400 }
      )
    }

    // Only super admins can modify other admins
    if (currentUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Super Admin access required.' },
        { status: 403 }
      )
    }

    // Check if target user exists
    const targetUser = await User.findById(user_id)
    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Handle different actions
    switch (action) {
      case 'promote':
        if (targetUser.role === 'ADMIN') {
          return NextResponse.json(
            { error: 'User is already an admin' },
            { status: 400 }
          )
        }
        await User.findByIdAndUpdate(user_id, {
          role: 'ADMIN',
          updatedAt: new Date()
        })
        return NextResponse.json({
          message: 'User promoted to admin successfully'
        })

      case 'demote':
        if (targetUser.role !== 'ADMIN') {
          return NextResponse.json(
            { error: 'User is not an admin' },
            { status: 400 }
          )
        }
        await User.findByIdAndUpdate(user_id, {
          role: 'USER',
          updatedAt: new Date()
        })
        return NextResponse.json({
          message: 'Admin demoted to user successfully'
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Admin management error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 