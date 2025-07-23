export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { validateAdmin } from '@/lib/server-utils'
import mongoose from 'mongoose'

// GET - Retrieve academic records with optional filtering
export async function GET(request: NextRequest) {
  try {
    // Validate admin access
    const validation = await validateAdmin(request)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: validation.status })
    }
    
    await connectToDatabase()
    
    // Define schemas
    const UserSchema = new mongoose.Schema({
      email: String,
      fullName: String,
      username: String
    })
    
    const CourseSchema = new mongoose.Schema({
      courseCode: String,
      title: String,
      credits: Number
    })
    
    const AcademicRecordSchema = new mongoose.Schema({
      userId: mongoose.Schema.Types.ObjectId,
      academicYear: Number,
      semester: String,
      courses: [{
        courseId: mongoose.Schema.Types.ObjectId,
        grade: String,
        gpa: Number,
        credits: Number
      }],
      semesterGPA: Number,
      cumulativeGPA: Number,
      totalCredits: Number,
      completedCredits: Number,
      status: String
    })
    
    // Create models
    const User = mongoose.models.User || mongoose.model('User', UserSchema)
    const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema)
    const AcademicRecord = mongoose.models.AcademicRecord || mongoose.model('AcademicRecord', AcademicRecordSchema)
    
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const academicYear = searchParams.get('year')
    const semester = searchParams.get('semester')
    const status = searchParams.get('status')
    
    // Build query
    const query: any = {}
    
    if (studentId) {
      query.userId = studentId
    }
    
    if (academicYear) {
      query.academicYear = parseInt(academicYear)
    }
    
    if (semester) {
      query.semester = semester
    }
    
    if (status) {
      query.status = status
    }
    
    // Fetch academic records
    const academicRecords = await AcademicRecord.find(query).lean()
    
    // Get user IDs from academic records
    const userIds = [...new Set(academicRecords.map(record => record.userId))]
    
    // Fetch user data
    const users = await User.find({ _id: { $in: userIds } }).lean()
    
    // Create a map of user data for quick lookup
    const userMap = new Map()
    users.forEach(user => {
      userMap.set(user._id.toString(), {
        fullName: user.fullName,
        email: user.email,
        username: user.username
      })
    })
    
    // Get all course IDs from academic records
    const courseIds = new Set()
    academicRecords.forEach(record => {
      record.courses.forEach(course => {
        courseIds.add(course.courseId.toString())
      })
    })
    
    // Fetch course data
    const courses = await Course.find({ _id: { $in: Array.from(courseIds) } }).lean()
    
    // Create a map of course data for quick lookup
    const courseMap = new Map()
    courses.forEach(course => {
      courseMap.set(course._id.toString(), {
        courseName: course.title,
        courseCode: course.courseCode
      })
    })
    
    // Combine academic records with user and course data
    const formattedRecords = academicRecords.map(record => {
      const userData = userMap.get(record.userId.toString()) || {}
      
      // Format courses with course names
      const formattedCourses = record.courses.map(course => {
        const courseData = courseMap.get(course.courseId.toString()) || {}
        return {
          courseId: course.courseId,
          courseName: courseData.courseName || 'Unknown Course',
          courseCode: courseData.courseCode || 'N/A',
          grade: course.grade,
          gpa: course.gpa,
          credits: course.credits
        }
      })
      
      return {
        _id: record._id,
        userId: record.userId,
        studentName: userData.fullName || 'Unknown Student',
        studentEmail: userData.email || 'no-email',
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
    
    return NextResponse.json({
      success: true,
      count: formattedRecords.length,
      records: formattedRecords
    })
    
  } catch (error) {
    console.error('Admin academic records fetch error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch academic records' 
    }, { status: 500 })
  }
}

// POST - Create a new academic record
export async function POST(request: NextRequest) {
  try {
    // Validate admin access
    const validation = await validateAdmin(request)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: validation.status })
    }
    
    await connectToDatabase()
    
    // Get academic record data from request body
    const data = await request.json()
    
    // Validate required fields
    if (!data.userId || !data.academicYear || !data.semester || !Array.isArray(data.courses)) {
      return NextResponse.json({ 
        error: 'Missing required fields: userId, academicYear, semester, courses' 
      }, { status: 400 })
    }
    
    // Define AcademicRecord schema
    const AcademicRecordSchema = new mongoose.Schema({
      userId: mongoose.Schema.Types.ObjectId,
      academicYear: Number,
      semester: String,
      courses: [{
        courseId: mongoose.Schema.Types.ObjectId,
        grade: String,
        gpa: Number,
        credits: Number
      }],
      semesterGPA: Number,
      cumulativeGPA: Number,
      totalCredits: Number,
      completedCredits: Number,
      status: String,
      createdAt: Date,
      updatedAt: Date
    })
    
    const AcademicRecord = mongoose.models.AcademicRecord || 
      mongoose.model('AcademicRecord', AcademicRecordSchema)
    
    // Check if record already exists for this user, year, and semester
    const existingRecord = await AcademicRecord.findOne({
      userId: data.userId,
      academicYear: data.academicYear,
      semester: data.semester
    })
    
    if (existingRecord) {
      return NextResponse.json({ 
        error: 'Academic record already exists for this student, year, and semester' 
      }, { status: 409 })
    }
    
    // Calculate GPA for each course
    const courseGpaMap: Record<string, number> = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'F': 0.0
    }
    
    // Process courses and calculate GPA
    let totalPoints = 0
    let totalCredits = 0
    let completedCredits = 0
    
    const processedCourses = data.courses.map(course => {
      const credits = course.credits || 0
      totalCredits += credits
      
      // If course has a grade, calculate GPA points
      if (course.grade && courseGpaMap[course.grade]) {
        const gpa = courseGpaMap[course.grade]
        totalPoints += gpa * credits
        completedCredits += credits
        
        return {
          courseId: course.courseId,
          grade: course.grade,
          gpa,
          credits
        }
      }
      
      return {
        courseId: course.courseId,
        grade: course.grade || null,
        gpa: null,
        credits
      }
    })
    
    // Calculate semester GPA
    const semesterGPA = completedCredits > 0 ? totalPoints / completedCredits : 0
    
    // Get previous academic records to calculate cumulative GPA
    const previousRecords = await AcademicRecord.find({
      userId: data.userId,
      $or: [
        { academicYear: { $lt: data.academicYear } },
        { 
          academicYear: data.academicYear,
          semester: { $in: getPreviousSemesters(data.semester) }
        }
      ]
    }).sort({ academicYear: -1, semester: -1 })
    
    // Calculate cumulative GPA
    let cumulativeTotalPoints = totalPoints
    let cumulativeTotalCredits = completedCredits
    
    previousRecords.forEach(record => {
      cumulativeTotalPoints += record.semesterGPA * record.completedCredits
      cumulativeTotalCredits += record.completedCredits
    })
    
    const cumulativeGPA = cumulativeTotalCredits > 0 ? cumulativeTotalPoints / cumulativeTotalCredits : 0
    
    // Create new academic record
    const newRecord = new AcademicRecord({
      userId: data.userId,
      academicYear: data.academicYear,
      semester: data.semester,
      courses: processedCourses,
      semesterGPA,
      cumulativeGPA,
      totalCredits,
      completedCredits,
      status: data.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    await newRecord.save()
    
    return NextResponse.json({
      success: true,
      message: 'Academic record created successfully',
      record: newRecord
    }, { status: 201 })
    
  } catch (error) {
    console.error('Admin academic record creation error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create academic record' 
    }, { status: 500 })
  }
}

// Helper function to get previous semesters
function getPreviousSemesters(currentSemester: string): string[] {
  const semesterOrder = ['Spring', 'Summer', 'Fall']
  const index = semesterOrder.indexOf(currentSemester)
  
  if (index <= 0) {
    return []
  }
  
  return semesterOrder.slice(0, index)
} 