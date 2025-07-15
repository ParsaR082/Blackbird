import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { getUserFromRequest } from '@/lib/server-utils'
import mongoose from 'mongoose'

// Study Plan Schema
const StudyPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  type: { 
    type: String, 
    enum: ['PERSONAL', 'SEMESTER', 'YEARLY'], 
    default: 'PERSONAL' 
  },
  status: { 
    type: String, 
    enum: ['ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'], 
    default: 'ACTIVE' 
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  priority: { 
    type: String, 
    enum: ['LOW', 'MEDIUM', 'HIGH'], 
    default: 'MEDIUM' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

const StudyPlan = mongoose.models.StudyPlan || mongoose.model('StudyPlan', StudyPlanSchema)

// Study Task Schema
const StudyTaskSchema = new mongoose.Schema({
  studyPlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyPlan', required: true },
  title: { type: String, required: true },
  description: String,
  status: { 
    type: String, 
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], 
    default: 'PENDING' 
  },
  priority: { 
    type: String, 
    enum: ['LOW', 'MEDIUM', 'HIGH'], 
    default: 'MEDIUM' 
  },
  dueDate: Date,
  completedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

const StudyTask = mongoose.models.StudyTask || mongoose.model('StudyTask', StudyTaskSchema)

// GET - Fetch study plans for authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDatabase()

    const studyPlans = await StudyPlan.find({ userId: user.id })
      .sort({ createdAt: -1 })
      .lean()

    // Get tasks for each study plan
    for (let plan of studyPlans) {
      const tasks = await StudyTask.find({ studyPlanId: plan._id })
        .sort({ createdAt: -1 })
        .lean()
      plan.tasks = tasks
    }

    return NextResponse.json({ studyPlans })
  } catch (error) {
    console.error('Error fetching study plans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch study plans' },
      { status: 500 }
    )
  }
}

// POST - Create new study plan
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { title, description, type, startDate, endDate, priority, tasks } = await request.json()

    if (!title || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const studyPlan = await StudyPlan.create({
      userId: user.id,
      title,
      description,
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      priority,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Create tasks if provided
    if (tasks && Array.isArray(tasks)) {
      const studyTasks = await StudyTask.insertMany(
        tasks.map(task => ({
          studyPlanId: studyPlan._id,
          title: task.title,
          description: task.description,
          priority: task.priority || 'MEDIUM',
          dueDate: task.dueDate ? new Date(task.dueDate) : null,
          createdAt: new Date(),
          updatedAt: new Date()
        }))
      )
      studyPlan.tasks = studyTasks
    }

    return NextResponse.json({ studyPlan }, { status: 201 })
  } catch (error) {
    console.error('Error creating study plan:', error)
    return NextResponse.json(
      { error: 'Failed to create study plan' },
      { status: 500 }
    )
  }
} 