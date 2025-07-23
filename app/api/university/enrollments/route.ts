export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { getUserFromRequest } from '@/lib/server-utils'
import mongoose from 'mongoose'

// Enrollment Schema
const EnrollmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  status: { 
    type: String, 
    enum: ['ENROLLED', 'COMPLETED', 'DROPPED', 'PENDING'], 
    default: 'ENROLLED' 
  },
  enrollmentDate: { type: Date, default: Date.now },
  completionDate: Date,
  grade: String,
  finalScore: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

const Enrollment = mongoose.models.Enrollment || mongoose.model('Enrollment', EnrollmentSchema)

// GET - Fetch enrollments for authenticated user
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

    const enrollments = await Enrollment.find({ userId: user.id })
      .populate('courseId')
      .sort({ enrollmentDate: -1 })
      .lean()

    return NextResponse.json({ enrollments })
  } catch (error) {
    console.error('Error fetching enrollments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch enrollments' },
      { status: 500 }
    )
  }
}

// POST - Create new enrollment
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { courseId } = await request.json()

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      )
    }

    await connectToDatabase()

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      userId: user.id,
      courseId,
      status: { $in: ['ENROLLED', 'PENDING'] }
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Already enrolled in this course' },
        { status: 409 }
      )
    }

    const enrollment = await Enrollment.create({
      userId: user.id,
      courseId,
      status: 'ENROLLED',
      enrollmentDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return NextResponse.json({ enrollment }, { status: 201 })
  } catch (error) {
    console.error('Error creating enrollment:', error)
    return NextResponse.json(
      { error: 'Failed to create enrollment' },
      { status: 500 }
    )
  }
} 