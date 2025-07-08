'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
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
  Mic,
  Archive,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface ArchivedEvent {
  id: number
  title: string
  description: string
  detailDescription?: string
  date: string
  time: string
  duration: string
  location: string
  category: string
  tags: string[]
  attendees: number
  rating: number
  featured: boolean
}

export default function EventArchive() {
  const [expandedCard, setExpandedCard] = useState<number | null>(null)

  // Sample archived events data - sorted from most recent to oldest
  const archivedEvents: ArchivedEvent[] = [
    {
      id: 1,
      title: 'React Masterclass',
      description: 'Advanced React patterns and performance optimization techniques',
      detailDescription: 'An intensive deep-dive into React\'s most advanced patterns, including custom hooks, context optimization, and performance monitoring. Participants built a real-world application using cutting-edge React features.',
      date: '2026-01-10',
      time: '14:00',
      duration: '4 hours',
      location: 'Virtual Reality Lab',
      category: 'workshops',
      tags: ['Workshop', 'Featured', 'Frontend'],
      attendees: 98,
      rating: 4.9,
      featured: true
    },
    {
      id: 2,
      title: 'Blockchain Fundamentals',
      description: 'Introduction to blockchain technology and cryptocurrency development',
      detailDescription: 'A comprehensive introduction to blockchain technology, covering consensus mechanisms, smart contracts, and decentralized applications. Students built their first DApp using Ethereum and Solidity.',
      date: '2026-01-05',
      time: '10:00',
      duration: '6 hours',
      location: 'Innovation Center',
      category: 'workshops',
      tags: ['Workshop', 'Blockchain', 'Web3'],
      attendees: 142,
      rating: 4.8,
      featured: false
    },
    {
      id: 3,
      title: 'Cybersecurity Summit',
      description: 'Latest trends in cybersecurity and ethical hacking',
      detailDescription: 'Industry experts shared insights on current cybersecurity threats, defense strategies, and ethical hacking methodologies. Interactive sessions included penetration testing workshops and security audit demonstrations.',
      date: '2025-12-20',
      time: '09:00',
      duration: '8 hours',
      location: 'Main Auditorium',
      category: 'conferences',
      tags: ['Conference', 'Security', 'Networking'],
      attendees: 234,
      rating: 4.7,
      featured: true
    },
    {
      id: 4,
      title: 'Machine Learning Bootcamp',
      description: 'Hands-on ML model development and deployment',
      detailDescription: 'A practical bootcamp covering machine learning fundamentals, model training, and deployment strategies. Participants worked with real datasets and deployed models to production environments.',
      date: '2025-12-15',
      time: '13:00',
      duration: '5 hours',
      location: 'AI Research Lab',
      category: 'workshops',
      tags: ['Workshop', 'AI', 'Python'],
      attendees: 87,
      rating: 4.6,
      featured: false
    },
    {
      id: 5,
      title: 'Startup Pitch Competition',
      description: 'Annual startup competition with venture capital judging',
      detailDescription: 'Entrepreneurs presented their innovative ideas to a panel of venture capitalists and industry leaders. Winners received funding opportunities and mentorship programs.',
      date: '2025-12-10',
      time: '18:00',
      duration: '3 hours',
      location: 'Exhibition Hall',
      category: 'networking',
      tags: ['Competition', 'Startup', 'Networking'],
      attendees: 156,
      rating: 4.5,
      featured: true
    },
    {
      id: 6,
      title: 'DevOps Automation Workshop',
      description: 'CI/CD pipelines and infrastructure as code',
      detailDescription: 'Learn to build robust DevOps pipelines using modern tools like Docker, Kubernetes, and Terraform. Hands-on labs covered automated testing, deployment strategies, and monitoring solutions.',
      date: '2025-12-05',
      time: '11:00',
      duration: '6 hours',
      location: 'Cloud Computing Lab',
      category: 'workshops',
      tags: ['Workshop', 'DevOps', 'Cloud'],
      attendees: 76,
      rating: 4.4,
      featured: false
    },
    {
      id: 7,
      title: 'UX Design Symposium',
      description: 'User experience design principles and emerging trends',
      detailDescription: 'Design professionals shared insights on user-centered design, accessibility, and emerging UX trends. Interactive workshops included prototyping sessions and usability testing methodologies.',
      date: '2025-11-28',
      time: '10:30',
      duration: '7 hours',
      location: 'Design Studio',
      category: 'conferences',
      tags: ['Conference', 'Design', 'UX'],
      attendees: 123,
      rating: 4.7,
      featured: false
    },
    {
      id: 8,
      title: 'Quantum Computing Intro',
      description: 'Introduction to quantum computing concepts and applications',
      detailDescription: 'Explore the fascinating world of quantum computing, from basic quantum mechanics to practical applications. Participants got hands-on experience with quantum simulators and real quantum hardware.',
      date: '2025-11-22',
      time: '15:00',
      duration: '4 hours',
      location: 'Physics Department',
      category: 'workshops',
      tags: ['Workshop', 'Quantum', 'Advanced'],
      attendees: 45,
      rating: 4.8,
      featured: true
    }
  ]

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'workshops': return Code
      case 'hackathons': return Zap
      case 'conferences': return Mic
      case 'networking': return Users
      default: return Globe
    }
  }

  const getTagColor = (tag: string) => {
    switch (tag.toLowerCase()) {
      case 'featured': return 'bg-[#5C4B00] text-[#FFD700] border-[#FFD700]/20'
      case 'workshop': return 'bg-[#2D8EFF]/20 text-[#2D8EFF] border-[#2D8EFF]/30'
      case 'conference': return 'bg-[#8B5CF6]/20 text-[#8B5CF6] border-[#8B5CF6]/30'
      case 'hackathon': return 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30'
      case 'networking': return 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30'
      case 'competition': return 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30'
      default: return 'bg-[#6B7280]/20 text-[#6B7280] border-[#6B7280]/30'
    }
  }

  const toggleCardExpansion = (eventId: number) => {
    setExpandedCard(expandedCard === eventId ? null : eventId)
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white p-6">
      {/* Header */}
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex items-center justify-center gap-4 mb-4">
          <motion.div 
            className="p-4 rounded-full bg-[#222222] border border-[#2A2A2A]"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          >
            <Archive className="w-8 h-8 text-white" />
          </motion.div>
        </div>
        <h1 className="text-3xl font-light text-white tracking-wide mb-2">
          Event Archive
        </h1>
        <p className="text-sm text-[#BBBBBB] max-w-md mx-auto">
          Browse through our collection of past events and learning experiences
        </p>
      </motion.div>

      {/* Events Grid */}
      <motion.div 
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {archivedEvents.map((event, index) => {
            const CategoryIcon = getCategoryIcon(event.category)
            const isExpanded = expandedCard === event.id
            
            return (
              <motion.div
                key={event.id}
                className="bg-[#222222] border border-[#2A2A2A] rounded-lg p-6 hover:shadow-lg hover:shadow-black/20 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                onClick={() => toggleCardExpansion(event.id)}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#2D8EFF]/20 rounded-lg">
                      <CategoryIcon className="w-4 h-4 text-[#2D8EFF]" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-[#6B7280]/20 text-[#6B7280] border border-[#6B7280]/30 rounded-full text-xs font-medium">
                        ARCHIVED
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-[#FFD700]" />
                    <span className="text-sm text-[#FFD700]">{event.rating}</span>
                  </div>
                </div>

                {/* Event Title */}
                <h3 className="text-lg font-medium text-white mb-2">{event.title}</h3>

                {/* Event Description */}
                <p className="text-sm text-[#BBBBBB] mb-4 line-clamp-2">{event.description}</p>

                {/* Event Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-[#BBBBBB]">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#BBBBBB]">
                    <Clock className="w-3 h-3" />
                    <span>{event.time} ({event.duration})</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#BBBBBB]">
                    <MapPin className="w-3 h-3" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#BBBBBB]">
                    <Users className="w-3 h-3" />
                    <span>{event.attendees} attendees</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {event.tags.map((tag, tagIndex) => (
                    <span 
                      key={tagIndex}
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getTagColor(tag)}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Expanded Content */}
                {isExpanded && event.detailDescription && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-[#2A2A2A] pt-4 mt-4"
                  >
                    <p className="text-sm text-[#BBBBBB] leading-relaxed">
                      {event.detailDescription}
                    </p>
                  </motion.div>
                )}

                {/* Expand/Collapse Indicator */}
                <div className="flex items-center justify-center mt-4 pt-2 border-t border-[#2A2A2A]">
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#BBBBBB]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#BBBBBB]" />
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Footer Stats */}
      <motion.div 
        className="max-w-6xl mx-auto mt-12 pt-8 border-t border-[#2A2A2A]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-[#222222] border border-[#2A2A2A] rounded-lg p-4">
            <div className="text-2xl font-light text-white mb-1">
              {archivedEvents.length}
            </div>
            <div className="text-xs text-[#BBBBBB]">Total Events</div>
          </div>
          <div className="bg-[#222222] border border-[#2A2A2A] rounded-lg p-4">
            <div className="text-2xl font-light text-white mb-1">
              {archivedEvents.reduce((sum, event) => sum + event.attendees, 0)}
            </div>
            <div className="text-xs text-[#BBBBBB]">Total Attendees</div>
          </div>
          <div className="bg-[#222222] border border-[#2A2A2A] rounded-lg p-4">
            <div className="text-2xl font-light text-white mb-1">
              {(archivedEvents.reduce((sum, event) => sum + event.rating, 0) / archivedEvents.length).toFixed(1)}
            </div>
            <div className="text-xs text-[#BBBBBB]">Average Rating</div>
          </div>
          <div className="bg-[#222222] border border-[#2A2A2A] rounded-lg p-4">
            <div className="text-2xl font-light text-white mb-1">
              {archivedEvents.filter(event => event.featured).length}
            </div>
            <div className="text-xs text-[#BBBBBB]">Featured Events</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 