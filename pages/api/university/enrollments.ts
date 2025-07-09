import { NextApiRequest, NextApiResponse } from 'next'
import connectToDatabase from '../../../lib/mongodb'
import { UserCourse } from '../../../lib/models/university'
import { Course } from '../../../lib/models/university'
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
        return await getEnrollments(req, res, session.user.email)
      case 'POST':
        return await enrollInCourse(req, res, session.user.email)
      case 'PUT':
        return await updateEnrollment(req, res, session.user.email)
      case 'DELETE':
        return await unenrollFromCourse(req, res, session.user.email)
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        return res.status(405).json({ error: `Method ${method} not allowed` })
    }
  } catch (error) {
    console.error('Enrollments API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function getEnrollments(req: NextApiRequest, res: NextApiResponse, userEmail: string) {
  try {
    const { year, semester } = req.query

    const query: any = { userEmail }
    if (year) query.year = year
    if (semester) query.semester = semester

    const enrollments = await UserCourse.find(query)
      .populate('courseId')
      .sort({ year: -1, semester: -1, createdAt: -1 })

    // Group by academic year and semester
    const groupedEnrollments = enrollments.reduce((acc: any, enrollment: any) => {
      const key = `${enrollment.year}-${enrollment.semester}`
      if (!acc[key]) {
        acc[key] = {
          year: enrollment.year,
          semester: enrollment.semester,
          courses: [],
          totalCredits: 0,
          gpa: 0
        }
      }
      acc[key].courses.push(enrollment)
      acc[key].totalCredits += enrollment.courseId.credits
      return acc
    }, {})

    // Calculate GPA for each semester
    Object.values(groupedEnrollments).forEach((semester: any) => {
      const completedCourses = semester.courses.filter((c: any) => c.grade && c.status === 'completed')
      if (completedCourses.length > 0) {
        const totalPoints = completedCourses.reduce((sum: number, course: any) => {
          const gradePoint = getGradePoint(course.grade)
          return sum + (gradePoint * course.courseId.credits)
        }, 0)
        const totalCredits = completedCourses.reduce((sum: number, course: any) => sum + course.courseId.credits, 0)
        semester.gpa = totalCredits > 0 ? totalPoints / totalCredits : 0
      }
    })

    return res.status(200).json({
      enrollments: Object.values(groupedEnrollments),
      total: enrollments.length
    })
  } catch (error) {
    console.error('Get enrollments error:', error)
    return res.status(500).json({ error: 'Failed to fetch enrollments' })
  }
}

async function enrollInCourse(req: NextApiRequest, res: NextApiResponse, userEmail: string) {
  try {
    const { courseId, year, semester } = req.body

    if (!courseId || !year || !semester) {
      return res.status(400).json({ error: 'Course ID, year, and semester are required' })
    }

    // Check if course exists
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ error: 'Course not found' })
    }

    // Check if already enrolled
    const existingEnrollment = await UserCourse.findOne({
      userEmail,
      courseId,
      year,
      semester
    })

    if (existingEnrollment) {
      return res.status(400).json({ error: 'Already enrolled in this course for this semester' })
    }

    // Check enrollment capacity
    const currentEnrollments = await UserCourse.countDocuments({
      courseId,
      year,
      semester,
      status: { $in: ['enrolled', 'completed'] }
    })

    if (course.maxEnrollment && currentEnrollments >= course.maxEnrollment) {
      return res.status(400).json({ error: 'Course enrollment is full' })
    }

    // Create enrollment
    const enrollment = new UserCourse({
      userEmail,
      courseId,
      year,
      semester,
      status: 'enrolled',
      enrollmentDate: new Date()
    })

    await enrollment.save()
    await enrollment.populate('courseId')

    return res.status(201).json(enrollment)
  } catch (error) {
    console.error('Enroll in course error:', error)
    return res.status(500).json({ error: 'Failed to enroll in course' })
  }
}

async function updateEnrollment(req: NextApiRequest, res: NextApiResponse, userEmail: string) {
  try {
    const { enrollmentId, grade, status, attendance, notes } = req.body

    if (!enrollmentId) {
      return res.status(400).json({ error: 'Enrollment ID is required' })
    }

    const enrollment = await UserCourse.findOne({
      _id: enrollmentId,
      userEmail
    })

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' })
    }

    // Update allowed fields
    if (grade !== undefined) enrollment.grade = grade
    if (status !== undefined) enrollment.status = status
    if (attendance !== undefined) enrollment.attendance = attendance
    if (notes !== undefined) enrollment.notes = notes

    await enrollment.save()
    await enrollment.populate('courseId')

    return res.status(200).json(enrollment)
  } catch (error) {
    console.error('Update enrollment error:', error)
    return res.status(500).json({ error: 'Failed to update enrollment' })
  }
}

async function unenrollFromCourse(req: NextApiRequest, res: NextApiResponse, userEmail: string) {
  try {
    const { enrollmentId } = req.query

    if (!enrollmentId) {
      return res.status(400).json({ error: 'Enrollment ID is required' })
    }

    const enrollment = await UserCourse.findOne({
      _id: enrollmentId,
      userEmail
    })

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' })
    }

    // Only allow unenrollment if course hasn't been completed
    if (enrollment.status === 'completed') {
      return res.status(400).json({ error: 'Cannot unenroll from completed course' })
    }

    await UserCourse.findByIdAndDelete(enrollmentId)

    return res.status(200).json({ message: 'Successfully unenrolled from course' })
  } catch (error) {
    console.error('Unenroll from course error:', error)
    return res.status(500).json({ error: 'Failed to unenroll from course' })
  }
}

function getGradePoint(grade: string): number {
  const gradePoints: { [key: string]: number } = {
    'A': 4.0,
    'A-': 3.7,
    'B+': 3.3,
    'B': 3.0,
    'B-': 2.7,
    'C+': 2.3,
    'C': 2.0,
    'C-': 1.7,
    'D+': 1.3,
    'D': 1.0,
    'F': 0.0
  }
  return gradePoints[grade] || 0.0
} 