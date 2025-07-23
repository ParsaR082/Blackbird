export const dynamic = 'force-dynamic';
export const revalidate = 0;

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar, 
  ChevronLeft, 
  Clock, 
  Edit, 
  Loader2, 
  MapPin, 
  Plus, 
  Search,
  Trash2, 
  Users, 
  X 
} from 'lucide-react'
import BackgroundNodes from '@/components/BackgroundNodes'
import CreateEventModal from '@/app/events/CreateEventModal'
import EditEventModal from '@/app/events/EditEventModal'

// Define event types based on documentation
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

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [creatingEvent, setCreatingEvent] = useState(false)
  const [updatingEvent, setUpdatingEvent] = useState(false)
  
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Check if we should show the create modal based on URL
  useEffect(() => {
    if (searchParams) {
      const action = searchParams.get('action')
      if (action === 'create') {
        setShowCreateModal(true)
      }
    }
  }, [searchParams])
  
  // Fetch events data
  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/events')
      if (!response.ok) {
        throw new Error('Failed to fetch events')
      }
      
      const data = await response.json()
      setEvents(data.events || [])
      setLoading(false)
    } catch (err) {
      console.error('Error fetching events:', err)
      setError('Failed to load events')
      setLoading(false)
    }
  }
  
  // Initial data fetch
  useEffect(() => {
    // Check if user is logged in but not admin, redirect to dashboard
    if (!isLoading && isAuthenticated && user && user.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
    
    // Only fetch events if the user is authenticated and is an admin
    if (!isLoading && isAuthenticated && user?.role === 'ADMIN') {
      fetchEvents()
    } else if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirectTo=/admin/events')
    }
  }, [user, isAuthenticated, isLoading, router])
  
  // Filter events based on search term and active tab
  const filteredEvents = events.filter(event => {
    // Filter by search term
    const matchesSearch = searchTerm === '' || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Filter by category/tab
    const matchesTab = activeTab === 'all' || 
      event.category === activeTab ||
      event.status === activeTab
    
    return matchesSearch && matchesTab
  })
  
  // Handle create event
  const handleCreateEvent = () => {
    setShowCreateModal(true)
  }

  // Handle event submission
  const handleEventSubmit = async (eventData: any) => {
    try {
      setCreatingEvent(true)
      setError(null)

      console.log('Raw form data received:', eventData)

      // Transform the form data to match API expectations
      const apiData = {
        title: eventData.title,
        description: eventData.description,
        detailDescription: eventData.description, // Use description as detail description for now
        dateTime: eventData.dateTime,
        duration: eventData.duration,
        location: eventData.location,
        category: eventData.category.toLowerCase(), // Convert to lowercase to match API enum
        maxAttendees: eventData.maxAttendees,
        featured: eventData.tags.featured,
        prerequisites: [], // Add these fields later
        whatYouWillLearn: [], // Add these fields later
        imageUrl: undefined // Add image upload later
      }

      console.log('Transformed API data:', apiData)
      console.log('Category before transform:', eventData.category)
      console.log('Category after transform:', apiData.category)

      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(apiData)
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Create event error:', result)
        throw new Error(result.error || 'Failed to create event')
      }

      // Add the new event to the list
      setEvents(prev => [result.event, ...prev])
      setShowCreateModal(false)
      
      // Show success message
      alert('Event created successfully!')
      
    } catch (err: any) {
      console.error('Error creating event:', err)
      setError(err.message || 'Failed to create event')
    } finally {
      setCreatingEvent(false)
    }
  }
  
  // Handle edit event
  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    setShowEditModal(true)
  }

  // Handle event update
  const handleEventUpdate = async (eventData: any) => {
    try {
      setUpdatingEvent(true)
      setError(null)

      console.log('Updating event with data:', eventData)

      const response = await fetch('/api/admin/events', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(eventData)
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Update event error:', result)
        throw new Error(result.error || 'Failed to update event')
      }

      // Update the event in the list
      setEvents(prev => prev.map(e => e.id === eventData.id ? result.event : e))
      setShowEditModal(false)
      setEditingEvent(null)
      
      // Show success message
      alert('Event updated successfully!')
      
    } catch (err: any) {
      console.error('Error updating event:', err)
      setError(err.message || 'Failed to update event')
    } finally {
      setUpdatingEvent(false)
    }
  }
  
  // Handle delete event
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return
    }
    
    try {
      const response = await fetch(`/api/admin/events?id=${eventId}`, { 
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete event')
      }
      
      // Update local state
      setEvents(events.filter(e => e.id !== eventId))
      
      console.log('Event deleted:', eventId)
    } catch (err) {
      console.error('Error deleting event:', err)
      setError('Failed to delete event')
    }
  }
  
  // Get category counts for tabs
  const getCategoryCounts = () => {
    const counts = {
      all: events.length,
      workshops: events.filter(e => e.category === 'workshops').length,
      hackathons: events.filter(e => e.category === 'hackathons').length,
      conferences: events.filter(e => e.category === 'conferences').length,
      networking: events.filter(e => e.category === 'networking').length,
      upcoming: events.filter(e => e.status === 'upcoming').length,
      'registration-open': events.filter(e => e.status === 'registration-open').length,
      full: events.filter(e => e.status === 'full').length,
      completed: events.filter(e => e.status === 'completed').length,
      cancelled: events.filter(e => e.status === 'cancelled').length
    }
    
    return counts
  }
  
  const categoryCounts = getCategoryCounts()
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        <BackgroundNodes isMobile={false} />
        <div className="relative z-10 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-lg">Checking authentication...</p>
        </div>
      </div>
    )
  }
  
  // Redirect if not authenticated or not admin
  if (!isAuthenticated || (user && user.role !== 'ADMIN')) {
    return null // We'll redirect in useEffect
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
                onClick={() => router.push('/admin')}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                  Events Management
                </h1>
                <p className="text-white/60 mt-1">Create and manage technology events</p>
              </div>
            </div>
            <Button 
              onClick={handleCreateEvent}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Event
            </Button>
          </div>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-md text-red-200">
            <p className="flex items-center gap-2">
              <X className="w-5 h-5" />
              {error}
            </p>
          </div>
        )}
        
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Tabs 
              defaultValue="all" 
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
                <TabsTrigger value="all">
                  All ({categoryCounts.all})
                </TabsTrigger>
                <TabsTrigger value="workshops">
                  Workshops ({categoryCounts.workshops})
                </TabsTrigger>
                <TabsTrigger value="hackathons">
                  Hackathons ({categoryCounts.hackathons})
                </TabsTrigger>
                <TabsTrigger value="conferences">
                  Conferences ({categoryCounts.conferences})
                </TabsTrigger>
                <TabsTrigger value="networking">
                  Networking ({categoryCounts.networking})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        {/* Events List */}
        <div className="grid grid-cols-1 gap-6">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="ml-2 text-lg">Loading events...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-20 bg-white/5 rounded-lg border border-white/10">
              <Calendar className="w-12 h-12 mx-auto text-white/40 mb-4" />
              <h3 className="text-xl font-medium">No events found</h3>
              <p className="text-white/60 mt-1 mb-6">
                {searchTerm ? 'Try a different search term or filter' : 'Create your first event to get started'}
              </p>
              <Button onClick={handleCreateEvent}>
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <Card key={event.id} className="bg-white/5 border-white/10 overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {/* Event Image */}
                  {event.imageUrl && (
                    <div className="w-full md:w-48 h-48 md:h-auto bg-gray-800 relative">
                      <div 
                        className="absolute inset-0 bg-center bg-cover"
                        style={{ backgroundImage: `url(${event.imageUrl})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    </div>
                  )}
                  
                  {/* Event Content */}
                  <div className="flex-1 p-6">
                    <div className="flex flex-col md:flex-row justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`
                            ${event.category === 'workshops' ? 'bg-purple-500/20 text-purple-300' : ''}
                            ${event.category === 'hackathons' ? 'bg-blue-500/20 text-blue-300' : ''}
                            ${event.category === 'conferences' ? 'bg-green-500/20 text-green-300' : ''}
                            ${event.category === 'networking' ? 'bg-amber-500/20 text-amber-300' : ''}
                          `}>
                            {event.category}
                          </Badge>
                          
                          <Badge className={`
                            ${event.status === 'upcoming' ? 'bg-blue-500/20 text-blue-300' : ''}
                            ${event.status === 'registration-open' ? 'bg-green-500/20 text-green-300' : ''}
                            ${event.status === 'full' ? 'bg-amber-500/20 text-amber-300' : ''}
                            ${event.status === 'completed' ? 'bg-gray-500/20 text-gray-300' : ''}
                            ${event.status === 'cancelled' ? 'bg-red-500/20 text-red-300' : ''}
                          `}>
                            {event.status.replace('-', ' ')}
                          </Badge>
                          
                          {event.featured && (
                            <Badge variant="outline" className="border-purple-500/50 text-purple-300">
                              Featured
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                        <p className="text-white/70 mb-4">{event.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-white/60">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(event.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{event.time} ({event.duration}h)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-white/60" />
                          <span className="text-white/60">
                            {event.currentAttendees} / {event.maxAttendees} attendees
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 mt-4 md:mt-0">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="bg-white/5 hover:bg-white/10"
                          onClick={() => handleEditEvent(event)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-300 border-red-500/30"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleEventSubmit}
      />

      {/* Edit Event Modal */}
      <EditEventModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingEvent(null)
        }}
        onSubmit={handleEventUpdate}
        event={editingEvent}
      />
    </div>
  )
} 