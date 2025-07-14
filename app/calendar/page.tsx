'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import BackgroundNodes from '@/components/BackgroundNodes'
import { 
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  MapPin,
  Globe,
  Sun
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

type CalendarType = 'gregorian' | 'jalali'

interface JalaliDate {
  jy: number
  jm: number
  jd: number
}

export default function CalendarPage() {
  const [isMobile, setIsMobile] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [today] = useState(new Date())
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
  const [calendarType, setCalendarType] = useState<CalendarType>('gregorian')

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
    const fetchCalendarEvents = async () => {
      try {
        setLoading(true)
        setError(null)
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
  }, [])

  // Jalali month names in English
  const jalaliMonths = [
    'Farvardin', 'Ordibehesht', 'Khordad', 'Tir', 'Mordad', 'Shahrivar',
    'Mehr', 'Aban', 'Azar', 'Dey', 'Bahman', 'Esfand'
  ]

  // Convert Gregorian date to Jalali
  const toJalali = (date: Date): JalaliDate => {
    return jalaali.toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate())
  }

  // Convert Jalali date to Gregorian
  const toGregorian = (jalaliDate: JalaliDate): Date => {
    const gregorian = jalaali.toGregorian(jalaliDate.jy, jalaliDate.jm, jalaliDate.jd)
    return new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd)
  }

  // Get current date in selected calendar type
  const getCurrentDateInType = (): Date | JalaliDate => {
    if (calendarType === 'jalali') {
      return toJalali(currentDate)
    }
    return currentDate
  }

  // Calendar logic
  const getDaysInMonth = (date: Date | JalaliDate) => {
    if (calendarType === 'jalali') {
      const jalaliDate = date as JalaliDate
      return jalaali.jalaaliMonthLength(jalaliDate.jy, jalaliDate.jm)
    } else {
      const gregorianDate = date as Date
      return new Date(gregorianDate.getFullYear(), gregorianDate.getMonth() + 1, 0).getDate()
    }
  }

  const getFirstDayOfMonth = (date: Date | JalaliDate) => {
    if (calendarType === 'jalali') {
      const jalaliDate = date as JalaliDate
      // Convert first day of Jalali month to Gregorian to get weekday
      const firstDayGregorian = toGregorian({ jy: jalaliDate.jy, jm: jalaliDate.jm, jd: 1 })
      return firstDayGregorian.getDay()
    } else {
      const gregorianDate = date as Date
      return new Date(gregorianDate.getFullYear(), gregorianDate.getMonth(), 1).getDay()
    }
  }

  const getMonthName = (date: Date | JalaliDate) => {
    if (calendarType === 'jalali') {
      const jalaliDate = date as JalaliDate
      return jalaliMonths[jalaliDate.jm - 1]
    } else {
      const gregorianDate = date as Date
      return gregorianDate.toLocaleString('default', { month: 'long' })
    }
  }

  const getYear = (date: Date | JalaliDate) => {
    if (calendarType === 'jalali') {
      const jalaliDate = date as JalaliDate
      return jalaliDate.jy
    } else {
      const gregorianDate = date as Date
      return gregorianDate.getFullYear()
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      if (calendarType === 'jalali') {
        const currentJalali = toJalali(prev)
        let newJy = currentJalali.jy
        let newJm = currentJalali.jm

        if (direction === 'prev') {
          if (newJm === 1) {
            newJm = 12
            newJy -= 1
          } else {
            newJm -= 1
          }
        } else {
          if (newJm === 12) {
            newJm = 1
            newJy += 1
          } else {
            newJm += 1
          }
        }

        const newGregorian = toGregorian({ jy: newJy, jm: newJm, jd: 1 })
        return newGregorian
      } else {
        const newDate = new Date(prev)
        if (direction === 'prev') {
          newDate.setMonth(prev.getMonth() - 1)
        } else {
          newDate.setMonth(prev.getMonth() + 1)
        }
        return newDate
      }
    })
  }

  const isToday = (day: number) => {
    if (calendarType === 'jalali') {
      const todayJalali = toJalali(today)
      const currentJalali = toJalali(currentDate)
      return todayJalali.jd === day && 
             todayJalali.jm === currentJalali.jm && 
             todayJalali.jy === currentJalali.jy
    } else {
      return today.getDate() === day && 
             today.getMonth() === currentDate.getMonth() && 
             today.getFullYear() === currentDate.getFullYear()
    }
  }

  const generateCalendarDays = () => {
    const currentDateInType = getCurrentDateInType()
    const daysInMonth = getDaysInMonth(currentDateInType)
    const firstDay = getFirstDayOfMonth(currentDateInType)
    const days = []
    
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }
    while (days.length < 42) {
      days.push(null)
    }
    return days
  }

  // Get events for a specific day
  const getEventsForDay = (day: number) => {
    let dateStr: string
    
    if (calendarType === 'jalali') {
      const currentJalali = toJalali(currentDate)
      const dayGregorian = toGregorian({ jy: currentJalali.jy, jm: currentJalali.jm, jd: day })
      dateStr = dayGregorian.toISOString().split('T')[0]
    } else {
      dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0]
    }
    
    return calendarEvents.filter(event => event.date === dateStr)
  }

  // Get today's date string for display
  const getTodayDisplay = () => {
    if (calendarType === 'jalali') {
      const todayJalali = toJalali(today)
      return `${jalaliMonths[todayJalali.jm - 1].substring(0, 3)} ${todayJalali.jd}`
    } else {
      return today.toLocaleDateString('default', { month: 'short', day: 'numeric' })
    }
  }

  // Remove event
  const handleRemoveEvent = async (eventId: string) => {
    if (!confirm('Remove this event from your calendar?')) return
    setRemoving(eventId)
    try {
      const response = await fetch(`/api/calendar?eventId=${eventId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (response.ok) {
        setCalendarEvents(prev => prev.filter(e => e.id !== eventId))
      } else {
        alert('Failed to remove event')
      }
    } catch (err) {
      alert('Failed to remove event')
    } finally {
      setRemoving(null)
    }
  }

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const calendarDays = generateCalendarDays()
  const currentDateInType = getCurrentDateInType()

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Interactive Background */}
      <BackgroundNodes isMobile={isMobile} />
      {/* Main Content */}
      <div className="relative z-10 h-screen px-4 pt-24 pb-4 md:pb-6 flex flex-col">
        {/* Header */}
        <motion.div 
          className="text-center mb-4 md:mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <motion.div 
              className="p-2 md:p-3 rounded-full bg-black/90 border border-white/30 backdrop-blur-sm"
              whileHover={{ scale: 1.1, boxShadow: '0 0 25px rgba(255,255,255,0.4)' }}
              transition={{ duration: 0.3 }}
            >
              <Calendar className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </motion.div>
          </div>
          <h1 className="text-xl md:text-2xl font-light text-white tracking-wide mb-1">
            Calendar Portal
          </h1>
          <p className="text-xs md:text-sm text-white/60 max-w-md mx-auto">
            Navigate through time and manage your schedule
          </p>
        </motion.div>

        {/* Calendar Type Toggle */}
        <motion.div 
          className="max-w-2xl mx-auto mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <div className="flex items-center justify-center gap-2 bg-[#111111] border border-[#1F1F1F] rounded-lg p-1">
            <motion.button
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs md:text-sm font-medium transition-all duration-200 ${
                calendarType === 'gregorian' 
                  ? 'bg-[#2D8EFF] text-black' 
                  : 'text-white/60 hover:text-white'
              }`}
              onClick={() => setCalendarType('gregorian')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Globe className="w-3 h-3" />
              Gregorian
            </motion.button>
            <motion.button
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs md:text-sm font-medium transition-all duration-200 ${
                calendarType === 'jalali' 
                  ? 'bg-[#FFD700] text-black' 
                  : 'text-white/60 hover:text-white'
              }`}
              onClick={() => setCalendarType('jalali')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Sun className="w-3 h-3" />
              Jalali
            </motion.button>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          className="max-w-2xl mx-auto mb-4 md:mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <motion.button
              className="p-2 md:p-3 bg-[#111111] border border-[#1F1F1F] rounded-lg hover:bg-[#1F1F1F] transition-all duration-200 text-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-[#2D8EFF] font-medium mb-1 text-xs md:text-sm">Today</div>
              <div className="text-[#CCCCCC] text-xs">
                {getTodayDisplay()}
              </div>
            </motion.button>
            <motion.button
              className="p-2 md:p-3 bg-[#111111] border border-[#1F1F1F] rounded-lg hover:bg-[#1F1F1F] transition-all duration-200 text-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-[#3AB54B] font-medium mb-1 text-xs md:text-sm">This Month</div>
              <div className="text-[#CCCCCC] text-xs">
                {getDaysInMonth(currentDateInType)} days
              </div>
            </motion.button>
            <motion.button
              className="p-2 md:p-3 bg-[#111111] border border-[#1F1F1F] rounded-lg hover:bg-[#1F1F1F] transition-all duration-200 text-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-[#FFD700] font-medium mb-1 text-xs md:text-sm">Year View</div>
              <div className="text-[#CCCCCC] text-xs">
                {getYear(currentDateInType)}
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* Calendar Container */}
        <motion.div 
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl backdrop-blur-sm p-3 md:p-4 shadow-2xl">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <motion.button
                onClick={() => navigateMonth('prev')}
                className="p-1.5 md:p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </motion.button>
              <motion.h2 
                className="text-base md:text-lg font-light text-white tracking-wide"
                key={`${getMonthName(currentDateInType)}-${getYear(currentDateInType)}-${calendarType}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {getMonthName(currentDateInType)} {getYear(currentDateInType)}
              </motion.h2>
              <motion.button
                onClick={() => navigateMonth('next')}
                className="p-1.5 md:p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </motion.button>
            </div>
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs md:text-sm font-medium text-[#CCCCCC] py-1"
                >
                  {day}
                </div>
              ))}
            </div>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 border border-[#1F1F1F] rounded-lg overflow-hidden">
              {calendarDays.map((day, index) => {
                const events = day ? getEventsForDay(day) : []
                const hasEvents = events.length > 0
                return (
                  <motion.div
                    key={index}
                    className={`
                      aspect-square flex flex-col items-center justify-center text-xs md:text-sm font-medium transition-all duration-200 border-r border-b border-[#1F1F1F]
                      ${day === null 
                        ? 'text-transparent cursor-default' 
                        : isToday(day)
                          ? 'bg-[#2D8EFF] text-black font-bold shadow-lg shadow-[#2D8EFF]/25'
                          : 'text-white hover:bg-white/10 cursor-pointer'
                      }
                      ${day !== null && !isToday(day) ? 'hover:scale-105' : ''}
                      ${(index + 1) % 7 === 0 ? 'border-r-0' : ''}
                      ${index >= 35 ? 'border-b-0' : ''}
                    `}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.01 }}
                    whileHover={day !== null && !isToday(day) ? { scale: 1.05 } : {}}
                    onClick={() => day && hasEvents && (() => { setSelectedDay(day); setShowModal(true); })()}
                  >
                    <span>{day}</span>
                    {/* Event indicator */}
                    {hasEvents && <span className="mt-1 w-2 h-2 rounded-full bg-[#FFD700]" />}
                  </motion.div>
                )
              })}
            </div>
            {/* Calendar Footer */}
            <div className="mt-2 md:mt-3 pt-2 border-t border-[#1F1F1F]">
              <div className="flex items-center justify-center gap-3 text-xs text-[#CCCCCC]">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-[#2D8EFF] rounded-full"></div>
                  <span>Today</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-white/10 rounded-full"></div>
                  <span>Available</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Event Modal */}
        {showModal && selectedDay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-[#18181b] border border-[#333] rounded-xl p-6 w-full max-w-md mx-auto relative">
              <button
                className="absolute top-3 right-3 text-white/60 hover:text-white"
                onClick={() => setShowModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-semibold mb-4 text-white">
                Events on {
                  calendarType === 'jalali' 
                    ? `${getMonthName(currentDateInType)} ${selectedDay}, ${getYear(currentDateInType)}`
                    : new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay).toLocaleDateString()
                }
              </h3>
              {loading ? (
                <div className="text-center py-8 text-white/60">Loading...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-400">{error}</div>
              ) : getEventsForDay(selectedDay).length === 0 ? (
                <div className="text-center py-8 text-white/60">No events for this day.</div>
              ) : (
                <ul className="space-y-4">
                  {getEventsForDay(selectedDay).map(event => (
                    <li key={event.id} className="bg-[#23232b] rounded-lg p-4 flex flex-col gap-2 border border-[#222]">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{event.title}</span>
                        <span className="text-xs px-2 py-1 rounded bg-[#FFD700] text-black ml-2">{event.category}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/70">
                        <Clock className="w-3 h-3" />
                        {event.time} ({event.duration}h)
                        <MapPin className="w-3 h-3 ml-4" />
                        {event.location}
                      </div>
                      <div className="text-xs text-white/60 mt-1">{event.description}</div>
                      <button
                        className="mt-2 self-end px-3 py-1 text-xs rounded bg-red-600 hover:bg-red-700 text-white transition"
                        disabled={removing === event.id}
                        onClick={() => handleRemoveEvent(event.id)}
                      >
                        {removing === event.id ? 'Removing...' : 'Remove'}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 