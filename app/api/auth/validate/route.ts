import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/server-utils'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      )
    }

    // Return user data without sensitive information
    return NextResponse.json({
      id: user.id,
      student_id: user.student_id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      is_verified: user.is_verified,
      avatar_url: user.avatar_url
    })
  } catch (error) {
    console.error('Session validation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 