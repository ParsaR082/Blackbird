export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Course } from '@/lib/models/university'
import mongoose from 'mongoose'

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    // Get query parameters
    const url = new URL(request.url)
    const searchParams = url.searchParams
    const department = searchParams.get('department')
    const level = searchParams.get('level')
    const semester = searchParams.get('semester')
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search')

    // Build query
    const query: any = { isActive: true }
    
    if (department) {
      query.department = department
    }

    if (level && ['undergraduate', 'graduate'].includes(level)) {
      query.level = level
    }

    if (semester && ['Fall', 'Spring', 'Summer'].includes(semester)) {
      query.semester = semester
    }

    if (year) {
      query.year = year
    }

    if (search) {
      query.$text = { $search: search }
    }

    // Define User schema for populated data
    const UserSchema = new mongoose.Schema({
      studentId: String,
      phoneNumber: String,
      username: String,
      email: String,
      password: String,
      fullName: String,
      role: String,
      isVerified: Boolean,
      avatarUrl: String,
      createdAt: Date,
      updatedAt: Date
    })

    const User = mongoose.models.User || mongoose.model('User', UserSchema)

    // Get courses with creator info
    const courses = await Course.find(query)
      .populate({
        path: 'createdBy',
        model: User,
        select: 'fullName username'
      })
      .sort({ department: 1, courseCode: 1 })
      .limit(limit)

    // Get department counts
    const departmentAggregation = await Course.aggregate([
      { $match: { isActive: true, year: year } },
      { 
        $group: { 
          _id: '$department', 
          count: { $sum: 1 } 
        } 
      }
    ])

    const departmentCounts: Record<string, number> = {}
    departmentAggregation.forEach(item => {
      if (item._id) {
        departmentCounts[item._id] = item.count
      }
    })

    // Get level counts
    const levelCounts = await Course.aggregate([
      { $match: { isActive: true, year: year } },
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 }
        }
      }
    ])

    const levelCountsFormatted: Record<string, number> = {
      undergraduate: 0,
      graduate: 0
    }

    levelCounts.forEach(item => {
      if (item._id && levelCountsFormatted.hasOwnProperty(item._id)) {
        levelCountsFormatted[item._id] = item.count
      }
    })

    // Format the response
    const formattedCourses = courses.map(course => ({
      id: course._id.toString(),
      courseCode: course.courseCode,
      title: course.title,
      description: course.description,
      credits: course.credits,
      professor: {
        name: course.professor.name,
        email: course.professor.email,
        department: course.professor.department
      },
      department: course.department,
      level: course.level,
      prerequisites: course.prerequisites,
      semester: course.semester,
      year: course.year,
      maxStudents: course.maxStudents,
      currentEnrollments: course.currentEnrollments,
      enrollmentPercentage: Math.round((course.currentEnrollments / course.maxStudents) * 100),
      isAvailable: course.currentEnrollments < course.maxStudents,
      syllabus: course.syllabus,
      createdBy: course.createdBy ? {
        name: course.createdBy.fullName,
        username: course.createdBy.username
      } : null,
      createdAt: course.createdAt
    }))

    return NextResponse.json({
      success: true,
      courses: formattedCourses,
      departmentCounts,
      levelCounts: levelCountsFormatted,
      total: formattedCourses.length,
      year,
      availableYears: [2024, 2025, 2026] // Can be made dynamic
    })

  } catch (error) {
    console.error('Courses fetch error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch courses' 
      },
      { status: 500 }
    )
  }
} 