import { NextApiRequest, NextApiResponse } from 'next'
import connectToDatabase from '../../../lib/mongodb'
import { Assignment, UserAssignment } from '../../../lib/models/university'
import { UserCourse } from '../../../lib/models/university'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectToDatabase()
    const session = await getServerSession(req, res, authOptions)

    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const { method } = req

    switch (method) {
      case 'GET':
        return await getAssignments(req, res, session.user.email)
      case 'POST':
        return await createOrUpdateAssignment(req, res, session.user.email)
      case 'PUT':
        return await updateAssignmentSubmission(req, res, session.user.email)
      case 'DELETE':
        return await deleteAssignment(req, res, session.user.email)
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        return res.status(405).json({ error: `Method ${method} not allowed` })
    }
  } catch (error) {
    console.error('Assignments API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function getAssignments(req: NextApiRequest, res: NextApiResponse, userEmail: string) {
  try {
    const { courseId, status, type, upcoming } = req.query

    // Get user's enrolled courses
    const userCourses = await UserCourse.find({ 
      userEmail,
      status: { $in: ['enrolled', 'completed'] }
    }).select('courseId')

    const enrolledCourseIds = userCourses.map(uc => uc.courseId)

    // Build assignment query
    const assignmentQuery: any = {
      courseId: { $in: enrolledCourseIds }
    }

    if (courseId) assignmentQuery.courseId = courseId
    if (type) assignmentQuery.type = type

    // Get assignments
    const assignments = await Assignment.find(assignmentQuery)
      .populate('courseId', 'courseCode title')
      .sort({ dueDate: 1 })

    // Get user submissions for these assignments
    const assignmentIds = assignments.map(a => a._id)
    const userSubmissions = await UserAssignment.find({
      userEmail,
      assignmentId: { $in: assignmentIds }
    })

    // Create lookup map for submissions
    const submissionMap = userSubmissions.reduce((acc: any, submission: any) => {
      acc[submission.assignmentId.toString()] = submission
      return acc
    }, {})

    // Combine assignments with user submissions
    let result = assignments.map(assignment => {
      const submission = submissionMap[assignment._id.toString()]
      return {
        ...assignment.toObject(),
        submission: submission || null,
        status: submission?.status || 'not_started',
        isOverdue: !submission && new Date() > assignment.dueDate
      }
    })

    // Apply filters
    if (status === 'pending') {
      result = result.filter(a => !a.submission || a.submission.status === 'in_progress')
    } else if (status === 'completed') {
      result = result.filter(a => a.submission?.status === 'completed')
    } else if (status === 'overdue') {
      result = result.filter(a => a.isOverdue)
    }

    if (upcoming === 'true') {
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)
      result = result.filter(a => a.dueDate <= nextWeek && (!a.submission || a.submission.status !== 'completed'))
    }

    return res.status(200).json({
      assignments: result,
      total: result.length
    })
  } catch (error) {
    console.error('Get assignments error:', error)
    return res.status(500).json({ error: 'Failed to fetch assignments' })
  }
}

async function createOrUpdateAssignment(req: NextApiRequest, res: NextApiResponse, userEmail: string) {
  try {
    const { assignmentId, submissionText, attachments, timeSpent, notes } = req.body

    if (!assignmentId) {
      return res.status(400).json({ error: 'Assignment ID is required' })
    }

    // Check if assignment exists
    const assignment = await Assignment.findById(assignmentId)
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' })
    }

    // Check if user is enrolled in the course
    const enrollment = await UserCourse.findOne({
      userEmail,
      courseId: assignment.courseId,
      status: { $in: ['enrolled', 'completed'] }
    })

    if (!enrollment) {
      return res.status(403).json({ error: 'Not enrolled in this course' })
    }

    // Find or create user assignment
    let userAssignment = await UserAssignment.findOne({
      userEmail,
      assignmentId
    })

    if (!userAssignment) {
      userAssignment = new UserAssignment({
        userEmail,
        assignmentId,
        status: 'in_progress',
        submissionDate: new Date()
      })
    }

    // Update submission
    if (submissionText !== undefined) userAssignment.submissionText = submissionText
    if (attachments !== undefined) userAssignment.attachments = attachments
    if (timeSpent !== undefined) userAssignment.timeSpent = timeSpent
    if (notes !== undefined) userAssignment.notes = notes

    userAssignment.lastModified = new Date()

    await userAssignment.save()
    await userAssignment.populate('assignmentId')

    return res.status(200).json(userAssignment)
  } catch (error) {
    console.error('Create/update assignment error:', error)
    return res.status(500).json({ error: 'Failed to save assignment submission' })
  }
}

async function updateAssignmentSubmission(req: NextApiRequest, res: NextApiResponse, userEmail: string) {
  try {
    const { submissionId, status, grade, feedback, submissionText, attachments } = req.body

    if (!submissionId) {
      return res.status(400).json({ error: 'Submission ID is required' })
    }

    const userAssignment = await UserAssignment.findOne({
      _id: submissionId,
      userEmail
    })

    if (!userAssignment) {
      return res.status(404).json({ error: 'Assignment submission not found' })
    }

    // Update submission
    if (status !== undefined) userAssignment.status = status
    if (grade !== undefined) userAssignment.grade = grade
    if (feedback !== undefined) userAssignment.feedback = feedback
    if (submissionText !== undefined) userAssignment.submissionText = submissionText
    if (attachments !== undefined) userAssignment.attachments = attachments

    if (status === 'completed') {
      userAssignment.completionDate = new Date()
    }

    userAssignment.lastModified = new Date()

    await userAssignment.save()
    await userAssignment.populate('assignmentId')

    return res.status(200).json(userAssignment)
  } catch (error) {
    console.error('Update assignment submission error:', error)
    return res.status(500).json({ error: 'Failed to update assignment submission' })
  }
}

async function deleteAssignment(req: NextApiRequest, res: NextApiResponse, userEmail: string) {
  try {
    const { submissionId } = req.query

    if (!submissionId) {
      return res.status(400).json({ error: 'Submission ID is required' })
    }

    const userAssignment = await UserAssignment.findOne({
      _id: submissionId,
      userEmail
    })

    if (!userAssignment) {
      return res.status(404).json({ error: 'Assignment submission not found' })
    }

    // Only allow deletion if not yet graded
    if (userAssignment.grade) {
      return res.status(400).json({ error: 'Cannot delete graded assignment' })
    }

    await UserAssignment.findByIdAndDelete(submissionId)

    return res.status(200).json({ message: 'Assignment submission deleted' })
  } catch (error) {
    console.error('Delete assignment error:', error)
    return res.status(500).json({ error: 'Failed to delete assignment submission' })
  }
} 