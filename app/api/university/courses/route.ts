import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { getUserFromRequest } from '@/lib/server-utils'
import mongoose from 'mongoose'

// Course Schema
const CourseSchema = new mongoose.Schema({
  name: String,
  code: String,
  credits: Number,
  description: String,
  instructor: String,
  universityId: { type: mongoose.Schema.Types.ObjectId, ref: 'University' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema)

// GET - Fetch courses for authenticated user
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

    // Get courses (for now return all active courses)
    const courses = await Course.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ courses })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}

// POST - Create new course (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name, code, credits, description, instructor, universityId } = await request.json()

    if (!name || !code || !credits) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    await connectToDatabase()

    // Check if course code already exists
    const existingCourse = await Course.findOne({ code })
    if (existingCourse) {
      return NextResponse.json(
        { error: 'Course code already exists' },
        { status: 409 }
      )
    }

    const course = await Course.create({
      name,
      code,
      credits,
      description,
      instructor,
      universityId,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return NextResponse.json({ course }, { status: 201 })
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    )
  }
} 