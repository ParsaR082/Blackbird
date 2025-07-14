// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { validateAdmin } from '@/lib/server-utils'
import mongoose from 'mongoose'

// GET - Retrieve a specific academic record
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate admin access
    const validation = await validateAdmin(request)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: validation.status })
    }
    
    const recordId = params.id
    
    if (!recordId || !mongoose.Types.ObjectId.isValid(recordId)) {
      return NextResponse.json({ error: 'Invalid record ID' }, { status: 400 })
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
    
    // Find academic record
    const record = await AcademicRecord.findById(recordId).lean()
    
    if (!record) {
      return NextResponse.json({ error: 'Academic record not found' }, { status: 404 })
    }
    
    // Get user data
    const user = record && typeof record === 'object' && 'userId' in record
      ? await User.findById(record.userId).lean()
      : null
    
    // Get course IDs from academic record
    const courseIds = record && typeof record === 'object' && 'courses' in record && Array.isArray(record.courses)
      ? record.courses.map(course => course.courseId)
      : []
    
    // Fetch course data
    const courses = await Course.find({ _id: { $in: courseIds } }).lean()
    
    // Create a map of course data for quick lookup
    const courseMap = new Map()
    if (Array.isArray(courses)) {
      courses.forEach((course: any) => {
        if (course && typeof course === 'object' && '_id' in course) {
          courseMap.set(course._id.toString(), {
            courseName: course.title,
            courseCode: course.courseCode
          })
        }
      })
    }
    
    // Format courses with course names
    const formattedCourses = record && typeof record === 'object' && 'courses' in record && Array.isArray(record.courses)
      ? record.courses.map((course: any) => {
          const courseData = course.courseId && courseMap.get(course.courseId.toString()) || {}
          return {
            courseId: course.courseId,
            courseName: courseData.courseName || 'Unknown Course',
            courseCode: courseData.courseCode || 'N/A',
            grade: course.grade,
            gpa: course.gpa,
            credits: course.credits
          }
        })
      : []
    
    // Format response
    const formattedRecord = {
      _id: record && typeof record === 'object' && '_id' in record ? record._id : null,
      userId: record && typeof record === 'object' && 'userId' in record ? record.userId : null,
      studentName: user && typeof user === 'object' && 'fullName' in user ? user.fullName : 'Unknown Student',
      studentEmail: user && typeof user === 'object' && 'email' in user ? user.email : 'no-email',
      academicYear: record && typeof record === 'object' && 'academicYear' in record ? record.academicYear : 0,
      semester: record && typeof record === 'object' && 'semester' in record ? record.semester : '',
      courses: formattedCourses,
      semesterGPA: record && typeof record === 'object' && 'semesterGPA' in record ? record.semesterGPA : 0,
      cumulativeGPA: record && typeof record === 'object' && 'cumulativeGPA' in record ? record.cumulativeGPA : 0,
      totalCredits: record && typeof record === 'object' && 'totalCredits' in record ? record.totalCredits : 0,
      completedCredits: record && typeof record === 'object' && 'completedCredits' in record ? record.completedCredits : 0,
      status: record && typeof record === 'object' && 'status' in record ? record.status : 'unknown',
      createdAt: record && typeof record === 'object' && 'createdAt' in record ? record.createdAt : null,
      updatedAt: record && typeof record === 'object' && 'updatedAt' in record ? record.updatedAt : null
    }
    
    return NextResponse.json({
      success: true,
      record: formattedRecord
    })
    
  } catch (error) {
    console.error('Admin academic record fetch error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch academic record' 
    }, { status: 500 })
  }
}

// PUT - Update a specific academic record
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate admin access
    const validation = await validateAdmin(request)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: validation.status })
    }
    
    const recordId = params.id
    
    if (!recordId || !mongoose.Types.ObjectId.isValid(recordId)) {
      return NextResponse.json({ error: 'Invalid record ID' }, { status: 400 })
    }
    
    await connectToDatabase()
    
    // Get update data from request body
    const data = await request.json()
    
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
    
    // Find academic record
    const record = await AcademicRecord.findById(recordId)
    
    if (!record) {
      return NextResponse.json({ error: 'Academic record not found' }, { status: 404 })
    }
    
    // Update status if provided
    if (data.status && ['active', 'completed', 'on-hold'].includes(data.status)) {
      record.status = data.status
    }
    
    // Update course grades if provided
    if (Array.isArray(data.courses)) {
      // Create a map of course updates for quick lookup
      const courseUpdates = new Map()
      data.courses.forEach((course: { courseId: string, grade: string }) => {
        courseUpdates.set(course.courseId.toString(), course.grade)
      })
      
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
      
      record.courses.forEach((course: { 
        courseId: { toString: () => string }, 
        credits: number, 
        grade: string, 
        gpa: number | null 
      }) => {
        const courseId = course.courseId.toString()
        const credits = course.credits
        totalCredits += credits
        
        // Update grade if provided
        if (courseUpdates.has(courseId)) {
          course.grade = courseUpdates.get(courseId)
        }
        
        // If course has a grade, calculate GPA points
        if (course.grade && courseGpaMap[course.grade]) {
          const gpa = courseGpaMap[course.grade]
          course.gpa = gpa
          totalPoints += gpa * credits
          completedCredits += credits
        } else {
          course.gpa = null
        }
      })
      
      // Update semester GPA
      record.semesterGPA = completedCredits > 0 ? totalPoints / completedCredits : 0
      record.completedCredits = completedCredits
      record.totalCredits = totalCredits
      
      // Update cumulative GPA
      const userId = record.userId
      const academicYear = record.academicYear
      const semester = record.semester
      
      // Get all other academic records for this user
      const otherRecords = await AcademicRecord.find({
        userId,
        _id: { $ne: recordId }
      }).lean()
      
      // Calculate cumulative GPA
      let cumulativeTotalPoints = totalPoints
      let cumulativeTotalCredits = completedCredits
      
      otherRecords.forEach(otherRecord => {
        cumulativeTotalPoints += otherRecord.semesterGPA * otherRecord.completedCredits
        cumulativeTotalCredits += otherRecord.completedCredits
      })
      
      record.cumulativeGPA = cumulativeTotalCredits > 0 ? cumulativeTotalPoints / cumulativeTotalCredits : 0
    }
    
    // Update timestamp
    record.updatedAt = new Date()
    
    // Save updated record
    await record.save()
    
    // Get updated record with formatted data
    const updatedRecord = await getFormattedRecord(record._id)
    
    return NextResponse.json({
      success: true,
      message: 'Academic record updated successfully',
      record: updatedRecord
    })
    
  } catch (error) {
    console.error('Admin academic record update error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update academic record' 
    }, { status: 500 })
  }
}

// Helper function to get formatted academic record
async function getFormattedRecord(recordId: string) {
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
  
  // Find academic record
  const record = await AcademicRecord.findById(recordId).lean()
  
  if (!record) {
    return null
  }
  
  // Get user data
  const user = await User.findById(record.userId).lean()
  
  // Get course IDs from academic record
  const courseIds = record.courses.map(course => course.courseId)
  
  // Fetch course data
  const courses = await Course.find({ _id: { $in: courseIds } }).lean()
  
  // Create a map of course data for quick lookup
  const courseMap = new Map()
  courses.forEach(course => {
    courseMap.set(course._id.toString(), {
      courseName: course.title,
      courseCode: course.courseCode
    })
  })
  
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
  
  // Format response
  return {
    _id: record._id,
    userId: record.userId,
    studentName: user ? user.fullName : 'Unknown Student',
    studentEmail: user ? user.email : 'no-email',
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
} 