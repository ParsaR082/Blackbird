import mongoose from 'mongoose'

export interface IHallOfFameEntry {
  _id?: string
  userId: string // Reference to User
  title: string // Admin-set title like "AI Pioneer"
  achievement: string // Admin-set achievement description
  category: 'Innovation' | 'Leadership' | 'Research' | 'Community'
  dateInducted: Date // When they were added to Hall of Fame
  yearAchieved: string // Year of the achievement (can be different from induction)
  addedBy: string // Admin who added them
  isActive: boolean // Can be temporarily disabled
  order: number // For custom ordering (lower number = higher rank)
  createdAt: Date
  updatedAt: Date
}

export interface IUserStats {
  _id?: string
  userId: string
  points: number
  contributions: number
  specialAchievements: string[]
  joinDate: Date
  tier: string // Current tier ID
  totalProjects: number
  totalCollaborations: number
  totalMentees: number
  industryRecognitions: string[]
  publications: string[]
  createdAt: Date
  updatedAt: Date
}

const HallOfFameSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // Each user can only be in Hall of Fame once
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  achievement: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    required: true,
    enum: ['Innovation', 'Leadership', 'Research', 'Community']
  },
  dateInducted: {
    type: Date,
    default: Date.now
  },
  yearAchieved: {
    type: String,
    required: true,
    match: /^\d{4}$/
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0 // 0 = highest rank
  }
}, {
  timestamps: true
})

const UserStatsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  points: {
    type: Number,
    default: 0,
    min: 0
  },
  contributions: {
    type: Number,
    default: 0,
    min: 0
  },
  specialAchievements: [{
    type: String,
    trim: true
  }],
  joinDate: {
    type: Date,
    default: Date.now
  },
  tier: {
    type: String,
    default: 'nestling'
  },
  totalProjects: {
    type: Number,
    default: 0,
    min: 0
  },
  totalCollaborations: {
    type: Number,
    default: 0,
    min: 0
  },
  totalMentees: {
    type: Number,
    default: 0,
    min: 0
  },
  industryRecognitions: [{
    type: String,
    trim: true
  }],
  publications: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
})

// Indexes for better query performance
HallOfFameSchema.index({ category: 1, order: 1 })
HallOfFameSchema.index({ dateInducted: -1 })
HallOfFameSchema.index({ isActive: 1, order: 1 })

UserStatsSchema.index({ points: -1 })
UserStatsSchema.index({ tier: 1 })
UserStatsSchema.index({ userId: 1 })

export const HallOfFame = mongoose.models.HallOfFame || mongoose.model<IHallOfFameEntry>('HallOfFame', HallOfFameSchema)
export const UserStats = mongoose.models.UserStats || mongoose.model<IUserStats>('UserStats', UserStatsSchema)

// Helper function to calculate years active
export function calculateYearsActive(joinDate: Date): number {
  const now = new Date()
  const diffInMs = now.getTime() - joinDate.getTime()
  const diffInYears = diffInMs / (1000 * 60 * 60 * 24 * 365.25)
  return Math.max(0, parseFloat(diffInYears.toFixed(2)))
} 