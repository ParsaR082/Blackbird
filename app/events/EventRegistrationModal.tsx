'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { X, User, UserPlus, Mail, Phone, Building, MessageSquare, AlertCircle, CheckCircle, Clock } from 'lucide-react'

interface Event {
  id: string
  title: string
  date: string
  time: string
  location: string
  maxAttendees: number
  attendees: number
  status: string
}

interface EventRegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  event: Event
  onRegistrationSuccess: () => void
}

interface GuestInfo {
  fullName: string
  email: string
  phoneNumber: string
  company: string
  notes: string
}

export default function EventRegistrationModal({ 
  isOpen, 
  onClose, 
  event, 
  onRegistrationSuccess 
}: EventRegistrationModalProps) {
  const { user } = useAuth()
  const [registrationType, setRegistrationType] = useState<'user' | 'guest'>(user ? 'user' : 'guest')
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    fullName: '',
    email: '',
    phoneNumber: '',
    company: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const registrationData: any = {
        eventId: event.id,
        registrationType
      }

      if (registrationType === 'guest') {
        registrationData.guestInfo = guestInfo
      }

      const response = await fetch('/api/events/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData)
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(data.message)
        onRegistrationSuccess()
        // Close modal after 2 seconds
        setTimeout(() => {
          onClose()
          setSuccess(null)
        }, 2000)
      } else {
        setError(data.error || 'Registration failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGuestInfoChange = (field: keyof GuestInfo, value: string) => {
    setGuestInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const isFormValid = () => {
    if (registrationType === 'user') {
      return true // User is already authenticated
    }
    
    // Guest validation
    return guestInfo.fullName.trim() !== '' && 
           guestInfo.email.trim() !== '' && 
           guestInfo.phoneNumber.trim() !== ''
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
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
          onClick={onClose}
        />
        
        {/* Modal Content */}
        <motion.div
          className="relative bg-[#111111] border border-[#1F1F1F] rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        >
          {/* Close Button */}
          <motion.button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-4 h-4 text-white" />
          </motion.button>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-xl font-light text-white mb-2">Register for Event</h2>
            <p className="text-[#CCCCCC] text-sm">{event.title}</p>
            <p className="text-[#CCCCCC] text-xs">
              {new Date(event.date).toLocaleDateString()} at {event.time} • {event.location}
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <motion.div
              className="mb-4 p-3 bg-green-500/20 border border-green-500/40 rounded-lg flex items-center gap-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm">{success}</span>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg flex items-center gap-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-sm">{error}</span>
            </motion.div>
          )}

          {/* Registration Type Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-3">Registration Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRegistrationType('user')}
                disabled={!user}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  registrationType === 'user'
                    ? 'bg-[#2D8EFF]/20 border-[#2D8EFF]/40 text-[#2D8EFF]'
                    : 'bg-[#1F1F1F] border-[#333333] text-[#CCCCCC] hover:bg-[#333333]'
                } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <User className="w-4 h-4 mx-auto mb-1" />
                <span className="text-xs">Registered User</span>
                {!user && <span className="text-xs block text-red-400">Login Required</span>}
              </button>
              <button
                type="button"
                onClick={() => setRegistrationType('guest')}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  registrationType === 'guest'
                    ? 'bg-[#2D8EFF]/20 border-[#2D8EFF]/40 text-[#2D8EFF]'
                    : 'bg-[#1F1F1F] border-[#333333] text-[#CCCCCC] hover:bg-[#333333]'
                }`}
              >
                <UserPlus className="w-4 h-4 mx-auto mb-1" />
                <span className="text-xs">Guest</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* User Registration */}
            {registrationType === 'user' && user && (
              <div className="mb-6 p-4 bg-[#1F1F1F] rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-[#2D8EFF]" />
                  <span className="text-sm font-medium text-white">User Information</span>
                </div>
                <p className="text-[#CCCCCC] text-sm">Name: {user.fullName}</p>
                <p className="text-[#CCCCCC] text-sm">Email: {user.email}</p>
              </div>
            )}

            {/* Guest Registration Form */}
            {registrationType === 'guest' && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#CCCCCC]" />
                    <input
                      type="text"
                      required
                      value={guestInfo.fullName}
                      onChange={(e) => handleGuestInfoChange('fullName', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-[#1F1F1F] border border-[#333333] rounded-lg text-white placeholder-[#CCCCCC] focus:border-[#2D8EFF] focus:outline-none transition-colors duration-200"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#CCCCCC]" />
                    <input
                      type="email"
                      required
                      value={guestInfo.email}
                      onChange={(e) => handleGuestInfoChange('email', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-[#1F1F1F] border border-[#333333] rounded-lg text-white placeholder-[#CCCCCC] focus:border-[#2D8EFF] focus:outline-none transition-colors duration-200"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#CCCCCC]" />
                    <input
                      type="tel"
                      required
                      value={guestInfo.phoneNumber}
                      onChange={(e) => handleGuestInfoChange('phoneNumber', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-[#1F1F1F] border border-[#333333] rounded-lg text-white placeholder-[#CCCCCC] focus:border-[#2D8EFF] focus:outline-none transition-colors duration-200"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Company/Organization
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#CCCCCC]" />
                    <input
                      type="text"
                      value={guestInfo.company}
                      onChange={(e) => handleGuestInfoChange('company', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-[#1F1F1F] border border-[#333333] rounded-lg text-white placeholder-[#CCCCCC] focus:border-[#2D8EFF] focus:outline-none transition-colors duration-200"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Additional Notes
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-[#CCCCCC]" />
                    <textarea
                      value={guestInfo.notes}
                      onChange={(e) => handleGuestInfoChange('notes', e.target.value)}
                      rows={3}
                      className="w-full pl-10 pr-4 py-2 bg-[#1F1F1F] border border-[#333333] rounded-lg text-white placeholder-[#CCCCCC] focus:border-[#2D8EFF] focus:outline-none transition-colors duration-200 resize-none"
                      placeholder="Any special requirements or questions..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Capacity Warning */}
            {event.attendees >= event.maxAttendees * 0.9 && (
              <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/40 rounded-lg flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 text-sm">
                  {event.attendees >= event.maxAttendees 
                    ? 'Event is full. You will be added to the waitlist.'
                    : 'Limited spots available! Register quickly.'}
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <motion.button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-[#1F1F1F] hover:bg-[#333333] text-[#CCCCCC] rounded-lg font-medium transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                disabled={loading || !isFormValid()}
                className="flex-1 bg-[#2D8EFF] hover:bg-[#2D8EFF]/90 disabled:bg-[#2D8EFF]/50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                whileHover={!loading && isFormValid() ? { scale: 1.02 } : {}}
                whileTap={!loading && isFormValid() ? { scale: 0.98 } : {}}
              >
                {loading ? 'Registering...' : 'Register'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
} 