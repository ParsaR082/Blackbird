import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { validateAdmin } from '@/lib/server-utils'
import mongoose from 'mongoose'

// Define interfaces for better type safety
interface UserDocument {
  _id: mongoose.Types.ObjectId
  email: string
  fullName: string
  username: string
  role: string
  isVerified: boolean
  createdAt: Date
}

interface CourseDocument {
  _id: mongoose.Types.ObjectId
  courseCode: string
  title: string
  description: string
  credits: number
  semester: string
  year: number
  department: string
  level: string
}

interface EnrollmentDocument {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  courseId: mongoose.Types.ObjectId
  status: string
  grade?: string
  finalGrade?: number
  enrolledAt: Date
  completedAt?: Date
}

interface SemesterDocument {
  _id: mongoose.Types.ObjectId
  year: number
  term: string
  startDate: Date
  endDate: Date
  registrationDeadline: Date
  isActive: boolean
}

interface SemesterEnrollmentDocument {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  semesterId: mongoose.Types.ObjectId
  year: number
  term: string
  courses: mongoose.Types.ObjectId[]
  totalCredits: number
  status: string
  gpa: number
}

interface AssignmentDocument {
  _id: mongoose.Types.ObjectId
  courseId: mongoose.Types.ObjectId
  title: string
  description: string
  type: string
  dueDate: Date
  points: number
}

interface UserAssignmentDocument {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  assignmentId: mongoose.Types.ObjectId
  courseId: mongoose.Types.ObjectId
  status: string
  submissionDate?: Date
  grade?: number
  feedback?: string
  timeSpent: number
  isCompleted: boolean
}

// GET - Retrieve detailed information about a specific student
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate admin access
    const validation = await validateAdmin(request)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: validation.status })
    }
    
    const studentId = params.id
    
    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
      return NextResponse.json({ error: 'Invalid student ID' }, { status: 400 })
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
    
    const CourseSchema = new mongoose.Schema({
      courseCode: String,
      title: String,
      description: String,
      credits: Number,
      semester: String,
      year: Number,
      department: String,
      level: String
    })
    
    const EnrollmentSchema = new mongoose.Schema({
      userId: mongoose.Schema.Types.ObjectId,
      courseId: mongoose.Schema.Types.ObjectId,
      status: String,
      grade: String,
      finalGrade: Number,
      enrolledAt: Date,
      completedAt: Date
    })
    
    const SemesterSchema = new mongoose.Schema({
      year: Number,
      term: String,
      startDate: Date,
      endDate: Date,
      registrationDeadline: Date,
      isActive: Boolean
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
    
    const AssignmentSchema = new mongoose.Schema({
      courseId: mongoose.Schema.Types.ObjectId,
      title: String,
      description: String,
      type: String,
      dueDate: Date,
      points: Number
    })
    
    const UserAssignmentSchema = new mongoose.Schema({
      userId: mongoose.Schema.Types.ObjectId,
      assignmentId: mongoose.Schema.Types.ObjectId,
      courseId: mongoose.Schema.Types.ObjectId,
      status: String,
      submissionDate: Date,
      grade: Number,
      feedback: String,
      timeSpent: Number,
      isCompleted: Boolean
    })
    
    // Create models
    const User = mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema)
    const Course = mongoose.models.Course || mongoose.model<CourseDocument>('Course', CourseSchema)
    const Enrollment = mongoose.models.Enrollment || mongoose.model<EnrollmentDocument>('Enrollment', EnrollmentSchema)
    const Semester = mongoose.models.Semester || mongoose.model<SemesterDocument>('Semester', SemesterSchema)
    const SemesterEnrollment = mongoose.models.SemesterEnrollment || 
      mongoose.model<SemesterEnrollmentDocument>('SemesterEnrollment', SemesterEnrollmentSchema)
    const Assignment = mongoose.models.Assignment || mongoose.model<AssignmentDocument>('Assignment', AssignmentSchema)
    const UserAssignment = mongoose.models.UserAssignment || mongoose.model<UserAssignmentDocument>('UserAssignment', UserAssignmentSchema)
    
    // Get user information
    const user = await User.findById(studentId).lean() as UserDocument
    
    if (!user) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }
    
    // Get course enrollments with course details
    const enrollments = await Enrollment.find({ userId: studentId }).lean() as EnrollmentDocument[]
    const courseIds = enrollments.map(enrollment => enrollment.courseId)
    const courses = await Course.find({ _id: { $in: courseIds } }).lean() as CourseDocument[]
    
    // Combine enrollment data with course details
    const enrolledCourses = enrollments.map(enrollment => {
      const course = courses.find(c => c._id.toString() === enrollment.courseId.toString())
      return {
        ...enrollment,
        ...(course || {}),
        _id: enrollment._id // Keep the enrollment ID
      }
    })
    
    // Get semester enrollments with semester details
    const semesterEnrollments = await SemesterEnrollment.find({ userId: studentId }).lean() as SemesterEnrollmentDocument[]
    const semesterIds = semesterEnrollments.map(enrollment => enrollment.semesterId)
    const semesters = await Semester.find({ _id: { $in: semesterIds } }).lean() as SemesterDocument[]
    
    // Combine semester enrollment data with semester details
    const enrolledSemesters = semesterEnrollments.map(enrollment => {
      const semester = semesters.find(s => s._id.toString() === enrollment.semesterId.toString())
      
      // Count courses for this semester enrollment
      const courseCount = enrollment.courses ? enrollment.courses.length : 0
      
      return {
        ...enrollment,
        ...(semester || {}),
        _id: enrollment._id, // Keep the enrollment ID
        courseCount
      }
    })
    
    // Get assignment submissions with assignment details
    const userAssignments = await UserAssignment.find({ userId: studentId }).lean() as UserAssignmentDocument[]
    const assignmentIds = userAssignments.map(ua => ua.assignmentId)
    const assignments = await Assignment.find({ _id: { $in: assignmentIds } }).lean() as AssignmentDocument[]
    
    // Combine user assignment data with assignment details
    const assignmentSubmissions = userAssignments.map(userAssignment => {
      const assignment = assignments.find(a => a._id.toString() === userAssignment.assignmentId.toString())
      const course = courses.find(c => c._id.toString() === userAssignment.courseId.toString())
      
      return {
        ...userAssignment,
        ...(assignment || {}),
        _id: userAssignment._id, // Keep the user assignment ID
        courseName: course ? course.title : 'Unknown Course'
      }
    })
    
    return NextResponse.json({
      success: true,
      student: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt
      },
      courses: enrolledCourses,
      semesters: enrolledSemesters,
      assignments: assignmentSubmissions
    })
    
  } catch (error) {
    console.error('Admin student details fetch error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch student details' 
    }, { status: 500 })
  }
} 