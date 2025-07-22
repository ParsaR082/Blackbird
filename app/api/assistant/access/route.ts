import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/server-utils'
import { connectToDatabase } from '@/lib/mongodb'
import { AssistantAccess } from '@/lib/models/assistant-usage'

// Check user's assistant access status
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Admins automatically have access
    if (user.role === 'ADMIN') {
      return NextResponse.json({
        isApproved: true,
        requestedAt: new Date(),
        approvedAt: new Date(),
        approvedBy: 'system'
      })
    }

    await connectToDatabase()

    let access = await AssistantAccess.findOne({ userId: user.id })
    
    if (!access) {
      // Create access request if it doesn't exist
      access = new AssistantAccess({
        userId: user.id,
        isApproved: false,
        requestedAt: new Date()
      })
      await access.save()
    }

    return NextResponse.json({
      isApproved: access.isApproved,
      requestedAt: access.requestedAt,
      approvedAt: access.approvedAt,
      approvedBy: access.approvedBy
    })
  } catch (error) {
    console.error('Assistant access check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Request assistant access
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reason } = await request.json()

    await connectToDatabase()

    let access = await AssistantAccess.findOne({ userId: user.id })
    
    if (!access) {
      access = new AssistantAccess({
        userId: user.id,
        isApproved: false,
        requestedAt: new Date(),
        reason: reason || ''
      })
    } else {
      access.reason = reason || ''
      access.requestedAt = new Date()
    }

    await access.save()

    return NextResponse.json({
      message: 'Assistant access requested successfully',
      requestedAt: access.requestedAt
    })
  } catch (error) {
    console.error('Assistant access request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 