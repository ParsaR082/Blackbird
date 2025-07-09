import { NextApiRequest, NextApiResponse } from 'next'
import connectToDatabase from '../../../lib/mongodb'
import { StudyPlan } from '../../../lib/models/university'
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
        return await getStudyPlans(req, res, session.user.email)
      case 'POST':
        return await createStudyPlan(req, res, session.user.email)
      case 'PUT':
        return await updateStudyPlan(req, res, session.user.email)
      case 'DELETE':
        return await deleteStudyPlan(req, res, session.user.email)
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        return res.status(405).json({ error: `Method ${method} not allowed` })
    }
  } catch (error) {
    console.error('Study plans API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function getStudyPlans(req: NextApiRequest, res: NextApiResponse, userEmail: string) {
  try {
    const { active, year } = req.query

    const query: any = { userEmail }
    if (active === 'true') query.isActive = true
    if (year) query.academicYear = year

    const studyPlans = await StudyPlan.find(query)
      .populate('plannedCourses.courseId', 'courseCode title credits department')
      .sort({ createdAt: -1 })

    return res.status(200).json({
      studyPlans,
      total: studyPlans.length
    })
  } catch (error) {
    console.error('Get study plans error:', error)
    return res.status(500).json({ error: 'Failed to fetch study plans' })
  }
}

async function createStudyPlan(req: NextApiRequest, res: NextApiResponse, userEmail: string) {
  try {
    const {
      title,
      description,
      academicYear,
      targetGPA,
      goals,
      plannedCourses,
      isActive,
      milestones
    } = req.body

    if (!title || !academicYear) {
      return res.status(400).json({ error: 'Title and academic year are required' })
    }

    // If setting as active, deactivate other plans
    if (isActive) {
      await StudyPlan.updateMany(
        { userEmail, isActive: true },
        { isActive: false }
      )
    }

    const studyPlan = new StudyPlan({
      userEmail,
      title,
      description,
      academicYear,
      targetGPA,
      goals: goals || [],
      plannedCourses: plannedCourses || [],
      isActive: isActive || false,
      milestones: milestones || []
    })

    await studyPlan.save()
    await studyPlan.populate('plannedCourses.courseId', 'courseCode title credits department')

    return res.status(201).json(studyPlan)
  } catch (error) {
    console.error('Create study plan error:', error)
    return res.status(500).json({ error: 'Failed to create study plan' })
  }
}

async function updateStudyPlan(req: NextApiRequest, res: NextApiResponse, userEmail: string) {
  try {
    const { planId, ...updates } = req.body

    if (!planId) {
      return res.status(400).json({ error: 'Plan ID is required' })
    }

    const studyPlan = await StudyPlan.findOne({
      _id: planId,
      userEmail
    })

    if (!studyPlan) {
      return res.status(404).json({ error: 'Study plan not found' })
    }

    // If setting as active, deactivate other plans
    if (updates.isActive && !studyPlan.isActive) {
      await StudyPlan.updateMany(
        { userEmail, isActive: true, _id: { $ne: planId } },
        { isActive: false }
      )
    }

    // Update allowed fields
    const allowedUpdates = [
      'title', 'description', 'targetGPA', 'goals', 'plannedCourses',
      'isActive', 'milestones', 'completedGoals', 'progress'
    ]

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        studyPlan[field] = updates[field]
      }
    })

    studyPlan.lastModified = new Date()

    await studyPlan.save()
    await studyPlan.populate('plannedCourses.courseId', 'courseCode title credits department')

    return res.status(200).json(studyPlan)
  } catch (error) {
    console.error('Update study plan error:', error)
    return res.status(500).json({ error: 'Failed to update study plan' })
  }
}

async function deleteStudyPlan(req: NextApiRequest, res: NextApiResponse, userEmail: string) {
  try {
    const { planId } = req.query

    if (!planId) {
      return res.status(400).json({ error: 'Plan ID is required' })
    }

    const studyPlan = await StudyPlan.findOne({
      _id: planId,
      userEmail
    })

    if (!studyPlan) {
      return res.status(404).json({ error: 'Study plan not found' })
    }

    await StudyPlan.findByIdAndDelete(planId)

    return res.status(200).json({ message: 'Study plan deleted successfully' })
  } catch (error) {
    console.error('Delete study plan error:', error)
    return res.status(500).json({ error: 'Failed to delete study plan' })
  }
} 