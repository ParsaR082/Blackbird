'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Loader2, X } from 'lucide-react'

interface Event {
  id: string
  title: string
  description: string
  detailDescription: string
  date: string
  time: string
  duration: number
  location: string
  category: 'workshops' | 'hackathons' | 'conferences' | 'networking'
  maxAttendees: number
  currentAttendees: number
  status: 'upcoming' | 'registration-open' | 'full' | 'completed' | 'cancelled'
  featured: boolean
  prerequisites: string[]
  whatYouWillLearn: string[]
  imageUrl?: string
  createdBy: {
    id: string
    name: string
    username: string
  }
  createdAt: string
  updatedAt: string
}

interface EditEventModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (eventData: any) => Promise<void>
  event: Event | null
}

export default function EditEventModal({ isOpen, onClose, onSubmit, event }: EditEventModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    detailDescription: '',
    dateTime: '',
    duration: 2,
    location: '',
    category: 'workshops' as 'workshops' | 'hackathons' | 'conferences' | 'networking',
    maxAttendees: 50,
    featured: false,
    status: 'upcoming' as 'upcoming' | 'registration-open' | 'full' | 'completed' | 'cancelled',
    prerequisites: [] as string[],
    whatYouWillLearn: [] as string[],
    imageUrl: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newPrerequisite, setNewPrerequisite] = useState('')
  const [newLearning, setNewLearning] = useState('')

  // Initialize form data when event changes
  useEffect(() => {
    if (event) {
      // Combine date and time into dateTime for the datetime-local input
      const dateTime = new Date(`${event.date}T${event.time}`)
      const dateTimeString = dateTime.toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:MM
      
      setFormData({
        title: event.title,
        description: event.description,
        detailDescription: event.detailDescription,
        dateTime: dateTimeString,
        duration: event.duration,
        location: event.location,
        category: event.category,
        maxAttendees: event.maxAttendees,
        featured: event.featured,
        status: event.status,
        prerequisites: event.prerequisites,
        whatYouWillLearn: event.whatYouWillLearn,
        imageUrl: event.imageUrl || ''
      })
      setErrors({})
    }
  }, [event])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!formData.dateTime) {
      newErrors.dateTime = 'Date and time is required'
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required'
    }

    if (formData.maxAttendees < 1) {
      newErrors.maxAttendees = 'Maximum attendees must be at least 1'
    }

    if (formData.duration < 0.5) {
      newErrors.duration = 'Duration must be at least 0.5 hours'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      await onSubmit({
        id: event?.id,
        ...formData
      })
      onClose()
    } catch (error) {
      console.error('Error updating event:', error)
    } finally {
      setLoading(false)
    }
  }

  const addPrerequisite = () => {
    if (newPrerequisite.trim() && !formData.prerequisites.includes(newPrerequisite.trim())) {
      setFormData(prev => ({
        ...prev,
        prerequisites: [...prev.prerequisites, newPrerequisite.trim()]
      }))
      setNewPrerequisite('')
    }
  }

  const removePrerequisite = (index: number) => {
    setFormData(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.filter((_, i) => i !== index)
    }))
  }

  const addLearning = () => {
    if (newLearning.trim() && !formData.whatYouWillLearn.includes(newLearning.trim())) {
      setFormData(prev => ({
        ...prev,
        whatYouWillLearn: [...prev.whatYouWillLearn, newLearning.trim()]
      }))
      setNewLearning('')
    }
  }

  const removeLearning = (index: number) => {
    setFormData(prev => ({
      ...prev,
      whatYouWillLearn: prev.whatYouWillLearn.filter((_, i) => i !== index)
    }))
  }

  if (!event) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-white/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Edit Event
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Update the event details below
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            
            <div>
              <Label htmlFor="title" className="text-gray-700">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={errors.title ? 'border-red-500' : ''}
                placeholder="Enter event title"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <Label htmlFor="description" className="text-gray-700">Short Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className={errors.description ? 'border-red-500' : ''}
                placeholder="Brief description of the event"
                rows={3}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div>
              <Label htmlFor="detailDescription" className="text-gray-700">Detailed Description</Label>
              <Textarea
                id="detailDescription"
                value={formData.detailDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, detailDescription: e.target.value }))}
                placeholder="Detailed description of the event"
                rows={4}
              />
            </div>
          </div>

          {/* Date, Time & Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Schedule & Location</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateTime" className="text-gray-700">Date & Time *</Label>
                <Input
                  id="dateTime"
                  type="datetime-local"
                  value={formData.dateTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateTime: e.target.value }))}
                  className={errors.dateTime ? 'border-red-500' : ''}
                />
                {errors.dateTime && <p className="text-red-500 text-sm mt-1">{errors.dateTime}</p>}
              </div>

              <div>
                <Label htmlFor="duration" className="text-gray-700">Duration (hours) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseFloat(e.target.value) }))}
                  className={errors.duration ? 'border-red-500' : ''}
                />
                {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="location" className="text-gray-700">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className={errors.location ? 'border-red-500' : ''}
                placeholder="Event location"
              />
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
            </div>
          </div>

          {/* Category & Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Category & Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category" className="text-gray-700">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="workshops">Workshops</SelectItem>
                    <SelectItem value="hackathons">Hackathons</SelectItem>
                    <SelectItem value="conferences">Conferences</SelectItem>
                    <SelectItem value="networking">Networking</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status" className="text-gray-700">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="registration-open">Registration Open</SelectItem>
                    <SelectItem value="full">Full</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxAttendees" className="text-gray-700">Maximum Attendees *</Label>
                <Input
                  id="maxAttendees"
                  type="number"
                  min="1"
                  value={formData.maxAttendees}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxAttendees: parseInt(e.target.value) }))}
                  className={errors.maxAttendees ? 'border-red-500' : ''}
                />
                {errors.maxAttendees && <p className="text-red-500 text-sm mt-1">{errors.maxAttendees}</p>}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, featured: checked }))}
                />
                <Label htmlFor="featured" className="text-gray-700">Featured Event</Label>
              </div>
            </div>
          </div>

          {/* Prerequisites */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Prerequisites</h3>
            
            <div className="flex gap-2">
              <Input
                value={newPrerequisite}
                onChange={(e) => setNewPrerequisite(e.target.value)}
                placeholder="Add a prerequisite"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrerequisite())}
              />
              <Button type="button" onClick={addPrerequisite} variant="outline">
                Add
              </Button>
            </div>

            {formData.prerequisites.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.prerequisites.map((prerequisite, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {prerequisite}
                    <button
                      type="button"
                      onClick={() => removePrerequisite(index)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* What You Will Learn */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">What You Will Learn</h3>
            
            <div className="flex gap-2">
              <Input
                value={newLearning}
                onChange={(e) => setNewLearning(e.target.value)}
                placeholder="Add a learning outcome"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLearning())}
              />
              <Button type="button" onClick={addLearning} variant="outline">
                Add
              </Button>
            </div>

            {formData.whatYouWillLearn.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.whatYouWillLearn.map((learning, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {learning}
                    <button
                      type="button"
                      onClick={() => removeLearning(index)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Image URL */}
          <div>
            <Label htmlFor="imageUrl" className="text-gray-700">Image URL (optional)</Label>
            <Input
              id="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Event'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 