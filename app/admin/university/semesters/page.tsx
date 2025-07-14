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
import { format, isAfter, isBefore, parseISO } from 'date-fns'
import { toast } from 'sonner'
import {
  Loader2,
  Calendar,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertCircle,
  Check,
  X,
  Filter,
  ArrowLeft,
  ChevronLeft
} from 'lucide-react'
import BackgroundNodes from '@/components/BackgroundNodes'

interface Semester {
  _id: string
  year: number
  term: 'Fall' | 'Spring' | 'Summer'
  startDate: string
  endDate: string
  registrationDeadline: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function AdminSemestersPage() {
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [yearFilter, setYearFilter] = useState('')
  const [termFilter, setTermFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  
  // New/Edit Semester Dialog
  const [showDialog, setShowDialog] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [processing, setProcessing] = useState(false)
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null)
  
  // Semester Form Data
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    term: 'Fall' as 'Fall' | 'Spring' | 'Summer',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    isActive: true
  })
  
  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [semesterToDelete, setSemesterToDelete] = useState<string | null>(null)

  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect if user is not admin
    if (!isLoading && (!isAuthenticated || (user && user.role !== 'ADMIN'))) {
      router.push('/admin')
      return
    }
    
    if (isAuthenticated && user?.role === 'ADMIN') {
      fetchSemesters()
    }
  }, [user, isAuthenticated, isLoading, router])

  const fetchSemesters = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/university/semesters')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch semesters')
      }
      
      setSemesters(data.semesters || [])
    } catch (error) {
      console.error('Error fetching semesters:', error)
      setError('Failed to load semesters. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const resetForm = () => {
    setFormData({
      year: new Date().getFullYear(),
      term: 'Fall',
      startDate: '',
      endDate: '',
      registrationDeadline: '',
      isActive: true
    })
  }

  const openCreateDialog = () => {
    resetForm()
    setDialogMode('create')
    setShowDialog(true)
  }

  const openEditDialog = (semester: Semester) => {
    setSelectedSemester(semester)
    setFormData({
      year: semester.year,
      term: semester.term,
      startDate: semester.startDate.split('T')[0],
      endDate: semester.endDate.split('T')[0],
      registrationDeadline: semester.registrationDeadline.split('T')[0],
      isActive: semester.isActive
    })
    setDialogMode('edit')
    setShowDialog(true)
  }

  const openDeleteDialog = (semesterId: string, isActive: boolean) => {
    setSemesterToDelete(semesterId)
    setShowDeleteConfirm(true)
  }

  const handleCreateSemester = async () => {
    try {
      setProcessing(true)
      
      // Validate form data
      if (!formData.year || !formData.term || !formData.startDate || !formData.endDate || !formData.registrationDeadline) {
        toast.error('Please fill in all required fields')
        return
      }
      
      // Validate dates
      const startDate = new Date(formData.startDate)
      const endDate = new Date(formData.endDate)
      const registrationDeadline = new Date(formData.registrationDeadline)
      
      if (isAfter(startDate, endDate)) {
        toast.error('Start date must be before end date')
        return
      }
      
      if (isAfter(registrationDeadline, startDate)) {
        toast.error('Registration deadline must be before start date')
        return
      }
      
      const response = await fetch('/api/admin/university/semesters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create semester')
      }
      
      toast.success('Semester created successfully')
      setShowDialog(false)
      fetchSemesters()
    } catch (error) {
      console.error('Error creating semester:', error)
      toast.error('Failed to create semester. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handleUpdateSemester = async () => {
    if (!selectedSemester) return
    
    try {
      setProcessing(true)
      
      // Validate form data
      if (!formData.year || !formData.term || !formData.startDate || !formData.endDate || !formData.registrationDeadline) {
        toast.error('Please fill in all required fields')
        return
      }
      
      // Validate dates
      const startDate = new Date(formData.startDate)
      const endDate = new Date(formData.endDate)
      const registrationDeadline = new Date(formData.registrationDeadline)
      
      if (isAfter(startDate, endDate)) {
        toast.error('Start date must be before end date')
        return
      }
      
      if (isAfter(registrationDeadline, startDate)) {
        toast.error('Registration deadline must be before start date')
        return
      }
      
      const response = await fetch(`/api/admin/university/semesters?id=${selectedSemester._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update semester')
      }
      
      toast.success('Semester updated successfully')
      setShowDialog(false)
      fetchSemesters()
    } catch (error) {
      console.error('Error updating semester:', error)
      toast.error('Failed to update semester. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handleDeleteSemester = async () => {
    if (!semesterToDelete) return
    
    try {
      setProcessing(true)
      
      const response = await fetch(`/api/admin/university/semesters?id=${semesterToDelete}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete semester')
      }
      
      toast.success('Semester deleted successfully')
      setShowDeleteConfirm(false)
      setSemesterToDelete(null)
      fetchSemesters()
    } catch (error) {
      console.error('Error deleting semester:', error)
      toast.error('Failed to delete semester. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const filteredSemesters = semesters.filter(semester => {
    // Apply year filter
    if (yearFilter && semester.year.toString() !== yearFilter) {
      return false
    }
    
    // Apply term filter
    if (termFilter && semester.term !== termFilter) {
      return false
    }
    
    // Apply active filter
    if (activeFilter === 'active' && !semester.isActive) {
      return false
    }
    
    if (activeFilter === 'inactive' && semester.isActive) {
      return false
    }
    
    return true
  })

  // Get unique years for filter
  const years = Array.from(new Set(semesters.map(s => s.year))).sort((a, b) => b - a)

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        <BackgroundNodes isMobile={false} />
        <div className="relative z-10 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-lg">Loading semesters...</p>
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
                  Semester Management
                </h1>
                <p className="text-white/60 mt-1">Create and manage academic semesters</p>
              </div>
            </div>
            <Button 
              onClick={openCreateDialog}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              New Semester
            </Button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-md p-4 mb-6 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-md p-4 mb-6 flex items-center">
            <Check className="h-5 w-5 text-green-400 mr-2" />
            <p>{success}</p>
          </div>
        )}
        
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-semibold flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-green-400" />
                Academic Semesters
              </h2>
              <p className="text-gray-400">
                {filteredSemesters.length} {filteredSemesters.length === 1 ? 'semester' : 'semesters'} found
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={openCreateDialog} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                New Semester
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="yearFilter" className="text-sm text-gray-400">Filter by Year</Label>
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
              <Label htmlFor="termFilter" className="text-sm text-gray-400">Filter by Term</Label>
              <Select value={termFilter} onValueChange={setTermFilter}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="All Terms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Terms</SelectItem>
                  <SelectItem value="Fall">Fall</SelectItem>
                  <SelectItem value="Spring">Spring</SelectItem>
                  <SelectItem value="Summer">Summer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Label htmlFor="activeFilter" className="text-sm text-gray-400">Filter by Status</Label>
              <Select value={activeFilter} onValueChange={setActiveFilter}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {filteredSemesters.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-md">
              <Calendar className="h-12 w-12 mx-auto text-gray-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">No semesters found</h3>
              <p className="text-gray-400 mb-4">
                {semesters.length > 0 
                  ? 'Try adjusting your filters to see more results'
                  : 'Get started by creating your first academic semester'}
              </p>
              {semesters.length === 0 && (
                <Button onClick={openCreateDialog} className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Semester
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-left">
                    <th className="py-3 px-4 text-gray-400 font-medium">Term</th>
                    <th className="py-3 px-4 text-gray-400 font-medium">Year</th>
                    <th className="py-3 px-4 text-gray-400 font-medium">Start Date</th>
                    <th className="py-3 px-4 text-gray-400 font-medium">End Date</th>
                    <th className="py-3 px-4 text-gray-400 font-medium">Registration Deadline</th>
                    <th className="py-3 px-4 text-gray-400 font-medium">Status</th>
                    <th className="py-3 px-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSemesters.map((semester) => (
                    <tr key={semester._id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-4 px-4">{semester.term}</td>
                      <td className="py-4 px-4">{semester.year}</td>
                      <td className="py-4 px-4">{format(new Date(semester.startDate), 'MMM d, yyyy')}</td>
                      <td className="py-4 px-4">{format(new Date(semester.endDate), 'MMM d, yyyy')}</td>
                      <td className="py-4 px-4">{format(new Date(semester.registrationDeadline), 'MMM d, yyyy')}</td>
                      <td className="py-4 px-4">
                        {semester.isActive ? (
                          <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30">
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-500/20 text-gray-400 hover:bg-gray-500/30">
                            Inactive
                          </Badge>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => openEditDialog(semester)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={() => openDeleteDialog(semester._id, semester.isActive)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Create/Edit Semester Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-gray-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'create' ? 'Create New Semester' : 'Edit Semester'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {dialogMode === 'create' 
                ? 'Add a new academic semester to the system'
                : 'Update the details of this academic semester'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="year" className="text-sm text-gray-400">Year</Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  min={2020}
                  max={2050}
                  value={formData.year}
                  onChange={handleInputChange}
                  className="bg-white/5 border-white/10"
                />
              </div>
              
              <div>
                <Label htmlFor="term" className="text-sm text-gray-400">Term</Label>
                <Select 
                  value={formData.term} 
                  onValueChange={(value) => handleSelectChange('term', value as 'Fall' | 'Spring' | 'Summer')}
                >
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fall">Fall</SelectItem>
                    <SelectItem value="Spring">Spring</SelectItem>
                    <SelectItem value="Summer">Summer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="startDate" className="text-sm text-gray-400">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
                className="bg-white/5 border-white/10"
              />
            </div>
            
            <div>
              <Label htmlFor="endDate" className="text-sm text-gray-400">End Date</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleInputChange}
                className="bg-white/5 border-white/10"
              />
            </div>
            
            <div>
              <Label htmlFor="registrationDeadline" className="text-sm text-gray-400">Registration Deadline</Label>
              <Input
                id="registrationDeadline"
                name="registrationDeadline"
                type="date"
                value={formData.registrationDeadline}
                onChange={handleInputChange}
                className="bg-white/5 border-white/10"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-gray-500"
              />
              <Label htmlFor="isActive" className="text-sm text-gray-400">Active Semester</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDialog(false)}
              className="border-white/10 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button 
              onClick={dialogMode === 'create' ? handleCreateSemester : handleUpdateSemester}
              className={dialogMode === 'create' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
              disabled={processing}
            >
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {dialogMode === 'create' ? 'Create Semester' : 'Update Semester'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="bg-gray-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Delete Semester</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this semester? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-red-400">
              <AlertCircle className="h-5 w-5 inline-block mr-2" />
              Warning: Deleting a semester will remove all associated data including enrollments.
            </p>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteConfirm(false)}
              className="border-white/10 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteSemester}
              className="bg-red-600 hover:bg-red-700"
              disabled={processing}
            >
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Semester
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 