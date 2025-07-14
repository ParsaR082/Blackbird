import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
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
    
    // Define NotificationTemplate schema
    const NotificationTemplateSchema = new mongoose.Schema({
      name: String,
      subject: String,
      content: String,
      type: String,
      category: String,
      isActive: Boolean,
      variables: [String],
      createdAt: Date,
      updatedAt: Date
    })
    
    const NotificationTemplate = mongoose.models.NotificationTemplate || mongoose.model('NotificationTemplate', NotificationTemplateSchema)

    const body = await request.json()
    const {
      name,
      subject,
      content,
      type,
      category,
      isActive,
      variables
    } = body

    // Validate required fields
    if (!name || !subject || !content || !type) {
      return NextResponse.json(
        { error: 'Name, subject, content, and type are required' },
        { status: 400 }
      )
    }

    // Check if template exists
    const existingTemplate = await NotificationTemplate.findById(id)
    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // Extract variables from content
    const extractedVariables = content.match(/\{\{(\w+)\}\}/g)?.map((v: string) => v.slice(2, -2)) || []

    // Update template
    const updatedTemplate = await NotificationTemplate.findByIdAndUpdate(
      id,
      {
        name,
        subject,
        content,
        type,
        category: category || 'announcement',
        isActive: isActive !== undefined ? isActive : true,
        variables: variables || extractedVariables,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    )

    return NextResponse.json(updatedTemplate)
  } catch (error) {
    console.error('Update template error:', error)
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
    
    // Define NotificationTemplate schema
    const NotificationTemplateSchema = new mongoose.Schema({
      name: String,
      subject: String,
      content: String,
      type: String,
      category: String,
      isActive: Boolean,
      variables: [String],
      createdAt: Date,
      updatedAt: Date
    })
    
    const NotificationTemplate = mongoose.models.NotificationTemplate || mongoose.model('NotificationTemplate', NotificationTemplateSchema)

    // Check if template exists
    const existingTemplate = await NotificationTemplate.findById(id)
    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // Delete template
    await NotificationTemplate.findByIdAndDelete(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete template error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 