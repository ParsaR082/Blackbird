'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import BackgroundNodes from '@/components/BackgroundNodes'
import { 
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

export default function CalendarPage() {
  const [isMobile, setIsMobile] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [today] = useState(new Date())

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const calendarDays = generateCalendarDays()

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
                 {today.toLocaleDateString('default', { month: 'short', day: 'numeric' })}
               </div>
             </motion.button>

            <motion.button
              className="p-2 md:p-3 bg-[#111111] border border-[#1F1F1F] rounded-lg hover:bg-[#1F1F1F] transition-all duration-200 text-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-[#3AB54B] font-medium mb-1 text-xs md:text-sm">This Month</div>
              <div className="text-[#CCCCCC] text-xs">
                {getDaysInMonth(currentDate)} days
              </div>
            </motion.button>

            <motion.button
              className="p-2 md:p-3 bg-[#111111] border border-[#1F1F1F] rounded-lg hover:bg-[#1F1F1F] transition-all duration-200 text-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-[#FFD700] font-medium mb-1 text-xs md:text-sm">Year View</div>
              <div className="text-[#CCCCCC] text-xs">
                {getYear(currentDate)}
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
                key={`${getMonthName(currentDate)}-${getYear(currentDate)}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {getMonthName(currentDate)} {getYear(currentDate)}
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
              {calendarDays.map((day, index) => (
                <motion.div
                  key={index}
                  className={`
                    aspect-square flex items-center justify-center text-xs md:text-sm font-medium transition-all duration-200 border-r border-b border-[#1F1F1F]
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
                >
                  {day}
                </motion.div>
              ))}
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


      </div>
    </div>
  )
} 