export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Assignment, UserAssignment, Course } from '@/lib/models/university'
import { getUserFromRequest } from '@/lib/server-utils'
import { IAssignment, IUserAssignment } from '@/lib/models/university'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build query
    let query: any = {}
    if (courseId) {
      query.courseId = courseId
    }

    // Get assignments
    const assignments = await Assignment.find(query)
      .sort({ dueDate: 1 })
      .skip(skip)
      .limit(limit)
      .lean() as IAssignment[]

    const totalAssignments = await Assignment.countDocuments(query)

    // Get user assignments for this user
    const assignmentIds = assignments.map(assignment => (assignment as any)._id.toString())
    const userAssignments = await UserAssignment.find({
      userId: user.id,
      assignmentId: { $in: assignmentIds }
    }).lean() as IUserAssignment[]

    // Create a map for quick lookup
    const userAssignmentMap = new Map()
    userAssignments.forEach(userAssignment => {
      userAssignmentMap.set((userAssignment as any).assignmentId, userAssignment)
    })

    // Get course information
    const courseIds = assignments.map(assignment => assignment.courseId)
    const courses = await Course.find({ _id: { $in: courseIds } }).lean()
    const courseMap = new Map()
    courses.forEach(course => {
      courseMap.set((course as any)._id.toString(), course)
    })

    // Format assignments with user progress
    const formattedAssignments = assignments.map(assignment => {
      const userAssignment = userAssignmentMap.get((assignment as any)._id.toString())
      const course = courseMap.get(assignment.courseId)

      return {
        _id: (assignment as any)._id,
        courseId: assignment.courseId,
        courseName: course ? (course as any).title : 'Unknown Course',
        courseCode: course ? (course as any).courseCode : 'N/A',
        title: assignment.title,
        description: assignment.description,
        type: assignment.type,
        dueDate: assignment.dueDate,
        points: assignment.points,
        isRequired: assignment.isRequired,
        attachments: assignment.attachments || [],
        status: userAssignment ? (userAssignment as any).status : 'pending',
        submissionDate: userAssignment ? (userAssignment as any).submissionDate : null,
        grade: userAssignment ? (userAssignment as any).grade : null,
        feedback: userAssignment ? (userAssignment as any).feedback : null,
        timeSpent: userAssignment ? (userAssignment as any).timeSpent : 0,
        isCompleted: userAssignment ? (userAssignment as any).isCompleted : false
      }
    })

    // Filter by status if provided
    let filteredAssignments = formattedAssignments
    if (status && status !== 'all') {
      filteredAssignments = formattedAssignments.filter(assignment => assignment.status === status)
    }

    return NextResponse.json({
      success: true,
      assignments: filteredAssignments,
      pagination: {
        page,
        limit,
        total: totalAssignments,
        totalPages: Math.ceil(totalAssignments / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching assignments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    )
  }
}