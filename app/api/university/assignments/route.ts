import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { getUserFromRequest } from '@/lib/server-utils'
import { Assignment, UserAssignment } from '@/lib/models/university'
import mongoose from 'mongoose'

// GET - Retrieve assignments for the authenticated user
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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const assignmentId = searchParams.get('id')
    const courseId = searchParams.get('courseId')
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    // If specific assignment ID is requested
    if (assignmentId) {
      // Find the assignment
      const assignment = await Assignment.findById(assignmentId).lean()
      
      if (!assignment) {
        return NextResponse.json(
          { error: 'Assignment not found' },
          { status: 404 }
        )
      }
      
      // Find user's submission for this assignment
      const userAssignment = await UserAssignment.findOne({
        userId: user.id,
        assignmentId: assignment._id
      }).lean()
      
      // Get course details
      const CourseSchema = new mongoose.Schema({
        courseCode: String,
        title: String
      })
      
      const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema)
      const course = await Course.findById(assignment.courseId).lean()
      
      // Combine assignment data with user submission data
      const formattedAssignment = {
        _id: assignment._id,
        courseId: assignment.courseId,
        courseName: course ? course.title : 'Unknown Course',
        courseCode: course ? course.courseCode : 'N/A',
        title: assignment.title,
        description: assignment.description,
        type: assignment.type,
        dueDate: assignment.dueDate,
        points: assignment.points,
        isRequired: assignment.isRequired,
        attachments: assignment.attachments || [],
        status: userAssignment ? userAssignment.status : 'pending',
        submissionDate: userAssignment ? userAssignment.submissionDate : null,
        grade: userAssignment ? userAssignment.grade : null,
        feedback: userAssignment ? userAssignment.feedback : null,
        timeSpent: userAssignment ? userAssignment.timeSpent : 0,
        isCompleted: userAssignment ? userAssignment.isCompleted : false
      }
      
      return NextResponse.json({
        success: true,
        assignment: formattedAssignment
      })
    }

    // Get all enrolled courses for the user
    const EnrollmentSchema = new mongoose.Schema({
      userId: mongoose.Schema.Types.ObjectId,
      courseId: mongoose.Schema.Types.ObjectId,
      status: String
    })
    
    const Enrollment = mongoose.models.Enrollment || mongoose.model('Enrollment', EnrollmentSchema)
    const enrollments = await Enrollment.find({
      userId: user.id,
      status: { $in: ['enrolled', 'completed'] }
    }).lean()
    
    const enrolledCourseIds = enrollments.map(enrollment => enrollment.courseId)
    
    // Build query for assignments
    const query: any = {
      courseId: { $in: enrolledCourseIds }
    }
    
    if (courseId) {
      query.courseId = courseId
    }
    
    if (type) {
      query.type = type
    }
    
    // Find all assignments for enrolled courses
    const assignments = await Assignment.find(query).lean()
    
    // Find user's submissions for these assignments
    const assignmentIds = assignments.map(assignment => assignment._id)
    const userAssignments = await UserAssignment.find({
      userId: user.id,
      assignmentId: { $in: assignmentIds }
    }).lean()
    
    // Create a map of user assignments for quick lookup
    const userAssignmentMap = new Map()
    userAssignments.forEach(userAssignment => {
      userAssignmentMap.set(userAssignment.assignmentId.toString(), userAssignment)
    })
    
    // Get course details
    const CourseSchema = new mongoose.Schema({
      courseCode: String,
      title: String
    })
    
    const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema)
    const courses = await Course.find({ _id: { $in: enrolledCourseIds } }).lean()
    
    // Create a map of courses for quick lookup
    const courseMap = new Map()
    courses.forEach(course => {
      courseMap.set(course._id.toString(), course)
    })
    
    // Combine assignment data with user submission data
    const formattedAssignments = assignments.map(assignment => {
      const userAssignment = userAssignmentMap.get(assignment._id.toString())
      const course = courseMap.get(assignment.courseId.toString())
      
      // Determine assignment status
      let status = userAssignment ? userAssignment.status : 'pending'
      
      // Check if assignment is overdue
      if (status === 'pending' && new Date(assignment.dueDate) < new Date()) {
        status = 'overdue'
      }
      
      return {
        _id: assignment._id,
        courseId: assignment.courseId,
        courseName: course ? course.title : 'Unknown Course',
        courseCode: course ? course.courseCode : 'N/A',
        title: assignment.title,
        description: assignment.description,
        type: assignment.type,
        dueDate: assignment.dueDate,
        points: assignment.points,
        isRequired: assignment.isRequired,
        attachments: assignment.attachments || [],
        status,
        submissionDate: userAssignment ? userAssignment.submissionDate : null,
        grade: userAssignment ? userAssignment.grade : null,
        feedback: userAssignment ? userAssignment.feedback : null,
        timeSpent: userAssignment ? userAssignment.timeSpent : 0,
        isCompleted: userAssignment ? userAssignment.isCompleted : false
      }
    })
    
    // Filter by status if requested
    let filteredAssignments = formattedAssignments
    if (status) {
      filteredAssignments = formattedAssignments.filter(assignment => assignment.status === status)
    }
    
    return NextResponse.json({
      success: true,
      count: filteredAssignments.length,
      assignments: filteredAssignments
    })
  } catch (error) {
    console.error('Assignments fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    )
  }
} 