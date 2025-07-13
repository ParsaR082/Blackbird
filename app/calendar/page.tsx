'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import BackgroundNodes from '@/components/BackgroundNodes'
import { useTheme } from '@/contexts/theme-context'
import { useAuth } from '@/contexts/auth-context'
import { 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Users,
  Star,
  Trash2,
  Edit,
  Bell,
  BellOff,
  Filter,
  Search,
  X,
  AlertCircle,
  CheckCircle2,
  CalendarDays,
  List,
  Grid3X3
} from 'lucide-react'
import jalaali from 'jalaali-js'

interface CalendarEvent {
  id: string
  eventId: string
  title: string
  description: string
  date: string
  time: string
  duration: number
  location: string
  category: string
  color: string
  reminder: boolean
  reminderTime: number
  createdAt: string
}

export default function CalendarPage() {
  const [isMobile, setIsMobile] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [today] = useState(new Date())
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showEventDetails, setShowEventDetails] = useState<CalendarEvent | null>(null)
  
  const { theme } = useTheme()
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Fetch calendar events
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirectTo=/calendar')
      return
    }

    const fetchCalendarEvents = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/calendar')
        const data = await response.json()
        
        if (data.success) {
          setCalendarEvents(data.calendarEvents)
        } else {
          setError('Failed to load calendar events')
        }
      } catch (err) {
        setError('Failed to load calendar events')
      } finally {
        setLoading(false)
      }
    }

    fetchCalendarEvents()
  }, [isAuthenticated, router])

  // Calendar logic
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getMonthName = (date: Date) => {
    return date.toLocaleString('default', { month: 'long' })
  }

  const getYear = (date: Date) => {
    return date.getFullYear()
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const isToday = (day: number) => {
    return today.getDate() === day && 
           today.getMonth() === currentDate.getMonth() && 
           today.getFullYear() === currentDate.getFullYear()
  }

  const getEventsForDate = (day: number) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0]
    return calendarEvents.filter(event => event.date === dateStr)
  }

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    // Add empty cells to complete the grid (42 cells = 6 weeks × 7 days)
    while (days.length < 42) {
      days.push(null)
    }

    return days
  }

  const handleRemoveFromCalendar = async (eventId: string) => {
    if (!confirm('Are you sure you want to remove this event from your calendar?')) {
      return
    }

    try {
      const response = await fetch(`/api/calendar?eventId=${eventId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        setCalendarEvents(prev => prev.filter(event => event.id !== eventId))
        setShowEventDetails(null)
      } else {
        alert('Failed to remove event from calendar')
      }
    } catch (error) {
      console.error('Error removing from calendar:', error)
      alert('Failed to remove event from calendar')
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'workshops': return '#8B5CF6'
      case 'hackathons': return '#3B82F6'
      case 'conferences': return '#10B981'
      case 'networking': return '#F59E0B'
      default: return '#2D8EFF'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'workshops': return '🔧'
      case 'hackathons': return '⚡'
      case 'conferences': return '🎤'
      case 'networking': return '🤝'
      default: return '📅'
    }
  }

  const filteredEvents = calendarEvents.filter(event => {
    const matchesSearch = searchTerm === '' || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const calendarDays = generateCalendarDays()

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen overflow-hidden transition-colors duration-300" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      {/* Interactive Background */}
      <BackgroundNodes isMobile={isMobile} />
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen px-4 pt-24 pb-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <motion.div 
              className="p-3 rounded-full border backdrop-blur-sm transition-colors duration-300"
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
              <Calendar className={`w-6 h-6 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
            </motion.div>
          </div>
          <h1 className={`text-3xl font-light tracking-wide mb-2 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>
            My Calendar
          </h1>
          <p className={`text-sm max-w-md mx-auto transition-colors duration-300 ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`}>
            Manage your scheduled events and activities
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div 
          className="max-w-6xl mx-auto mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 pr-4 py-2 rounded-lg border transition-colors duration-300 ${
                    theme === 'light' 
                      ? 'bg-white border-gray-300 text-black placeholder-gray-500' 
                      : 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                  }`}
                />
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`px-4 py-2 rounded-lg border transition-colors duration-300 ${
                  theme === 'light' 
                    ? 'bg-white border-gray-300 text-black' 
                    : 'bg-gray-800 border-gray-600 text-white'
                }`}
              >
                <option value="all">All Categories</option>
                <option value="workshops">Workshops</option>
                <option value="hackathons">Hackathons</option>
                <option value="conferences">Conferences</option>
                <option value="networking">Networking</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2">
              <motion.button
                onClick={() => setViewMode('calendar')}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  viewMode === 'calendar'
                    ? (theme === 'light' ? 'bg-black text-white' : 'bg-white text-black')
                    : (theme === 'light' ? 'bg-gray-100 text-gray-600' : 'bg-gray-800 text-gray-300')
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <CalendarDays className="w-4 h-4" />
              </motion.button>
              <motion.button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  viewMode === 'list'
                    ? (theme === 'light' ? 'bg-black text-white' : 'bg-white text-black')
                    : (theme === 'light' ? 'bg-gray-100 text-gray-600' : 'bg-gray-800 text-gray-300')
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <List className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <motion.div 
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className={`border rounded-xl backdrop-blur-sm p-6 shadow-2xl transition-colors duration-300 ${
              theme === 'light' ? 'bg-white/90 border-gray-200' : 'bg-gray-900/90 border-gray-700'
            }`}>
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <motion.button
                  onClick={() => navigateMonth('prev')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-800'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronLeft className={`w-5 h-5 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
                </motion.button>
                
                <motion.h2 
                  className={`text-xl font-medium transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}
                  key={`${getMonthName(currentDate)}-${getYear(currentDate)}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {getMonthName(currentDate)} {getYear(currentDate)}
                </motion.h2>
                
                <motion.button
                  onClick={() => navigateMonth('next')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-800'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronRight className={`w-5 h-5 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
                </motion.button>
              </div>

              {/* Days of Week Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {daysOfWeek.map((day) => (
                  <div
                    key={day}
                    className={`text-center text-sm font-medium py-2 transition-colors duration-300 ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-300'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className={`grid grid-cols-7 border rounded-lg overflow-hidden transition-colors duration-300 ${
                theme === 'light' ? 'border-gray-200' : 'border-gray-700'
              }`}>
                {calendarDays.map((day, index) => {
                  const dayEvents = day ? getEventsForDate(day) : []
                  const hasEvents = dayEvents.length > 0
                  
                  return (
                    <motion.div
                      key={index}
                      className={`
                        aspect-square p-1 transition-all duration-200 border-r border-b
                        ${theme === 'light' ? 'border-gray-200' : 'border-gray-700'}
                        ${day === null 
                          ? 'cursor-default' 
                          : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800'
                        }
                        ${(index + 1) % 7 === 0 ? 'border-r-0' : ''}
                        ${index >= 35 ? 'border-b-0' : ''}
                      `}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.01 }}
                      whileHover={day !== null ? { scale: 1.02 } : {}}
                      onClick={() => day && setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                    >
                      <div className="h-full flex flex-col">
                        <div className={`
                          text-sm font-medium mb-1 transition-colors duration-300
                          ${day === null 
                            ? 'text-transparent' 
                            : isToday(day)
                              ? 'text-blue-600 dark:text-blue-400 font-bold'
                              : theme === 'light' ? 'text-gray-900' : 'text-white'
                          }
                        `}>
                          {day}
                        </div>
                        
                        {/* Event Indicators */}
                        {hasEvents && (
                          <div className="flex flex-col gap-1">
                            {dayEvents.slice(0, 3).map((event, eventIndex) => (
                              <div
                                key={event.id}
                                className="h-1.5 rounded-full text-xs truncate px-1"
                                style={{ backgroundColor: getCategoryColor(event.category) }}
                                title={event.title}
                              />
                            ))}
                            {dayEvents.length > 3 && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                +{dayEvents.length - 3} more
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <motion.div 
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className={`border rounded-xl backdrop-blur-sm p-6 shadow-2xl transition-colors duration-300 ${
              theme === 'light' ? 'bg-white/90 border-gray-200' : 'bg-gray-900/90 border-gray-700'
            }`}>
              <h3 className={`text-lg font-medium mb-4 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                All Events ({filteredEvents.length})
              </h3>
              
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className={theme === 'light' ? 'text-black' : 'text-white'}>{error}</p>
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className={`text-lg transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                    No events found
                  </p>
                  <p className={`text-sm transition-colors duration-300 ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`}>
                    {searchTerm || selectedCategory !== 'all' 
                      ? 'Try adjusting your search or filters' 
                      : 'Add events to your calendar to see them here'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEvents.map((event) => (
                    <motion.div
                      key={event.id}
                      className={`p-4 border rounded-lg transition-all duration-300 cursor-pointer ${
                        theme === 'light' 
                          ? 'bg-white border-gray-200 hover:bg-gray-50' 
                          : 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                      }`}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => setShowEventDetails(event)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-lg">{getCategoryIcon(event.category)}</span>
                            <h4 className={`font-medium transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                              {event.title}
                            </h4>
                            <span 
                              className="px-2 py-1 text-xs rounded-full text-white"
                              style={{ backgroundColor: getCategoryColor(event.category) }}
                            >
                              {event.category}
                            </span>
                          </div>
                          
                          <p className={`text-sm mb-3 transition-colors duration-300 ${theme === 'light' ? 'text-gray-600' : 'text-white/70'}`}>
                            {event.description}
                          </p>
                          
                          <div className={`flex flex-wrap items-center gap-4 text-xs transition-colors duration-300 ${theme === 'light' ? 'text-gray-500' : 'text-white/60'}`}>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(event.date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {event.time} ({event.duration}h)
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </span>
                          </div>
                        </div>
                        
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveFromCalendar(event.id)
                          }}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Selected Date Events Modal */}
        {selectedDate && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedDate(null)}
            />
            
            <motion.div
              className={`relative max-w-md w-full max-h-[80vh] overflow-y-auto rounded-xl p-6 transition-colors duration-300 ${
                theme === 'light' ? 'bg-white' : 'bg-gray-900'
              }`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-medium transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                  {selectedDate.toLocaleDateString('default', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {getEventsForDate(selectedDate.getDate()).length === 0 ? (
                <p className={`text-center py-8 transition-colors duration-300 ${theme === 'light' ? 'text-gray-500' : 'text-white/60'}`}>
                  No events scheduled for this date
                </p>
              ) : (
                <div className="space-y-3">
                  {getEventsForDate(selectedDate.getDate()).map((event) => (
                    <div
                      key={event.id}
                      className={`p-3 border rounded-lg transition-all duration-300 cursor-pointer ${
                        theme === 'light' ? 'border-gray-200 hover:bg-gray-50' : 'border-gray-700 hover:bg-gray-800'
                      }`}
                      onClick={() => {
                        setShowEventDetails(event)
                        setSelectedDate(null)
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">{getCategoryIcon(event.category)}</span>
                        <h4 className={`font-medium text-sm transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                          {event.title}
                        </h4>
                      </div>
                      <p className={`text-xs transition-colors duration-300 ${theme === 'light' ? 'text-gray-600' : 'text-white/70'}`}>
                        {event.time} • {event.location}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Event Details Modal */}
        {showEventDetails && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowEventDetails(null)}
            />
            
            <motion.div
              className={`relative max-w-md w-full rounded-xl p-6 transition-colors duration-300 ${
                theme === 'light' ? 'bg-white' : 'bg-gray-900'
              }`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getCategoryIcon(showEventDetails.category)}</span>
                  <h3 className={`font-medium transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                    {showEventDetails.title}
                  </h3>
                </div>
                <button
                  onClick={() => setShowEventDetails(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <p className={`text-sm mb-4 transition-colors duration-300 ${theme === 'light' ? 'text-gray-600' : 'text-white/70'}`}>
                {showEventDetails.description}
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className={theme === 'light' ? 'text-gray-700' : 'text-white/80'}>
                    {new Date(showEventDetails.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className={theme === 'light' ? 'text-gray-700' : 'text-white/80'}>
                    {showEventDetails.time} ({showEventDetails.duration}h)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className={theme === 'light' ? 'text-gray-700' : 'text-white/80'}>
                    {showEventDetails.location}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <motion.button
                  onClick={() => handleRemoveFromCalendar(showEventDetails.id)}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Remove from Calendar
                </motion.button>
                <motion.button
                  onClick={() => setShowEventDetails(null)}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    theme === 'light' 
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                      : 'bg-gray-800 text-white hover:bg-gray-700'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
} 