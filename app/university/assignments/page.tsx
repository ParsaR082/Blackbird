
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
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import {
  Loader2,
  Search,
  Filter,
  BookOpen,
  Clock,
  Calendar,
  FileText,
  Upload,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronRight
} from 'lucide-react'
import BackgroundNodes from '@/components/BackgroundNodes'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'

interface Assignment {
  _id: string
  courseId: string
  courseName: string
  courseCode: string
  title: string
  description: string
  type: 'homework' | 'quiz' | 'exam' | 'project' | 'reading'
  dueDate: string
  points: number
  isRequired: boolean
  attachments: {
    name: string
    url: string
    type: string
  }[]
  status: 'pending' | 'in-progress' | 'submitted' | 'graded' | 'overdue'
  submissionDate?: string
  grade?: number
  feedback?: string
  timeSpent: number
  isCompleted: boolean
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [courseFilter, setCourseFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [activeTab, setActiveTab] = useState('upcoming')
  
  // Assignment details dialog
  const [showAssignmentDetails, setShowAssignmentDetails] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [submissionFiles, setSubmissionFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [timeSpent, setTimeSpent] = useState(0)

  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
      return
    }
    
    if (isAuthenticated) {
      fetchAssignments()
    }
  }, [isAuthenticated, isLoading, router])

  const fetchAssignments = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/university/assignments')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch assignments')
      }
      
      setAssignments(data.assignments || [])
    } catch (error) {
      console.error('Error fetching assignments:', error)
      setError('Failed to load assignments. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleViewAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setSubmissionFiles([])
    setTimeSpent(assignment.timeSpent || 0)
    setShowAssignmentDetails(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files)
      setSubmissionFiles(fileArray)
    }
  }

  const handleTimeSpentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimeSpent(parseInt(e.target.value) || 0)
  }

  const handleSubmitAssignment = async () => {
    if (!selectedAssignment) return
    
    try {
      setSubmitting(true)
      
      // Create form data for file upload
      const formData = new FormData()
      formData.append('assignmentId', selectedAssignment._id)
      formData.append('timeSpent', timeSpent.toString())
      
      submissionFiles.forEach(file => {
        formData.append('files', file)
      })
      
      const response = await fetch('/api/university/submissions', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit assignment')
      }
      
      toast.success('Assignment submitted successfully')
      setShowAssignmentDetails(false)
      
      // Refresh assignments list
      fetchAssignments()
    } catch (error) {
      console.error('Error submitting assignment:', error)
      toast.error('Failed to submit assignment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Get unique courses for filter
  const courses = Array.from(new Set(assignments.map(assignment => assignment.courseId)))
    .map(courseId => {
      const assignment = assignments.find(a => a.courseId === courseId)
      return {
        id: courseId,
        name: assignment?.courseName || 'Unknown Course',
        code: assignment?.courseCode || 'N/A'
      }
    })

  // Filter assignments based on search and filters
  const filteredAssignments = assignments.filter(assignment => {
    // Apply search filter
    if (searchTerm && !assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !assignment.courseName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    
    // Apply course filter
    if (courseFilter && assignment.courseId !== courseFilter) {
      return false
    }
    
    // Apply status filter
    if (statusFilter && assignment.status !== statusFilter) {
      return false
    }
    
    // Apply type filter
    if (typeFilter && assignment.type !== typeFilter) {
      return false
    }
    
    // Apply tab filter
    if (activeTab === 'upcoming') {
      return ['pending', 'in-progress'].includes(assignment.status)
    } else if (activeTab === 'submitted') {
      return ['submitted', 'graded'].includes(assignment.status)
    } else if (activeTab === 'overdue') {
      return assignment.status === 'overdue'
    }
    
    return true
  })

  // Sort assignments by due date (closest first)
  const sortedAssignments = [...filteredAssignments].sort((a, b) => {
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })

  if (isLoading || loading) {
    return <LoadingState message="Loading assignments..." />
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchAssignments} />
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
      <BackgroundNodes isMobile={false} />
      
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Assignments</h1>
          <p className="text-gray-400">View and submit your course assignments</p>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-semibold flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-blue-400" />
                My Assignments
              </h2>
              <p className="text-gray-400">
                {filteredAssignments.length} {filteredAssignments.length === 1 ? 'assignment' : 'assignments'} found
              </p>
            </div>
            
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search assignments..."
                  className="pl-10 bg-white/5 border-white/10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="bg-white/5">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="submitted">Submitted</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="courseFilter" className="text-sm text-gray-400">Filter by Course</Label>
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="All Courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Label htmlFor="statusFilter" className="text-sm text-gray-400">Filter by Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="graded">Graded</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Label htmlFor="typeFilter" className="text-sm text-gray-400">Filter by Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="homework">Homework</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="reading">Reading</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {sortedAssignments.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-md">
              <BookOpen className="h-12 w-12 mx-auto text-gray-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">No assignments found</h3>
              <p className="text-gray-400 mb-4">
                {assignments.length > 0 
                  ? 'Try adjusting your filters to see more results'
                  : 'You have no assignments yet'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedAssignments.map((assignment) => (
                <Card 
                  key={assignment._id} 
                  className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => handleViewAssignment(assignment)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Badge className={`
                        ${assignment.status === 'graded' ? 'bg-green-500/20 text-green-400' : 
                          assignment.status === 'submitted' ? 'bg-blue-500/20 text-blue-400' : 
                          assignment.status === 'overdue' ? 'bg-red-500/20 text-red-400' :
                          assignment.status === 'in-progress' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-gray-500/20 text-gray-400'}
                      `}>
                        {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                      </Badge>
                      <Badge className="bg-purple-500/20 text-purple-400">
                        {assignment.type.charAt(0).toUpperCase() + assignment.type.slice(1)}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{assignment.title}</CardTitle>
                    <CardDescription className="text-gray-400">
                      {assignment.courseCode} - {assignment.courseName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-gray-400 mb-2">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <FileText className="h-4 w-4 mr-1" />
                      <span>{assignment.points} points</span>
                    </div>
                    
                    {assignment.status === 'graded' && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-400 mb-1">Grade</p>
                        <div className="flex items-center">
                          <span className="text-lg font-medium">{assignment.grade} / {assignment.points}</span>
                          <span className="ml-2 text-sm text-gray-400">
                            ({((assignment.grade! / assignment.points) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="ghost" className="w-full border-t border-white/10 rounded-none flex justify-center items-center">
                      View Details
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Assignment Details Dialog */}
      <Dialog open={showAssignmentDetails} onOpenChange={setShowAssignmentDetails}>
        <DialogContent className="bg-gray-900 border-white/10 text-white max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedAssignment?.title}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedAssignment?.courseCode} - {selectedAssignment?.courseName}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAssignment && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BookOpen className="mr-2 h-5 w-5 text-blue-400" />
                        Assignment Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-400">Description</p>
                        <p className="whitespace-pre-line">{selectedAssignment.description}</p>
                      </div>
                      
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Type</p>
                          <p>{selectedAssignment.type.charAt(0).toUpperCase() + selectedAssignment.type.slice(1)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Points</p>
                          <p>{selectedAssignment.points}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Required</p>
                          <p>{selectedAssignment.isRequired ? 'Yes' : 'No'}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-400">Due Date</p>
                        <p>{new Date(selectedAssignment.dueDate).toLocaleString()}</p>
                      </div>
                      
                      {selectedAssignment.attachments && selectedAssignment.attachments.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-400 mb-2">Attachments</p>
                          <div className="space-y-2">
                            {selectedAssignment.attachments.map((attachment, index) => (
                              <a 
                                key={index}
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center p-2 bg-white/5 rounded-md hover:bg-white/10"
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                <span className="flex-1">{attachment.name}</span>
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                <div className="flex-1">
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Clock className="mr-2 h-5 w-5 text-purple-400" />
                        Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center">
                        <div className="flex-1">
                          <p className="text-sm text-gray-400">Status</p>
                          <Badge className={`
                            ${selectedAssignment.status === 'graded' ? 'bg-green-500/20 text-green-400' : 
                              selectedAssignment.status === 'submitted' ? 'bg-blue-500/20 text-blue-400' : 
                              selectedAssignment.status === 'overdue' ? 'bg-red-500/20 text-red-400' :
                              selectedAssignment.status === 'in-progress' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-gray-500/20 text-gray-400'}
                          `}>
                            {selectedAssignment.status.charAt(0).toUpperCase() + selectedAssignment.status.slice(1)}
                          </Badge>
                        </div>
                        
                        {selectedAssignment.status === 'graded' && (
                          <div className="text-right">
                            <p className="text-sm text-gray-400">Grade</p>
                            <p className="text-lg font-medium">
                              {selectedAssignment.grade} / {selectedAssignment.points}
                              <span className="ml-2 text-sm text-gray-400">
                                ({((selectedAssignment.grade! / selectedAssignment.points) * 100).toFixed(1)}%)
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {selectedAssignment.submissionDate && (
                        <div>
                          <p className="text-sm text-gray-400">Submitted On</p>
                          <p>{new Date(selectedAssignment.submissionDate).toLocaleString()}</p>
                        </div>
                      )}
                      
                      {selectedAssignment.feedback && (
                        <div>
                          <p className="text-sm text-gray-400">Feedback</p>
                          <p className="whitespace-pre-line">{selectedAssignment.feedback}</p>
                        </div>
                      )}
                      
                      {['pending', 'in-progress'].includes(selectedAssignment.status) && (
                        <div>
                          <p className="text-sm text-gray-400 mb-2">Time Remaining</p>
                          <div className="flex items-center">
                            {new Date(selectedAssignment.dueDate) > new Date() ? (
                              <>
                                <Clock className="h-4 w-4 mr-2 text-amber-400" />
                                <span>
                                  {Math.ceil((new Date(selectedAssignment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                                </span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-4 w-4 mr-2 text-red-400" />
                                <span className="text-red-400">Overdue</span>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {['pending', 'in-progress'].includes(selectedAssignment.status) && (
                        <>
                          <div>
                            <Label htmlFor="timeSpent" className="text-sm text-gray-400">Time Spent (minutes)</Label>
                            <Input
                              id="timeSpent"
                              type="number"
                              min="0"
                              value={timeSpent}
                              onChange={handleTimeSpentChange}
                              className="bg-white/5 border-white/10"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="files" className="text-sm text-gray-400">Upload Files</Label>
                            <div className="mt-2">
                              <Input
                                id="files"
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                className="bg-white/5 border-white/10"
                              />
                            </div>
                            {submissionFiles.length > 0 && (
                              <div className="mt-2">
                                <p className="text-sm text-gray-400">Selected Files:</p>
                                <ul className="text-sm">
                                  {submissionFiles.map((file, index) => (
                                    <li key={index}>{file.name}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowAssignmentDetails(false)}
              className="border-white/10 hover:bg-white/10"
            >
              Close
            </Button>
            
            {selectedAssignment && ['pending', 'in-progress'].includes(selectedAssignment.status) && (
              <Button 
                onClick={handleSubmitAssignment}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={submitting}
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Assignment
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 