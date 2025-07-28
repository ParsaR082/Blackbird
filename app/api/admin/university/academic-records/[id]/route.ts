export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { AcademicRecord, Course, IUser } from '@/lib/models/university'
import { validateAdmin } from '@/lib/server-utils'
import { IAcademicRecord } from '@/lib/models/university'

// Create a User model for MongoDB queries
const mongoose = require('mongoose')
const UserSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  role: String,
}, { collection: 'users' })

const User = mongoose.models.User || mongoose.model('User', UserSchema)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const validation = await validateAdmin(request)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: validation.status })
    }

    await connectToDatabase()

    const recordId = params.id
    const record = await AcademicRecord.findById(recordId).lean() as IAcademicRecord | null

    if (!record) {
      return NextResponse.json({ error: 'Academic record not found' }, { status: 404 })
    }

    // Get user information
    const user = await User.findById(record.userId).lean()

    // Get course information for all courses in the record
    const courseIds = record.courses.map(course => course.courseId)
    const courses = await Course.find({ _id: { $in: courseIds } }).lean()

    // Create a map for quick course lookup
    const courseMap = new Map()
    courses.forEach((course: any) => {
      courseMap.set(course._id.toString(), {
        title: course.title,
        courseCode: course.courseCode,
        credits: course.credits,
        department: course.department
      })
    })

    // Format courses with additional information
    const formattedCourses = record.courses.map(course => {
      const courseInfo = courseMap.get(course.courseId)
      return {
        ...course,
        courseInfo: courseInfo || {
          title: 'Unknown Course',
          courseCode: 'N/A',
          credits: 0,
          department: 'Unknown'
        }
      }
    })

    // Return formatted record
    return NextResponse.json({
      success: true,
      record: {
        _id: record._id,
        userId: record.userId,
        studentName: user ? (user as any).fullName : 'Unknown Student',
        studentEmail: user ? (user as any).email : 'no-email',
        academicYear: record.academicYear,
        semester: record.semester,
        courses: formattedCourses,
        semesterGPA: record.semesterGPA,
        cumulativeGPA: record.cumulativeGPA,
        totalCredits: record.totalCredits,
        completedCredits: record.completedCredits,
        status: record.status,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
      }
    })

  } catch (error) {
    console.error('Error fetching academic record:', error)
    return NextResponse.json(
      { error: 'Failed to fetch academic record' },
      { status: 500 }
    )
  }
}