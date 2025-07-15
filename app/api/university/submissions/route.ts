import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { getUserFromRequest } from '@/lib/server-utils'
import { UserAssignment, Assignment } from '@/lib/models/university'
import mongoose from 'mongoose'

// GET - Retrieve user assignment submissions
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
    const submissionId = searchParams.get('id')
    const assignmentId = searchParams.get('assignmentId')
    const courseId = searchParams.get('courseId')
    const status = searchParams.get('status')

    // Build query
    const query: any = { userId: user.id }

    if (submissionId) {
      query._id = submissionId
    }

    if (assignmentId) {
      query.assignmentId = assignmentId
    }

    if (courseId) {
      query.courseId = courseId
    }

    if (status) {
      query.status = status
    }

    // Fetch user submissions
    const userAssignments = await UserAssignment.find(query)
      .populate('assignmentId')
      .sort({ updatedAt: -1 })

    return NextResponse.json({
      success: true,
      submissions: userAssignments
    })
  } catch (error) {
    console.error('Submissions fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    )
  }
}

// POST - Create a new assignment submission
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDatabase()

    // Parse form data for file uploads
    const formData = await request.formData()
    const assignmentId = formData.get('assignmentId')?.toString()
    const timeSpent = parseInt(formData.get('timeSpent')?.toString() || '0')
    const files = formData.getAll('files')

    if (!assignmentId) {
      return NextResponse.json(
        { error: 'Assignment ID is required' },
        { status: 400 }
      )
    }

    // Validate assignment exists
    const assignment = await Assignment.findById(assignmentId)
    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      )
    }

    // Check if submission already exists
    const existingSubmission = await UserAssignment.findOne({
      userId: user.id,
      assignmentId
    })

    if (existingSubmission) {
      // Update existing submission
      existingSubmission.status = 'submitted'
      existingSubmission.submissionDate = new Date()
      existingSubmission.timeSpent += timeSpent

      // Process file uploads
      if (files.length > 0) {
        // In a real implementation, you would upload files to a storage service
        // and store the URLs. For this example, we'll just store file names.
        const attachments = files.map((file: any) => ({
          name: file.name,
          url: `/uploads/${file.name}`, // Placeholder URL
          type: file.type
        }))

        existingSubmission.attachments = [
          ...existingSubmission.attachments,
          ...attachments
        ]
      }

      await existingSubmission.save()

      return NextResponse.json({
        success: true,
        message: 'Submission updated successfully',
        submission: existingSubmission
      })
    } else {
      // Create new submission
      const attachments = files.map((file: any) => ({
        name: file.name,
        url: `/uploads/${file.name}`, // Placeholder URL
        type: file.type
      }))

      const newSubmission = new UserAssignment({
        userId: user.id,
        assignmentId,
        courseId: assignment.courseId,
        status: 'submitted',
        submissionDate: new Date(),
        timeSpent,
        attachments,
        isCompleted: true
      })

      await newSubmission.save()

      return NextResponse.json({
        success: true,
        message: 'Assignment submitted successfully',
        submission: newSubmission
      }, { status: 201 })
    }
  } catch (error) {
    console.error('Submission creation error:', error)
    return NextResponse.json(
      { error: 'Failed to submit assignment' },
      { status: 500 }
    )
  }
}

// PUT - Update an existing submission
export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDatabase()

    // Get submission ID from query parameters
    const { searchParams } = new URL(request.url)
    const submissionId = searchParams.get('id')

    if (!submissionId) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      )
    }

    // Find submission
    const submission = await UserAssignment.findOne({
      _id: submissionId,
      userId: user.id
    })

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found or you do not have permission to update it' },
        { status: 404 }
      )
    }

    // Get update data
    const data = await request.json()

    // Only allow updating timeSpent and adding attachments for submitted assignments
    if (submission.status === 'submitted') {
      if (data.timeSpent) {
        submission.timeSpent = data.timeSpent
      }

      if (Array.isArray(data.attachments)) {
        submission.attachments = [
          ...submission.attachments,
          ...data.attachments
        ]
      }

      await submission.save()

      return NextResponse.json({
        success: true,
        message: 'Submission updated successfully',
        submission
      })
    } else {
      return NextResponse.json(
        { error: 'Cannot update submission that is already graded or overdue' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Submission update error:', error)
    return NextResponse.json(
      { error: 'Failed to update submission' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a submission
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDatabase()

    // Get submission ID from query parameters
    const { searchParams } = new URL(request.url)
    const submissionId = searchParams.get('id')

    if (!submissionId) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      )
    }

    // Find submission
    const submission = await UserAssignment.findOne({
      _id: submissionId,
      userId: user.id
    })

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found or you do not have permission to delete it' },
        { status: 404 }
      )
    }

    // Only allow deleting submissions that are not graded
    if (submission.status !== 'graded') {
      await UserAssignment.findByIdAndDelete(submissionId)

      return NextResponse.json({
        success: true,
        message: 'Submission deleted successfully'
      })
    } else {
      return NextResponse.json(
        { error: 'Cannot delete submission that has already been graded' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Submission deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete submission' },
      { status: 500 }
    )
  }
} 