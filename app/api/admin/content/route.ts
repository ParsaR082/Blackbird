import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
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
    
    // Define Content schema
    const ContentSchema = new mongoose.Schema({
      title: String,
      content: String,
      type: String,
      status: String,
      priority: String,
      targetAudience: String,
      startDate: Date,
      endDate: Date,
      createdBy: String,
      createdAt: Date,
      updatedAt: Date,
      isActive: Boolean,
      tags: [String]
    })
    
    const Content = mongoose.models.Content || mongoose.model('Content', ContentSchema)
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    // Build query
    const query: any = {}
    if (type) query.type = type
    if (status) query.status = status
    
    // Fetch content items
    const contentItems = await Content.find(query)
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean()

    return NextResponse.json(contentItems)
  } catch (error) {
    console.error('Fetch content error:', error)
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
    
    // Define Content schema
    const ContentSchema = new mongoose.Schema({
      title: String,
      content: String,
      type: String,
      status: String,
      priority: String,
      targetAudience: String,
      startDate: Date,
      endDate: Date,
      createdBy: String,
      createdAt: Date,
      updatedAt: Date,
      isActive: Boolean,
      tags: [String]
    })
    
    const Content = mongoose.models.Content || mongoose.model('Content', ContentSchema)

    const body = await request.json()
    const {
      title,
      content,
      type,
      status,
      priority,
      targetAudience,
      startDate,
      endDate,
      isActive,
      tags
    } = body

    // Validate required fields
    if (!title || !content || !type) {
      return NextResponse.json(
        { error: 'Title, content, and type are required' },
        { status: 400 }
      )
    }

    // Create new content item
    const newContent = new Content({
      title,
      content,
      type,
      status: status || 'draft',
      priority: priority || 'medium',
      targetAudience: targetAudience || 'all',
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      createdBy: currentUser.email,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: isActive !== undefined ? isActive : true,
      tags: tags || []
    })

    await newContent.save()

    return NextResponse.json(newContent, { status: 201 })
  } catch (error) {
    console.error('Create content error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 