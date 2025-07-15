import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { getUserFromRequest } from '@/lib/server-utils'
import mongoose from 'mongoose'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify the current user is an admin
    const currentUser = await getUserFromRequest(request)
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { id } = params
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

    // Check if content exists
    const existingContent = await Content.findById(id)
    if (!existingContent) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      )
    }

    // Update content
    const updatedContent = await Content.findByIdAndUpdate(
      id,
      {
        title,
        content,
        type,
        status,
        priority,
        targetAudience,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        updatedAt: new Date(),
        isActive,
        tags
      },
      { new: true, runValidators: true }
    )

    return NextResponse.json(updatedContent)
  } catch (error) {
    console.error('Update content error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify the current user is an admin
    const currentUser = await getUserFromRequest(request)
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { id } = params
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

    // Check if content exists
    const existingContent = await Content.findById(id)
    if (!existingContent) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      )
    }

    // Delete content
    await Content.findByIdAndDelete(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete content error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 