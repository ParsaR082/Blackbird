import { NextApiRequest, NextApiResponse } from 'next'
import connectToDatabase from '../../../lib/mongodb'
import { AcademicRecord, UserCourse } from '../../../lib/models/university'
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
        return await getAcademicRecord(req, res, session.user.email)
      case 'POST':
        return await updateAcademicRecord(req, res, session.user.email)
      default:
        res.setHeader('Allow', ['GET', 'POST'])
        return res.status(405).json({ error: `Method ${method} not allowed` })
    }
  } catch (error) {
    console.error('Academic record API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function getAcademicRecord(req: NextApiRequest, res: NextApiResponse, userEmail: string) {
  try {
    const { year, semester } = req.query

    // Get all user enrollments
    const enrollments = await UserCourse.find({ userEmail })
      .populate('courseId')
      .sort({ year: -1, semester: -1 })

    // Calculate comprehensive academic statistics
    const academicData = calculateAcademicStats(enrollments)

    // Get existing academic records
    const query: any = { userEmail }
    if (year) query.academicYear = year
    if (semester) query.semester = semester

    const academicRecords = await AcademicRecord.find(query)
      .sort({ academicYear: -1, semester: -1 })

    // If no specific query, return comprehensive overview
    if (!year && !semester) {
      return res.status(200).json({
        overview: academicData,
        records: academicRecords,
        currentStatus: {
          totalCoursesTaken: academicData.totalCourses,
          totalCreditsEarned: academicData.totalCreditsEarned,
          cumulativeGPA: academicData.cumulativeGPA,
          currentSemesterGPA: academicData.currentSemesterGPA,
          academicStanding: getAcademicStanding(academicData.cumulativeGPA),
          progressTowardsGraduation: calculateGraduationProgress(academicData.totalCreditsEarned)
        }
      })
    }

    return res.status(200).json({
      records: academicRecords,
      semesterData: academicData.semesterBreakdown
    })
  } catch (error) {
    console.error('Get academic record error:', error)
    return res.status(500).json({ error: 'Failed to fetch academic record' })
  }
}

async function updateAcademicRecord(req: NextApiRequest, res: NextApiResponse, userEmail: string) {
  try {
    const { year, semester, gpa, creditsEarned, notes } = req.body

    if (!year || !semester) {
      return res.status(400).json({ error: 'Academic year and semester are required' })
    }

    // Find or create academic record
    let record = await AcademicRecord.findOne({
      userEmail,
      academicYear: year,
      semester
    })

    if (!record) {
      record = new AcademicRecord({
        userEmail,
        academicYear: year,
        semester
      })
    }

    // Update fields
    if (gpa !== undefined) record.semesterGPA = gpa
    if (creditsEarned !== undefined) record.creditsEarned = creditsEarned
    if (notes !== undefined) record.notes = notes

    // Recalculate cumulative GPA
    const allRecords = await AcademicRecord.find({ userEmail })
    const totalPoints = allRecords.reduce((sum, r) => sum + (r.semesterGPA * r.creditsEarned), 0)
    const totalCredits = allRecords.reduce((sum, r) => sum + r.creditsEarned, 0)
    
    record.cumulativeGPA = totalCredits > 0 ? totalPoints / totalCredits : 0
    record.totalCreditsEarned = totalCredits

    await record.save()

    return res.status(200).json(record)
  } catch (error) {
    console.error('Update academic record error:', error)
    return res.status(500).json({ error: 'Failed to update academic record' })
  }
}

function calculateAcademicStats(enrollments: any[]) {
  const semesterBreakdown: { [key: string]: any } = {}
  let totalCreditsEarned = 0
  let totalQualityPoints = 0
  let totalCourses = enrollments.length

  enrollments.forEach(enrollment => {
    const semesterKey = `${enrollment.year}-${enrollment.semester}`
    
    if (!semesterBreakdown[semesterKey]) {
      semesterBreakdown[semesterKey] = {
        year: enrollment.year,
        semester: enrollment.semester,
        courses: [],
        creditsAttempted: 0,
        creditsEarned: 0,
        qualityPoints: 0,
        gpa: 0
      }
    }

    const semester = semesterBreakdown[semesterKey]
    semester.courses.push(enrollment)
    semester.creditsAttempted += enrollment.courseId.credits

    if (enrollment.grade && enrollment.status === 'completed') {
      const gradePoint = getGradePoint(enrollment.grade)
      const qualityPoints = gradePoint * enrollment.courseId.credits
      
      semester.creditsEarned += enrollment.courseId.credits
      semester.qualityPoints += qualityPoints
      
      totalCreditsEarned += enrollment.courseId.credits
      totalQualityPoints += qualityPoints
    }
  })

  // Calculate semester GPAs
  Object.values(semesterBreakdown).forEach((semester: any) => {
    semester.gpa = semester.creditsEarned > 0 ? semester.qualityPoints / semester.creditsEarned : 0
  })

  const cumulativeGPA = totalCreditsEarned > 0 ? totalQualityPoints / totalCreditsEarned : 0
  
  // Get current semester (most recent)
  const currentSemester = Object.values(semesterBreakdown)[0] as any
  const currentSemesterGPA = currentSemester?.gpa || 0

  return {
    semesterBreakdown,
    totalCourses,
    totalCreditsEarned,
    cumulativeGPA,
    currentSemesterGPA,
    totalQualityPoints
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

function getAcademicStanding(gpa: number): string {
  if (gpa >= 3.8) return 'Summa Cum Laude'
  if (gpa >= 3.6) return 'Magna Cum Laude'
  if (gpa >= 3.4) return 'Cum Laude'
  if (gpa >= 3.0) return 'Good Standing'
  if (gpa >= 2.5) return 'Satisfactory'
  if (gpa >= 2.0) return 'Academic Warning'
  return 'Academic Probation'
}

function calculateGraduationProgress(creditsEarned: number): {
  percentage: number
  creditsRemaining: number
  estimatedGraduation: string
} {
  const requiredCredits = 120 // Standard bachelor's degree
  const percentage = Math.min((creditsEarned / requiredCredits) * 100, 100)
  const creditsRemaining = Math.max(requiredCredits - creditsEarned, 0)
  
  // Estimate graduation (assuming 15 credits per semester, 2 semesters per year)
  const semestersRemaining = Math.ceil(creditsRemaining / 15)
  const yearsRemaining = Math.ceil(semestersRemaining / 2)
  const currentYear = new Date().getFullYear()
  const estimatedGraduation = `${currentYear + yearsRemaining}`

  return {
    percentage,
    creditsRemaining,
    estimatedGraduation
  }
} 