'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import BackgroundNodes from '@/components/BackgroundNodes'
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
  Video
} from 'lucide-react'

export default function EventsPage() {
  const [isMobile, setIsMobile] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const eventCategories = [
    { id: 'all', label: 'All Events', icon: Globe, count: 24 },
    { id: 'workshops', label: 'Workshops', icon: Code, count: 8 },
    { id: 'hackathons', label: 'Hackathons', icon: Zap, count: 4 },
    { id: 'conferences', label: 'Conferences', icon: Mic, count: 6 },
    { id: 'networking', label: 'Networking', icon: Users, count: 6 }
  ]

  const upcomingEvents = [
    {
      id: 1,
      title: 'Neural Network Workshop',
      description: 'Deep dive into advanced neural network architectures and implementation',
      date: '2024-01-15',
      time: '14:00',
      duration: '3 hours',
      location: 'Virtual Reality Lab',
      category: 'workshops',
      attendees: 124,
      maxAttendees: 150,
      status: 'upcoming',
      featured: true
    },
    {
      id: 2,
      title: 'Quantum Computing Hackathon',
      description: '48-hour intensive hackathon exploring quantum algorithms',
      date: '2024-01-20',
      time: '09:00',
      duration: '48 hours',
      location: 'Innovation Center',
      category: 'hackathons',
      attendees: 89,
      maxAttendees: 100,
      status: 'registration-open',
      featured: true
    },
    {
      id: 3,
      title: 'AI Ethics Conference',
      description: 'Exploring the ethical implications of artificial intelligence',
      date: '2024-01-25',
      time: '10:00',
      duration: '6 hours',
      location: 'Main Auditorium',
      category: 'conferences',
      attendees: 267,
      maxAttendees: 300,
      status: 'upcoming',
      featured: false
    },
    {
      id: 4,
      title: 'Tech Startup Mixer',
      description: 'Connect with fellow entrepreneurs and innovators',
      date: '2024-01-30',
      time: '18:00',
      duration: '2 hours',
      location: 'Rooftop Lounge',
      category: 'networking',
      attendees: 156,
      maxAttendees: 200,
      status: 'registration-open',
      featured: false
    }
  ]

  const pastEvents = [
    {
      title: 'Blockchain Fundamentals',
      date: '2024-01-05',
      attendees: 142,
      rating: 4.8
    },
    {
      title: 'React Masterclass',
      date: '2024-01-10',
      attendees: 98,
      rating: 4.9
    },
    {
      title: 'Cybersecurity Summit',
      date: '2023-12-20',
      attendees: 234,
      rating: 4.7
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500/20 border-blue-500/40 text-blue-400'
      case 'registration-open': return 'bg-green-500/20 border-green-500/40 text-green-400'
      case 'full': return 'bg-red-500/20 border-red-500/40 text-red-400'
      default: return 'bg-white/10 border-white/20 text-white/60'
    }
  }

  const filteredEvents = selectedCategory === 'all' 
    ? upcomingEvents 
    : upcomingEvents.filter(event => event.category === selectedCategory)

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Interactive Background */}
      <BackgroundNodes isMobile={isMobile} />
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen px-4 py-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <motion.div 
              className="p-4 rounded-full bg-black/90 border border-white/30 backdrop-blur-sm"
              whileHover={{ scale: 1.1, boxShadow: '0 0 25px rgba(255,255,255,0.4)' }}
              transition={{ duration: 0.3 }}
            >
              <Calendar className="w-8 h-8 text-white" />
            </motion.div>
          </div>
          <h1 className="text-3xl font-light text-white tracking-wide mb-2">
            Event Portal
          </h1>
          <p className="text-sm text-white/60 max-w-md mx-auto">
            Immersive technology events and collaborative learning experiences
          </p>
        </motion.div>

        {/* Event Categories */}
        <motion.div 
          className="max-w-4xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex flex-wrap justify-center gap-4">
            {eventCategories.map((category, index) => (
              <motion.button
                key={category.id}
                className={`group relative cursor-pointer px-6 py-3 bg-black/90 border rounded-full backdrop-blur-sm transition-all duration-300 ${
                  selectedCategory === category.id 
                    ? 'border-white/60 bg-black/95' 
                    : 'border-white/30 hover:border-white/50'
                }`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.id)}
              >
                <div className="flex items-center gap-2">
                  <category.icon className="w-4 h-4 text-white" />
                  <span className="text-sm text-white">{category.label}</span>
                  <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded-full">
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
            <div className="bg-black/90 border border-white/30 rounded-lg backdrop-blur-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <Star className="w-5 h-5 text-white" />
                <h2 className="text-lg font-light text-white tracking-wide">Upcoming Events</h2>
              </div>
              
              <div className="space-y-4">
                {filteredEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    className="group p-4 bg-black/50 border border-white/20 rounded-lg hover:border-white/40 hover:bg-black/70 transition-all duration-300 cursor-pointer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-base font-medium text-white">{event.title}</h3>
                          {event.featured && (
                            <span className="px-2 py-1 bg-yellow-500/20 border border-yellow-500/40 rounded-full text-xs text-yellow-400">
                              FEATURED
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(event.status)}`}>
                            {event.status.replace('-', ' ').toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-white/70 mb-3">{event.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-white/60">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(event.date).toLocaleDateString()}
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
                      </div>
                      <div className="flex flex-col gap-2">
                        <motion.button
                          className="px-6 py-2 bg-white/10 border border-white/30 rounded-lg text-white hover:bg-white/20 hover:border-white/60 transition-all duration-300 text-sm"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Register
                        </motion.button>
                        <motion.button
                          className="px-6 py-2 bg-white/5 border border-white/20 rounded-lg text-white/70 hover:bg-white/10 hover:border-white/40 transition-all duration-300 text-sm"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Details
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
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
            <div className="bg-black/90 border border-white/30 rounded-lg backdrop-blur-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-5 h-5 text-white" />
                <h3 className="text-lg font-light text-white tracking-wide">Event Stats</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">Events Attended</span>
                  <span className="text-sm font-light text-white">47</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">Hours Learned</span>
                  <span className="text-sm font-light text-white">156</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">Certificates</span>
                  <span className="text-sm font-light text-white">23</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">Network Size</span>
                  <span className="text-sm font-light text-white">234</span>
                </div>
              </div>
            </div>

            {/* Past Events */}
            <div className="bg-black/90 border border-white/30 rounded-lg backdrop-blur-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-5 h-5 text-white" />
                <h3 className="text-lg font-light text-white tracking-wide">Recent Events</h3>
              </div>
              <div className="space-y-3">
                {pastEvents.map((event, index) => (
                  <motion.div 
                    key={event.title}
                    className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-all duration-300"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-light text-white">{event.title}</p>
                      <p className="text-xs text-white/50">{new Date(event.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/60">{event.attendees} attended</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400" />
                        <span className="text-xs text-yellow-400">{event.rating}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-black/90 border border-white/30 rounded-lg backdrop-blur-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-5 h-5 text-white" />
                <h3 className="text-lg font-light text-white tracking-wide">Quick Actions</h3>
              </div>
              <div className="space-y-3">
                <motion.button
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white hover:bg-white/20 hover:border-white/60 transition-all duration-300 text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Create Event
                </motion.button>
                <motion.button
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white hover:bg-white/20 hover:border-white/60 transition-all duration-300 text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  My Calendar
                </motion.button>
                <motion.button
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white hover:bg-white/20 hover:border-white/60 transition-all duration-300 text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
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
          <div className="flex items-center space-x-2 text-white/40 text-xs">
            <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse" />
            <span>Event Network Active</span>
            <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
        </motion.div>
      </div>
    </div>
  )
} 