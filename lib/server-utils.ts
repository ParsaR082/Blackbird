import { cookies } from "next/headers"
import { supabase } from './supabase'
import { UserAuth } from '@/types'
import { NextRequest } from 'next/server'

/**
 * Gets the authenticated user from a request - SERVER SIDE ONLY
 */
export async function getUserFromRequest(request: NextRequest): Promise<UserAuth | null> {
  try {
    // Try to get the session token from cookie
    const sessionToken = cookies().get('session_token')?.value
    
    if (!sessionToken) {
      return null
    }
    
    // Find session in database
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('user_id, expires_at')
      .eq('token', sessionToken)
      .single()
    
    if (sessionError || !session) {
      return null
    }
    
    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      return null
    }
    
    // Get user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, student_id, username, full_name, role, is_verified, avatar_url')
      .eq('id', session.user_id)
      .single()
    
    if (userError || !user) {
      return null
    }
    
    return {
      id: user.id,
      student_id: user.student_id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      is_verified: user.is_verified,
      avatar_url: user.avatar_url
    }
  } catch (error) {
    console.error('Error getting user from request:', error)
    return null
  }
} 