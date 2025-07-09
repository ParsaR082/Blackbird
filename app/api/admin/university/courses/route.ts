import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { getUserFromRequest } from '@/lib/server-utils'
import { Course } from '@/lib/models/university'
import mongoose from 'mongoose'

// Helper to check if user is admin
async function validateAdmin(request: NextRequest) {
  const user = await getUserFromRequest(request)
  
  if (!user) {
    return { isValid: false, error: 'Unauthorized', status: 401 }
  }
  
  if (user.role !== 'ADMIN') {
    return { isValid: false, error: 'Forbidden: Admin access required', status: 403 }
  }
  
  return { isValid: true, user }
}

// GET - Retrieve courses (with optional filters)
export async function GET(request: NextRequest) {
  try {
    // Validate admin access
    const validation = await validateAdmin(request)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: validation.status })
    }
    
    await connectToDatabase()
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    
    if (courseId) {
      // Fetch a single course by ID
      const course = await Course.findById(courseId)
      
      if (!course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 })
      }
      
      return NextResponse.json({ 
        success: true,
        course
      })
    }
    
    // Fetch all courses with optional filtering
    const department = searchParams.get('department')
    const level = searchParams.get('level')
    const semester = searchParams.get('semester')
    const year = parseInt(searchParams.get('year') || '0')
    const isActive = searchParams.get('isActive') === 'true'
    
    // Build query
    const query: any = {}
    
    if (department) {
      query.department = department
    }
    
    if (level) {
      query.level = level
    }
    
    if (semester) {
      query.semester = semester
    }
    
    if (year > 0) {
      query.year = year
    }
    
    if (searchParams.has('isActive')) {
      query.isActive = isActive
    }
    
    const courses = await Course.find(query)
      .sort({ updatedAt: -1 })
      
    return NextResponse.json({
      success: true,
      count: courses.length,
      courses
    })
    
  } catch (error) {
    console.error('Admin courses fetch error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch courses' 
    }, { status: 500 })
  }
}

// POST - Create a new course
export async function POST(request: NextRequest) {
  try {
    // Validate admin access
    const validation = await validateAdmin(request)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: validation.status })
    }
    
    const user = validation.user!
    await connectToDatabase()
    
    const courseData = await request.json()
    
    // Validate required fields
    const requiredFields = ['courseCode', 'title', 'description', 'credits', 'department', 'level', 'semester', 'year', 'maxStudents']
    for (const field of requiredFields) {
      if (!courseData[field]) {
        return NextResponse.json({ 
          success: false, 
          error: `Missing required field: ${field}` 
        }, { status: 400 })
      }
    }
    
    // Validate professor info
    if (!courseData.professor || !courseData.professor.name || !courseData.professor.email || !courseData.professor.department) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid professor information' 
      }, { status: 400 })
    }
    
    // Check for duplicate course code
    const existingCourse = await Course.findOne({ courseCode: courseData.courseCode })
    if (existingCourse) {
      return NextResponse.json({ 
        success: false, 
        error: 'Course code already exists' 
      }, { status: 409 })
    }
    
    // Create new course
    const newCourse = await Course.create({
      ...courseData,
      createdBy: user.id,
      currentEnrollments: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    return NextResponse.json({
      success: true,
      message: 'Course created successfully',
      course: newCourse
    }, { status: 201 })
    
  } catch (error) {
    console.error('Admin course creation error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create course' 
    }, { status: 500 })
  }
}

// PUT - Update an existing course
export async function PUT(request: NextRequest) {
  try {
    // Validate admin access
    const validation = await validateAdmin(request)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: validation.status })
    }
    
    await connectToDatabase()
    
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    
    if (!courseId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Course ID is required' 
      }, { status: 400 })
    }
    
    // Check if course exists
    const existingCourse = await Course.findById(courseId)
    if (!existingCourse) {
      return NextResponse.json({ 
        success: false, 
        error: 'Course not found' 
      }, { status: 404 })
    }
    
    const courseData = await request.json()
    
    // Remove fields that shouldn't be updated directly
    delete courseData._id
    delete courseData.createdAt
    delete courseData.createdBy
    delete courseData.currentEnrollments // This should be updated through enrollments
    
    // Update course
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { 
        ...courseData,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    )
    
    return NextResponse.json({
      success: true,
      message: 'Course updated successfully',
      course: updatedCourse
    })
    
  } catch (error) {
    console.error('Admin course update error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update course' 
    }, { status: 500 })
  }
}

// DELETE - Remove a course or set it inactive
export async function DELETE(request: NextRequest) {
  try {
    // Validate admin access
    const validation = await validateAdmin(request)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: validation.status })
    }
    
    await connectToDatabase()
    
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    
    if (!courseId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Course ID is required' 
      }, { status: 400 })
    }
    
    // Check if course exists
    const existingCourse = await Course.findById(courseId)
    if (!existingCourse) {
      return NextResponse.json({ 
        success: false, 
        error: 'Course not found' 
      }, { status: 404 })
    }
    
    // Check if hard delete or soft delete
    const hardDelete = searchParams.get('hard') === 'true'
    
    if (hardDelete) {
      // Check if there are any enrollments for this course
      const EnrollmentSchema = new mongoose.Schema({
        courseId: mongoose.Schema.Types.ObjectId
      })
      
      const Enrollment = mongoose.models.Enrollment || mongoose.model('Enrollment', EnrollmentSchema)
      
      const enrollments = await Enrollment.countDocuments({ courseId })
      
      if (enrollments > 0) {
        return NextResponse.json({ 
          success: false, 
          error: 'Cannot hard delete a course with existing enrollments' 
        }, { status: 409 })
      }
      
      // Perform hard delete
      await Course.findByIdAndDelete(courseId)
      
      return NextResponse.json({
        success: true,
        message: 'Course permanently deleted'
      })
    } else {
      // Perform soft delete by setting inactive
      await Course.findByIdAndUpdate(
        courseId,
        { isActive: false, updatedAt: new Date() },
        { new: true }
      )
      
      return NextResponse.json({
        success: true,
        message: 'Course deactivated successfully'
      })
    }
    
  } catch (error) {
    console.error('Admin course deletion error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete course' 
    }, { status: 500 })
  }
} 