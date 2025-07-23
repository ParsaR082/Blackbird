export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/server-utils'
import { connectToDatabase } from '@/lib/mongodb'
import { AssistantAccess } from '@/lib/models/assistant-usage'
import mongoose from 'mongoose'

// Get all access requests (Admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    await connectToDatabase()

    // Define User schema for joining data
    const UserSchema = new mongoose.Schema({
      email: String,
      fullName: String,
      role: String,
      isVerified: Boolean,
      createdAt: Date
    })
    
    const User = mongoose.models.User || mongoose.model('User', UserSchema)

    // Get all access requests with user details
    const accessRequests = await AssistantAccess.find({}).sort({ requestedAt: -1 })
    
    // Enrich with user data
    const enrichedRequests = await Promise.all(
      accessRequests.map(async (request) => {
        const userData = await User.findById(request.userId).select('email fullName isVerified createdAt')
        return {
          id: request._id,
          userId: request.userId,
          isApproved: request.isApproved,
          approvedBy: request.approvedBy,
          approvedAt: request.approvedAt,
          requestedAt: request.requestedAt,
          reason: request.reason,
          user: userData ? {
            email: userData.email,
            fullName: userData.fullName,
            isVerified: userData.isVerified,
            createdAt: userData.createdAt
          } : null
        }
      })
    )

    return NextResponse.json({
      requests: enrichedRequests,
      total: enrichedRequests.length,
      pending: enrichedRequests.filter(r => !r.isApproved).length,
      approved: enrichedRequests.filter(r => r.isApproved).length
    })
  } catch (error) {
    console.error('Admin access requests fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Approve or deny access request (Admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { userId, action } = await request.json()
    
    if (!userId || !action || !['approve', 'deny'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 })
    }

    await connectToDatabase()

    const accessRequest = await AssistantAccess.findOne({ userId })
    
    if (!accessRequest) {
      return NextResponse.json({ error: 'Access request not found' }, { status: 404 })
    }

    if (action === 'approve') {
      accessRequest.isApproved = true
      accessRequest.approvedBy = user.id
      accessRequest.approvedAt = new Date()
    } else {
      // For deny, we could either delete the request or mark it as denied
      // For now, let's delete it so the user can request again
      await AssistantAccess.deleteOne({ userId })
      return NextResponse.json({
        message: 'Access request denied and removed',
        action: 'denied'
      })
    }

    await accessRequest.save()

    return NextResponse.json({
      message: action === 'approve' ? 'Access approved successfully' : 'Access denied',
      action,
      approvedAt: accessRequest.approvedAt,
      approvedBy: user.id
    })
  } catch (error) {
    console.error('Admin access approval error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 