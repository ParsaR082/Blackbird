export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { getUserFromRequest } from '@/lib/server-utils'
import { Course, Assignment, Semester, AcademicRecord } from '@/lib/models/university'

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

// GET - Retrieve university statistics
export async function GET(request: NextRequest) {
  try {
    // Validate admin access
    const validation = await validateAdmin(request)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: validation.status })
    }
    
    await connectToDatabase()
    
    // Get query parameters for date range
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    // Build date filter
    const dateFilter: any = {}
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }
    
    // Fetch statistics in parallel
    const [
      totalCourses,
      totalStudents,
      totalAssignments,
      activeSemesters,
      recentEnrollments,
      academicRecords,
      courseStats
    ] = await Promise.all([
      // Total courses
      Course.countDocuments({ isActive: true }),
      
      // Total students (unique users enrolled in courses)
      Course.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, totalEnrollments: { $sum: '$currentEnrollments' } } }
      ]),
      
      // Total assignments
      Assignment.countDocuments(),
      
      // Active semesters
      Semester.countDocuments({ isActive: true }),
      
      // Recent enrollments (last 30 days)
      Course.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, totalEnrollments: { $sum: '$currentEnrollments' } } }
      ]),
      
      // Academic records for GPA calculation
      AcademicRecord.find({}, 'semesterGPA cumulativeGPA'),
      
      // Course statistics
      Course.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            avgEnrollment: { $avg: '$currentEnrollments' },
            maxEnrollment: { $max: '$currentEnrollments' },
            minEnrollment: { $min: '$currentEnrollments' },
            totalCapacity: { $sum: '$maxStudents' },
            totalEnrolled: { $sum: '$currentEnrollments' }
          }
        }
      ])
    ])
    
    // Calculate average GPA
    const averageGPA = academicRecords.length > 0 
      ? academicRecords.reduce((sum, record) => sum + (record.cumulativeGPA || 0), 0) / academicRecords.length
      : 0
    
    // Calculate completion rate (courses with enrollments)
    const completionRate = courseStats.length > 0 && courseStats[0].totalCapacity > 0
      ? (courseStats[0].totalEnrolled / courseStats[0].totalCapacity) * 100
      : 0
    
    // Get recent enrollments count
    const recentEnrollmentsCount = recentEnrollments.length > 0 ? recentEnrollments[0].totalEnrollments : 0
    
    // Get total students count
    const totalStudentsCount = totalStudents.length > 0 ? totalStudents[0].totalEnrollments : 0
    
    const stats = {
      totalCourses,
      totalStudents: totalStudentsCount,
      totalAssignments,
      activeSemesters,
      recentEnrollments: recentEnrollmentsCount,
      averageGPA: Math.round(averageGPA * 100) / 100,
      completionRate: Math.round(completionRate * 100) / 100,
      courseStats: courseStats.length > 0 ? courseStats[0] : {
        avgEnrollment: 0,
        maxEnrollment: 0,
        minEnrollment: 0,
        totalCapacity: 0,
        totalEnrolled: 0
      }
    }
    
    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('University stats fetch error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch university statistics' 
    }, { status: 500 })
  }
} 