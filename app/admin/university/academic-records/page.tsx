export const dynamic = 'force-dynamic';
export const revalidate = 0;

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  Edit,
  Save,
  AlertCircle,
  Check,
  X,
  Plus,
  ChevronLeft
} from 'lucide-react'
import BackgroundNodes from '@/components/BackgroundNodes'

interface AcademicRecord {
  _id: string
  userId: string
  studentName: string
  studentEmail: string
  academicYear: number
  semester: string
  courses: {
    courseId: string
    courseName: string
    courseCode: string
    grade: string
    gpa: number
    credits: number
  }[]
  semesterGPA: number
  cumulativeGPA: number
  totalCredits: number
  completedCredits: number
  status: 'active' | 'completed' | 'on-hold'
  createdAt: string
  updatedAt: string
}

export default function AdminAcademicRecordsPage() {
  const [records, setRecords] = useState<AcademicRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [semesterFilter, setSemesterFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  
  // Record details dialog
  const [showRecordDetails, setShowRecordDetails] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<AcademicRecord | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedRecord, setEditedRecord] = useState<any>(null)
  const [processing, setProcessing] = useState(false)

  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const studentId = searchParams ? searchParams.get('studentId') : null

  const fetchAcademicRecords = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      let url = '/api/admin/university/academic-records'
      if (studentId) {
        url += `?studentId=${studentId}`
      }
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch academic records')
      }
      
      setRecords(data.records || [])
    } catch (error) {
      console.error('Error fetching academic records:', error)
      setError('Failed to load academic records. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [studentId])

  useEffect(() => {
    // Redirect if user is not admin
    if (!isLoading && (!isAuthenticated || (user && user.role !== 'ADMIN'))) {
      router.push('/admin')
      return
    }
    
    if (isAuthenticated && user?.role === 'ADMIN') {
      fetchAcademicRecords()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAuthenticated, isLoading, router, studentId])

  const handleViewRecord = (record: AcademicRecord) => {
    setSelectedRecord(record)
    setEditedRecord(null)
    setIsEditing(false)
    setShowRecordDetails(true)
  }

  const handleEditRecord = () => {
    if (!selectedRecord) return
    
    setEditedRecord({
      ...selectedRecord,
      courses: selectedRecord.courses.map(course => ({
        ...course
      }))
    })
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setEditedRecord(null)
    setIsEditing(false)
  }

  const handleCourseGradeChange = (index: number, grade: string) => {
    if (!editedRecord) return
    
    const updatedCourses = [...editedRecord.courses]
    updatedCourses[index] = {
      ...updatedCourses[index],
      grade
    }
    
    setEditedRecord({
      ...editedRecord,
      courses: updatedCourses
    })
  }

  const handleStatusChange = (status: 'active' | 'completed' | 'on-hold') => {
    if (!editedRecord) return
    
    setEditedRecord({
      ...editedRecord,
      status
    })
  }

  const handleSaveRecord = async () => {
    if (!editedRecord) return
    
    try {
      setProcessing(true)
      
      const response = await fetch(`/api/admin/university/academic-records/${editedRecord._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          courses: editedRecord.courses.map((course: any) => ({
            courseId: course.courseId,
            grade: course.grade
          })),
          status: editedRecord.status
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update academic record')
      }
      
      toast.success('Academic record updated successfully')
      setSelectedRecord(data.record)
      setIsEditing(false)
      setEditedRecord(null)
      
      // Refresh records list
      fetchAcademicRecords()
    } catch (error) {
      console.error('Error updating academic record:', error)
      toast.error('Failed to update academic record. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const filteredRecords = records.filter(record => {
    // Apply search filter
    if (searchTerm && !record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !record.studentEmail.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    
    // Apply year filter
    if (yearFilter && record.academicYear.toString() !== yearFilter) {
      return false
    }
    
    // Apply semester filter
    if (semesterFilter && record.semester !== semesterFilter) {
      return false
    }
    
    // Apply status filter
    if (statusFilter && record.status !== statusFilter) {
      return false
    }
    
    return true
  })

  // Get unique years for filter
  const years = Array.from(new Set(records.map(record => record.academicYear))).sort((a, b) => b - a)

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        <BackgroundNodes isMobile={false} />
        <div className="relative z-10 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-lg">Loading academic records...</p>
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
                  Academic Records
                </h1>
                <p className="text-white/60 mt-1">Manage student academic records and grades</p>
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
                <GraduationCap className="h-5 w-5 mr-2 text-purple-400" />
                Academic Records
              </h2>
              <p className="text-gray-400">
                {filteredRecords.length} {filteredRecords.length === 1 ? 'record' : 'records'} found
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
              
              <Button variant="outline" className="border-white/10 hover:bg-white/10" onClick={() => router.push('/admin/university/students')}>
                <User className="h-4 w-4 mr-2" />
                View Students
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="yearFilter" className="text-sm text-gray-400">Academic Year</Label>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Label htmlFor="semesterFilter" className="text-sm text-gray-400">Semester</Label>
              <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="All Semesters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Semesters</SelectItem>
                  <SelectItem value="Fall">Fall</SelectItem>
                  <SelectItem value="Spring">Spring</SelectItem>
                  <SelectItem value="Summer">Summer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Label htmlFor="statusFilter" className="text-sm text-gray-400">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-md">
              <GraduationCap className="h-12 w-12 mx-auto text-gray-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">No academic records found</h3>
              <p className="text-gray-400 mb-4">
                {records.length > 0 
                  ? 'Try adjusting your filters to see more results'
                  : 'No academic records have been created yet'}
              </p>
              <Button 
                onClick={() => router.push('/admin/university/students')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <User className="h-4 w-4 mr-2" />
                View Students
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-left">
                    <th className="py-3 px-4 text-gray-400 font-medium">Student</th>
                    <th className="py-3 px-4 text-gray-400 font-medium">Year</th>
                    <th className="py-3 px-4 text-gray-400 font-medium">Semester</th>
                    <th className="py-3 px-4 text-gray-400 font-medium">Courses</th>
                    <th className="py-3 px-4 text-gray-400 font-medium">GPA</th>
                    <th className="py-3 px-4 text-gray-400 font-medium">Credits</th>
                    <th className="py-3 px-4 text-gray-400 font-medium">Status</th>
                    <th className="py-3 px-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr key={record._id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium">{record.studentName}</p>
                          <p className="text-sm text-gray-400">{record.studentEmail}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">{record.academicYear}</td>
                      <td className="py-4 px-4">{record.semester}</td>
                      <td className="py-4 px-4">{record.courses.length}</td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium">{record.semesterGPA.toFixed(2)}</p>
                          <p className="text-sm text-gray-400">Cumulative: {record.cumulativeGPA.toFixed(2)}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p>{record.completedCredits}/{record.totalCredits}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={`
                          ${record.status === 'completed' ? 'bg-green-500/20 text-green-400' : 
                            record.status === 'active' ? 'bg-blue-500/20 text-blue-400' : 
                            'bg-amber-500/20 text-amber-400'}
                        `}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 p-0"
                          onClick={() => handleViewRecord(record)}
                        >
                          View Details
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
      
      {/* Record Details Dialog */}
      <Dialog open={showRecordDetails} onOpenChange={setShowRecordDetails}>
        <DialogContent className="bg-gray-900 border-white/10 text-white max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Academic Record' : 'Academic Record Details'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {isEditing 
                ? 'Update grades and status for this academic record'
                : `${selectedRecord?.studentName}'s academic record for ${selectedRecord?.semester} ${selectedRecord?.academicYear}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="mr-2 h-5 w-5 text-blue-400" />
                        Student Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-400">Name</p>
                        <p className="font-medium">{selectedRecord.studentName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Email</p>
                        <p className="font-medium">{selectedRecord.studentEmail}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="flex-1">
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <GraduationCap className="mr-2 h-5 w-5 text-purple-400" />
                        Academic Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Semester GPA</p>
                          <p className="font-medium text-lg">{selectedRecord.semesterGPA.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Cumulative GPA</p>
                          <p className="font-medium text-lg">{selectedRecord.cumulativeGPA.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Credits</p>
                          <p className="font-medium">
                            {selectedRecord.completedCredits}/{selectedRecord.totalCredits} Completed
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Status</p>
                          {isEditing ? (
                            <Select 
                              value={editedRecord.status} 
                              onValueChange={(value) => handleStatusChange(value as 'active' | 'completed' | 'on-hold')}
                            >
                              <SelectTrigger className="bg-white/5 border-white/10 w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="on-hold">On Hold</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge className={`
                              ${selectedRecord.status === 'completed' ? 'bg-green-500/20 text-green-400' : 
                                selectedRecord.status === 'active' ? 'bg-blue-500/20 text-blue-400' : 
                                'bg-amber-500/20 text-amber-400'}
                            `}>
                              {selectedRecord.status.charAt(0).toUpperCase() + selectedRecord.status.slice(1)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <BookOpen className="mr-2 h-5 w-5 text-green-400" />
                      Course Grades
                    </CardTitle>
                    <CardDescription>
                      {selectedRecord.courses.length} courses in {selectedRecord.semester} {selectedRecord.academicYear}
                    </CardDescription>
                  </div>
                  
                  {!isEditing && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-white/10 hover:bg-white/10"
                      onClick={handleEditRecord}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Grades
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-left">
                          <th className="py-2 px-4 text-gray-400 font-medium">Course</th>
                          <th className="py-2 px-4 text-gray-400 font-medium">Code</th>
                          <th className="py-2 px-4 text-gray-400 font-medium">Credits</th>
                          <th className="py-2 px-4 text-gray-400 font-medium">Grade</th>
                          <th className="py-2 px-4 text-gray-400 font-medium">GPA</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(isEditing ? editedRecord.courses : selectedRecord.courses).map((course: any, index: number) => (
                          <tr key={course.courseId} className="border-b border-white/10">
                            <td className="py-2 px-4 font-medium">{course.courseName}</td>
                            <td className="py-2 px-4">{course.courseCode}</td>
                            <td className="py-2 px-4">{course.credits}</td>
                            <td className="py-2 px-4">
                              {isEditing ? (
                                <Select 
                                  value={course.grade || ''} 
                                  onValueChange={(value) => handleCourseGradeChange(index, value)}
                                >
                                  <SelectTrigger className="bg-white/5 border-white/10 w-24">
                                    <SelectValue placeholder="--" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="not-graded">Not Graded</SelectItem>
                                    <SelectItem value="A+">A+</SelectItem>
                                    <SelectItem value="A">A</SelectItem>
                                    <SelectItem value="A-">A-</SelectItem>
                                    <SelectItem value="B+">B+</SelectItem>
                                    <SelectItem value="B">B</SelectItem>
                                    <SelectItem value="B-">B-</SelectItem>
                                    <SelectItem value="C+">C+</SelectItem>
                                    <SelectItem value="C">C</SelectItem>
                                    <SelectItem value="C-">C-</SelectItem>
                                    <SelectItem value="D+">D+</SelectItem>
                                    <SelectItem value="D">D</SelectItem>
                                    <SelectItem value="F">F</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                course.grade || '--'
                              )}
                            </td>
                            <td className="py-2 px-4">{course.gpa?.toFixed(2) || '--'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <DialogFooter>
            {isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleCancelEdit}
                  className="border-white/10 hover:bg-white/10"
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveRecord}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={processing}
                >
                  {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => setShowRecordDetails(false)}
                className="border-white/10 hover:bg-white/10"
              >
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 