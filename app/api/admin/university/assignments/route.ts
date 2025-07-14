import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { getUserFromRequest } from '@/lib/server-utils'
import mongoose from 'mongoose'
import { Assignment } from '@/lib/models/university'

// Helper to check if user is admin
async function validateAdmin(request: NextRequest) {
  const user = await getUserFromRequest(request)
  
  if (!user) {
    return { isValid: false, error: 'Unauthorized', status: 401 }
  }
  
  if (user.role !== 'ADMIN') {
    return { isValid: false, error: 'Forbidden: Admin access required', status: 403 }
  }
  
  return { isValid: true, user: user }
}

// GET - Retrieve assignments with optional filters
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
    const assignmentId = searchParams.get('assignmentId')
    
    if (assignmentId) {
      // Fetch a single assignment by ID
      const assignment = await Assignment.findById(assignmentId)
      
      if (!assignment) {
        return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
      }
      
      return NextResponse.json({ 
        success: true,
        assignment
      })
    }
    
    // Fetch assignments with optional filtering
    const courseId = searchParams.get('courseId')
    const type = searchParams.get('type')
    
    // Build query
    const query: any = {}
    
    if (courseId) {
      query.courseId = courseId
    }
    
    if (type && ['homework', 'quiz', 'exam', 'project', 'reading'].includes(type)) {
      query.type = type
    }
    
    // Get Course schema for population
    const CourseSchema = new mongoose.Schema({
      courseCode: String,
      title: String
    })
    
    const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema)
    
    const assignments = await Assignment.find(query)
      .populate({
        path: 'courseId',
        model: Course,
        select: 'courseCode title'
      })
      .sort({ dueDate: 1 })
    
    return NextResponse.json({
      success: true,
      count: assignments.length,
      assignments
    })
    
  } catch (error) {
    console.error('Admin assignments fetch error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch assignments' 
    }, { status: 500 })
  }
}

// POST - Create a new assignment
export async function POST(request: NextRequest) {
  try {
    // Validate admin access
    const validation = await validateAdmin(request)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: validation.status })
    }
    
    await connectToDatabase()
    
    const assignmentData = await request.json()
    
    // Validate required fields
    const requiredFields = ['courseId', 'title', 'description', 'type', 'dueDate', 'points']
    for (const field of requiredFields) {
      if (!assignmentData[field]) {
        return NextResponse.json({ 
          success: false, 
          error: `Missing required field: ${field}` 
        }, { status: 400 })
      }
    }
    
    // Validate assignment type
    if (!['homework', 'quiz', 'exam', 'project', 'reading'].includes(assignmentData.type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid assignment type' 
      }, { status: 400 })
    }
    
    // Check if course exists
    const CourseSchema = new mongoose.Schema({})
    const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema)
    
    const courseExists = await Course.exists({ _id: assignmentData.courseId })
    if (!courseExists) {
      return NextResponse.json({ 
        success: false, 
        error: 'Course not found' 
      }, { status: 404 })
    }
    
    // Create new assignment
    const newAssignment = await Assignment.create({
      ...assignmentData,
      isRequired: assignmentData.isRequired ?? true,
      attachments: assignmentData.attachments || [],
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    return NextResponse.json({
      success: true,
      message: 'Assignment created successfully',
      assignment: newAssignment
    }, { status: 201 })
    
  } catch (error) {
    console.error('Admin assignment creation error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create assignment' 
    }, { status: 500 })
  }
}

// PUT - Update an existing assignment
export async function PUT(request: NextRequest) {
  try {
    // Validate admin access
    const validation = await validateAdmin(request)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: validation.status })
    }
    
    await connectToDatabase()
    
    const { searchParams } = new URL(request.url)
    const assignmentId = searchParams.get('assignmentId')
    
    if (!assignmentId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Assignment ID is required' 
      }, { status: 400 })
    }
    
    // Check if assignment exists
    const existingAssignment = await Assignment.findById(assignmentId)
    if (!existingAssignment) {
      return NextResponse.json({ 
        success: false, 
        error: 'Assignment not found' 
      }, { status: 404 })
    }
    
    const assignmentData = await request.json()
    
    // Remove fields that shouldn't be updated directly
    delete assignmentData._id
    delete assignmentData.createdAt
    
    // If courseId is provided, check if it exists
    if (assignmentData.courseId && assignmentData.courseId !== existingAssignment.courseId.toString()) {
      const CourseSchema = new mongoose.Schema({})
      const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema)
      
      const courseExists = await Course.exists({ _id: assignmentData.courseId })
      if (!courseExists) {
        return NextResponse.json({ 
          success: false, 
          error: 'Course not found' 
        }, { status: 404 })
      }
    }
    
    // Validate assignment type if provided
    if (assignmentData.type && !['homework', 'quiz', 'exam', 'project', 'reading'].includes(assignmentData.type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid assignment type' 
      }, { status: 400 })
    }
    
    // Update assignment
    const updatedAssignment = await Assignment.findByIdAndUpdate(
      assignmentId,
      { 
        ...assignmentData,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    )
    
    return NextResponse.json({
      success: true,
      message: 'Assignment updated successfully',
      assignment: updatedAssignment
    })
    
  } catch (error) {
    console.error('Admin assignment update error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update assignment' 
    }, { status: 500 })
  }
}

// DELETE - Remove an assignment
export async function DELETE(request: NextRequest) {
  try {
    // Validate admin access
    const validation = await validateAdmin(request)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: validation.status })
    }
    
    await connectToDatabase()
    
    const { searchParams } = new URL(request.url)
    const assignmentId = searchParams.get('assignmentId')
    
    if (!assignmentId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Assignment ID is required' 
      }, { status: 400 })
    }
    
    // Check if assignment exists
    const existingAssignment = await Assignment.findById(assignmentId)
    if (!existingAssignment) {
      return NextResponse.json({ 
        success: false, 
        error: 'Assignment not found' 
      }, { status: 404 })
    }
    
    // Check for student submissions before deleting
    const UserAssignmentSchema = new mongoose.Schema({
      assignmentId: mongoose.Schema.Types.ObjectId
    })
    
    const UserAssignment = mongoose.models.UserAssignment || 
      mongoose.model('UserAssignment', UserAssignmentSchema)
    
    const submissionCount = await UserAssignment.countDocuments({ assignmentId })
    
    if (submissionCount > 0) {
      return NextResponse.json({ 
        success: false, 
        error: `Cannot delete assignment with ${submissionCount} student submissions. Consider updating the assignment instead.` 
      }, { status: 409 })
    }
    
    // Delete the assignment
    await Assignment.findByIdAndDelete(assignmentId)
    
    return NextResponse.json({
      success: true,
      message: 'Assignment deleted successfully'
    })
    
  } catch (error) {
    console.error('Admin assignment deletion error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete assignment' 
    }, { status: 500 })
  }
} 