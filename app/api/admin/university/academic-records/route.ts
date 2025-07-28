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

export async function GET(request: NextRequest) {
  try {
    const validation = await validateAdmin(request)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: validation.status })
    }

    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Get academic records with pagination
    const academicRecords = await AcademicRecord.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean() as IAcademicRecord[]

    const totalRecords = await AcademicRecord.countDocuments({})

    // Get unique user IDs
    const userIds = Array.from(new Set(academicRecords.map(record => record.userId)))

    // Get user information
    const users = await User.find({ _id: { $in: userIds } }).lean()
    const userMap = new Map()
    users.forEach((user: any) => {
      userMap.set(user._id.toString(), {
        fullName: user.fullName,
        email: user.email
      })
    })

    // Get all course IDs from all records
    const allCourseIds = new Set<string>()
    academicRecords.forEach(record => {
      record.courses.forEach(course => {
        allCourseIds.add(course.courseId)
      })
    })

    // Get course information
    const courses = await Course.find({ _id: { $in: Array.from(allCourseIds) } }).lean()
    const courseMap = new Map()
    courses.forEach((course: any) => {
      courseMap.set(course._id.toString(), {
        title: course.title,
        courseCode: course.courseCode,
        credits: course.credits,
        department: course.department
      })
    })

    // Format records with user and course information
    const formattedRecords = academicRecords.map(record => {
      const userInfo = userMap.get(record.userId) || { fullName: 'Unknown Student', email: 'no-email' }
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

      return {
        ...record,
        studentName: userInfo.fullName,
        studentEmail: userInfo.email,
        courses: formattedCourses
      }
    })

    return NextResponse.json({
      success: true,
      records: formattedRecords,
      pagination: {
        page,
        limit,
        total: totalRecords,
        totalPages: Math.ceil(totalRecords / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching academic records:', error)
    return NextResponse.json(
      { error: 'Failed to fetch academic records' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const validation = await validateAdmin(request)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: validation.status })
    }

    await connectToDatabase()

    const data = await request.json()

    // Validate required fields
    if (!data.userId || !data.academicYear || !data.semester || !data.courses) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, academicYear, semester, courses' },
        { status: 400 }
      )
    }

    // Process courses data
    const processedCourses = data.courses.map((course: any) => ({
      courseId: course.courseId,
      grade: course.grade,
      gpa: course.gpa,
      credits: course.credits
    }))

    // Calculate totals
    const totalCredits = processedCourses.reduce((sum: number, course: any) => sum + course.credits, 0)
    const completedCredits = processedCourses
      .filter((course: any) => course.grade !== 'F' && course.grade !== 'W')
      .reduce((sum: number, course: any) => sum + course.credits, 0)
    
    const semesterGPA = processedCourses.reduce((sum: number, course: any) => sum + (course.gpa * course.credits), 0) / totalCredits

    // Create academic record
    const academicRecord = new AcademicRecord({
      userId: data.userId,
      academicYear: data.academicYear,
      semester: data.semester,
      courses: processedCourses,
      semesterGPA: semesterGPA,
      cumulativeGPA: data.cumulativeGPA || semesterGPA,
      totalCredits: totalCredits,
      completedCredits: completedCredits,
      status: data.status || 'active'
    })

    await academicRecord.save()

    return NextResponse.json({
      success: true,
      record: academicRecord
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating academic record:', error)
    return NextResponse.json(
      { error: 'Failed to create academic record' },
      { status: 500 }
    )
  }
}