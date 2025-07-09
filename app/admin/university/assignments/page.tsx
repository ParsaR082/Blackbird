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
import { Checkbox } from '@/components/ui/checkbox'
import { format } from 'date-fns'
import { 
  Loader2, 
  Search, 
  Plus, 
  ArrowLeft,
  Filter,
  Edit,
  Trash2,
  RefreshCw,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  FileText,
  Link
} from 'lucide-react'

interface Attachment {
  name: string
  url: string
  type: string
}

interface Course {
  _id: string
  courseCode: string
  title: string
}

interface Assignment {
  _id: string
  courseId: string | Course
  title: string
  description: string
  type: 'homework' | 'quiz' | 'exam' | 'project' | 'reading'
  dueDate: string
  points: number
  isRequired: boolean
  attachments: Attachment[]
  createdAt: string
  updatedAt: string
}

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [courseFilter, setCourseFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  
  // New/Edit Assignment Dialog
  const [showDialog, setShowDialog] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [processing, setProcessing] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  
  // Assignment Form Data
  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    description: '',
    type: 'homework' as 'homework' | 'quiz' | 'exam' | 'project' | 'reading',
    dueDate: '',
    points: 10,
    isRequired: true,
    attachments: [] as Attachment[]
  })
  
  // Attachment form
  const [showAttachmentForm, setShowAttachmentForm] = useState(false)
  const [attachmentForm, setAttachmentForm] = useState({
    name: '',
    url: '',
    type: 'document'
  })
  
  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [assignmentToDelete, setAssignmentToDelete] = useState<string | null>(null)

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
      fetchAssignments()
    }
  }, [user, isAuthenticated, isLoading, router])

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/admin/university/courses')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.status}`)
      }
      
      const data = await response.json()
      if (data.success && data.courses) {
        setCourses(data.courses)
      }
    } catch (err) {
      console.error('Error fetching courses:', err)
    }
  }

  const fetchAssignments = async () => {
    try {
      setLoading(true)
      setError(null)
      
      let url = '/api/admin/university/assignments'
      const params = new URLSearchParams()
      
      if (courseFilter) params.append('courseId', courseFilter)
      if (typeFilter) params.append('type', typeFilter)
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch assignments: ${response.status}`)
      }
      
      const data = await response.json()
      setAssignments(data.assignments)
      
    } catch (err) {
      console.error('Error fetching assignments:', err)
      setError('Failed to load assignments. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
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

  const handleAttachmentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setAttachmentForm({
      ...attachmentForm,
      [name]: value
    })
  }

  const addAttachment = () => {
    const { name, url, type } = attachmentForm
    
    if (!name || !url) {
      setError('Attachment name and URL are required')
      return
    }
    
    setFormData({
      ...formData,
      attachments: [
        ...formData.attachments,
        { name, url, type }
      ]
    })
    
    // Reset attachment form
    setAttachmentForm({
      name: '',
      url: '',
      type: 'document'
    })
    
    setShowAttachmentForm(false)
  }

  const removeAttachment = (index: number) => {
    setFormData({
      ...formData,
      attachments: formData.attachments.filter((_, i) => i !== index)
    })
  }

  const resetForm = () => {
    setFormData({
      courseId: '',
      title: '',
      description: '',
      type: 'homework',
      dueDate: '',
      points: 10,
      isRequired: true,
      attachments: []
    })
  }

  const handleCreateAssignment = () => {
    setDialogMode('create')
    resetForm()
    setShowDialog(true)
  }

  const handleEditAssignment = (assignment: Assignment) => {
    setDialogMode('edit')
    setSelectedAssignment(assignment)
    
    const dueDateFormatted = new Date(assignment.dueDate).toISOString().split('T')[0]
    
    // Fill form with assignment data
    setFormData({
      courseId: typeof assignment.courseId === 'string' ? assignment.courseId : assignment.courseId._id,
      title: assignment.title,
      description: assignment.description,
      type: assignment.type,
      dueDate: dueDateFormatted,
      points: assignment.points,
      isRequired: assignment.isRequired,
      attachments: assignment.attachments
    })
    
    setShowDialog(true)
  }

  const handleDeleteAssignment = (assignmentId: string) => {
    setAssignmentToDelete(assignmentId)
    setShowDeleteConfirm(true)
  }

  const performDelete = async () => {
    if (!assignmentToDelete) return
    
    try {
      setProcessing(true)
      
      const url = `/api/admin/university/assignments?assignmentId=${assignmentToDelete}`
      const response = await fetch(url, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete assignment')
      }
      
      setSuccess('Assignment deleted successfully')
      fetchAssignments()
      
    } catch (err: any) {
      console.error('Error deleting assignment:', err)
      setError(err.message || 'Failed to delete assignment')
    } finally {
      setProcessing(false)
      setShowDeleteConfirm(false)
      setAssignmentToDelete(null)
    }
  }

  const submitAssignmentForm = async () => {
    try {
      setProcessing(true)
      setError(null)
      
      // Validate form
      if (!formData.courseId || !formData.title || !formData.description || !formData.dueDate) {
        setError('Please fill in all required fields')
        setProcessing(false)
        return
      }
      
      const method = dialogMode === 'create' ? 'POST' : 'PUT'
      const url = dialogMode === 'create' 
        ? '/api/admin/university/assignments' 
        : `/api/admin/university/assignments?assignmentId=${selectedAssignment?._id}`
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${dialogMode} assignment`)
      }
      
      setSuccess(`Assignment ${dialogMode === 'create' ? 'created' : 'updated'} successfully`)
      fetchAssignments()
      setShowDialog(false)
      
    } catch (err: any) {
      console.error(`Error ${dialogMode}ing assignment:`, err)
      setError(err.message || `Failed to ${dialogMode} assignment`)
    } finally {
      setProcessing(false)
    }
  }

  const getCourseById = (courseId: string): Course | undefined => {
    return courses.find(course => course._id === courseId)
  }

  const getCourseDetails = (assignment: Assignment): { code: string; title: string } => {
    if (typeof assignment.courseId === 'string') {
      const course = getCourseById(assignment.courseId)
      return course 
        ? { code: course.courseCode, title: course.title }
        : { code: 'Unknown', title: 'Unknown Course' }
    } else {
      return { 
        code: (assignment.courseId as Course).courseCode, 
        title: (assignment.courseId as Course).title 
      }
    }
  }

  const filteredAssignments = assignments.filter(assignment => {
    if (!searchTerm) return true
    
    const courseDetails = getCourseDetails(assignment)
    
    return (
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      courseDetails.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      courseDetails.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, 'MMM d, yyyy h:mm a')
    } catch (err) {
      return 'Invalid date'
    }
  }

  const getAssignmentTypeColor = (type: string) => {
    switch (type) {
      case 'homework': return 'bg-blue-500/20 text-blue-300'
      case 'quiz': return 'bg-green-500/20 text-green-300'
      case 'exam': return 'bg-red-500/20 text-red-300'
      case 'project': return 'bg-purple-500/20 text-purple-300'
      case 'reading': return 'bg-amber-500/20 text-amber-300'
      default: return 'bg-gray-500/20 text-gray-300'
    }
  }

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
                Assignment Management
              </h1>
              <p className="text-white/60 mt-2">Create, edit, and manage course assignments</p>
            </div>
            <Button 
              onClick={handleCreateAssignment}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              New Assignment
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
                    placeholder="Search assignments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10"
                  />
                </div>
              </div>
              
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Filter by Course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Courses</SelectItem>
                  {courses.map(course => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.courseCode} - {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Assignment Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="homework">Homework</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="reading">Reading</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={fetchAssignments} className="gap-2 border-white/10 hover:bg-white/10">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Assignments Table */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle>Assignments ({filteredAssignments.length})</CardTitle>
            <CardDescription>Manage your course assignments</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-white/60">Loading assignments...</p>
                </div>
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/60 mb-4">No assignments found matching your criteria</p>
                <Button onClick={handleCreateAssignment} className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4" />
                  Create First Assignment
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4">Title</th>
                      <th className="text-left py-3 px-4">Course</th>
                      <th className="text-left py-3 px-4">Type</th>
                      <th className="text-left py-3 px-4">Due Date</th>
                      <th className="text-left py-3 px-4">Points</th>
                      <th className="text-center py-3 px-4">Required</th>
                      <th className="text-right py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssignments.map((assignment) => {
                      const courseDetails = getCourseDetails(assignment)
                      return (
                        <tr key={assignment._id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3 px-4">{assignment.title}</td>
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium">{courseDetails.code}</div>
                              <div className="text-sm text-white/60">{courseDetails.title}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getAssignmentTypeColor(assignment.type)}>
                              {assignment.type.charAt(0).toUpperCase() + assignment.type.slice(1)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center text-white/80">
                              <Calendar className="h-4 w-4 mr-2" />
                              {formatDate(assignment.dueDate)}
                            </div>
                          </td>
                          <td className="py-3 px-4">{assignment.points}</td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex justify-center">
                              {assignment.isRequired ? (
                                <CheckCircle className="h-5 w-5 text-green-400" />
                              ) : (
                                <span className="text-white/60">Optional</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditAssignment(assignment)}
                                className="h-8 border-white/10 hover:bg-white/10"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteAssignment(assignment._id)}
                                className="h-8 text-red-400 border-red-400/20 hover:bg-red-400/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Create/Edit Assignment Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="bg-gray-900 border-white/10 text-white max-w-3xl">
            <DialogHeader>
              <DialogTitle>{dialogMode === 'create' ? 'Create New Assignment' : 'Edit Assignment'}</DialogTitle>
              <DialogDescription>
                {dialogMode === 'create'
                  ? 'Add a new assignment to a course.'
                  : 'Update the details of this assignment.'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="md:col-span-2">
                <Label htmlFor="courseId">Course *</Label>
                <Select 
                  value={formData.courseId} 
                  onValueChange={(value) => handleSelectChange('courseId', value)}
                  disabled={dialogMode === 'edit'}
                >
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course._id} value={course._id}>
                        {course.courseCode} - {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="title">Assignment Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Midterm Exam"
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
                  placeholder="Assignment description..."
                  className="bg-white/5 border-white/10 min-h-[100px]"
                />
              </div>
              
              <div>
                <Label>Assignment Type *</Label>
                <Select value={formData.type} onValueChange={(value) => handleSelectChange('type', value as any)}>
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="homework">Homework</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="reading">Reading</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="bg-white/5 border-white/10"
                />
              </div>
              
              <div>
                <Label htmlFor="points">Points *</Label>
                <Input
                  id="points"
                  name="points"
                  type="number"
                  value={formData.points}
                  onChange={(e) => handleNumberChange('points', e.target.value)}
                  min={0}
                  className="bg-white/5 border-white/10"
                />
              </div>
              
              <div>
                <div className="flex items-center space-x-2 h-full">
                  <Checkbox
                    id="isRequired"
                    checked={formData.isRequired}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, isRequired: checked === true })
                    }
                    className="data-[state=checked]:bg-blue-600"
                  />
                  <Label htmlFor="isRequired">Required Assignment</Label>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <Label>Attachments</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAttachmentForm(!showAttachmentForm)}
                    className="border-white/10 hover:bg-white/10"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Attachment
                  </Button>
                </div>
                
                {showAttachmentForm && (
                  <div className="border border-white/10 p-3 rounded-md mb-3 bg-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <div>
                        <Label htmlFor="attachmentName">Name</Label>
                        <Input
                          id="attachmentName"
                          name="name"
                          value={attachmentForm.name}
                          onChange={handleAttachmentInputChange}
                          placeholder="Syllabus"
                          className="bg-white/5 border-white/10"
                        />
                      </div>
                      <div>
                        <Label htmlFor="attachmentUrl">URL</Label>
                        <Input
                          id="attachmentUrl"
                          name="url"
                          value={attachmentForm.url}
                          onChange={handleAttachmentInputChange}
                          placeholder="https://example.com/file.pdf"
                          className="bg-white/5 border-white/10"
                        />
                      </div>
                      <div>
                        <Label htmlFor="attachmentType">Type</Label>
                        <Select 
                          value={attachmentForm.type} 
                          onValueChange={(value) => setAttachmentForm({...attachmentForm, type: value})}
                        >
                          <SelectTrigger className="bg-white/5 border-white/10">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="document">Document</SelectItem>
                            <SelectItem value="image">Image</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="audio">Audio</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAttachmentForm(false)}
                        className="h-8"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={addAttachment}
                        className="h-8 bg-blue-600 hover:bg-blue-700"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                )}
                
                {formData.attachments.length > 0 ? (
                  <div className="border border-white/10 rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-white/5 text-white/60">
                          <th className="text-left p-2">Name</th>
                          <th className="text-left p-2">Type</th>
                          <th className="text-right p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.attachments.map((attachment, index) => (
                          <tr key={index} className="border-t border-white/5">
                            <td className="p-2 flex items-center">
                              <FileText className="h-4 w-4 mr-2" />
                              <span>{attachment.name}</span>
                            </td>
                            <td className="p-2">{attachment.type}</td>
                            <td className="p-2 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => window.open(attachment.url, '_blank')}
                                >
                                  <Link className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-red-400 hover:text-red-300"
                                  onClick={() => removeAttachment(index)}
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
                ) : (
                  <p className="text-white/40 text-sm">No attachments yet</p>
                )}
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
                onClick={submitAssignmentForm}
                disabled={processing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {dialogMode === 'create' ? 'Creating...' : 'Updating...'}
                  </>
                ) : (
                  dialogMode === 'create' ? 'Create Assignment' : 'Update Assignment'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="bg-gray-900 border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>Delete Assignment?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the assignment.
                Student submissions related to this assignment may also be affected.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <p className="text-white/60">
                Are you sure you want to delete this assignment?
              </p>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setAssignmentToDelete(null)
                }}
                disabled={processing}
                className="border-white/10 hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={performDelete}
                disabled={processing}
                className="bg-red-600 hover:bg-red-700"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Assignment'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 