import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { validateAdmin } from '@/lib/server-utils'
import mongoose from 'mongoose'

// GET - Retrieve students with their university data
export async function GET(request: NextRequest) {
  try {
    // Validate admin access
    const validation = await validateAdmin(request)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: validation.status })
    }
    
    await connectToDatabase()
    
    // Define schemas
    const UserSchema = new mongoose.Schema({
      email: String,
      fullName: String,
      username: String,
      role: String,
      isVerified: Boolean,
      createdAt: Date
    })
    
    const EnrollmentSchema = new mongoose.Schema({
      userId: mongoose.Schema.Types.ObjectId,
      courseId: mongoose.Schema.Types.ObjectId,
      status: String
    })
    
    const SemesterEnrollmentSchema = new mongoose.Schema({
      userId: mongoose.Schema.Types.ObjectId,
      semesterId: mongoose.Schema.Types.ObjectId,
      year: Number,
      term: String,
      courses: [mongoose.Schema.Types.ObjectId],
      totalCredits: Number,
      status: String,
      gpa: Number
    })
    
    const AcademicRecordSchema = new mongoose.Schema({
      userId: mongoose.Schema.Types.ObjectId,
      academicYear: Number,
      semester: String,
      courses: [{
        courseId: mongoose.Schema.Types.ObjectId,
        grade: String,
        gpa: Number,
        credits: Number
      }],
      semesterGPA: Number,
      cumulativeGPA: Number,
      totalCredits: Number,
      completedCredits: Number
    })
    
    // Create models
    const User = mongoose.models.User || mongoose.model('User', UserSchema)
    const Enrollment = mongoose.models.Enrollment || mongoose.model('Enrollment', EnrollmentSchema)
    const SemesterEnrollment = mongoose.models.SemesterEnrollment || 
      mongoose.model('SemesterEnrollment', SemesterEnrollmentSchema)
    const AcademicRecord = mongoose.models.AcademicRecord || mongoose.model('AcademicRecord', AcademicRecordSchema)
    
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const semester = searchParams.get('semester')
    const isActive = searchParams.get('active') === 'true'
    
    // Find all users who have university enrollments
    const enrollments = await Enrollment.distinct('userId')
    
    // Build query for users
    let userQuery: any = {
      _id: { $in: enrollments }
    }
    
    if (search) {
      userQuery.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ]
    }
    
    // Find users
    const users = await User.find(userQuery).lean()
    
    // Get academic data for each user
    const students = await Promise.all(users.map(async (user: any) => {
      // Count enrolled courses
      const enrolledCourses = await Enrollment.countDocuments({
        userId: user._id,
        status: { $in: ['enrolled', 'completed'] }
      })
      
      // Count active semesters
      const activeSemesters = await SemesterEnrollment.countDocuments({
        userId: user._id,
        status: { $in: ['registered', 'in-progress'] }
      })
      
      // Get latest academic record
      const academicRecord = await AcademicRecord.findOne({
        userId: user._id
      }).sort({ academicYear: -1, semester: -1 })
      
      return {
        _id: user._id,
        userId: user._id,
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        enrolledCourses,
        activeSemesters,
        gpa: academicRecord?.cumulativeGPA || 0,
        totalCredits: academicRecord?.totalCredits || 0,
        completedCredits: academicRecord?.completedCredits || 0,
        createdAt: user.createdAt
      }
    }))
    
    // Filter by active status if requested
    let filteredStudents = students
    if (searchParams.has('active')) {
      filteredStudents = students.filter(student => 
        isActive ? student.activeSemesters > 0 : student.activeSemesters === 0
      )
    }
    
    // Filter by semester if requested
    if (semester) {
      const [year, term] = semester.split('-')
      
      if (year && term) {
        const semesterEnrollments = await SemesterEnrollment.find({
          year: parseInt(year),
          term
        }).distinct('userId')
        
        filteredStudents = filteredStudents.filter(student => 
          semesterEnrollments.some((id: any) => id.toString() === student.userId.toString())
        )
      }
    }
    
    return NextResponse.json({
      success: true,
      count: filteredStudents.length,
      students: filteredStudents
    })
    
  } catch (error) {
    console.error('Admin students fetch error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch students' 
    }, { status: 500 })
  }
} 