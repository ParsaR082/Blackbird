'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Loader2, 
  Search, 
  Plus, 
  ArrowLeft,
  Filter,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react'

interface Professor {
  name: string
  email: string
  department: string
}

interface Course {
  _id: string
  courseCode: string
  title: string
  description: string
  credits: number
  professor: Professor
  department: string
  level: 'undergraduate' | 'graduate'
  prerequisites: string[]
  semester: 'Fall' | 'Spring' | 'Summer'
  year: number
  maxStudents: number
  currentEnrollments: number
  syllabus?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  
  // New/Edit Course Dialog
  const [showDialog, setShowDialog] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [processing, setProcessing] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  
  // Course Form Data
  const [formData, setFormData] = useState({
    courseCode: '',
    title: '',
    description: '',
    credits: 3,
    professor: {
      name: '',
      email: '',
      department: ''
    },
    department: '',
    level: 'undergraduate' as 'undergraduate' | 'graduate',
    prerequisites: [] as string[],
    semester: 'Fall' as 'Fall' | 'Spring' | 'Summer',
    year: new Date().getFullYear(),
    maxStudents: 30,
    syllabus: '',
    isActive: true
  })
  
  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null)
  const [deletionType, setDeletionType] = useState<'soft' | 'hard'>('soft')

  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect if user is not admin
    if (!isLoading && (!isAuthenticated || (user && user.role !== 'ADMIN'))) {
      router.push('/admin')
      return
    }
    
    if (isAuthenticated && user?.role === 'ADMIN') {
      fetchCourses()
    }
  }, [user, isAuthenticated, isLoading, router])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      setError(null)
      
      let url = '/api/admin/university/courses'
      const params = new URLSearchParams()
      
      if (departmentFilter) params.append('department', departmentFilter)
      if (levelFilter) params.append('level', levelFilter)
      if (yearFilter) params.append('year', yearFilter)
      if (activeFilter !== 'all') params.append('isActive', activeFilter === 'active' ? 'true' : 'false')
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.status}`)
      }
      
      const data = await response.json()
      setCourses(data.courses)
      
    } catch (err) {
      console.error('Error fetching courses:', err)
      setError('Failed to load courses. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent as keyof typeof formData],
          [child]: value
        }
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleNumberChange = (name: string, value: string) => {
    const numValue = parseInt(value)
    if (!isNaN(numValue)) {
      setFormData({
        ...formData,
        [name]: numValue
      })
    }
  }

  const resetForm = () => {
    setFormData({
      courseCode: '',
      title: '',
      description: '',
      credits: 3,
      professor: {
        name: '',
        email: '',
        department: ''
      },
      department: '',
      level: 'undergraduate',
      prerequisites: [],
      semester: 'Fall',
      year: new Date().getFullYear(),
      maxStudents: 30,
      syllabus: '',
      isActive: true
    })
  }

  const handleCreateCourse = () => {
    setDialogMode('create')
    resetForm()
    setShowDialog(true)
  }

  const handleEditCourse = (course: Course) => {
    setDialogMode('edit')
    setSelectedCourse(course)
    
    // Fill form with course data
    setFormData({
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
      syllabus: course.syllabus || '',
      isActive: course.isActive
    })
    
    setShowDialog(true)
  }

  const handleDeleteCourse = (courseId: string, type: 'soft' | 'hard') => {
    setCourseToDelete(courseId)
    setDeletionType(type)
    setShowDeleteConfirm(true)
  }

  const performDelete = async () => {
    if (!courseToDelete) return
    
    try {
      setProcessing(true)
      
      const url = `/api/admin/university/courses?courseId=${courseToDelete}${deletionType === 'hard' ? '&hard=true' : ''}`
      const response = await fetch(url, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete course')
      }
      
      setSuccess(`Course ${deletionType === 'hard' ? 'permanently deleted' : 'deactivated'} successfully`)
      fetchCourses()
      
    } catch (err: any) {
      console.error('Error deleting course:', err)
      setError(err.message || 'Failed to delete course')
    } finally {
      setProcessing(false)
      setShowDeleteConfirm(false)
      setCourseToDelete(null)
    }
  }

  const submitCourseForm = async () => {
    try {
      setProcessing(true)
      setError(null)
      
      // Validate form
      if (!formData.courseCode || !formData.title || !formData.description || 
          !formData.professor.name || !formData.professor.email || !formData.department) {
        setError('Please fill in all required fields')
        setProcessing(false)
        return
      }
      
      const method = dialogMode === 'create' ? 'POST' : 'PUT'
      const url = dialogMode === 'create' 
        ? '/api/admin/university/courses' 
        : `/api/admin/university/courses?courseId=${selectedCourse?._id}`
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${dialogMode} course`)
      }
      
      setSuccess(`Course ${dialogMode === 'create' ? 'created' : 'updated'} successfully`)
      fetchCourses()
      setShowDialog(false)
      
    } catch (err: any) {
      console.error(`Error ${dialogMode}ing course:`, err)
      setError(err.message || `Failed to ${dialogMode} course`)
    } finally {
      setProcessing(false)
    }
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = !searchTerm || 
      course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.professor.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  // Get unique departments for filter
  const departments = Array.from(new Set(courses.map(course => course.department)))
  
  // Get unique years for filter
  const years = Array.from(new Set(courses.map(course => course.year.toString())))

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
      
      <div className="relative z-10 container mx-auto pt-24 pb-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Button
                variant="ghost"
                onClick={() => router.push('/admin')}
                className="mb-4 text-white/60 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin Panel
              </Button>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Course Management
              </h1>
              <p className="text-white/60 mt-2">Create, edit, and manage university courses</p>
            </div>
            <Button 
              onClick={handleCreateCourse}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              New Course
            </Button>
          </div>
        </div>
        
        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-md text-red-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setError(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-md text-green-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <p>{success}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSuccess(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {/* Filters */}
        <Card className="bg-white/5 border-white/10 mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                  <Input
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10"
                  />
                </div>
              </div>
              
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="bg-white/5 border-white/10">
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
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Levels</SelectItem>
                  <SelectItem value="undergraduate">Undergraduate</SelectItem>
                  <SelectItem value="graduate">Graduate</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Years</SelectItem>
                  {years.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="md:col-span-2">
                <div className="flex items-center space-x-2">
                  <Button
                    variant={activeFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveFilter('all')}
                    className={activeFilter === 'all' ? 'bg-blue-600 hover:bg-blue-700' : 'border-white/10'}
                  >
                    All Courses
                  </Button>
                  <Button
                    variant={activeFilter === 'active' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveFilter('active')}
                    className={activeFilter === 'active' ? 'bg-green-600 hover:bg-green-700' : 'border-white/10'}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Active Only
                  </Button>
                  <Button
                    variant={activeFilter === 'inactive' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveFilter('inactive')}
                    className={activeFilter === 'inactive' ? 'bg-red-600 hover:bg-red-700' : 'border-white/10'}
                  >
                    <EyeOff className="h-4 w-4 mr-1" />
                    Inactive Only
                  </Button>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <Button variant="outline" onClick={fetchCourses} className="gap-2 border-white/10 hover:bg-white/10">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Courses Table */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle>Courses ({filteredCourses.length})</CardTitle>
            <CardDescription>Manage your university course catalog</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-white/60">Loading courses...</p>
                </div>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/60 mb-4">No courses found matching your criteria</p>
                <Button onClick={handleCreateCourse} className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4" />
                  Create First Course
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4">Code</th>
                      <th className="text-left py-3 px-4">Title</th>
                      <th className="text-left py-3 px-4">Department</th>
                      <th className="text-left py-3 px-4">Level</th>
                      <th className="text-left py-3 px-4">Credits</th>
                      <th className="text-left py-3 px-4">Enrollment</th>
                      <th className="text-center py-3 px-4">Status</th>
                      <th className="text-right py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourses.map((course) => (
                      <tr key={course._id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4">{course.courseCode}</td>
                        <td className="py-3 px-4">{course.title}</td>
                        <td className="py-3 px-4">{course.department}</td>
                        <td className="py-3 px-4 capitalize">{course.level}</td>
                        <td className="py-3 px-4">{course.credits}</td>
                        <td className="py-3 px-4">
                          {course.currentEnrollments}/{course.maxStudents}
                          <div className="w-full bg-white/10 rounded-full h-1.5 mt-1">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full" 
                              style={{ 
                                width: `${Math.min(100, Math.round((course.currentEnrollments / course.maxStudents) * 100))}%` 
                              }}
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={course.isActive ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}>
                            {course.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditCourse(course)}
                              className="h-8 border-white/10 hover:bg-white/10"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteCourse(course._id, 'soft')}
                              className="h-8 border-white/10 hover:bg-white/10"
                            >
                              <Eye className="h-4 w-4" />
                              <EyeOff className="h-4 w-4 ml-1" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteCourse(course._id, 'hard')}
                              className="h-8 text-red-400 border-red-400/20 hover:bg-red-400/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Create/Edit Course Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="bg-gray-900 border-white/10 text-white max-w-3xl">
            <DialogHeader>
              <DialogTitle>{dialogMode === 'create' ? 'Create New Course' : 'Edit Course'}</DialogTitle>
              <DialogDescription>
                {dialogMode === 'create'
                  ? 'Add a new course to the university catalog.'
                  : 'Update the details of this course.'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div>
                <Label htmlFor="courseCode">Course Code *</Label>
                <Input
                  id="courseCode"
                  name="courseCode"
                  value={formData.courseCode}
                  onChange={handleInputChange}
                  placeholder="e.g., CS101"
                  className="bg-white/5 border-white/10"
                />
              </div>
              
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Introduction to Computer Science"
                  className="bg-white/5 border-white/10"
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Course description..."
                  className="bg-white/5 border-white/10 min-h-[100px]"
                />
              </div>
              
              <div>
                <Label htmlFor="credits">Credits *</Label>
                <Input
                  id="credits"
                  name="credits"
                  type="number"
                  value={formData.credits}
                  onChange={(e) => handleNumberChange('credits', e.target.value)}
                  min={1}
                  max={6}
                  className="bg-white/5 border-white/10"
                />
              </div>
              
              <div>
                <Label htmlFor="department">Department *</Label>
                <Input
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  placeholder="Computer Science"
                  className="bg-white/5 border-white/10"
                />
              </div>
              
              <div>
                <Label htmlFor="professor.name">Professor Name *</Label>
                <Input
                  id="professor.name"
                  name="professor.name"
                  value={formData.professor.name}
                  onChange={handleInputChange}
                  placeholder="Dr. John Doe"
                  className="bg-white/5 border-white/10"
                />
              </div>
              
              <div>
                <Label htmlFor="professor.email">Professor Email *</Label>
                <Input
                  id="professor.email"
                  name="professor.email"
                  value={formData.professor.email}
                  onChange={handleInputChange}
                  placeholder="professor@example.edu"
                  className="bg-white/5 border-white/10"
                />
              </div>
              
              <div>
                <Label htmlFor="professor.department">Professor Department *</Label>
                <Input
                  id="professor.department"
                  name="professor.department"
                  value={formData.professor.department}
                  onChange={handleInputChange}
                  placeholder="Computer Science"
                  className="bg-white/5 border-white/10"
                />
              </div>
              
              <div>
                <Label>Level *</Label>
                <Select value={formData.level} onValueChange={(value) => handleSelectChange('level', value as 'undergraduate' | 'graduate')}>
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="undergraduate">Undergraduate</SelectItem>
                    <SelectItem value="graduate">Graduate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Semester *</Label>
                <Select value={formData.semester} onValueChange={(value) => handleSelectChange('semester', value as 'Fall' | 'Spring' | 'Summer')}>
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fall">Fall</SelectItem>
                    <SelectItem value="Spring">Spring</SelectItem>
                    <SelectItem value="Summer">Summer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleNumberChange('year', e.target.value)}
                  min={new Date().getFullYear()}
                  max={new Date().getFullYear() + 5}
                  className="bg-white/5 border-white/10"
                />
              </div>
              
              <div>
                <Label htmlFor="maxStudents">Maximum Enrollment *</Label>
                <Input
                  id="maxStudents"
                  name="maxStudents"
                  type="number"
                  value={formData.maxStudents}
                  onChange={(e) => handleNumberChange('maxStudents', e.target.value)}
                  min={1}
                  className="bg-white/5 border-white/10"
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="syllabus">Syllabus URL (Optional)</Label>
                <Input
                  id="syllabus"
                  name="syllabus"
                  value={formData.syllabus}
                  onChange={handleInputChange}
                  placeholder="https://example.edu/syllabus.pdf"
                  className="bg-white/5 border-white/10"
                />
              </div>
              
              <div className="md:col-span-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-white/20 bg-white/5 text-blue-600 focus:ring-blue-600"
                  />
                  <Label htmlFor="isActive">Course is active and available for enrollment</Label>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDialog(false)}
                disabled={processing}
                className="border-white/10 hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={submitCourseForm}
                disabled={processing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {dialogMode === 'create' ? 'Creating...' : 'Updating...'}
                  </>
                ) : (
                  dialogMode === 'create' ? 'Create Course' : 'Update Course'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="bg-gray-900 border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>{deletionType === 'hard' ? 'Permanently Delete Course?' : 'Deactivate Course?'}</DialogTitle>
              <DialogDescription>
                {deletionType === 'hard' 
                  ? 'This action cannot be undone. This will permanently delete the course from the database.'
                  : 'This will mark the course as inactive. It will no longer appear in course listings for students, but data will be preserved.'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <p className="text-white/60">
                {deletionType === 'hard'
                  ? 'Please type DELETE to confirm:'
                  : 'Are you sure you want to deactivate this course?'}
              </p>
              
              {deletionType === 'hard' && (
                <Input
                  className="mt-2 bg-white/5 border-white/10"
                  placeholder="Type DELETE to confirm"
                  onChange={(e) => {
                    const confirmBtn = document.getElementById('confirm-delete-btn') as HTMLButtonElement
                    if (confirmBtn) {
                      confirmBtn.disabled = e.target.value !== 'DELETE'
                    }
                  }}
                />
              )}
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setCourseToDelete(null)
                }}
                disabled={processing}
                className="border-white/10 hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                id="confirm-delete-btn"
                variant="destructive"
                onClick={performDelete}
                disabled={processing || (deletionType === 'hard')}
                className="bg-red-600 hover:bg-red-700"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  deletionType === 'hard' ? 'Permanently Delete' : 'Deactivate Course'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 