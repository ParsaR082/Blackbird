import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/server-utils'

export async function POST(request: NextRequest) {
  try {
    // Verify the current user is an admin
    const currentUser = await getUserFromRequest(request)
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { user_id } = await request.json()
    
    if (!user_id) {
      return NextResponse.json(
        { error: 'Missing user ID' },
        { status: 400 }
      )
    }

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', user_id)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.role === 'admin') {
      return NextResponse.json(
        { error: 'User is already an admin' },
        { status: 400 }
      )
    }

    // Update user role to admin
    const { error: updateError } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', user_id)

    if (updateError) {
      console.error('Admin promotion error:', updateError)
      return NextResponse.json(
        { error: 'Failed to promote user to admin' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'User promoted to admin successfully' 
    })
  } catch (error) {
    console.error('Admin promotion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 