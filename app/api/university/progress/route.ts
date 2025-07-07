import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { getUserFromRequest } from '@/lib/server-utils'
import mongoose from 'mongoose'

// Progress Schema
const ProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  completionPercentage: { type: Number, default: 0 },
  currentGrade: String,
  finalGrade: String,
  credits: Number,
  semester: String,
  academicYear: String,
  isCompleted: { type: Boolean, default: false },
  completedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

const Progress = mongoose.models.Progress || mongoose.model('Progress', ProgressSchema)

// GET - Fetch academic progress for authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const semester = url.searchParams.get('semester')
    const academicYear = url.searchParams.get('academicYear')

    await connectToDatabase()

    let query: any = { userId: user.id }
    if (semester) query.semester = semester
    if (academicYear) query.academicYear = academicYear

    const progressRecords = await Progress.find(query)
      .populate('courseId')
      .sort({ academicYear: -1, semester: -1, createdAt: -1 })
      .lean()

    // Calculate overall statistics
    const completedCourses = progressRecords.filter(p => p.isCompleted)
    const totalCredits = progressRecords.reduce((sum, p) => sum + (p.credits || 0), 0)
    const completedCredits = completedCourses.reduce((sum, p) => sum + (p.credits || 0), 0)

    // Calculate GPA (simplified calculation)
    const gradePoints: Record<string, number> = {
      'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0
    }

    const gradedCourses = completedCourses.filter((p: any) => p.finalGrade && gradePoints[p.finalGrade])
    const totalGradePoints = gradedCourses.reduce((sum: number, p: any) => {
      return sum + (gradePoints[p.finalGrade] * (p.credits || 0))
    }, 0)
    const totalGradedCredits = gradedCourses.reduce((sum: number, p: any) => sum + (p.credits || 0), 0)
    const overallGPA = totalGradedCredits > 0 ? (totalGradePoints / totalGradedCredits) : 0

    // Group by semester
    const semesterData: Record<string, any> = progressRecords.reduce((acc: Record<string, any>, record: any) => {
      const key = `${record.semester} ${record.academicYear}`
      if (!acc[key]) {
        acc[key] = {
          semester: record.semester,
          academicYear: record.academicYear,
          courses: [],
          totalCredits: 0,
          gpa: 0
        }
      }
      acc[key].courses.push(record)
      acc[key].totalCredits += record.credits || 0
      return acc
    }, {})

    // Calculate GPA for each semester
    Object.values(semesterData).forEach((semester: any) => {
      const semesterGradedCourses = semester.courses.filter((p: any) => p.finalGrade && gradePoints[p.finalGrade])
      const semesterGradePoints = semesterGradedCourses.reduce((sum: number, p: any) => {
        return sum + (gradePoints[p.finalGrade] * (p.credits || 0))
      }, 0)
      const semesterGradedCredits = semesterGradedCourses.reduce((sum: number, p: any) => sum + (p.credits || 0), 0)
      semester.gpa = semesterGradedCredits > 0 ? (semesterGradePoints / semesterGradedCredits) : 0
    })

    const progressSummary = {
      overallGPA: Math.round(overallGPA * 100) / 100,
      totalCredits,
      completedCredits,
      completedCourses: completedCourses.length,
      totalCourses: progressRecords.length,
      progressPercentage: totalCredits > 0 ? Math.round((completedCredits / totalCredits) * 100) : 0
    }

    return NextResponse.json({
      progressSummary,
      semesterData: Object.values(semesterData),
      progressRecords
    })
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    )
  }
}

// POST - Update course progress
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { 
      courseId, 
      completionPercentage, 
      currentGrade, 
      finalGrade, 
      credits, 
      semester, 
      academicYear, 
      isCompleted 
    } = await request.json()

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const updateData: any = {
      userId: user.id,
      courseId,
      completionPercentage,
      currentGrade,
      finalGrade,
      credits,
      semester,
      academicYear,
      isCompleted,
      updatedAt: new Date()
    }

    if (isCompleted) {
      updateData.completedAt = new Date()
    }

    const progress = await Progress.findOneAndUpdate(
      { userId: user.id, courseId },
      updateData,
      { upsert: true, new: true }
    )

    return NextResponse.json({ progress })
  } catch (error) {
    console.error('Error updating progress:', error)
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    )
  }
} 