import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { getUserFromRequest } from '@/lib/server-utils'
import { Semester } from '@/lib/models/semester-enrollment'

// GET - Get all active semesters or specific semester details
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const semesterId = searchParams.get('id')
    
    // Get a specific semester
    if (semesterId) {
      const semester = await Semester.findById(semesterId)
      
      if (!semester) {
        return NextResponse.json({ error: 'Semester not found' }, { status: 404 })
      }
      
      return NextResponse.json({
        success: true,
        semester: {
          id: semester._id,
          year: semester.year,
          term: semester.term,
          startDate: semester.startDate,
          endDate: semester.endDate,
          registrationDeadline: semester.registrationDeadline,
          isActive: semester.isActive,
          createdAt: semester.createdAt,
          updatedAt: semester.updatedAt
        }
      })
    }
    
    // Get all semesters with optional filters
    const isActive = searchParams.get('active') !== 'false'
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : null
    
    // Build query
    const query: any = {}
    
    if (isActive) {
      query.isActive = true
    }
    
    if (year) {
      query.year = year
    }
    
    const semesters = await Semester.find(query).sort({ year: -1, term: 1 })
    
    // Group semesters by year
    const semestersByYear: Record<number, any[]> = {}
    const years: number[] = []
    
    semesters.forEach(semester => {
      const year = semester.year
      
      if (!semestersByYear[year]) {
        semestersByYear[year] = []
        years.push(year)
      }
      
      semestersByYear[year].push({
        id: semester._id,
        term: semester.term,
        startDate: semester.startDate,
        endDate: semester.endDate,
        registrationDeadline: semester.registrationDeadline,
        isActive: semester.isActive,
        isRegistrationOpen: new Date() <= new Date(semester.registrationDeadline),
        isCurrentSemester: new Date() >= new Date(semester.startDate) && new Date() <= new Date(semester.endDate)
      })
    })
    
    // Sort years in descending order
    years.sort((a, b) => b - a)
    
    return NextResponse.json({
      success: true,
      years,
      semestersByYear,
      currentYear: new Date().getFullYear()
    })
    
  } catch (error) {
    console.error('Error fetching semesters:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch semesters' },
      { status: 500 }
    )
  }
} 