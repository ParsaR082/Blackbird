
'use client'



import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { useTheme } from '@/contexts/theme-context'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import BackgroundNodes from '@/components/BackgroundNodes'
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
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
  const { theme } = useTheme()

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
    return <ErrorState message={error} onRetry={fetchSemesters} />
  }

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      <div className="fixed inset-0 transition-colors duration-300" style={{ 
        background: theme === 'light' 
          ? 'linear-gradient(to bottom right, #ffffff, #f8fafc, #ffffff)' 
          : 'linear-gradient(to bottom right, #000000, #1f2937, #000000)'
      }} />
      <div className="fixed inset-0" style={{
        background: theme === 'light'
          ? 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1), transparent 50%)'
          : 'radial-gradient(circle at 50% 50%, rgba(120, 119, 198, 0.1), transparent 50%)'
      }} />
      <BackgroundNodes isMobile={false} />
      
      <motion.div 
        className="relative z-10 container mx-auto pt-24 pb-12 px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="mb-8 text-center" variants={itemVariants}>
          <h1 className="text-4xl font-bold transition-all duration-300" style={{ color: 'var(--text-color)' }}>
            University Dashboard
          </h1>
          <p className="mt-2 max-w-xl mx-auto transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
            Manage your courses, study plans, and track your academic progress
          </p>
        </motion.div>
        
        {/* Current Semester Overview */}
        <motion.div className="mb-10" variants={itemVariants}>
          <h2 className="text-2xl font-bold mb-4">Current Semester</h2>
          
          {currentEnrollment ? (
            <Card className="transition-colors duration-300" style={{
              backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
              borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
            }}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
                      {currentEnrollment.term} {currentEnrollment.year} Semester
                    </CardTitle>
                    <CardDescription className="transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                      {currentEnrollment.status === 'in-progress' ? 'In Progress' : 
                       currentEnrollment.status === 'completed' ? 'Completed' : 'Registered'}
                    </CardDescription>
                  </div>
                  <Badge className="bg-blue-500 text-white">{currentEnrollment.totalCredits} Credits</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div>
                  <h3 className="text-sm font-medium mb-2 transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>Enrolled Courses</h3>
                  <div className="space-y-3">
                    {currentEnrollment.courses.map((course) => (
                      <div key={course.id} className="p-3 rounded-md transition-colors duration-300" style={{
                        backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                        borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                        borderWidth: '1px',
                        borderStyle: 'solid'
                      }}>
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="flex items-center">
                              <BookOpen className="h-4 w-4 mr-2 text-blue-400" />
                              <span className="font-medium transition-colors duration-300" style={{ color: 'var(--text-color)' }}>{course.courseCode}</span>
                            </div>
                            <h4 className="text-sm mt-1 transition-colors duration-300" style={{ color: 'var(--text-color)' }}>{course.title}</h4>
                            <p className="text-xs mt-1 transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>Prof. {course.professor.name}</p>
                          </div>
                          <div className="text-right">
                            <Badge className="transition-colors duration-300" style={{
                              backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                              color: 'var(--text-color)'
                            }}>{course.credits} Credits</Badge>
                            <div className="mt-1">
                              <div className="w-full rounded-full h-1.5 mt-1 transition-colors duration-300" style={{
                                backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
                              }}>
                                <div 
                                  className={`${getProgressColor(75)} h-1.5 rounded-full`} 
                                  style={{ width: `75%` }}
                                />
                              </div>
                              <p className="text-xs mt-1 transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>75% Complete</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4 flex justify-between transition-colors duration-300" style={{
                borderTopColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                borderTopWidth: '1px',
                borderTopStyle: 'solid'
              }}>
                <Link href="/university/courses">
                  <Button variant="outline" className="transition-colors duration-300" style={{
                    borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                    color: 'var(--text-color)',
                    backgroundColor: 'transparent'
                  }}>
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
            <Card className="transition-colors duration-300" style={{
              backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
              borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
            }}>
              <CardContent className="pt-6 pb-6 text-center">
                <div className="mb-4">
                  <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2 transition-colors duration-300" style={{ color: 'var(--text-color)' }}>No Current Enrollment</h3>
                  <p className="max-w-md mx-auto transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                    You haven&apos;t enrolled in any courses yet. Check available semesters below to enroll.
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
        </motion.div>
        
        {/* Academic Stats */}
        <motion.div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-4" variants={itemVariants}>
          <Card className="transition-colors duration-300" style={{
            backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
            borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
          }}>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="rounded-full bg-blue-500/20 p-3 mr-4">
                  <GraduationCap className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>Total Credits</p>
                  <h3 className="text-2xl font-bold transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
                    {enrollments.reduce((total, enrollment) => total + enrollment.totalCredits, 0)}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="transition-colors duration-300" style={{
            backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
            borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
          }}>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="rounded-full bg-purple-500/20 p-3 mr-4">
                  <Award className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>GPA</p>
                  <h3 className="text-2xl font-bold transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
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
          
          <Card className="transition-colors duration-300" style={{
            backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
            borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
          }}>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="rounded-full bg-green-500/20 p-3 mr-4">
                  <BarChart4 className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>Completion Rate</p>
                  <h3 className="text-2xl font-bold transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
                    {enrollments.length ? 
                      `${Math.round(enrollments.filter(e => e.status === 'completed').length / enrollments.length * 100)}%` 
                      : 'N/A'}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Year-based Semesters */}
        <motion.div variants={itemVariants}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold transition-colors duration-300" style={{ color: 'var(--text-color)' }}>Semester Overview</h2>
            <Button 
              variant="outline" 
              className="transition-colors duration-300"
              style={{
                borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                color: 'var(--text-color)',
                backgroundColor: 'transparent'
              }}
              onClick={() => router.push('/university/semester-enrollment')}
            >
              Manage Enrollments
            </Button>
          </div>
          
          <div className="mb-4">
            <Tabs value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
              <TabsList className="transition-colors duration-300" style={{
                backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
                borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
              }}>
                {years.map(year => (
                  <TabsTrigger 
                    key={year} 
                    value={year.toString()}
                    className={selectedYear === year ? "bg-blue-600 text-white data-[state=active]:bg-blue-600" : ""}
                  >
                    {year}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
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
                    className="transition-colors duration-300"
                    style={{
                      backgroundColor: semester 
                        ? (theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)')
                        : (theme === 'light' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'),
                      borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
                        <span>{term} {selectedYear}</span>
                        {semester?.isCurrentSemester && (
                          <Badge className="bg-green-600">Current</Badge>
                        )}
                      </CardTitle>
                      {semester ? (
                        <CardDescription className="transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                          {formatDate(semester.startDate)} - {formatDate(semester.endDate)}
                        </CardDescription>
                      ) : (
                        <CardDescription className="transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
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
                              <span className="text-sm transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                                {enrollment.totalCredits} Credits
                              </span>
                            </div>
                            
                            <div className="mt-4">
                              <h4 className="text-sm font-medium mb-2 transition-colors duration-300" style={{ color: 'var(--text-color)' }}>Enrolled Courses ({enrollment.courses.length})</h4>
                              <ul className="space-y-1">
                                {enrollment.courses.map(course => (
                                  <li key={course.id} className="text-sm transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
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
                                <p className="text-sm mb-3 transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
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
                                <Calendar className="h-8 w-8 mx-auto mb-2 transition-colors duration-300" style={{ color: 'var(--text-secondary)' }} />
                                <p className="text-sm transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
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
        </motion.div>
        
        {/* Quick Links */}
        <motion.div className="mt-10" variants={itemVariants}>
          <h2 className="text-2xl font-bold mb-4 transition-colors duration-300" style={{ color: 'var(--text-color)' }}>Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="cursor-pointer transition-colors duration-300"
                style={{
                  backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
                  borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
                }}
                onClick={() => router.push('/university/courses')}>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <BookOpen className="h-6 w-6 text-blue-400 mr-3" />
                  <span className="transition-colors duration-300" style={{ color: 'var(--text-color)' }}>Browse Courses</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer transition-colors duration-300"
                style={{
                  backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
                  borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
                }}
                onClick={() => router.push('/university/study-plans')}>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <ClipboardList className="h-6 w-6 text-purple-400 mr-3" />
                  <span className="transition-colors duration-300" style={{ color: 'var(--text-color)' }}>Study Plans</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer transition-colors duration-300"
                style={{
                  backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
                  borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
                }}
                onClick={() => router.push('/university/assignments')}>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Award className="h-6 w-6 text-amber-400 mr-3" />
                  <span className="transition-colors duration-300" style={{ color: 'var(--text-color)' }}>My Assignments</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer transition-colors duration-300"
                style={{
                  backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
                  borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
                }}
                onClick={() => router.push('/university/academic-record')}>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <GraduationCap className="h-6 w-6 text-green-400 mr-3" />
                  <span className="transition-colors duration-300" style={{ color: 'var(--text-color)' }}>Academic Record</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}