import mongoose from 'mongoose'

// Assistant Usage Tracking Schema
const AssistantUsageSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true,
    index: true
  },
  tokensUsed: {
    type: Number,
    default: 0
  },
  interactionCount: {
    type: Number,
    default: 0
  },
  lastInteraction: {
    type: Date,
    default: Date.now
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  lockExpiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
})

// Compound index for efficient queries
AssistantUsageSchema.index({ userId: 1, date: 1 }, { unique: true })

// Assistant Access Control Schema
const AssistantAccessSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: String, // Admin user ID
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  reason: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
})

export const AssistantUsage = mongoose.models.AssistantUsage || mongoose.model('AssistantUsage', AssistantUsageSchema)
export const AssistantAccess = mongoose.models.AssistantAccess || mongoose.model('AssistantAccess', AssistantAccessSchema)

// Constants
export const DAILY_TOKEN_LIMIT = 20000
export const LOCKOUT_DURATION_HOURS = 24

// Helper functions
export const getTodayString = () => {
  return new Date().toISOString().split('T')[0]
}

export const isUserLocked = (usage: any) => {
  if (!usage.isLocked) return false
  if (!usage.lockExpiresAt) return false
  return new Date() < usage.lockExpiresAt
}

export const getRemainingTokens = (usage: any) => {
  return Math.max(0, DAILY_TOKEN_LIMIT - usage.tokensUsed)
} 