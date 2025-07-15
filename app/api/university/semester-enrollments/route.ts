import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { getUserFromRequest } from '@/lib/server-utils'
import { SemesterEnrollment, Semester } from '@/lib/models/semester-enrollment'
import { Course } from '@/lib/models/university'
import mongoose from 'mongoose'

// GET - Fetch a user's semester enrollments
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
    const enrollmentId = searchParams.get('id')
    const semesterId = searchParams.get('semesterId')
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : null
    const term = searchParams.get('term')
    
    // Get a specific enrollment
    if (enrollmentId) {
      const enrollment = await SemesterEnrollment.findOne({
        _id: enrollmentId,
        userId: user.id
      }).populate('courses semesterId')
      
      if (!enrollment) {
        return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
      }
      
      return NextResponse.json({
        success: true,
        enrollment
      })
    }
    
    // Build query
    const query: any = { userId: user.id }
    
    if (semesterId) {
      query.semesterId = semesterId
    }
    
    if (year) {
      query.year = year
    }
    
    if (term && ['Fall', 'Spring', 'Summer'].includes(term)) {
      query.term = term
    }
    
    const enrollments = await SemesterEnrollment.find(query)
      .populate('semesterId')
      .populate('courses')
      .sort({ year: -1, term: 1 })
      
    // Format response
    const formattedEnrollments = await Promise.all(enrollments.map(async (enrollment) => {
      // Calculate total credits
      let totalCredits = 0
      const courseDetails = []
      
      for (const courseId of enrollment.courses) {
        const course = await Course.findById(courseId)
        if (course) {
          totalCredits += course.credits
          courseDetails.push({
            id: course._id,
            courseCode: course.courseCode,
            title: course.title,
            credits: course.credits,
            professor: course.professor
          })
        }
      }
      
      return {
        id: enrollment._id,
        year: enrollment.year,
        term: enrollment.term,
        semesterId: enrollment.semesterId,
        totalCredits,
        status: enrollment.status,
        courses: courseDetails,
        gpa: enrollment.gpa,
        createdAt: enrollment.createdAt
      }
    }))
    
    return NextResponse.json({
      success: true,
      enrollments: formattedEnrollments
    })
    
  } catch (error) {
    console.error('Error fetching semester enrollments:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch enrollments' },
      { status: 500 }
    )
  }
}

// POST - Create a new semester enrollment
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
    
    const { semesterId, courses } = await request.json()
    
    if (!semesterId) {
      return NextResponse.json(
        { error: 'Semester ID is required' },
        { status: 400 }
      )
    }
    
    // Validate semester exists and is active
    const semester = await Semester.findById(semesterId)
    
    if (!semester) {
      return NextResponse.json(
        { error: 'Semester not found' },
        { status: 404 }
      )
    }
    
    if (!semester.isActive) {
      return NextResponse.json(
        { error: 'Cannot enroll in an inactive semester' },
        { status: 400 }
      )
    }
    
    // Check if registration deadline has passed
    if (new Date() > new Date(semester.registrationDeadline)) {
      return NextResponse.json(
        { error: 'Registration deadline has passed' },
        { status: 400 }
      )
    }
    
    // Check if already enrolled in this semester
    const existingEnrollment = await SemesterEnrollment.findOne({
      userId: user.id,
      semesterId
    })
    
    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Already enrolled in this semester' },
        { status: 409 }
      )
    }
    
    // Validate courses exist and are offered in this semester
    let totalCredits = 0
    const validCourseIds = []
    
    if (courses && Array.isArray(courses)) {
      for (const courseId of courses) {
        const course = await Course.findOne({ 
          _id: courseId,
          semester: semester.term,
          year: semester.year,
          isActive: true
        })
        
        if (course) {
          validCourseIds.push(courseId)
          totalCredits += course.credits
        }
      }
    }
    
    // Create enrollment
    const enrollment = await SemesterEnrollment.create({
      userId: user.id,
      semesterId,
      year: semester.year,
      term: semester.term,
      courses: validCourseIds,
      totalCredits,
      status: 'registered',
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    return NextResponse.json({
      success: true,
      message: 'Successfully enrolled in semester',
      enrollment: {
        id: enrollment._id,
        semesterId: enrollment.semesterId,
        year: enrollment.year,
        term: enrollment.term,
        courses: validCourseIds,
        totalCredits,
        status: enrollment.status
      }
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error creating semester enrollment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create enrollment' },
      { status: 500 }
    )
  }
}

// PUT - Update a semester enrollment (add/remove courses)
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
    
    const { searchParams } = new URL(request.url)
    const enrollmentId = searchParams.get('id')
    
    if (!enrollmentId) {
      return NextResponse.json(
        { error: 'Enrollment ID is required' },
        { status: 400 }
      )
    }
    
    const { courses } = await request.json()
    
    // Check if enrollment exists and belongs to user
    const enrollment = await SemesterEnrollment.findOne({
      _id: enrollmentId,
      userId: user.id
    }).populate('semesterId')
    
    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      )
    }
    
    // Check if semester is still in registration period
    const semester = enrollment.semesterId
    
    if (semester && new Date() > new Date(semester.registrationDeadline)) {
      return NextResponse.json(
        { error: 'Registration deadline has passed, cannot modify courses' },
        { status: 400 }
      )
    }
    
    // Validate new courses
    let totalCredits = 0
    const validCourseIds = []
    
    if (courses && Array.isArray(courses)) {
      for (const courseId of courses) {
        const course = await Course.findOne({ 
          _id: courseId,
          semester: enrollment.term,
          year: enrollment.year,
          isActive: true
        })
        
        if (course) {
          validCourseIds.push(courseId)
          totalCredits += course.credits
        }
      }
    }
    
    // Update enrollment
    const updatedEnrollment = await SemesterEnrollment.findByIdAndUpdate(
      enrollmentId,
      {
        courses: validCourseIds,
        totalCredits,
        updatedAt: new Date()
      },
      { new: true }
    )
    
    return NextResponse.json({
      success: true,
      message: 'Enrollment updated successfully',
      enrollment: {
        id: updatedEnrollment._id,
        year: updatedEnrollment.year,
        term: updatedEnrollment.term,
        courses: validCourseIds,
        totalCredits,
        status: updatedEnrollment.status
      }
    })
    
  } catch (error) {
    console.error('Error updating semester enrollment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update enrollment' },
      { status: 500 }
    )
  }
}

// DELETE - Cancel a semester enrollment
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
    
    const { searchParams } = new URL(request.url)
    const enrollmentId = searchParams.get('id')
    
    if (!enrollmentId) {
      return NextResponse.json(
        { error: 'Enrollment ID is required' },
        { status: 400 }
      )
    }
    
    // Check if enrollment exists and belongs to user
    const enrollment = await SemesterEnrollment.findOne({
      _id: enrollmentId,
      userId: user.id
    }).populate('semesterId')
    
    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      )
    }
    
    // Check if semester is still in registration period
    const semester = enrollment.semesterId
    
    if (semester && new Date() > new Date(semester.registrationDeadline)) {
      return NextResponse.json(
        { error: 'Registration deadline has passed, cannot cancel enrollment' },
        { status: 400 }
      )
    }
    
    // Delete enrollment
    await SemesterEnrollment.findByIdAndDelete(enrollmentId)
    
    return NextResponse.json({
      success: true,
      message: 'Enrollment cancelled successfully'
    })
    
  } catch (error) {
    console.error('Error deleting semester enrollment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to cancel enrollment' },
      { status: 500 }
    )
  }
} 