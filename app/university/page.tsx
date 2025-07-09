'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import {
  Loader2,
  Calendar,
  BookOpen,
  GraduationCap,
  BarChart4,
  ClipboardList,
  Award,
  AlertCircle
} from 'lucide-react'
import { LoadingState } from './components/LoadingState'
import { ErrorState } from './components/ErrorState'

interface Semester {
  id: string
  term: 'Fall' | 'Spring' | 'Summer'
  startDate: string
  endDate: string
  registrationDeadline: string
  isActive: boolean
  isRegistrationOpen: boolean
  isCurrentSemester: boolean
}

interface Course {
  id: string
  courseCode: string
  title: string
  credits: number
  professor: {
    name: string
    email: string
    department: string
  }
}

interface SemesterEnrollment {
  id: string
  year: number
  term: 'Fall' | 'Spring' | 'Summer'
  totalCredits: number
  status: 'registered' | 'in-progress' | 'completed'
  courses: Course[]
  gpa: number
}

export default function UniversityPage() {
  const [semesters, setSemesters] = useState<Record<number, Semester[]>>({})
  const [years, setYears] = useState<number[]>([])
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear())
  const [enrollments, setEnrollments] = useState<SemesterEnrollment[]>([])
  const [loadingSemesters, setLoadingSemesters] = useState(true)
  const [loadingEnrollments, setLoadingEnrollments] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState<number>(0)

  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    fetchSemesters()
    fetchEnrollments()
  }, [])

  const fetchSemesters = async () => {
    try {
      setLoadingSemesters(true)
      setError(null)

      const response = await fetch('/api/university/semesters')
      
      if (!response.ok) {
        throw new Error('Failed to fetch semesters')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setSemesters(data.semestersByYear)
        setYears(data.years)
        setCurrentYear(data.currentYear)
        setSelectedYear(data.years[0] || data.currentYear)
      }
    } catch (err) {
      console.error('Error fetching semesters:', err)
      setError('Failed to load semesters. Please try again.')
    } finally {
      setLoadingSemesters(false)
    }
  }

  const fetchEnrollments = async () => {
    try {
      setLoadingEnrollments(true)
      
      const response = await fetch('/api/university/semester-enrollments')
      
      if (!response.ok) {
        throw new Error('Failed to fetch enrollments')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setEnrollments(data.enrollments)
      }
    } catch (err) {
      console.error('Error fetching enrollments:', err)
    } finally {
      setLoadingEnrollments(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy')
    } catch (error) {
      return 'Invalid date'
    }
  }

  const getEnrollmentsForYear = (year: number) => {
    return enrollments.filter(enrollment => enrollment.year === year)
  }

  const getCurrentSemesterEnrollment = () => {
    for (const enrollment of enrollments) {
      const semestersInYear = semesters[enrollment.year] || []
      const semester = semestersInYear.find(s => 
        s.term === enrollment.term && s.isCurrentSemester
      )
      
      if (semester) {
        return enrollment
      }
    }
    return null
  }

  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-red-500'
    if (progress < 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const currentEnrollment = getCurrentSemesterEnrollment()

  if (loadingSemesters || loadingEnrollments) {
    return <LoadingState message="Loading university information..." />
  }

  if (error) {
    return <ErrorState message={error} retry={fetchSemesters} />
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
      
      <div className="relative z-10 container mx-auto pt-24 pb-12 px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            University Dashboard
          </h1>
          <p className="text-white/60 mt-2 max-w-xl mx-auto">
            Manage your courses, study plans, and track your academic progress
          </p>
        </div>
        
        {/* Current Semester Overview */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Current Semester</h2>
          
          {currentEnrollment ? (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      {currentEnrollment.term} {currentEnrollment.year} Semester
                    </CardTitle>
                    <CardDescription className="text-white/60">
                      {currentEnrollment.status === 'in-progress' ? 'In Progress' : 
                       currentEnrollment.status === 'completed' ? 'Completed' : 'Registered'}
                    </CardDescription>
                  </div>
                  <Badge className="bg-blue-500 text-white">{currentEnrollment.totalCredits} Credits</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div>
                  <h3 className="text-sm font-medium text-white/60 mb-2">Enrolled Courses</h3>
                  <div className="space-y-3">
                    {currentEnrollment.courses.map((course) => (
                      <div key={course.id} className="p-3 rounded-md bg-white/5 border border-white/10">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="flex items-center">
                              <BookOpen className="h-4 w-4 mr-2 text-blue-400" />
                              <span className="font-medium">{course.courseCode}</span>
                            </div>
                            <h4 className="text-sm mt-1">{course.title}</h4>
                            <p className="text-xs text-white/60 mt-1">Prof. {course.professor.name}</p>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-white/10 text-white">{course.credits} Credits</Badge>
                            <div className="mt-1">
                              <div className="w-full bg-white/10 rounded-full h-1.5 mt-1">
                                <div 
                                  className={`${getProgressColor(75)} h-1.5 rounded-full`} 
                                  style={{ width: `75%` }}
                                />
                              </div>
                              <p className="text-xs text-white/60 mt-1">75% Complete</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-white/10 pt-4 flex justify-between">
                <Link href="/university/courses">
                  <Button variant="outline" className="border-white/10 hover:bg-white/10">
                    View Course Details
                  </Button>
                </Link>
                <Link href="/university/study-plans">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Update Study Plan
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ) : (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="pt-6 pb-6 text-center">
                <div className="mb-4">
                  <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Current Enrollment</h3>
                  <p className="text-white/60 max-w-md mx-auto">
                    You're not enrolled in the current semester. Check available semesters below to enroll.
                  </p>
                </div>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 mx-auto" 
                  onClick={() => router.push('/university/semester-enrollment')}
                >
                  Browse Available Semesters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Academic Stats */}
        <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="rounded-full bg-blue-500/20 p-3 mr-4">
                  <GraduationCap className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Total Credits</p>
                  <h3 className="text-2xl font-bold">
                    {enrollments.reduce((total, enrollment) => total + enrollment.totalCredits, 0)}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="rounded-full bg-purple-500/20 p-3 mr-4">
                  <Award className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60">GPA</p>
                  <h3 className="text-2xl font-bold">
                    {enrollments.length ? (
                      (enrollments.reduce((total, enrollment) => 
                        total + (enrollment.gpa || 0), 0) / 
                        enrollments.filter(e => e.gpa !== undefined).length || 1
                      ).toFixed(2)
                    ) : 'N/A'}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="rounded-full bg-green-500/20 p-3 mr-4">
                  <BarChart4 className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Completion Rate</p>
                  <h3 className="text-2xl font-bold">
                    {enrollments.length ? 
                      `${Math.round(enrollments.filter(e => e.status === 'completed').length / enrollments.length * 100)}%` 
                      : 'N/A'}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Year-based Semesters */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Semester Overview</h2>
            <Button 
              variant="outline" 
              className="border-white/10 hover:bg-white/10"
              onClick={() => router.push('/university/semester-enrollment')}
            >
              Manage Enrollments
            </Button>
          </div>
          
          <div className="mb-4">
            <TabsList className="bg-white/5 border border-white/10">
              {years.map(year => (
                <TabsTrigger 
                  key={year} 
                  value={year.toString()}
                  onClick={() => setSelectedYear(year)}
                  className={selectedYear === year ? "bg-blue-600 text-white data-[state=active]:bg-blue-600" : ""}
                >
                  {year}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          {selectedYear > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['Spring', 'Summer', 'Fall'].map(term => {
                const semester = (semesters[selectedYear] || [])
                  .find(s => s.term === term)
                
                const enrollment = enrollments.find(
                  e => e.year === selectedYear && e.term === term
                )
                
                return (
                  <Card 
                    key={term} 
                    className={`${semester ? 'bg-white/5' : 'bg-white/2'} border-white/10`}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{term} {selectedYear}</span>
                        {semester?.isCurrentSemester && (
                          <Badge className="bg-green-600">Current</Badge>
                        )}
                      </CardTitle>
                      {semester ? (
                        <CardDescription className="text-white/60">
                          {formatDate(semester.startDate)} - {formatDate(semester.endDate)}
                        </CardDescription>
                      ) : (
                        <CardDescription className="text-white/40">
                          Not scheduled
                        </CardDescription>
                      )}
                    </CardHeader>
                    
                    {semester && (
                      <CardContent>
                        {enrollment ? (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Badge 
                                className={
                                  enrollment.status === 'completed' ? 'bg-green-600' :
                                  enrollment.status === 'in-progress' ? 'bg-blue-600' :
                                  'bg-amber-600'
                                }
                              >
                                {enrollment.status === 'completed' ? 'Completed' :
                                 enrollment.status === 'in-progress' ? 'In Progress' :
                                 'Registered'}
                              </Badge>
                              <span className="text-sm text-white/60">
                                {enrollment.totalCredits} Credits
                              </span>
                            </div>
                            
                            <div className="mt-4">
                              <h4 className="text-sm font-medium mb-2">Enrolled Courses ({enrollment.courses.length})</h4>
                              <ul className="space-y-1">
                                {enrollment.courses.map(course => (
                                  <li key={course.id} className="text-sm text-white/80">
                                    {course.courseCode} - {course.title}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ) : (
                          <div>
                            {semester.isRegistrationOpen ? (
                              <div className="text-center py-4">
                                <Calendar className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                                <p className="text-sm text-white/60 mb-3">
                                  Registration open until {formatDate(semester.registrationDeadline)}
                                </p>
                                <Button 
                                  className="bg-blue-600 hover:bg-blue-700"
                                  onClick={() => router.push('/university/semester-enrollment')}
                                >
                                  Enroll Now
                                </Button>
                              </div>
                            ) : (
                              <div className="text-center py-4">
                                <Calendar className="h-8 w-8 text-white/40 mx-auto mb-2" />
                                <p className="text-sm text-white/60">
                                  {new Date(semester.registrationDeadline) < new Date() ?
                                    'Registration period has ended' :
                                    'Registration not yet open'
                                  }
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </div>
        
        {/* Quick Links */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer transition-colors"
                onClick={() => router.push('/university/courses')}>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <BookOpen className="h-6 w-6 text-blue-400 mr-3" />
                  <span>Browse Courses</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer transition-colors"
                onClick={() => router.push('/university/study-plans')}>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <ClipboardList className="h-6 w-6 text-purple-400 mr-3" />
                  <span>Study Plans</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer transition-colors"
                onClick={() => router.push('/university/assignments')}>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Award className="h-6 w-6 text-amber-400 mr-3" />
                  <span>My Assignments</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer transition-colors"
                onClick={() => router.push('/university/academic-record')}>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <GraduationCap className="h-6 w-6 text-green-400 mr-3" />
                  <span>Academic Record</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}