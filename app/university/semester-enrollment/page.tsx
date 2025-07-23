export const dynamic = 'force-dynamic';
export const revalidate = 0;

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import { toast } from 'sonner'
import {
  Loader2,
  Calendar,
  BookOpen,
  CheckCircle,
  Search,
  Filter,
  X,
  AlertCircle,
  ArrowLeft,
  Info,
  Check
} from 'lucide-react'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'
import { ErrorMessage } from '../components/ErrorMessage'

interface Semester {
  id: string
  term: 'Fall' | 'Spring' | 'Summer'
  year: number
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
  description: string
  credits: number
  professor: {
    name: string
    email: string
    department: string
  }
  department: string
  level: 'undergraduate' | 'graduate'
  prerequisites: string[]
  semester: 'Fall' | 'Spring' | 'Summer'
  year: number
  maxStudents: number
  currentEnrollments: number
  enrollmentPercentage: number
  isAvailable: boolean
}

interface Enrollment {
  id: string
  semesterId: string
  year: number
  term: 'Fall' | 'Spring' | 'Summer'
  courses: string[]
  totalCredits: number
  status: 'registered' | 'in-progress' | 'completed'
}

export default function SemesterEnrollmentPage() {
  const [years, setYears] = useState<number[]>([])
  const [semestersByYear, setSemestersByYear] = useState<Record<number, Semester[]>>({})
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [availableCourses, setAvailableCourses] = useState<Course[]>([])
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null)
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [processingEnrollment, setProcessingEnrollment] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showEnrollConfirm, setShowEnrollConfirm] = useState(false)
  const [showDropConfirm, setShowDropConfirm] = useState(false)
  
  const { user } = useAuth()
  const router = useRouter()

  // Selected year for the UI
  const [activeYear, setActiveYear] = useState<number>(0)
  
  useEffect(() => {
    fetchSemesters()
    fetchEnrollments()
  }, [])
  
  // Fix the useEffect hooks with eslint-disable comments
  useEffect(() => {
    if (selectedSemester) {
      fetchCoursesForSemester(selectedSemester)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSemester])

  useEffect(() => {
    if (years.length > 0 && activeYear === 0) {
      setActiveYear(years[0])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [years])

  const fetchSemesters = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/university/semesters')
      
      if (!response.ok) {
        throw new Error('Failed to fetch semesters')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setSemestersByYear(data.semestersByYear)
        setYears(data.years)
        
        if (data.years.length > 0) {
          setActiveYear(data.years[0])
        }
      } else {
        throw new Error(data.error || 'Failed to fetch semesters')
      }
    } catch (err: any) {
      console.error('Error fetching semesters:', err)
      setError(err.message || 'Failed to load semesters. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchEnrollments = async () => {
    try {
      const response = await fetch('/api/university/semester-enrollments')
      
      if (!response.ok) {
        throw new Error('Failed to fetch enrollments')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setEnrollments(data.enrollments)
      } else {
        throw new Error(data.error || 'Failed to fetch enrollments')
      }
    } catch (err) {
      console.error('Error fetching enrollments:', err)
    }
  }

  const fetchCoursesForSemester = async (semester: Semester) => {
    try {
      setLoadingCourses(true)
      setAvailableCourses([])
      
      const response = await fetch(`/api/university/courses?semester=${semester.term}&year=${semester.year}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch courses')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setAvailableCourses(data.courses)
        
        // Check if user is already enrolled in this semester
        const enrollment = enrollments.find(e => 
          e.semesterId === semester.id || 
          (e.year === semester.year && e.term === semester.term)
        )
        
        if (enrollment) {
          setSelectedCourses(enrollment.courses)
          setEnrollmentId(enrollment.id)
        } else {
          setSelectedCourses([])
          setEnrollmentId(null)
        }
      } else {
        throw new Error(data.error || 'Failed to fetch courses')
      }
    } catch (err) {
      console.error('Error fetching courses:', err)
      toast.error('Failed to load courses for this semester')
    } finally {
      setLoadingCourses(false)
    }
  }

  const handleSemesterSelect = (semester: Semester) => {
    setSelectedSemester(semester)
    setSearchTerm('')
    setDepartmentFilter('')
    setLevelFilter('')
  }

  const toggleCourseSelection = (courseId: string, credits: number) => {
    setSelectedCourses(prev => {
      if (prev.includes(courseId)) {
        return prev.filter(id => id !== courseId)
      } else {
        return [...prev, courseId]
      }
    })
  }

  const handleEnroll = async () => {
    if (!selectedSemester) return
    
    try {
      setProcessingEnrollment(true)
      
      const method = enrollmentId ? 'PUT' : 'POST'
      const url = enrollmentId 
        ? `/api/university/semester-enrollments?id=${enrollmentId}`
        : '/api/university/semester-enrollments'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          semesterId: selectedSemester.id,
          courses: selectedCourses
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process enrollment')
      }
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(
          enrollmentId 
            ? 'Course selection updated successfully' 
            : 'Successfully enrolled in semester'
        )
        
        fetchEnrollments()
        router.push('/university')
      } else {
        throw new Error(data.error || 'Failed to process enrollment')
      }
    } catch (err: any) {
      console.error('Error processing enrollment:', err)
      toast.error(err.message || 'Failed to process enrollment')
    } finally {
      setProcessingEnrollment(false)
      setShowEnrollConfirm(false)
    }
  }

  const handleDropEnrollment = async () => {
    if (!enrollmentId) return
    
    try {
      setProcessingEnrollment(true)
      
      const response = await fetch(`/api/university/semester-enrollments?id=${enrollmentId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to drop enrollment')
      }
      
      const data = await response.json()
      
      if (data.success) {
        toast.success('Enrollment cancelled successfully')
        fetchEnrollments()
        router.push('/university')
      } else {
        throw new Error(data.error || 'Failed to drop enrollment')
      }
    } catch (err: any) {
      console.error('Error dropping enrollment:', err)
      toast.error(err.message || 'Failed to drop enrollment')
    } finally {
      setProcessingEnrollment(false)
      setShowDropConfirm(false)
    }
  }

  const calculateTotalCredits = () => {
    return selectedCourses.reduce((total, courseId) => {
      const course = availableCourses.find(c => c.id === courseId)
      return total + (course ? course.credits : 0)
    }, 0)
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy')
    } catch (error) {
      return 'Invalid date'
    }
  }

  const isEnrolled = (semesterId: string) => {
    return enrollments.some(e => e.semesterId === semesterId)
  }

  const getEnrollmentForSemester = (semesterId: string) => {
    return enrollments.find(e => e.semesterId === semesterId)
  }

  // Filter courses based on search and filters
  const filteredCourses = availableCourses.filter(course => {
    const matchesSearch = !searchTerm || 
      course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.professor.name.toLowerCase().includes(searchTerm.toLowerCase())
      
    const matchesDepartment = !departmentFilter || course.department === departmentFilter
    const matchesLevel = !levelFilter || course.level === levelFilter
    
    return matchesSearch && matchesDepartment && matchesLevel
  })

  // Get unique departments for filter
  const departments = Array.from(new Set(availableCourses.map(course => course.department)))

  if (loading) {
    return <LoadingState message="Loading semester information..." />
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchSemesters} />
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
      
      <div className="relative z-10 container mx-auto pt-24 pb-12 px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/university')}
            className="mb-4 text-white/60 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Semester Enrollment
          </h1>
          <p className="text-white/60 mt-2">
            Register for courses and manage your academic schedule
          </p>
        </div>
        
        {selectedSemester ? (
          <>
            {/* Selected Semester View */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedSemester(null)}
                  className="mb-2 border-white/10 hover:bg-white/10"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Semesters
                </Button>
                <h2 className="text-2xl font-bold">
                  {selectedSemester.term} {selectedSemester.year} Courses
                </h2>
                <p className="text-white/60">
                  {formatDate(selectedSemester.startDate)} - {formatDate(selectedSemester.endDate)}
                </p>
                <p className="text-white/60">
                  Registration deadline: {formatDate(selectedSemester.registrationDeadline)}
                </p>
              </div>
              <div>
                <div className="flex gap-2">
                  <Button 
                    disabled={selectedCourses.length === 0 || !selectedSemester.isRegistrationOpen || processingEnrollment}
                    onClick={() => setShowEnrollConfirm(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {processingEnrollment ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : enrollmentId ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Update Selection
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirm Enrollment
                      </>
                    )}
                  </Button>
                  
                  {enrollmentId && (
                    <Button 
                      variant="destructive"
                      disabled={processingEnrollment || !selectedSemester.isRegistrationOpen}
                      onClick={() => setShowDropConfirm(true)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Drop Semester
                    </Button>
                  )}
                </div>
                
                <div className="mt-2 text-right">
                  <Badge className="bg-blue-600">
                    {selectedCourses.length} courses selected
                  </Badge>
                  <Badge className="ml-2 bg-blue-600">
                    {calculateTotalCredits()} credits
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Course Selection */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-1">
                <Card className="bg-white/5 border-white/10 sticky top-24">
                  <CardHeader>
                    <CardTitle>Filters</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Search</Label>
                      <div className="relative mt-1">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                        <Input
                          placeholder="Search courses..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-8 bg-white/5 border-white/10"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Department</Label>
                      <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                        <SelectTrigger className="mt-1 bg-white/5 border-white/10">
                          <SelectValue placeholder="All Departments" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Departments</SelectItem>
                          {departments.map(dept => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Level</Label>
                      <Select value={levelFilter} onValueChange={setLevelFilter}>
                        <SelectTrigger className="mt-1 bg-white/5 border-white/10">
                          <SelectValue placeholder="All Levels" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          <SelectItem value="undergraduate">Undergraduate</SelectItem>
                          <SelectItem value="graduate">Graduate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="pt-2">
                      <Button 
                        variant="outline" 
                        className="w-full border-white/10 hover:bg-white/10"
                        onClick={() => {
                          setSearchTerm('')
                          setDepartmentFilter('')
                          setLevelFilter('')
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                    
                    <div className="border-t border-white/10 pt-4 mt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Selected:</span>
                        <Badge>{selectedCourses.length} courses</Badge>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-medium">Total Credits:</span>
                        <Badge>{calculateTotalCredits()} credits</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="md:col-span-3">
                {loadingCourses ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                      <p className="text-white/60">Loading courses...</p>
                    </div>
                  </div>
                ) : filteredCourses.length === 0 ? (
                  <div className="text-center py-12 bg-white/5 border border-white/10 rounded-lg">
                    <AlertCircle className="h-12 w-12 text-white/40 mx-auto mb-4" />
                    <h3 className="text-xl font-medium mb-2">No Courses Found</h3>
                    <p className="text-white/60 max-w-md mx-auto">
                      No courses match your search criteria. Try adjusting your filters or search terms.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredCourses.map((course) => (
                      <Card 
                        key={course.id} 
                        className={`${
                          selectedCourses.includes(course.id) 
                            ? 'bg-blue-900/20 border-blue-500/50' 
                            : 'bg-white/5 border-white/10'
                        } transition-colors duration-200`}
                      >
                        <CardContent className="pt-6">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center mb-1">
                                <Badge className="mr-2 bg-white/10">{course.courseCode}</Badge>
                                <Badge 
                                  className={
                                    course.level === 'undergraduate' 
                                      ? 'bg-blue-500/20 text-blue-300' 
                                      : 'bg-purple-500/20 text-purple-300'
                                  }
                                >
                                  {course.level === 'undergraduate' ? 'Undergraduate' : 'Graduate'}
                                </Badge>
                                <Badge className="ml-2 bg-white/10">{course.credits} Credits</Badge>
                              </div>
                              
                              <h3 className="text-lg font-medium">{course.title}</h3>
                              <p className="text-white/60 mt-1 line-clamp-2">{course.description}</p>
                              
                              <div className="mt-2">
                                <p className="text-sm">
                                  <span className="text-white/60">Professor:</span> {course.professor.name}
                                </p>
                                <p className="text-sm">
                                  <span className="text-white/60">Department:</span> {course.department}
                                </p>
                              </div>
                              
                              <div className="mt-3">
                                <div className="flex items-center">
                                  <div className="w-full max-w-xs bg-white/10 rounded-full h-1.5">
                                    <div 
                                      className={`${
                                        course.enrollmentPercentage >= 90 ? 'bg-red-500' :
                                        course.enrollmentPercentage >= 70 ? 'bg-yellow-500' :
                                        'bg-green-500'
                                      } h-1.5 rounded-full`}
                                      style={{ width: `${Math.min(100, course.enrollmentPercentage)}%` }}
                                    />
                                  </div>
                                  <span className="ml-2 text-xs text-white/60">
                                    {course.currentEnrollments}/{course.maxStudents} enrolled
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-center justify-center">
                              <Button
                                variant={selectedCourses.includes(course.id) ? "default" : "outline"}
                                className={
                                  selectedCourses.includes(course.id)
                                    ? "bg-blue-600 hover:bg-blue-700 min-w-[120px]"
                                    : "border-white/10 hover:bg-white/10 min-w-[120px]"
                                }
                                onClick={() => toggleCourseSelection(course.id, course.credits)}
                                disabled={!course.isAvailable && !selectedCourses.includes(course.id)}
                              >
                                {selectedCourses.includes(course.id) ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Selected
                                  </>
                                ) : course.isAvailable ? (
                                  "Select Course"
                                ) : (
                                  "Class Full"
                                )}
                              </Button>
                              
                              {!course.isAvailable && !selectedCourses.includes(course.id) && (
                                <p className="text-xs text-red-400 mt-2">No spots available</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Semester Selection View */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">Available Semesters</h2>
              
              <Tabs defaultValue={activeYear.toString()} className="w-full">
                <TabsList className="bg-white/5 border border-white/10">
                  {years.map(year => (
                    <TabsTrigger 
                      key={year} 
                      value={year.toString()}
                      onClick={() => setActiveYear(year)}
                      className={activeYear === year ? "bg-blue-600 text-white data-[state=active]:bg-blue-600" : ""}
                    >
                      {year}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {years.map(year => (
                  <TabsContent key={year} value={year.toString()} className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {['Spring', 'Summer', 'Fall'].map(term => {
                        const semester = (semestersByYear[year] || [])
                          .find(s => s.term === term)
                        
                        if (!semester) {
                          return (
                            <Card key={term} className="bg-white/2 border-white/10">
                              <CardHeader>
                                <CardTitle>{term} {year}</CardTitle>
                                <CardDescription className="text-white/40">Not scheduled</CardDescription>
                              </CardHeader>
                            </Card>
                          )
                        }
                        
                        const enrollment = getEnrollmentForSemester(semester.id)
                        
                        return (
                          <Card 
                            key={term} 
                            className={`${
                              enrollment 
                                ? 'bg-blue-900/20 border-blue-500/50' 
                                : 'bg-white/5 border-white/10'
                            }`}
                          >
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle>{term} {year}</CardTitle>
                                {semester.isCurrentSemester && (
                                  <Badge className="bg-green-600">Current</Badge>
                                )}
                              </div>
                              <CardDescription className="text-white/60">
                                {formatDate(semester.startDate)} - {formatDate(semester.endDate)}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              {enrollment ? (
                                <div>
                                  <div className="mb-3 flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                                    <span className="font-medium">Enrolled</span>
                                  </div>
                                  <p className="text-sm text-white/60 mb-1">
                                    {enrollment.courses.length} courses selected
                                  </p>
                                  <p className="text-sm text-white/60">
                                    {enrollment.totalCredits} total credits
                                  </p>
                                </div>
                              ) : (
                                <div>
                                  {semester.isRegistrationOpen ? (
                                    <>
                                      <div className="flex items-center mb-3">
                                        <Calendar className="h-5 w-5 text-blue-400 mr-2" />
                                        <span className="text-sm">Registration open until {formatDate(semester.registrationDeadline)}</span>
                                      </div>
                                      <Button
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                        onClick={() => handleSemesterSelect(semester)}
                                      >
                                        Browse Courses
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      <div className="flex items-center mb-3">
                                        <Info className="h-5 w-5 text-yellow-400 mr-2" />
                                        <span className="text-sm text-white/60">
                                          {new Date(semester.registrationDeadline) < new Date()
                                            ? 'Registration period has ended'
                                            : 'Registration not yet open'
                                          }
                                        </span>
                                      </div>
                                      <Button
                                        className="w-full"
                                        variant="outline"
                                        disabled
                                      >
                                        Registration Closed
                                      </Button>
                                    </>
                                  )}
                                </div>
                              )}
                            </CardContent>
                            <CardFooter className="border-t border-white/10 pt-4">
                              {enrollment ? (
                                <Button 
                                  onClick={() => handleSemesterSelect(semester)}
                                  className="w-full"
                                  variant={semester.isRegistrationOpen ? "default" : "secondary"}
                                  disabled={!semester.isRegistrationOpen && !semester.isCurrentSemester}
                                >
                                  {semester.isRegistrationOpen 
                                    ? "Manage Enrollment" 
                                    : semester.isCurrentSemester
                                      ? "View Enrollment"
                                      : "Registration Closed"
                                  }
                                </Button>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  className="w-full border-white/10 hover:bg-white/10"
                                  onClick={() => handleSemesterSelect(semester)}
                                  disabled={!semester.isRegistrationOpen}
                                >
                                  View Courses
                                </Button>
                              )}
                            </CardFooter>
                          </Card>
                        )
                      })}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </>
        )}
      </div>
      
      {/* Enrollment Confirmation Dialog */}
      <Dialog open={showEnrollConfirm} onOpenChange={setShowEnrollConfirm}>
        <DialogContent className="bg-gray-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>
              {enrollmentId ? "Update Course Selection?" : "Confirm Enrollment?"}
            </DialogTitle>
            <DialogDescription>
              {enrollmentId 
                ? "You're about to update your course selection for this semester."
                : "You're about to enroll in the selected courses for this semester."
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <h3 className="font-medium mb-2">Selected Courses ({selectedCourses.length})</h3>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
              {selectedCourses.map(courseId => {
                const course = availableCourses.find(c => c.id === courseId)
                if (!course) return null
                
                return (
                  <div key={courseId} className="flex items-center space-x-2 p-2 bg-white/5 rounded-md">
                    <BookOpen className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{course.courseCode}: {course.title}</p>
                      <p className="text-xs text-white/60">{course.credits} credits</p>
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="mt-4 p-3 border border-white/10 rounded-md bg-white/5">
              <div className="flex justify-between items-center">
                <span>Total Credits:</span>
                <Badge className="bg-blue-600">{calculateTotalCredits()} credits</Badge>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEnrollConfirm(false)}
              disabled={processingEnrollment}
              className="border-white/10 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEnroll}
              disabled={processingEnrollment}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {processingEnrollment ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                enrollmentId ? "Update Enrollment" : "Confirm Enrollment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Drop Enrollment Confirmation Dialog */}
      <Dialog open={showDropConfirm} onOpenChange={setShowDropConfirm}>
        <DialogContent className="bg-gray-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Drop Semester Enrollment?</DialogTitle>
            <DialogDescription>
              You&apos;re about to drop all courses for this semester. This action can only be done during the registration period.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-md text-white">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                <div>
                  <h3 className="font-medium mb-1">Warning</h3>
                  <p className="text-sm text-white/80">
                    This will remove you from all courses in this semester. You may need to re-enroll if spots fill up.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDropConfirm(false)}
              disabled={processingEnrollment}
              className="border-white/10 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDropEnrollment}
              disabled={processingEnrollment}
              className="bg-red-600 hover:bg-red-700"
            >
              {processingEnrollment ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Drop Enrollment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 