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
    
    // Define NotificationCampaign schema
    const NotificationCampaignSchema = new mongoose.Schema({
      name: String,
      templateId: String,
      subject: String,
      content: String,
      targetAudience: String,
      customRecipients: [String],
      scheduledFor: Date,
      status: String,
      sentCount: Number,
      totalCount: Number,
      createdAt: Date,
      sentAt: Date
    })
    
    const NotificationCampaign = mongoose.models.NotificationCampaign || mongoose.model('NotificationCampaign', NotificationCampaignSchema)
    
    // Fetch all campaigns
    const campaigns = await NotificationCampaign.find({})
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json(campaigns)
  } catch (error) {
    console.error('Fetch campaigns error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    await connectToDatabase()
    
    // Define NotificationCampaign schema
    const NotificationCampaignSchema = new mongoose.Schema({
      name: String,
      templateId: String,
      subject: String,
      content: String,
      targetAudience: String,
      customRecipients: [String],
      scheduledFor: Date,
      status: String,
      sentCount: Number,
      totalCount: Number,
      createdAt: Date,
      sentAt: Date
    })
    
    const NotificationCampaign = mongoose.models.NotificationCampaign || mongoose.model('NotificationCampaign', NotificationCampaignSchema)

    const body = await request.json()
    const {
      name,
      templateId,
      subject,
      content,
      targetAudience,
      customRecipients,
      scheduledFor,
      sendImmediately
    } = body

    // Validate required fields
    if (!name || !subject || !content) {
      return NextResponse.json(
        { error: 'Name, subject, and content are required' },
        { status: 400 }
      )
    }

    // Determine initial status
    let status = 'draft'
    let sentAt = undefined
    
    if (sendImmediately) {
      status = 'sending'
      sentAt = new Date()
    } else if (scheduledFor) {
      status = 'scheduled'
    }

    // Create new campaign
    const newCampaign = new NotificationCampaign({
      name,
      templateId,
      subject,
      content,
      targetAudience: targetAudience || 'all',
      customRecipients: customRecipients || [],
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      status,
      sentCount: 0,
      totalCount: 0, // Will be calculated based on target audience
      createdAt: new Date(),
      sentAt
    })

    await newCampaign.save()

    // If sending immediately, trigger the sending process
    if (sendImmediately) {
      // TODO: Implement actual sending logic
      // For now, just update the status
      await NotificationCampaign.findByIdAndUpdate(newCampaign._id, {
        status: 'sent',
        sentCount: 1,
        totalCount: 1
      })
    }

    return NextResponse.json(newCampaign, { status: 201 })
  } catch (error) {
    console.error('Create campaign error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 