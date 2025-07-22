import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { connectToDatabase } from './mongodb'
import mongoose from 'mongoose'

// Get user from request
export async function getUserFromRequest(request: NextRequest) {
  try {
    // Get session token from cookie
    const sessionToken = cookies().get('session_token')?.value

    if (!sessionToken) {
      return null
    }

    await connectToDatabase()

    // Define Session schema
    const SessionSchema = new mongoose.Schema({
      userId: String,
      token: String,
      expiresAt: Date,
      createdAt: Date
    })
    
    const Session = mongoose.models.Session || mongoose.model('Session', SessionSchema)

    // Find valid session
    const session = await Session.findOne({
      token: sessionToken,
      expiresAt: { $gt: new Date() }
    })

    if (!session) {
      return null
    }

    // Define User schema
    const UserSchema = new mongoose.Schema({
      email: String,
      password: String,
      fullName: String,
      role: String,
      isVerified: Boolean,
      avatarUrl: String,
      createdAt: Date,
      updatedAt: Date
    })
    
    const User = mongoose.models.User || mongoose.model('User', UserSchema)

    // Find user by session userId
    const user = await User.findById(session.userId)

    if (!user) {
      return null
    }

    // Return user data without sensitive information
    return {
      id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isVerified: user.isVerified,
      avatarUrl: user.avatarUrl
    }
  } catch (error) {
    console.error('Error getting user from request:', error)
    return null
  }
}

// Helper to check if user is admin
export async function validateAdmin(request: NextRequest) {
  const user = await getUserFromRequest(request)
  
  if (!user) {
    return { isValid: false, error: 'Unauthorized', status: 401 }
  }
  
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    return { isValid: false, error: 'Forbidden: Admin access required', status: 403 }
  }
  
  return { isValid: true, user: user }
}

// Helper to check if user is super admin
export async function validateSuperAdmin(request: NextRequest) {
  console.log('[Super Admin Validation] Starting validation')
  const user = await getUserFromRequest(request)
  console.log('[Super Admin Validation] User:', user ? { id: user.id, role: user.role } : 'null')
  
  if (!user) {
    console.log('[Super Admin Validation] No user found')
    return { isValid: false, error: 'Unauthorized', status: 401 }
  }
  
  if (user.role !== 'SUPER_ADMIN') {
    console.log('[Super Admin Validation] User is not super admin')
    return { isValid: false, error: 'Forbidden: Super Admin access required', status: 403 }
  }
  
  console.log('[Super Admin Validation] Super admin access confirmed')
  return { isValid: true, user: user }
}

// Check if a user is a super admin (for preventing role changes)
export async function isSuperAdmin(userId: string): Promise<boolean> {
  try {
    await connectToDatabase()
    
    const UserSchema = new mongoose.Schema({
      email: String,
      password: String,
      fullName: String,
      role: String,
      isVerified: Boolean,
      avatarUrl: String,
      createdAt: Date,
      updatedAt: Date
    })
    
    const User = mongoose.models.User || mongoose.model('User', UserSchema)
    const user = await User.findById(userId)
    
    return user?.role === 'SUPER_ADMIN'
  } catch (error) {
    console.error('Error checking super admin status:', error)
    return false
  }
}

// Format error response
export function formatErrorResponse(error: any) {
  return {
    success: false,
    error: error instanceof Error ? error.message : String(error)
  }
}

// Format success response
export function formatSuccessResponse(data: any = {}, message: string = 'Success') {
  return {
    success: true,
    message,
    ...data
  }
}

// Get pagination parameters from request
export function getPaginationParams(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const skip = (page - 1) * limit
  
  return { page, limit, skip }
}

// Get sort parameters from request
export function getSortParams(request: NextRequest, defaultSort: string = 'createdAt', defaultOrder: 'asc' | 'desc' = 'desc') {
  const { searchParams } = new URL(request.url)
  const sortField = searchParams.get('sort') || defaultSort
  const sortOrder = searchParams.get('order') === 'asc' ? 'asc' : defaultOrder
  
  return { sortField, sortOrder }
}

// Check if string is valid ObjectId
export function isValidObjectId(id: string) {
  return /^[0-9a-fA-F]{24}$/.test(id)
}

// Get client IP address
export function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for')
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  
  return request.ip || '0.0.0.0'
} 