import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { getUserFromRequest } from '@/lib/server-utils'
import { Semester } from '@/lib/models/semester-enrollment'
import mongoose from 'mongoose'

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

// GET - Retrieve all semesters or a specific one by ID
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
    const semesterId = searchParams.get('id')
    
    if (semesterId) {
      // Get a specific semester
      const semester = await Semester.findById(semesterId)
      
      if (!semester) {
        return NextResponse.json({ error: 'Semester not found' }, { status: 404 })
      }
      
      return NextResponse.json({
        success: true,
        semester
      })
    }
    
    // Get all semesters
    const includeInactive = searchParams.get('includeInactive') === 'true'
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : null
    
    // Build query
    const query: any = {}
    
    if (!includeInactive) {
      query.isActive = true
    }
    
    if (year) {
      query.year = year
    }
    
    const semesters = await Semester.find(query).sort({ year: -1, term: 1 })
    
    // Count enrollments for each semester
    const SemesterEnrollmentSchema = new mongoose.Schema({
      semesterId: mongoose.Schema.Types.ObjectId
    })
    
    const SemesterEnrollment = mongoose.models.SemesterEnrollment || 
      mongoose.model('SemesterEnrollment', SemesterEnrollmentSchema)
    
    const enrollmentCounts = await SemesterEnrollment.aggregate([
      { $group: { _id: '$semesterId', count: { $sum: 1 } } }
    ])
    
    const enrollmentCountMap = new Map()
    enrollmentCounts.forEach(item => {
      enrollmentCountMap.set(item._id.toString(), item.count)
    })
    
    // Format response
    const formattedSemesters = semesters.map(semester => ({
      id: semester._id,
      year: semester.year,
      term: semester.term,
      startDate: semester.startDate,
      endDate: semester.endDate,
      registrationDeadline: semester.registrationDeadline,
      isActive: semester.isActive,
      enrollments: enrollmentCountMap.get(semester._id.toString()) || 0,
      isCurrentSemester: new Date() >= new Date(semester.startDate) && new Date() <= new Date(semester.endDate),
      isRegistrationOpen: new Date() <= new Date(semester.registrationDeadline),
      createdAt: semester.createdAt,
      updatedAt: semester.updatedAt
    }))
    
    // Group by year for easier UI display
    const semestersByYear = formattedSemesters.reduce((acc, semester) => {
      if (!acc[semester.year]) {
        acc[semester.year] = []
      }
      
      acc[semester.year].push(semester)
      
      return acc
    }, {} as Record<number, any[]>)
    
    const years = Object.keys(semestersByYear).map(Number).sort((a, b) => b - a)
    
    return NextResponse.json({
      success: true,
      semesters: formattedSemesters,
      semestersByYear,
      years,
      total: formattedSemesters.length
    })
    
  } catch (error) {
    console.error('Admin semesters fetch error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch semesters' 
    }, { status: 500 })
  }
}

// POST - Create a new semester
export async function POST(request: NextRequest) {
  try {
    // Validate admin access
    const validation = await validateAdmin(request)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: validation.status })
    }
    
    await connectToDatabase()
    
    const semesterData = await request.json()
    
    // Validate required fields
    const requiredFields = ['year', 'term', 'startDate', 'endDate', 'registrationDeadline']
    for (const field of requiredFields) {
      if (!semesterData[field]) {
        return NextResponse.json({ 
          success: false, 
          error: `Missing required field: ${field}` 
        }, { status: 400 })
      }
    }
    
    // Validate dates
    const startDate = new Date(semesterData.startDate)
    const endDate = new Date(semesterData.endDate)
    const registrationDeadline = new Date(semesterData.registrationDeadline)
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || isNaN(registrationDeadline.getTime())) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid date format' 
      }, { status: 400 })
    }
    
    // Ensure dates make sense
    if (endDate <= startDate) {
      return NextResponse.json({ 
        success: false, 
        error: 'End date must be after start date' 
      }, { status: 400 })
    }
    
    if (registrationDeadline > startDate) {
      return NextResponse.json({ 
        success: false, 
        error: 'Registration deadline must be before or on the start date' 
      }, { status: 400 })
    }
    
    // Check for duplicate semester in the same year and term
    const existingSemester = await Semester.findOne({ 
      year: semesterData.year, 
      term: semesterData.term 
    })
    
    if (existingSemester) {
      return NextResponse.json({ 
        success: false, 
        error: `A semester with term ${semesterData.term} already exists for year ${semesterData.year}` 
      }, { status: 409 })
    }
    
    // Create new semester
    const newSemester = await Semester.create({
      year: semesterData.year,
      term: semesterData.term,
      startDate,
      endDate,
      registrationDeadline,
      isActive: semesterData.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    return NextResponse.json({
      success: true,
      message: 'Semester created successfully',
      semester: newSemester
    }, { status: 201 })
    
  } catch (error) {
    console.error('Admin semester creation error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create semester' 
    }, { status: 500 })
  }
}

// PUT - Update an existing semester
export async function PUT(request: NextRequest) {
  try {
    // Validate admin access
    const validation = await validateAdmin(request)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: validation.status })
    }
    
    await connectToDatabase()
    
    const { searchParams } = new URL(request.url)
    const semesterId = searchParams.get('id')
    
    if (!semesterId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Semester ID is required' 
      }, { status: 400 })
    }
    
    // Check if semester exists
    const existingSemester = await Semester.findById(semesterId)
    if (!existingSemester) {
      return NextResponse.json({ 
        success: false, 
        error: 'Semester not found' 
      }, { status: 404 })
    }
    
    const semesterData = await request.json()
    
    // Validate dates if provided
    if (semesterData.startDate && semesterData.endDate) {
      const startDate = new Date(semesterData.startDate)
      const endDate = new Date(semesterData.endDate)
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid date format' 
        }, { status: 400 })
      }
      
      if (endDate <= startDate) {
        return NextResponse.json({ 
          success: false, 
          error: 'End date must be after start date' 
        }, { status: 400 })
      }
    }
    
    if (semesterData.registrationDeadline && semesterData.startDate) {
      const registrationDeadline = new Date(semesterData.registrationDeadline)
      const startDate = new Date(semesterData.startDate)
      
      if (isNaN(registrationDeadline.getTime())) {
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid date format' 
        }, { status: 400 })
      }
      
      if (registrationDeadline > startDate) {
        return NextResponse.json({ 
          success: false, 
          error: 'Registration deadline must be before or on the start date' 
        }, { status: 400 })
      }
    }
    
    // Check for duplicate semester if changing year or term
    if ((semesterData.year && semesterData.year !== existingSemester.year) || 
        (semesterData.term && semesterData.term !== existingSemester.term)) {
      
      const duplicateSemester = await Semester.findOne({ 
        year: semesterData.year || existingSemester.year, 
        term: semesterData.term || existingSemester.term,
        _id: { $ne: semesterId }
      })
      
      if (duplicateSemester) {
        return NextResponse.json({ 
          success: false, 
          error: `A semester with term ${semesterData.term || existingSemester.term} already exists for year ${semesterData.year || existingSemester.year}` 
        }, { status: 409 })
      }
    }
    
    // Remove fields that shouldn't be updated directly
    delete semesterData._id
    delete semesterData.createdAt
    
    // Update semester
    const updatedSemester = await Semester.findByIdAndUpdate(
      semesterId,
      { 
        ...semesterData,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    )
    
    return NextResponse.json({
      success: true,
      message: 'Semester updated successfully',
      semester: updatedSemester
    })
    
  } catch (error) {
    console.error('Admin semester update error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update semester' 
    }, { status: 500 })
  }
}

// DELETE - Remove a semester
export async function DELETE(request: NextRequest) {
  try {
    // Validate admin access
    const validation = await validateAdmin(request)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: validation.status })
    }
    
    await connectToDatabase()
    
    const { searchParams } = new URL(request.url)
    const semesterId = searchParams.get('id')
    
    if (!semesterId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Semester ID is required' 
      }, { status: 400 })
    }
    
    // Check if semester exists
    const existingSemester = await Semester.findById(semesterId)
    if (!existingSemester) {
      return NextResponse.json({ 
        success: false, 
        error: 'Semester not found' 
      }, { status: 404 })
    }
    
    // Check if there are enrollments for this semester
    const SemesterEnrollmentSchema = new mongoose.Schema({
      semesterId: mongoose.Schema.Types.ObjectId
    })
    
    const SemesterEnrollment = mongoose.models.SemesterEnrollment || 
      mongoose.model('SemesterEnrollment', SemesterEnrollmentSchema)
    
    const enrollments = await SemesterEnrollment.countDocuments({ semesterId })
    
    if (enrollments > 0) {
      // If there are enrollments, just set inactive instead of deleting
      await Semester.findByIdAndUpdate(
        semesterId,
        { 
          isActive: false,
          updatedAt: new Date()
        }
      )
      
      return NextResponse.json({
        success: true,
        message: `Semester has ${enrollments} enrollments. It has been set to inactive instead of being deleted.`
      })
    } else {
      // No enrollments, can be deleted
      await Semester.findByIdAndDelete(semesterId)
      
      return NextResponse.json({
        success: true,
        message: 'Semester deleted successfully'
      })
    }
    
  } catch (error) {
    console.error('Admin semester deletion error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete semester' 
    }, { status: 500 })
  }
} 