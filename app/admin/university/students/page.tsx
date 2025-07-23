export const dynamic = 'force-dynamic';
export const revalidate = 0;

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  Loader2,
  Search,
  Filter,
  ArrowLeft,
  User,
  GraduationCap,
  BookOpen,
  Mail,
  Eye,
  BarChart4,
  AlertCircle,
  ChevronLeft
} from 'lucide-react'
import BackgroundNodes from '@/components/BackgroundNodes'

interface Student {
  _id: string
  userId: string
  fullName: string
  email: string
  username: string
  enrolledCourses: number
  activeSemesters: number
  gpa: number
  totalCredits: number
  completedCredits: number
  createdAt: string
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [semesterFilter, setSemesterFilter] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  
  // Student details dialog
  const [showStudentDetails, setShowStudentDetails] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [studentDetails, setStudentDetails] = useState<any>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect if user is not admin
    if (!isLoading && (!isAuthenticated || (user && user.role !== 'ADMIN'))) {
      router.push('/admin')
      return
    }
    
    if (isAuthenticated && user?.role === 'ADMIN') {
      fetchStudents()
    }
  }, [user, isAuthenticated, isLoading, router])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/university/students')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch students')
      }
      
      setStudents(data.students || [])
    } catch (error) {
      console.error('Error fetching students:', error)
      setError('Failed to load students. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchStudentDetails = async (studentId: string) => {
    try {
      setLoadingDetails(true)
      
      const response = await fetch(`/api/admin/university/students/${studentId}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch student details')
      }
      
      setStudentDetails(data)
    } catch (error) {
      console.error('Error fetching student details:', error)
      toast.error('Failed to load student details. Please try again.')
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student)
    setShowStudentDetails(true)
    fetchStudentDetails(student._id)
  }

  const filteredStudents = students.filter(student => {
    // Apply search filter
    if (searchTerm && !student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !student.email.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    
    // Apply tab filter
    if (activeTab === 'active' && student.activeSemesters === 0) {
      return false
    }
    
    if (activeTab === 'inactive' && student.activeSemesters > 0) {
      return false
    }
    
    return true
  })

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        <BackgroundNodes isMobile={false} />
        <div className="relative z-10 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-lg">Loading students...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
      <BackgroundNodes isMobile={false} />
      
      <div className="relative z-10 container mx-auto pt-24 pb-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                className="bg-white/10 hover:bg-white/20"
                onClick={() => router.push('/admin/university')}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                  Student Management
                </h1>
                <p className="text-white/60 mt-1">Manage student enrollments and academic records</p>
              </div>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-md p-4 mb-6 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p>{error}</p>
          </div>
        )}
        
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-semibold flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-400" />
                Students
              </h2>
              <p className="text-gray-400">
                {filteredStudents.length} {filteredStudents.length === 1 ? 'student' : 'students'} found
              </p>
            </div>
            
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search students..."
                  className="pl-10 bg-white/5 border-white/10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="bg-white/5">
              <TabsTrigger value="all">All Students</TabsTrigger>
              <TabsTrigger value="active">Active Students</TabsTrigger>
              <TabsTrigger value="inactive">Inactive Students</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-md">
              <User className="h-12 w-12 mx-auto text-gray-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">No students found</h3>
              <p className="text-gray-400 mb-4">
                {students.length > 0 
                  ? 'Try adjusting your filters to see more results'
                  : 'No students have enrolled in university courses yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-left">
                    <th className="py-3 px-4 text-gray-400 font-medium">Name</th>
                    <th className="py-3 px-4 text-gray-400 font-medium">Email</th>
                    <th className="py-3 px-4 text-gray-400 font-medium">Enrolled Courses</th>
                    <th className="py-3 px-4 text-gray-400 font-medium">Active Semesters</th>
                    <th className="py-3 px-4 text-gray-400 font-medium">GPA</th>
                    <th className="py-3 px-4 text-gray-400 font-medium">Credits</th>
                    <th className="py-3 px-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student._id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-4 px-4 font-medium">{student.fullName}</td>
                      <td className="py-4 px-4">{student.email}</td>
                      <td className="py-4 px-4">{student.enrolledCourses}</td>
                      <td className="py-4 px-4">
                        {student.activeSemesters > 0 ? (
                          <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30">
                            {student.activeSemesters}
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-500/20 text-gray-400 hover:bg-gray-500/30">
                            None
                          </Badge>
                        )}
                      </td>
                      <td className="py-4 px-4">{student.gpa.toFixed(2)}</td>
                      <td className="py-4 px-4">{student.completedCredits}/{student.totalCredits}</td>
                      <td className="py-4 px-4">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleViewStudent(student)}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Student Details Dialog */}
      <Dialog open={showStudentDetails} onOpenChange={setShowStudentDetails}>
        <DialogContent className="bg-gray-900 border-white/10 text-white max-w-4xl">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription className="text-gray-400">
              Detailed information about the student
            </DialogDescription>
          </DialogHeader>
          
          {loadingDetails ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : studentDetails ? (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="mr-2 h-5 w-5 text-blue-400" />
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-400">Full Name</p>
                        <p className="font-medium">{selectedStudent?.fullName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Email</p>
                        <p className="font-medium">{selectedStudent?.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Username</p>
                        <p className="font-medium">{selectedStudent?.username}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Joined</p>
                        <p className="font-medium">
                          {selectedStudent?.createdAt ? new Date(selectedStudent.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="flex-1">
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart4 className="mr-2 h-5 w-5 text-purple-400" />
                        Academic Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-400">GPA</p>
                        <p className="font-medium text-lg">{selectedStudent?.gpa.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Credits</p>
                        <p className="font-medium">
                          {selectedStudent?.completedCredits}/{selectedStudent?.totalCredits} Completed
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Active Semesters</p>
                        <p className="font-medium">{selectedStudent?.activeSemesters}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Enrolled Courses</p>
                        <p className="font-medium">{selectedStudent?.enrolledCourses}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <Tabs defaultValue="courses">
                <TabsList className="bg-white/5">
                  <TabsTrigger value="courses">Courses</TabsTrigger>
                  <TabsTrigger value="semesters">Semesters</TabsTrigger>
                  <TabsTrigger value="assignments">Assignments</TabsTrigger>
                </TabsList>
                
                <TabsContent value="courses" className="mt-4">
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BookOpen className="mr-2 h-5 w-5 text-green-400" />
                        Enrolled Courses
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {studentDetails.courses && studentDetails.courses.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="border-b border-white/10 text-left">
                                <th className="py-2 px-4 text-gray-400 font-medium">Course</th>
                                <th className="py-2 px-4 text-gray-400 font-medium">Semester</th>
                                <th className="py-2 px-4 text-gray-400 font-medium">Status</th>
                                <th className="py-2 px-4 text-gray-400 font-medium">Grade</th>
                              </tr>
                            </thead>
                            <tbody>
                              {studentDetails.courses.map((course: any) => (
                                <tr key={course._id} className="border-b border-white/10">
                                  <td className="py-2 px-4 font-medium">{course.title}</td>
                                  <td className="py-2 px-4">{course.semester} {course.year}</td>
                                  <td className="py-2 px-4">
                                    <Badge className={`
                                      ${course.status === 'completed' ? 'bg-green-500/20 text-green-400' : 
                                        course.status === 'enrolled' ? 'bg-blue-500/20 text-blue-400' : 
                                        'bg-amber-500/20 text-amber-400'}
                                    `}>
                                      {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                                    </Badge>
                                  </td>
                                  <td className="py-2 px-4">{course.grade || 'N/A'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-400">
                          No courses found for this student
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="semesters" className="mt-4">
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <GraduationCap className="mr-2 h-5 w-5 text-amber-400" />
                        Semester Enrollments
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {studentDetails.semesters && studentDetails.semesters.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="border-b border-white/10 text-left">
                                <th className="py-2 px-4 text-gray-400 font-medium">Term</th>
                                <th className="py-2 px-4 text-gray-400 font-medium">Year</th>
                                <th className="py-2 px-4 text-gray-400 font-medium">Courses</th>
                                <th className="py-2 px-4 text-gray-400 font-medium">Credits</th>
                                <th className="py-2 px-4 text-gray-400 font-medium">GPA</th>
                                <th className="py-2 px-4 text-gray-400 font-medium">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {studentDetails.semesters.map((semester: any) => (
                                <tr key={semester._id} className="border-b border-white/10">
                                  <td className="py-2 px-4">{semester.term}</td>
                                  <td className="py-2 px-4">{semester.year}</td>
                                  <td className="py-2 px-4">{semester.courseCount}</td>
                                  <td className="py-2 px-4">{semester.totalCredits}</td>
                                  <td className="py-2 px-4">{semester.gpa.toFixed(2)}</td>
                                  <td className="py-2 px-4">
                                    <Badge className={`
                                      ${semester.status === 'completed' ? 'bg-green-500/20 text-green-400' : 
                                        semester.status === 'registered' ? 'bg-blue-500/20 text-blue-400' : 
                                        'bg-amber-500/20 text-amber-400'}
                                    `}>
                                      {semester.status.charAt(0).toUpperCase() + semester.status.slice(1)}
                                    </Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-400">
                          No semester enrollments found for this student
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="assignments" className="mt-4">
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BookOpen className="mr-2 h-5 w-5 text-blue-400" />
                        Assignment Submissions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {studentDetails.assignments && studentDetails.assignments.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="border-b border-white/10 text-left">
                                <th className="py-2 px-4 text-gray-400 font-medium">Assignment</th>
                                <th className="py-2 px-4 text-gray-400 font-medium">Course</th>
                                <th className="py-2 px-4 text-gray-400 font-medium">Due Date</th>
                                <th className="py-2 px-4 text-gray-400 font-medium">Status</th>
                                <th className="py-2 px-4 text-gray-400 font-medium">Grade</th>
                              </tr>
                            </thead>
                            <tbody>
                              {studentDetails.assignments.map((assignment: any) => (
                                <tr key={assignment._id} className="border-b border-white/10">
                                  <td className="py-2 px-4 font-medium">{assignment.title}</td>
                                  <td className="py-2 px-4">{assignment.courseName}</td>
                                  <td className="py-2 px-4">
                                    {new Date(assignment.dueDate).toLocaleDateString()}
                                  </td>
                                  <td className="py-2 px-4">
                                    <Badge className={`
                                      ${assignment.status === 'graded' ? 'bg-green-500/20 text-green-400' : 
                                        assignment.status === 'submitted' ? 'bg-blue-500/20 text-blue-400' : 
                                        assignment.status === 'overdue' ? 'bg-red-500/20 text-red-400' :
                                        'bg-amber-500/20 text-amber-400'}
                                    `}>
                                      {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                                    </Badge>
                                  </td>
                                  <td className="py-2 px-4">
                                    {assignment.grade !== undefined ? `${assignment.grade}/${assignment.points}` : 'N/A'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-400">
                          No assignments found for this student
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">
              Failed to load student details
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowStudentDetails(false)}
              className="border-white/10 hover:bg-white/10"
            >
              Close
            </Button>
            <Button 
              onClick={() => router.push(`/admin/university/academic-records?studentId=${selectedStudent?._id}`)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              View Academic Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 