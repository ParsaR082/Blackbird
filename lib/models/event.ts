import mongoose from 'mongoose'

export interface IEvent {
  _id?: string
  title: string
  description: string
  detailDescription?: string
  date: Date
  time: string
  duration: number // in hours
  location: string
  category: 'workshops' | 'hackathons' | 'conferences' | 'networking'
  maxAttendees: number
  currentAttendees: number
  status: 'upcoming' | 'registration-open' | 'full' | 'completed' | 'cancelled'
  featured: boolean
  prerequisites: string[]
  whatYouWillLearn: string[]
  imageUrl?: string
  createdBy: string // Admin who created it
  isActive: boolean
  origin?: string // Source of the event (manual, bubot, etc.)
  createdAt: Date
  updatedAt: Date
}

export interface IEventRegistration {
  _id?: string
  eventId: string
  userId?: string // For registered users
  guestInfo?: {
    fullName: string
    email: string
    phoneNumber: string
    company?: string
    notes?: string
  }
  registrationType: 'user' | 'guest'
  status: 'registered' | 'waitlisted' | 'cancelled' | 'attended'
  registeredAt: Date
  cancelledAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface IEventStats {
  _id?: string
  eventId: string
  totalRegistrations: number
  userRegistrations: number
  guestRegistrations: number
  attendanceRate: number
  rating?: number
  feedback: {
    userId?: string
    guestEmail?: string
    rating: number
    comment: string
    submittedAt: Date
  }[]
  createdAt: Date
  updatedAt: Date
}

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  detailDescription: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
  },
  duration: {
    type: Number,
    required: true,
    min: 0.5,
    max: 72 // Maximum 3 days
  },
  location: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  category: {
    type: String,
    required: true,
    enum: ['workshops', 'hackathons', 'conferences', 'networking', 'study']
  },
  maxAttendees: {
    type: Number,
    required: true,
    min: 1
  },
  currentAttendees: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['upcoming', 'registration-open', 'full', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  featured: {
    type: Boolean,
    default: false
  },
  prerequisites: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  whatYouWillLearn: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  imageUrl: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  origin: {
    type: String,
    default: 'manual',
    trim: true,
    maxlength: 50
  }
}, {
  timestamps: true
})

const EventRegistrationSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function(this: any) { return this.registrationType === 'user' }
  },
  guestInfo: {
    fullName: {
      type: String,
      required: function(this: any) { return this.registrationType === 'guest' },
      trim: true,
      maxlength: 100
    },
    email: {
      type: String,
      required: function(this: any) { return this.registrationType === 'guest' },
      trim: true,
      lowercase: true
    },
    phoneNumber: {
      type: String,
      required: function(this: any) { return this.registrationType === 'guest' },
      trim: true
    },
    company: {
      type: String,
      trim: true,
      maxlength: 100
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500
    }
  },
  registrationType: {
    type: String,
    required: true,
    enum: ['user', 'guest']
  },
  status: {
    type: String,
    required: true,
    enum: ['registered', 'waitlisted', 'cancelled', 'attended'],
    default: 'registered'
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  cancelledAt: {
    type: Date
  }
}, {
  timestamps: true
})

const EventStatsSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
    unique: true
  },
  totalRegistrations: {
    type: Number,
    default: 0
  },
  userRegistrations: {
    type: Number,
    default: 0
  },
  guestRegistrations: {
    type: Number,
    default: 0
  },
  attendanceRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    guestEmail: {
      type: String,
      trim: true,
      lowercase: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
})

// Indexes for better performance
EventSchema.index({ category: 1, status: 1, isActive: 1 })
EventSchema.index({ date: 1, status: 1 })
EventSchema.index({ featured: 1, status: 1 })
EventSchema.index({ createdBy: 1 })
EventSchema.index({ title: 'text', description: 'text' })

EventRegistrationSchema.index({ eventId: 1, status: 1 })
EventRegistrationSchema.index({ userId: 1 })
EventRegistrationSchema.index({ 'guestInfo.email': 1 })
EventRegistrationSchema.index({ registeredAt: -1 })

EventStatsSchema.index({ eventId: 1 })

// Pre-save middleware to update event status based on attendees
EventSchema.pre('save', function(next) {
  if (this.currentAttendees >= this.maxAttendees) {
    this.status = 'full'
  } else if (this.status === 'full' && this.currentAttendees < this.maxAttendees) {
    this.status = 'registration-open'
  }
  
  // Auto-set detail description if not provided
  if (!this.detailDescription) {
    this.detailDescription = this.description
  }
  
  next()
})

// Virtual for checking if event is in the past
EventSchema.virtual('isPast').get(function() {
  const eventDateTime = new Date(this.date)
  const [hours, minutes] = this.time.split(':').map(Number)
  eventDateTime.setHours(hours, minutes)
  return eventDateTime < new Date()
})

// Virtual for time until event
EventSchema.virtual('timeUntilEvent').get(function() {
  const now = new Date()
  const eventDateTime = new Date(this.date)
  const [hours, minutes] = this.time.split(':').map(Number)
  eventDateTime.setHours(hours, minutes)
  
  const timeDiff = eventDateTime.getTime() - now.getTime()
  
  if (timeDiff <= 0) {
    return "Event has started"
  }
  
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
  const hoursLeft = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (days > 0) {
    return `Starts in ${days} day${days > 1 ? 's' : ''}, ${hoursLeft} hour${hoursLeft > 1 ? 's' : ''}`
  } else if (hoursLeft > 0) {
    return `Starts in ${hoursLeft} hour${hoursLeft > 1 ? 's' : ''}, ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}`
  } else {
    return `Starts in ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}`
  }
})

export const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema)
export const EventRegistration = mongoose.models.EventRegistration || mongoose.model<IEventRegistration>('EventRegistration', EventRegistrationSchema)
export const EventStats = mongoose.models.EventStats || mongoose.model<IEventStats>('EventStats', EventStatsSchema) 