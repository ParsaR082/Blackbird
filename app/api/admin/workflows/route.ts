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
    
    // Define Workflow schema
    const WorkflowSchema = new mongoose.Schema({
      name: String,
      description: String,
      type: String,
      status: String,
      triggers: [String],
      conditions: [Object],
      actions: [Object],
      approvers: [String],
      timeout: Number,
      createdAt: Date,
      updatedAt: Date
    })
    
    const Workflow = mongoose.models.Workflow || mongoose.model('Workflow', WorkflowSchema)
    
    // Fetch all workflows
    const workflows = await Workflow.find({})
      .sort({ updatedAt: -1 })
      .lean()

    return NextResponse.json(workflows)
  } catch (error) {
    console.error('Fetch workflows error:', error)
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
    
    // Define Workflow schema
    const WorkflowSchema = new mongoose.Schema({
      name: String,
      description: String,
      type: String,
      status: String,
      triggers: [String],
      conditions: [Object],
      actions: [Object],
      approvers: [String],
      timeout: Number,
      createdAt: Date,
      updatedAt: Date
    })
    
    const Workflow = mongoose.models.Workflow || mongoose.model('Workflow', WorkflowSchema)

    const body = await request.json()
    const {
      name,
      description,
      type,
      triggers,
      conditions,
      actions,
      approvers,
      timeout
    } = body

    // Validate required fields
    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      )
    }

    // Create new workflow
    const newWorkflow = new Workflow({
      name,
      description: description || '',
      type,
      status: 'draft',
      triggers: triggers || [],
      conditions: conditions || [],
      actions: actions || [],
      approvers: approvers || [],
      timeout: timeout || 24,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    await newWorkflow.save()

    return NextResponse.json(newWorkflow, { status: 201 })
  } catch (error) {
    console.error('Create workflow error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 