import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { getUserFromRequest } from '@/lib/server-utils'
import { Course, Assignment, Semester } from '@/lib/models/university'
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
  
  return { isValid: true, user }
}

// GET - Global search across university entities
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
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type') || 'all' // all, courses, assignments, students, semesters
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')
    const skip = (page - 1) * limit
    
    if (!query.trim()) {
      return NextResponse.json({
        success: true,
        results: [],
        total: 0,
        page,
        limit
      })
    }
    
    const results: any[] = []
    let total = 0
    
    // Search courses
    if (type === 'all' || type === 'courses') {
      const courseQuery = {
        $or: [
          { courseCode: { $regex: query, $options: 'i' } },
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { department: { $regex: query, $options: 'i' } },
          { 'professor.name': { $regex: query, $options: 'i' } }
        ]
      }
      
      const courses = await Course.find(courseQuery)
        .select('courseCode title department professor semester year isActive')
        .limit(limit)
        .skip(type === 'courses' ? skip : 0)
        .sort({ updatedAt: -1 })
        .lean()
      
      if (type === 'courses') {
        total = await Course.countDocuments(courseQuery)
      }
      
      results.push(...courses.map(course => ({
        ...course,
        type: 'course',
        displayName: `${course.courseCode} - ${course.title}`,
        subtitle: `${course.department} • ${course.professor.name}`,
        status: course.isActive ? 'Active' : 'Inactive'
      })))
    }
    
    // Search assignments
    if (type === 'all' || type === 'assignments') {
      const assignmentQuery = {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { type: { $regex: query, $options: 'i' } }
        ]
      }
      
      const assignments = await Assignment.find(assignmentQuery)
        .populate('courseId', 'courseCode title')
        .select('title type dueDate points courseId')
        .limit(limit)
        .skip(type === 'assignments' ? skip : 0)
        .sort({ dueDate: 1 })
        .lean()
      
      if (type === 'assignments') {
        total = await Assignment.countDocuments(assignmentQuery)
      }
      
      results.push(...assignments.map(assignment => ({
        ...assignment,
        type: 'assignment',
        displayName: assignment.title,
        subtitle: `${assignment.type} • ${assignment.courseId?.courseCode || 'Unknown Course'}`,
        status: new Date(assignment.dueDate) > new Date() ? 'Active' : 'Overdue'
      })))
    }
    
    // Search students
    if (type === 'all' || type === 'students') {
      // Define User schema for student search
      const UserSchema = new mongoose.Schema({
        email: String,
        fullName: String,
        username: String,
        role: String,
        isVerified: Boolean,
        createdAt: Date
      })
      
      const User = mongoose.models.User || mongoose.model('User', UserSchema)
      
      const studentQuery = {
        role: 'USER',
        $or: [
          { fullName: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
          { username: { $regex: query, $options: 'i' } }
        ]
      }
      
      const students = await User.find(studentQuery)
        .select('fullName email username createdAt')
        .limit(limit)
        .skip(type === 'students' ? skip : 0)
        .sort({ createdAt: -1 })
        .lean()
      
      if (type === 'students') {
        total = await User.countDocuments(studentQuery)
      }
      
      results.push(...students.map(student => ({
        ...student,
        type: 'student',
        displayName: student.fullName,
        subtitle: `${student.email} • @${student.username}`,
        status: student.isVerified ? 'Verified' : 'Unverified'
      })))
    }
    
    // Search semesters
    if (type === 'all' || type === 'semesters') {
      const semesterQuery = {
        $or: [
          { term: { $regex: query, $options: 'i' } },
          { year: { $regex: query, $options: 'i' } }
        ]
      }
      
      const semesters = await Semester.find(semesterQuery)
        .select('year term startDate endDate isActive')
        .limit(limit)
        .skip(type === 'semesters' ? skip : 0)
        .sort({ year: -1, term: 1 })
        .lean()
      
      if (type === 'semesters') {
        total = await Semester.countDocuments(semesterQuery)
      }
      
      results.push(...semesters.map(semester => ({
        ...semester,
        type: 'semester',
        displayName: `${semester.term} ${semester.year}`,
        subtitle: `${new Date(semester.startDate).toLocaleDateString()} - ${new Date(semester.endDate).toLocaleDateString()}`,
        status: semester.isActive ? 'Active' : 'Inactive'
      })))
    }
    
    // Sort results by relevance and limit if searching all types
    if (type === 'all') {
      results.sort((a, b) => {
        // Prioritize exact matches
        const aExact = a.displayName.toLowerCase().includes(query.toLowerCase())
        const bExact = b.displayName.toLowerCase().includes(query.toLowerCase())
        
        if (aExact && !bExact) return -1
        if (!aExact && bExact) return 1
        
        // Then by type priority: courses > students > assignments > semesters
        const typePriority = { course: 4, student: 3, assignment: 2, semester: 1 }
        return typePriority[b.type as keyof typeof typePriority] - typePriority[a.type as keyof typeof typePriority]
      })
      
      results.splice(limit)
    }
    
    return NextResponse.json({
      success: true,
      results,
      total: type === 'all' ? results.length : total,
      page,
      limit,
      query
    })
    
  } catch (error) {
    console.error('University search error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to perform search' 
    }, { status: 500 })
  }
} 