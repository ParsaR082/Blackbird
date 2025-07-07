'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, MapPin, Clock, Tag, Star, Users, Zap, Hash, User } from 'lucide-react'

interface CreateEventModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (eventData: any) => void
}

export default function CreateEventModal({ isOpen, onClose, onSubmit }: CreateEventModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    datetime: '',
    duration: '',
    maxAttendees: '',
    location: '',
    category: '',
    tags: {
      featured: false,
      upcoming: false,
      registrationOpen: false
    }
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: {
        ...prev.tags,
        [tag]: !prev.tags[tag as keyof typeof prev.tags]
      }
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Log the complete event object
    console.log('Event created:', formData)
    
    if (onSubmit) {
      onSubmit(formData)
    }
    // Reset form
    setFormData({
      title: '',
      description: '',
      datetime: '',
      duration: '',
      maxAttendees: '',
      location: '',
      category: '',
      tags: {
        featured: false,
        upcoming: false,
        registrationOpen: false
      }
    })
    onClose()
  }

  const handleCancel = () => {
    // Reset form
    setFormData({
      title: '',
      description: '',
      datetime: '',
      duration: '',
      maxAttendees: '',
      location: '',
      category: '',
      tags: {
        featured: false,
        upcoming: false,
        registrationOpen: false
      }
    })
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Background Overlay */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal Content */}
          <motion.div
            className="relative bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-5 max-w-2xl w-full max-h-[95vh] overflow-y-auto"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#3498DB]/20 rounded-lg">
                  <Calendar className="w-5 h-5 text-[#3498DB]" />
                </div>
                <h2 className="text-xl font-light text-white">Create New Event</h2>
              </div>
              <motion.button
                onClick={onClose}
                className="w-8 h-8 bg-[#555555] hover:bg-[#777777] rounded-full flex items-center justify-center transition-all duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4 text-white" />
              </motion.button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Event Title */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Event Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-4 py-2 bg-[#222222] border border-[#2A2A2A] rounded-lg text-white placeholder-[#BBBBBB] focus:outline-none focus:ring-2 focus:ring-[#3498DB] focus:border-transparent transition-all duration-200"
                  placeholder="Enter event title..."
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-[#222222] border border-[#2A2A2A] rounded-lg text-white placeholder-[#BBBBBB] focus:outline-none focus:ring-2 focus:ring-[#3498DB] focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Describe your event..."
                  required
                />
              </div>

              {/* Date & Time and Duration Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date & Time */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Date & Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#BBBBBB]" />
                    <input
                      type="datetime-local"
                      value={formData.datetime}
                      onChange={(e) => handleInputChange('datetime', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-[#222222] border border-[#2A2A2A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#3498DB] focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Duration (hours)
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#BBBBBB]" />
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-[#222222] border border-[#2A2A2A] rounded-lg text-white placeholder-[#BBBBBB] focus:outline-none focus:ring-2 focus:ring-[#3498DB] focus:border-transparent transition-all duration-200"
                      placeholder="Enter duration..."
                      min="0"
                      step="0.5"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Location, Max Attendees, and Category Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#BBBBBB]" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-[#222222] border border-[#2A2A2A] rounded-lg text-white placeholder-[#BBBBBB] focus:outline-none focus:ring-2 focus:ring-[#3498DB] focus:border-transparent transition-all duration-200"
                      placeholder="Enter location..."
                      required
                    />
                  </div>
                </div>

                {/* Max Attendees */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Max Attendees
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#BBBBBB]" />
                    <input
                      type="number"
                      value={formData.maxAttendees}
                      onChange={(e) => handleInputChange('maxAttendees', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-[#222222] border border-[#2A2A2A] rounded-lg text-white placeholder-[#BBBBBB] focus:outline-none focus:ring-2 focus:ring-[#3498DB] focus:border-transparent transition-all duration-200"
                      placeholder="Max attendees..."
                      min="1"
                      required
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-4 py-2 bg-[#222222] border border-[#2A2A2A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#3498DB] focus:border-transparent transition-all duration-200"
                    required
                  >
                    <option value="">Select category...</option>
                    <option value="Workshops">Workshops</option>
                    <option value="Hackathons">Hackathons</option>
                    <option value="Conferences">Conferences</option>
                    <option value="Networking">Networking</option>
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Event Tags
                  </div>
                </label>
                <div className="flex flex-wrap gap-2">
                  {/* Featured */}
                  <motion.label
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-all duration-200 ${
                      formData.tags.featured
                        ? 'bg-[#FFD700]/20 border-[#FFD700] text-[#FFD700]'
                        : 'bg-[#222222] border-[#2A2A2A] text-[#BBBBBB] hover:border-[#FFD700]/50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.tags.featured}
                      onChange={() => handleTagToggle('featured')}
                      className="hidden"
                    />
                    <Star className="w-4 h-4" />
                    <span className="text-sm font-medium">Featured</span>
                  </motion.label>

                  {/* Upcoming */}
                  <motion.label
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-all duration-200 ${
                      formData.tags.upcoming
                        ? 'bg-[#2D8EFF]/20 border-[#2D8EFF] text-[#2D8EFF]'
                        : 'bg-[#222222] border-[#2A2A2A] text-[#BBBBBB] hover:border-[#2D8EFF]/50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.tags.upcoming}
                      onChange={() => handleTagToggle('upcoming')}
                      className="hidden"
                    />
                    <Zap className="w-4 h-4" />
                    <span className="text-sm font-medium">Upcoming</span>
                  </motion.label>

                  {/* Registration Open */}
                  <motion.label
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-all duration-200 ${
                      formData.tags.registrationOpen
                        ? 'bg-[#3AB54B]/20 border-[#3AB54B] text-[#3AB54B]'
                        : 'bg-[#222222] border-[#2A2A2A] text-[#BBBBBB] hover:border-[#3AB54B]/50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.tags.registrationOpen}
                      onChange={() => handleTagToggle('registrationOpen')}
                      className="hidden"
                    />
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">Registration Open</span>
                  </motion.label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <motion.button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 bg-[#555555] hover:bg-[#777777] text-white rounded-lg font-medium transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  className="px-6 py-2 bg-[#3498DB] hover:bg-[#5DADE2] text-white rounded-lg font-medium transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Create Event
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 