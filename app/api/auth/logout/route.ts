import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Get session token from cookie
    const sessionToken = cookies().get('session_token')?.value
    
    if (sessionToken) {
      // Delete session from database
      await supabase
        .from('sessions')
        .delete()
        .eq('token', sessionToken)
    }
    
    // Delete cookie
    const response = NextResponse.json({ message: 'Logged out successfully' })
    response.cookies.delete('session_token')
    
    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 