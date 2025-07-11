import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { Semester } from '@/lib/models/university'
import { validateAdmin } from '@/lib/server-utils'

// Helper function to validate semester data
const validateSemesterData = (data: any) => {
  const { year, term, startDate, endDate, registrationDeadline } = data
  
  if (!year || !term || !startDate || !endDate || !registrationDeadline) {
    return { isValid: false, error: 'Missing required fields' }
  }
  
  if (!['Fall', 'Spring', 'Summer'].includes(term)) {
    return { isValid: false, error: 'Invalid term value' }
  }
  
  const currentYear = new Date().getFullYear()
  if (year < 2020 || year > currentYear + 10) {
    return { isValid: false, error: 'Invalid year value' }
  }
  
  // Check if dates are valid
  try {
    new Date(startDate)
    new Date(endDate)
    new Date(registrationDeadline)
  } catch (error) {
    return { isValid: false, error: 'Invalid date format' }
  }
  
  // Check if start date is before end date
  if (new Date(startDate) >= new Date(endDate)) {
    return { isValid: false, error: 'Start date must be before end date' }
  }
  
  // Check if registration deadline is before start date
  if (new Date(registrationDeadline) >= new Date(startDate)) {
    return { isValid: false, error: 'Registration deadline must be before start date' }
  }
  
  return { isValid: true }
}

// GET - Retrieve semesters (with optional filters)
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
      // Fetch a single semester by ID
      const semester = await Semester.findById(semesterId)
      
      if (!semester) {
        return NextResponse.json({ error: 'Semester not found' }, { status: 404 })
      }
      
      return NextResponse.json({ 
        success: true,
        semester
      })
    }
    
    // Fetch all semesters with optional filtering
    const year = parseInt(searchParams.get('year') || '0')
    const term = searchParams.get('term')
    const isActive = searchParams.get('isActive') === 'true'
    
    // Build query
    const query: any = {}
    
    if (year > 0) {
      query.year = year
    }
    
    if (term && ['Fall', 'Spring', 'Summer'].includes(term)) {
      query.term = term
    }
    
    if (searchParams.has('isActive')) {
      query.isActive = isActive
    }
    
    const semesters = await Semester.find(query)
      .sort({ year: -1, term: 1 })
      
    return NextResponse.json({
      success: true,
      count: semesters.length,
      semesters
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
    
    // Get semester data from request body
    const data = await request.json()
    
    // Validate semester data
    const dataValidation = validateSemesterData(data)
    if (!dataValidation.isValid) {
      return NextResponse.json({ error: dataValidation.error }, { status: 400 })
    }
    
    // Check if semester already exists
    const existingSemester = await Semester.findOne({
      year: data.year,
      term: data.term
    })
    
    if (existingSemester) {
      return NextResponse.json({ 
        error: `A semester for ${data.term} ${data.year} already exists` 
      }, { status: 409 })
    }
    
    // Create new semester
    const newSemester = new Semester({
      year: data.year,
      term: data.term,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      registrationDeadline: new Date(data.registrationDeadline),
      isActive: data.isActive !== undefined ? data.isActive : true
    })
    
    await newSemester.save()
    
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
    
    // Get semester ID from query parameters
    const { searchParams } = new URL(request.url)
    const semesterId = searchParams.get('id')
    
    if (!semesterId) {
      return NextResponse.json({ error: 'Semester ID is required' }, { status: 400 })
    }
    
    // Check if semester exists
    const existingSemester = await Semester.findById(semesterId)
    
    if (!existingSemester) {
      return NextResponse.json({ error: 'Semester not found' }, { status: 404 })
    }
    
    // Get updated data from request body
    const data = await request.json()
    
    // Validate semester data
    const dataValidation = validateSemesterData(data)
    if (!dataValidation.isValid) {
      return NextResponse.json({ error: dataValidation.error }, { status: 400 })
    }
    
    // Check if updated term/year combination already exists (excluding current semester)
    if (data.year !== existingSemester.year || data.term !== existingSemester.term) {
      const duplicateSemester = await Semester.findOne({
        _id: { $ne: semesterId },
        year: data.year,
        term: data.term
      })
      
      if (duplicateSemester) {
        return NextResponse.json({ 
          error: `A semester for ${data.term} ${data.year} already exists` 
        }, { status: 409 })
      }
    }
    
    // Update semester
    const updatedSemester = await Semester.findByIdAndUpdate(
      semesterId,
      {
        year: data.year,
        term: data.term,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        registrationDeadline: new Date(data.registrationDeadline),
        isActive: data.isActive !== undefined ? data.isActive : existingSemester.isActive
      },
      { new: true }
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

// DELETE - Delete a semester
export async function DELETE(request: NextRequest) {
  try {
    // Validate admin access
    const validation = await validateAdmin(request)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: validation.status })
    }
    
    await connectToDatabase()
    
    // Get semester ID from query parameters
    const { searchParams } = new URL(request.url)
    const semesterId = searchParams.get('id')
    
    if (!semesterId) {
      return NextResponse.json({ error: 'Semester ID is required' }, { status: 400 })
    }
    
    // Check if semester exists
    const existingSemester = await Semester.findById(semesterId)
    
    if (!existingSemester) {
      return NextResponse.json({ error: 'Semester not found' }, { status: 404 })
    }
    
    // Delete semester
    await Semester.findByIdAndDelete(semesterId)
    
    return NextResponse.json({
      success: true,
      message: 'Semester deleted successfully'
    })
    
  } catch (error) {
    console.error('Admin semester deletion error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete semester' 
    }, { status: 500 })
  }
} 