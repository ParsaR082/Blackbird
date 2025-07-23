export const dynamic = 'force-dynamic';
export const revalidate = 0;

'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import BackgroundNodes from '@/components/BackgroundNodes'
import { useTheme } from '@/contexts/theme-context'
import { useAuth } from '@/contexts/auth-context'
import EditEventModal from './EditEventModal'
import EventRegistrationModal from './EventRegistrationModal'
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  Star,
  Zap,
  Trophy,
  Code,
  Cpu,
  Rocket,
  Globe,
  Play,
  BookOpen,
  Coffee,
  Mic,
  Video,
  X,
  AlertCircle,
  CheckCircle2,
  UserCheck,
  Edit,
  Trash2
} from 'lucide-react'
import jalaali from 'jalaali-js'

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
  attendees: number
  currentAttendees: number
  maxAttendees: number
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
  timeUntilEvent: string
  createdAt: string
  updatedAt: string
}

interface CategoryCounts {
  all: number
  workshops: number
  hackathons: number
  conferences: number
  networking: number
}

export default function EventsPage() {
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [categoryCounts, setCategoryCounts] = useState<CategoryCounts>({
    all: 0,
    workshops: 0,
    hackathons: 0,
    conferences: 0,
    networking: 0
  })
  const [userRegistrations, setUserRegistrations] = useState<{[eventId: string]: any}>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { theme } = useTheme()
  const { user } = useAuth()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events')
        const data = await response.json()
        
        if (data.success) {
          setEvents(data.events)
          setCategoryCounts(data.categoryCounts)
        } else {
          setError('Failed to load events')
        }
      } catch (err) {
        setError('Failed to load events')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  // Fetch user registrations if logged in
  useEffect(() => {
    const fetchUserRegistrations = async () => {
      if (!user) return

      try {
        const response = await fetch('/api/events/register')
        const data = await response.json()
        
        if (data.success) {
          const registrationsMap: {[eventId: string]: any} = {}
          data.registrations.forEach((reg: any) => {
            registrationsMap[reg.event.id] = reg
          })
          setUserRegistrations(registrationsMap)
        }
      } catch (err) {
        console.error('Failed to fetch user registrations:', err)
      }
    }

    fetchUserRegistrations()
  }, [user])

  const eventCategories = [
    { id: 'all', label: 'All Events', icon: Globe, count: categoryCounts.all },
    { id: 'workshops', label: 'Workshops', icon: Code, count: categoryCounts.workshops },
    { id: 'hackathons', label: 'Hackathons', icon: Zap, count: categoryCounts.hackathons },
    { id: 'conferences', label: 'Conferences', icon: Mic, count: categoryCounts.conferences },
    { id: 'networking', label: 'Networking', icon: Users, count: categoryCounts.networking }
  ]

  // Filter events by category
  const filteredEvents = selectedCategory === 'all' 
    ? events 
    : events.filter(event => event.category === selectedCategory)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500/20 border-blue-500/40 text-blue-400'
      case 'registration-open': return 'bg-green-500/20 border-green-500/40 text-green-400'
      case 'full': return 'bg-red-500/20 border-red-500/40 text-red-400'
      default: return 'bg-white/10 border-white/20 text-white/60'
    }
  }

  const openModal = (event: any) => {
    setSelectedEvent(event)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedEvent(null)
  }



  const openEditModal = (event: Event) => {
    setEditingEvent(event)
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setEditingEvent(null)
  }

  const openRegistrationModal = (event: Event) => {
    setSelectedEvent(event)
    setIsRegistrationModalOpen(true)
  }

  const closeRegistrationModal = () => {
    setIsRegistrationModalOpen(false)
    setSelectedEvent(null)
  }

  const handleRegistrationSuccess = async () => {
    // Refresh events data
    try {
      const response = await fetch('/api/events')
      const data = await response.json()
      
      if (data.success) {
        setEvents(data.events)
        setCategoryCounts(data.categoryCounts)
      }
    } catch (err) {
      console.error('Failed to refresh events:', err)
    }

    // Refresh user registrations if logged in
    if (user) {
      try {
        const response = await fetch('/api/events/register')
        const data = await response.json()
        
        if (data.success) {
          const registrationsMap: {[eventId: string]: any} = {}
          data.registrations.forEach((reg: any) => {
            registrationsMap[reg.event.id] = reg
          })
          setUserRegistrations(registrationsMap)
        }
      } catch (err) {
        console.error('Failed to refresh user registrations:', err)
      }
    }
  }



  const handleEditEvent = async (eventData: any) => {
    try {
      const response = await fetch('/api/admin/events', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(eventData)
      })

      if (response.ok) {
        // Refresh events list
        const eventsResponse = await fetch('/api/events')
        const eventsData = await eventsResponse.json()
        if (eventsData.success) {
          setEvents(eventsData.events)
          setCategoryCounts(eventsData.categoryCounts)
        }
        closeEditModal()
      } else {
        console.error('Failed to update event')
      }
    } catch (error) {
      console.error('Error updating event:', error)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/events?id=${eventId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        // Refresh events list
        const eventsResponse = await fetch('/api/events')
        const eventsData = await eventsResponse.json()
        if (eventsData.success) {
          setEvents(eventsData.events)
          setCategoryCounts(eventsData.categoryCounts)
        }
      } else {
        console.error('Failed to delete event')
      }
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  const handleAddToCalendar = async (event: Event) => {
    if (!user) {
      alert('Please log in to add events to your calendar')
      return
    }

    try {
      // Convert duration to number if it's a string
      let duration: number
      if (typeof event.duration === 'string') {
        // Extract number from strings like "1 hour", "2 hours", etc.
        const match = (event.duration as string).match(/(\d+(?:\.\d+)?)/)
        duration = match ? parseFloat(match[1]) : 1
      } else {
        duration = event.duration
      }

      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          eventId: event.id,
          title: event.title,
          description: event.description,
          date: event.date,
          time: event.time,
          duration: duration,
          location: event.location,
          category: event.category
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert('Event added to your calendar!')
      } else {
        alert(data.error || 'Failed to add event to calendar')
      }
    } catch (error) {
      console.error('Error adding to calendar:', error)
      alert('Failed to add event to calendar')
    }
  }

  // Helper to convert Gregorian date string to Persian date string
  function toPersianDateString(dateStr: string) {
    const d = new Date(dateStr)
    const j = jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate())
    return `${j.jy}/${j.jm.toString().padStart(2, '0')}/${j.jd.toString().padStart(2, '0')}`
  }

  // Helper to format Gregorian date in a clear, unambiguous format
  function formatGregorianDate(dateStr: string) {
    const d = new Date(dateStr)
    const month = d.toLocaleString('en-US', { month: 'short' })
    const day = d.getDate()
    const year = d.getFullYear()
    return `${month} ${day}, ${year}`
  }

  // Modal Component
  const EventModal = () => {
    if (!selectedEvent) return null

    const getCategoryIcon = (category: string) => {
      switch (category) {
        case 'workshops': return Code
        case 'hackathons': return Zap
        case 'conferences': return Mic
        case 'networking': return Users
        default: return Globe
      }
    }

    const CategoryIcon = getCategoryIcon(selectedEvent.category)

    return (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Overlay */}
        <motion.div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
        />
        
        {/* Modal Content */}
        <motion.div
          className="relative bg-[#111111] border border-[#1F1F1F] rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        >
          {/* Close Button */}
          <motion.button
            onClick={closeModal}
            className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-4 h-4 text-white" />
          </motion.button>

          {/* Event Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-[#2D8EFF]/20 rounded-lg">
                <CategoryIcon className="w-5 h-5 text-[#2D8EFF]" />
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedEvent.featured && (
                  <span className="px-2 py-1 bg-[#5C4B00] rounded-full text-xs text-[#FFD700] font-medium">
                    FEATURED
                  </span>
                )}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedEvent.status === 'registration-open' 
                    ? 'bg-[#033D1D] text-[#3AB54B]' 
                    : 'bg-[#2D8EFF]/20 text-[#2D8EFF]'
                }`}>
                  {selectedEvent.status.replace('-', ' ').toUpperCase()}
                </span>
              </div>
            </div>
            <h2 className="text-2xl font-light text-white mb-2">{selectedEvent.title}</h2>
            <p className="text-[#CCCCCC] text-sm leading-relaxed">{selectedEvent.detailDescription}</p>
          </div>

          {/* Event Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-[#1F1F1F] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-[#2D8EFF]" />
                <span className="text-sm font-medium text-white">Date & Time</span>
              </div>
              <p className="text-[#CCCCCC] text-sm">{formatGregorianDate(selectedEvent.date)} | {toPersianDateString(selectedEvent.date)}</p>
              <p className="text-[#CCCCCC] text-sm">{selectedEvent.time} ({selectedEvent.duration})</p>
            </div>

            <div className="bg-[#1F1F1F] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-[#2D8EFF]" />
                <span className="text-sm font-medium text-white">Location</span>
              </div>
              <p className="text-[#CCCCCC] text-sm">{selectedEvent.location}</p>
            </div>

            <div className="bg-[#1F1F1F] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-[#2D8EFF]" />
                <span className="text-sm font-medium text-white">Attendees</span>
              </div>
              <p className="text-[#CCCCCC] text-sm">{selectedEvent.attendees} / {selectedEvent.maxAttendees}</p>
              <div className="w-full bg-[#333333] rounded-full h-2 mt-2">
                <div 
                  className="bg-[#3AB54B] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(selectedEvent.attendees / selectedEvent.maxAttendees) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-[#1F1F1F] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Rocket className="w-4 h-4 text-[#2D8EFF]" />
                <span className="text-sm font-medium text-white">Category</span>
              </div>
              <p className="text-[#CCCCCC] text-sm capitalize">{selectedEvent.category}</p>
            </div>
          </div>

          {/* Prerequisites */}
          <div className="mb-6">
            <h3 className="text-lg font-light text-white mb-3">Prerequisites</h3>
            <div className="flex flex-wrap gap-2">
              {selectedEvent.prerequisites.map((prereq: string, index: number) => (
                <span key={index} className="px-3 py-1 bg-[#1F1F1F] text-[#CCCCCC] text-sm rounded-full">
                  {prereq}
                </span>
              ))}
            </div>
          </div>

          {/* What You'll Learn */}
          <div className="mb-6">
            <h3 className="text-lg font-light text-white mb-3">What You&apos;ll Learn</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {selectedEvent.whatYouWillLearn.map((item: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#3AB54B] rounded-full flex-shrink-0" />
                  <span className="text-[#CCCCCC] text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {userRegistrations[selectedEvent.id] ? (
              <div className="flex-1 bg-green-500/20 border border-green-500/40 text-green-400 px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {userRegistrations[selectedEvent.id].status === 'registered' 
                  ? 'Registered' 
                  : 'On Waitlist'}
              </div>
            ) : (
              <motion.button
                onClick={() => openRegistrationModal(selectedEvent)}
                disabled={selectedEvent.status === 'completed' || selectedEvent.status === 'cancelled'}
                className="flex-1 bg-[#2D8EFF] hover:bg-[#2D8EFF]/90 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {selectedEvent.status === 'full' ? 'Join Waitlist' : 'Register Now'}
              </motion.button>
            )}
            <motion.button
              onClick={() => handleAddToCalendar(selectedEvent)}
              className="px-6 py-3 bg-[#1F1F1F] hover:bg-[#333333] text-[#CCCCCC] rounded-lg font-medium transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Add to Calendar
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen overflow-hidden transition-colors duration-300" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      {/* Interactive Background */}
      <BackgroundNodes isMobile={isMobile} />
      
      {/* Modals */}
      {isModalOpen && <EventModal />}
      {isEditModalOpen && editingEvent && (
        <EditEventModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          onSubmit={handleEditEvent}
          event={editingEvent}
        />
      )}
      {isRegistrationModalOpen && selectedEvent && (
        <EventRegistrationModal
          isOpen={isRegistrationModalOpen}
          onClose={closeRegistrationModal}
          event={selectedEvent}
          onRegistrationSuccess={handleRegistrationSuccess}
        />
      )}
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen px-4 pt-24 pb-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <motion.div 
              className="p-4 rounded-full border backdrop-blur-sm transition-colors duration-300"
              style={{
                backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
                borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
              }}
              whileHover={{ 
                scale: 1.1, 
                boxShadow: theme === 'light' ? '0 0 25px rgba(0,0,0,0.2)' : '0 0 25px rgba(255,255,255,0.4)'
              }}
              transition={{ duration: 0.3 }}
            >
              <Calendar className={`w-8 h-8 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
            </motion.div>
          </div>
          <h1 className={`text-3xl font-light tracking-wide mb-2 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>
            Event Portal
          </h1>
          <p className={`text-sm max-w-md mx-auto transition-colors duration-300 ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`}>
            Immersive technology events and collaborative learning experiences
          </p>
        </motion.div>

        {/* Event Categories */}
        <motion.div 
          className="max-w-6xl mx-auto mb-12 px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex flex-wrap sm:flex-nowrap justify-center sm:justify-center gap-3 sm:gap-4 overflow-x-auto scrollbar-hide">
            {eventCategories.map((category, index) => (
              <motion.button
                key={category.id}
                className="group relative cursor-pointer px-6 py-3 border rounded-full backdrop-blur-sm transition-all duration-300"
                style={{
                  backgroundColor: selectedCategory === category.id 
                    ? (theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.95)')
                    : (theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)'),
                  borderColor: selectedCategory === category.id 
                    ? (theme === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)')
                    : (theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)')
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -2,
                  borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)'
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.id)}
              >
                <div className="flex items-center gap-2">
                  <category.icon className={`w-4 h-4 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
                  <span className={`text-sm transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>{category.label}</span>
                  <span className={`text-xs px-2 py-1 rounded-full transition-colors duration-300 ${
                    theme === 'light' 
                      ? 'text-gray-600 bg-black/10' 
                      : 'text-white/60 bg-white/10'
                  }`}>
                    {category.count}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Main Events Interface */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Events List */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="border rounded-lg backdrop-blur-sm p-6 transition-colors duration-300" style={{
              backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
              borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
            }}>
              <div className="flex items-center gap-3 mb-6">
                <Star className={`w-5 h-5 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
                <h2 className={`text-lg font-light tracking-wide transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>Upcoming Events</h2>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className={`transition-colors duration-300 ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`}>Loading events...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className={`text-lg transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>{error}</p>
                  </div>
                </div>
              ) : filteredEvents.length > 0 ? (
                <div className="space-y-4">
                  {filteredEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    className="group p-4 border rounded-lg cursor-pointer transition-all duration-300"
                    style={{
                      backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                      borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ 
                      scale: 1.02,
                      backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                      borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)'
                    }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className={`text-base font-medium transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>{event.title}</h3>
                          {event.featured && (
                            <span className="px-2 py-1 bg-yellow-500/20 border border-yellow-500/40 rounded-full text-xs text-yellow-400">
                              FEATURED
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(event.status)}`}>
                            {event.status.replace('-', ' ').toUpperCase()}
                          </span>
                        </div>
                        <p className={`text-sm mb-3 transition-colors duration-300 ${theme === 'light' ? 'text-gray-700' : 'text-white/70'}`}>{event.description}</p>
                        <div className={`flex flex-wrap items-center gap-4 text-xs transition-colors duration-300 ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`}>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatGregorianDate(event.date)} <span className="mx-1">|</span> <span dir="ltr">{toPersianDateString(event.date)}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {event.time} ({event.duration})
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {event.attendees}/{event.maxAttendees}
                          </span>
                        </div>
                        <div className={`text-xs mt-2 transition-colors duration-300 ${theme === 'light' ? 'text-gray-500' : 'text-white/50'}`}>
                          {event.timeUntilEvent}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {userRegistrations[event.id] ? (
                          <div className="px-6 py-2 bg-green-500/20 border border-green-500/40 text-green-400 rounded-lg text-sm flex items-center justify-center gap-1">
                            <UserCheck className="w-3 h-3" />
                            {userRegistrations[event.id].status === 'registered' ? 'Registered' : 'Waitlisted'}
                          </div>
                        ) : (
                          <motion.button
                            onClick={() => openRegistrationModal(event)}
                            disabled={event.status === 'completed' || event.status === 'cancelled'}
                            className={`px-6 py-2 border rounded-lg transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                              theme === 'light' 
                                ? 'bg-black/10 border-black/30 text-black hover:bg-black/20 hover:border-black/60' 
                                : 'bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/60'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {event.status === 'full' ? 'Join Waitlist' : 'Register'}
                          </motion.button>
                        )}
                        <motion.button
                          className={`px-6 py-2 border rounded-lg transition-all duration-300 text-sm ${
                            theme === 'light' 
                              ? 'bg-black/5 border-black/20 text-gray-700 hover:bg-black/10 hover:border-black/40' 
                              : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10 hover:border-white/40'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openModal(event)}
                        >
                          Details
                        </motion.button>
                        
                        {/* Admin Actions */}
                        {user && user.role === 'ADMIN' && (
                          <div className="flex gap-1 mt-2">
                            <motion.button
                              className="px-3 py-1 bg-blue-500/20 border border-blue-500/40 text-blue-400 rounded text-xs hover:bg-blue-500/30 transition-all duration-200"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation()
                                openEditModal(event)
                              }}
                            >
                              <Edit className="w-3 h-3" />
                            </motion.button>
                            <motion.button
                              className="px-3 py-1 bg-red-500/20 border border-red-500/40 text-red-400 rounded text-xs hover:bg-red-500/30 transition-all duration-200"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteEvent(event.id)
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </motion.button>
                          </div>
                        )}
                      </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className={`text-lg transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>No events found</p>
                    <p className={`text-sm transition-colors duration-300 ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`}>
                      Try selecting a different category or check back later.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {/* Event Stats */}
            <div className="border rounded-lg backdrop-blur-sm p-6 transition-colors duration-300" style={{
              backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
              borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
            }}>
              <div className="flex items-center gap-3 mb-4">
                <Trophy className={`w-5 h-5 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
                <h3 className={`text-lg font-light tracking-wide transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>Event Stats</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-sm transition-colors duration-300 ${theme === 'light' ? 'text-gray-700' : 'text-white/70'}`}>Events Attended</span>
                  <span className={`text-sm font-light transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>47</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm transition-colors duration-300 ${theme === 'light' ? 'text-gray-700' : 'text-white/70'}`}>Hours Learned</span>
                  <span className={`text-sm font-light transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>156</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm transition-colors duration-300 ${theme === 'light' ? 'text-gray-700' : 'text-white/70'}`}>Certificates</span>
                  <span className={`text-sm font-light transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>23</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm transition-colors duration-300 ${theme === 'light' ? 'text-gray-700' : 'text-white/70'}`}>Network Size</span>
                  <span className={`text-sm font-light transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>234</span>
                </div>
              </div>
            </div>

            {/* Past Events */}
            <div className="border rounded-lg backdrop-blur-sm p-6 transition-colors duration-300" style={{
              backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
              borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
            }}>
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className={`w-5 h-5 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
                <h3 className={`text-lg font-light tracking-wide transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>Recent Events</h3>
              </div>
              <div className="space-y-3">
                <motion.div 
                  className={`flex items-center justify-center p-8 rounded-lg transition-all duration-300 ${
                    theme === 'light' ? 'bg-black/5' : 'bg-white/5'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="text-center">
                    <Calendar className={`w-8 h-8 mx-auto mb-2 opacity-50 ${theme === 'light' ? 'text-gray-400' : 'text-white/40'}`} />
                    <p className={`text-sm transition-colors duration-300 ${theme === 'light' ? 'text-gray-500' : 'text-white/50'}`}>
                      No past events to display
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border rounded-lg backdrop-blur-sm p-6 transition-colors duration-300" style={{
              backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
              borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
            }}>
              <div className="flex items-center gap-3 mb-4">
                <Zap className={`w-5 h-5 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
                <h3 className={`text-lg font-light tracking-wide transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>Quick Actions</h3>
              </div>
              <div className="space-y-3">
                <motion.button
                  className={`w-full p-3 border rounded-lg transition-all duration-300 text-sm ${
                    theme === 'light' 
                      ? 'bg-black/10 border-black/30 text-black hover:bg-black/20 hover:border-black/60' 
                      : 'bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/60'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/calendar')}
                >
                  My Calendar
                </motion.button>
                <motion.button
                  className={`w-full p-3 border rounded-lg transition-all duration-300 text-sm ${
                    theme === 'light' 
                      ? 'bg-black/10 border-black/30 text-black hover:bg-black/20 hover:border-black/60' 
                      : 'bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/60'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/events/archive')}
                >
                  Event Archive
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Status */}
        <motion.div 
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <div className={`flex items-center space-x-2 text-xs transition-colors duration-300 ${theme === 'light' ? 'text-gray-500' : 'text-white/40'}`}>
            <div className={`w-2 h-2 rounded-full animate-pulse transition-colors duration-300 ${theme === 'light' ? 'bg-gray-500' : 'bg-white/40'}`} />
            <span>Event Network Active</span>
            <div className={`w-2 h-2 rounded-full animate-pulse transition-colors duration-300 ${theme === 'light' ? 'bg-gray-500' : 'bg-white/40'}`} style={{ animationDelay: '0.5s' }} />
          </div>
        </motion.div>
      </div>
    </div>
  )
} 
