'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { useTheme } from '@/contexts/theme-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'
import { ErrorMessage } from '../components/ErrorMessage'

import BackgroundNodes from '@/components/BackgroundNodes'

import { 
  BookOpen, 
  Calendar, 
  Users,
  Clock,
  Plus,
  Search,
  Filter,
  ArrowLeft,
  User,
  MapPin,
  AlertCircle,
  Check,
  X,
  BookMarked,
  Loader2
} from 'lucide-react'

interface Course {
  _id: string
  courseCode: string
  title: string
  description: string
  credits: number
  professor: {
    name: string
    email: string
    office: string
  }
  department: string
  level: string
  prerequisites: string[]
  semester: string
  year: number
  maxEnrollment: number
  currentEnrollment: number
  isEnrolled?: boolean
  enrollmentId?: string
}

interface EnrollmentSemester {
  year: number
  semester: string
  courses: any[]
  totalCredits: number
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
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
}

export default function CoursesPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { theme } = useTheme()
  const router = useRouter()
  
  const [availableCourses, setAvailableCourses] = useState<Course[]>([])
  const [enrolledSemesters, setEnrolledSemesters] = useState<EnrollmentSemester[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [semesterFilter, setSemesterFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [enrollmentYear, setEnrollmentYear] = useState('')
  const [enrollmentSemester, setEnrollmentSemester] = useState('')
  const [enrolling, setEnrolling] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirectTo=/university/courses')
      return
    }

    if (isAuthenticated) {
      fetchCoursesData()
    }
  }, [isAuthenticated, isLoading, router])

  const fetchCoursesData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [coursesResponse, enrollmentsResponse] = await Promise.all([
        fetch('/api/university/courses'),
        fetch('/api/university/enrollments')
      ])

      if (!coursesResponse.ok) {
        throw new Error('Failed to fetch courses')
      }

      const coursesData = await coursesResponse.json()
      const enrollmentsData = enrollmentsResponse.ok ? await enrollmentsResponse.json() : { enrollments: [] }

      // Create a map of enrolled course IDs for quick lookup
      const enrolledCourseIds = new Set()
      const enrollmentMap = new Map()

      enrollmentsData.enrollments?.forEach((semester: any) => {
        semester.courses.forEach((enrollment: any) => {
          enrolledCourseIds.add(enrollment.courseId._id)
          enrollmentMap.set(enrollment.courseId._id, enrollment._id)
        })
      })

      // Mark courses as enrolled and add enrollment IDs
      const coursesWithEnrollment = coursesData.courses.map((course: Course) => ({
        ...course,
        isEnrolled: enrolledCourseIds.has(course._id),
        enrollmentId: enrollmentMap.get(course._id)
      }))

      setAvailableCourses(coursesWithEnrollment)
      setEnrolledSemesters(enrollmentsData.enrollments || [])

      // Set default filter values
      const currentYear = new Date().getFullYear()
      setEnrollmentYear(currentYear.toString())
      setEnrollmentSemester('Fall')

    } catch (err) {
      console.error('Error fetching courses data:', err)
      setError('Failed to load courses data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEnrollInCourse = async () => {
    if (!selectedCourse || !enrollmentYear || !enrollmentSemester) return

    try {
      setEnrolling(true)
      
      const response = await fetch('/api/university/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          courseId: selectedCourse._id,
          year: parseInt(enrollmentYear),
          semester: enrollmentSemester
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to enroll in course')
      }

      // Refresh data and close modal
      await fetchCoursesData()
      setShowEnrollModal(false)
      setSelectedCourse(null)

    } catch (err: any) {
      console.error('Error enrolling in course:', err)
      setError(err.message)
    } finally {
      setEnrolling(false)
    }
  }

  const handleUnenrollFromCourse = async (enrollmentId: string) => {
    try {
      const response = await fetch(`/api/university/enrollments?enrollmentId=${enrollmentId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to unenroll from course')
      }

      // Refresh data
      await fetchCoursesData()

    } catch (err: any) {
      console.error('Error unenrolling from course:', err)
      setError(err.message)
    }
  }

  // Filter courses based on search and filters
  const filteredCourses = availableCourses.filter(course => {
    const matchesSearch = !searchTerm || 
      course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.professor.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDepartment = !departmentFilter || course.department === departmentFilter
    const matchesLevel = !levelFilter || course.level === levelFilter
    const matchesSemester = !semesterFilter || course.semester === semesterFilter
    const matchesYear = !yearFilter || course.year.toString() === yearFilter

    return matchesSearch && matchesDepartment && matchesLevel && matchesSemester && matchesYear
  })

  // Get unique filter options
  const departments = Array.from(new Set(availableCourses.map(course => course.department)))
  const levels = Array.from(new Set(availableCourses.map(course => course.level)))
  const semesters = Array.from(new Set(availableCourses.map(course => course.semester)))
  const years = Array.from(new Set(availableCourses.map(course => course.year.toString())))

  if (isLoading || loading) {
    return <LoadingState message="Loading courses..." />
  }

  if (!isAuthenticated) {
    return null
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchCoursesData} />
  }

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      {/* Background Effects */}
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
        className="relative z-10 container mx-auto px-4 pt-24 pb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Button
                variant="ghost"
                onClick={() => router.push('/university')}
                className="mb-2 md:mb-4 transition-colors duration-300"
                style={{ color: 'var(--text-secondary)' }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to University Portal
              </Button>
              <h1 
                className="text-3xl md:text-4xl font-bold transition-all duration-300" 
                style={{ 
                  background: theme === 'light' 
                    ? 'linear-gradient(to right, #000000, #374151, #6b7280)' 
                    : 'linear-gradient(to right, #ffffff, #e5e7eb, #9ca3af)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                My Courses
              </h1>
              <p className="mt-2 transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                Browse and enroll in courses for your academic journey
              </p>
            </div>
            <BookOpen className="h-10 w-10 md:h-12 md:w-12 transition-colors duration-300 self-center md:self-auto" style={{ color: 'var(--text-secondary)' }} />
          </div>
        </motion.div>

        {error && (
          <motion.div variants={itemVariants} className="mb-6">
            <ErrorMessage message={error} onDismiss={() => setError(null)} />
          </motion.div>
        )}

        {/* Enrolled Courses */}
        {enrolledSemesters.length > 0 && (
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold mb-4 transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
              My Enrolled Courses
            </h2>
            <div className="space-y-6">
              {enrolledSemesters.map((semester, index) => (
                <Card key={`${semester.year}-${semester.semester}`} className="backdrop-blur-sm transition-colors duration-300" style={{
                  backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.05)',
                  borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
                }}>
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <CardTitle className="transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
                          {semester.semester} {semester.year}
                        </CardTitle>
                        <CardDescription className="transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                          {semester.courses.length} courses • {semester.totalCredits} credits
                          {semester.gpa > 0 && ` • GPA: ${semester.gpa.toFixed(2)}`}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="transition-colors duration-300 self-start md:self-auto">
                        {semester.courses.filter(c => c.status === 'completed').length} completed
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {semester.courses.map((enrollment) => (
                        <Card key={enrollment._id} className="transition-colors duration-300" style={{
                          backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.03)',
                          borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
                        }}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
                                {enrollment.courseId.courseCode}
                              </CardTitle>
                              <Badge variant={enrollment.status === 'completed' ? 'default' : 'secondary'}>
                                {enrollment.status}
                              </Badge>
                            </div>
                            <CardDescription className="text-xs transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                              {enrollment.courseId.title}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-1">
                              <div className="flex items-center text-xs transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                                <User className="h-3 w-3 mr-1" />
                                {enrollment.courseId.professor.name}
                              </div>
                              <div className="flex items-center text-xs transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                                <BookMarked className="h-3 w-3 mr-1" />
                                {enrollment.courseId.credits} credits
                              </div>
                              {enrollment.grade && (
                                <div className="flex items-center text-xs transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                                  <Check className="h-3 w-3 mr-1" />
                                  Grade: {enrollment.grade}
                                </div>
                              )}
                            </div>
                            {enrollment.status !== 'completed' && (
                              <Button
                                variant="destructive"
                                size="sm"
                                className="w-full mt-3"
                                onClick={() => handleUnenrollFromCourse(enrollment._id)}
                              >
                                Unenroll
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Search and Filters */}
        <motion.div variants={itemVariants} className="mb-6">
          <Card className="backdrop-blur-sm transition-colors duration-300" style={{
            backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.05)',
            borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
          }}>
            <CardHeader>
              <CardTitle className="transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
                Browse Available Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 transition-colors duration-300" style={{ color: 'var(--text-secondary)' }} />
                    <Input
                      placeholder="Search courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 transition-colors duration-300"
                    />
                  </div>
                </div>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Levels</SelectItem>
                    {levels.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Semesters</SelectItem>
                    {semesters.map(semester => (
                      <SelectItem key={semester} value={semester}>{semester}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Years</SelectItem>
                    {years.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Available Courses */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course._id} className="backdrop-blur-sm transition-all duration-300 group hover:shadow-lg" style={{
                backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.05)',
                borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
              }}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
                      {course.courseCode}
                    </CardTitle>
                    <Badge variant={course.isEnrolled ? 'default' : 'outline'}>
                      {course.isEnrolled ? 'Enrolled' : 'Available'}
                    </Badge>
                  </div>
                  <CardDescription className="transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                    {course.title}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                      {course.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                        <User className="h-4 w-4 mr-2 shrink-0" />
                        <span className="truncate">Prof. {course.professor.name}</span>
                      </div>
                      <div className="flex items-center text-sm transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                        <MapPin className="h-4 w-4 mr-2 shrink-0" />
                        <span className="truncate">{course.professor.office}</span>
                      </div>
                      <div className="flex items-center text-sm transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                        <BookMarked className="h-4 w-4 mr-2 shrink-0" />
                        {course.credits} credits • {course.department}
                      </div>
                      <div className="flex items-center text-sm transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                        <Calendar className="h-4 w-4 mr-2 shrink-0" />
                        {course.semester} {course.year}
                      </div>
                      <div className="flex items-center text-sm transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                        <Users className="h-4 w-4 mr-2 shrink-0" />
                        {course.currentEnrollment}/{course.maxEnrollment} enrolled
                      </div>
                    </div>

                    {course.prerequisites.length > 0 && (
                      <div>
                        <p className="text-xs font-medium mb-1 transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                          Prerequisites:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {course.prerequisites.map((prereq, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {prereq}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-3">
                      {course.isEnrolled ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full"
                          onClick={() => course.enrollmentId && handleUnenrollFromCourse(course.enrollmentId)}
                        >
                          Unenroll
                        </Button>
                      ) : (
                        <Dialog open={showEnrollModal && selectedCourse?._id === course._id} onOpenChange={(open) => {
                          setShowEnrollModal(open)
                          if (!open) setSelectedCourse(null)
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="default"
                              size="sm"
                              className="w-full"
                              onClick={() => {
                                setSelectedCourse(course)
                                setShowEnrollModal(true)
                              }}
                              disabled={course.currentEnrollment >= course.maxEnrollment}
                            >
                              {course.currentEnrollment >= course.maxEnrollment ? 'Full' : 'Enroll'}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Enroll in {course.courseCode}</DialogTitle>
                              <DialogDescription>
                                Select the semester and year for enrollment in {course.title}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="enrollment-year">Academic Year</Label>
                                <Select value={enrollmentYear} onValueChange={setEnrollmentYear}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select year" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {[2024, 2025, 2026, 2027].map(year => (
                                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="enrollment-semester">Semester</Label>
                                <Select value={enrollmentSemester} onValueChange={setEnrollmentSemester}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select semester" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Spring">Spring</SelectItem>
                                    <SelectItem value="Fall">Fall</SelectItem>
                                    <SelectItem value="Summer">Summer</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  className="flex-1"
                                  onClick={() => {
                                    setShowEnrollModal(false)
                                    setSelectedCourse(null)
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  className="flex-1"
                                  onClick={handleEnrollInCourse}
                                  disabled={enrolling || !enrollmentYear || !enrollmentSemester}
                                >
                                  {enrolling ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Enrolling...
                                    </>
                                  ) : (
                                    'Confirm Enrollment'
                                  )}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto mb-4 transition-colors duration-300" style={{ color: 'var(--text-secondary)' }} />
              <h3 className="text-lg font-medium mb-2 transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
                No courses found
              </h3>
              <p className="transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                Try adjusting your search criteria or filters.
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}