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
    
    // Fetch all templates
    const templates = await NotificationTemplate.find({})
      .sort({ updatedAt: -1 })
      .lean()

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Fetch templates error:', error)
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

    // Extract variables from content (simple regex for {{variable}})
    const extractedVariables = content.match(/\{\{(\w+)\}\}/g)?.map((v: string) => v.slice(2, -2)) || []

    // Create new template
    const newTemplate = new NotificationTemplate({
      name,
      subject,
      content,
      type,
      category: category || 'announcement',
      isActive: isActive !== undefined ? isActive : true,
      variables: variables || extractedVariables,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    await newTemplate.save()

    return NextResponse.json(newTemplate, { status: 201 })
  } catch (error) {
    console.error('Create template error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 