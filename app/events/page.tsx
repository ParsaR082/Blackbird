'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import BackgroundNodes from '@/components/BackgroundNodes'
import CreateEventModal from './CreateEventModal'
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
  X
} from 'lucide-react'

export default function EventsPage() {
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

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
      detailDescription: 'Join us for an intensive hands-on workshop where you\'ll build neural networks from scratch. We\'ll cover everything from basic perceptrons to complex deep learning architectures. Perfect for developers looking to understand the fundamentals behind modern AI systems.',
      date: '2026-01-15',
      time: '14:00',
      duration: '3 hours',
      location: 'Virtual Reality Lab',
      category: 'workshops',
      attendees: 124,
      maxAttendees: 150,
      status: 'upcoming',
      featured: true,
      prerequisites: ['Basic Python knowledge', 'Understanding of linear algebra'],
      whatYouWillLearn: ['Neural network fundamentals', 'Backpropagation algorithm', 'TensorFlow implementation', 'Model optimization techniques']
    },
    {
      id: 2,
      title: 'Quantum Computing Hackathon',
      description: '48-hour intensive hackathon exploring quantum algorithms',
      detailDescription: 'Ready to dive into the quantum realm? This hackathon brings together brilliant minds to tackle real-world problems using quantum computing. Teams will work on cutting-edge quantum algorithms and compete for amazing prizes.',
      date: '2026-01-20',
      time: '09:00',
      duration: '48 hours',
      location: 'Innovation Center',
      category: 'hackathons',
      attendees: 89,
      maxAttendees: 100,
      status: 'registration-open',
      featured: true,
      prerequisites: ['Basic quantum mechanics understanding', 'Programming experience'],
      whatYouWillLearn: ['Quantum algorithm design', 'Qiskit framework', 'Quantum error correction', 'Real quantum hardware access']
    },
    {
      id: 3,
      title: 'AI Ethics Conference',
      description: 'Exploring the ethical implications of artificial intelligence',
      detailDescription: 'As AI becomes more prevalent, ethical considerations become crucial. This conference brings together ethicists, technologists, and policy makers to discuss responsible AI development and deployment in our society.',
      date: '2026-01-25',
      time: '10:00',
      duration: '6 hours',
      location: 'Main Auditorium',
      category: 'conferences',
      attendees: 267,
      maxAttendees: 300,
      status: 'upcoming',
      featured: false,
      prerequisites: ['None - open to all'],
      whatYouWillLearn: ['AI bias detection', 'Ethical AI frameworks', 'Policy implications', 'Industry best practices']
    },
    {
      id: 4,
      title: 'Tech Startup Mixer',
      description: 'Connect with fellow entrepreneurs and innovators',
      detailDescription: 'Network with like-minded entrepreneurs, investors. Share ideas, find co-founders, and discover opportunities in the thriving tech startup ecosystem.',
      date: '2026-01-30',
      time: '18:00',
      duration: '2 hours',
      location: 'not determined',
      category: 'networking',
      attendees: 156,
      maxAttendees: 200,
      status: 'registration-open',
      featured: false,
      prerequisites: ['None - all welcome'],
      whatYouWillLearn: ['Networking strategies', 'Pitch techniques', 'Funding insights', 'Industry connections']
    }
  ]

  const pastEvents = [
    {
      title: 'Blockchain Fundamentals',
      date: '2026-01-05',
      attendees: 142,
      rating: 4.8
    },
    {
      title: 'React Masterclass',
      date: '2026-01-10',
      attendees: 98,
      rating: 4.9
    },
    {
      title: 'Cybersecurity Summit',
      date: '2026-12-20',
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

  const openModal = (event: any) => {
    setSelectedEvent(event)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedEvent(null)
  }

  const filteredEvents = selectedCategory === 'all' 
    ? upcomingEvents 
    : upcomingEvents.filter(event => event.category === selectedCategory)

  // Helper function to calculate time until event
  const getTimeUntilEvent = (eventDate: string, eventTime: string) => {
    const now = new Date()
    const eventDateTime = new Date(`${eventDate}T${eventTime}`)
    const timeDiff = eventDateTime.getTime() - now.getTime()
    
    if (timeDiff <= 0) {
      return "Event has started"
    }
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) {
      return `Starts in ${days} day${days > 1 ? 's' : ''}, ${hours} hour${hours > 1 ? 's' : ''}`
    } else if (hours > 0) {
      return `Starts in ${hours} hour${hours > 1 ? 's' : ''}, ${minutes} minute${minutes > 1 ? 's' : ''}`
    } else {
      return `Starts in ${minutes} minute${minutes > 1 ? 's' : ''}`
    }
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
              <p className="text-[#CCCCCC] text-sm">{new Date(selectedEvent.date).toLocaleDateString()}</p>
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
            <motion.button
              className="flex-1 bg-[#2D8EFF] hover:bg-[#2D8EFF]/90 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Register Now
            </motion.button>
            <motion.button
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
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Interactive Background */}
      <BackgroundNodes isMobile={isMobile} />
      
      {/* Modal */}
      {isModalOpen && <EventModal />}
      
      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={(eventData) => {
          console.log('New event created:', eventData)
          // TODO: Add event creation logic here
          setIsCreateModalOpen(false)
        }}
      />
      
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
          className="max-w-6xl mx-auto mb-12 px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex flex-wrap sm:flex-nowrap justify-center sm:justify-center gap-3 sm:gap-4 overflow-x-auto scrollbar-hide">
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
                        <div className="text-xs text-white/50 mt-2">
                          {getTimeUntilEvent(event.date, event.time)}
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
                          onClick={() => openModal(event)}
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
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  Create Event
                </motion.button>
                <motion.button
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white hover:bg-white/20 hover:border-white/60 transition-all duration-300 text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/calendar')}
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