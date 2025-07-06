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

    const { user_id, verification_notes } = await request.json()
    
    if (!user_id) {
      return NextResponse.json(
        { error: 'Missing user ID' },
        { status: 400 }
      )
    }

    // Check if user exists
    const { data: userExists } = await supabase
      .from('users')
      .select('id, is_verified')
      .eq('id', user_id)
      .single()

    if (!userExists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (userExists.is_verified) {
      return NextResponse.json(
        { error: 'User is already verified' },
        { status: 400 }
      )
    }

    // Update user verified status
    const { error: updateError } = await supabase
      .from('users')
      .update({ is_verified: true })
      .eq('id', user_id)

    if (updateError) {
      console.error('User verification error:', updateError)
      return NextResponse.json(
        { error: 'Failed to verify user' },
        { status: 500 }
      )
    }

    // Add verification record
    const { error: verificationError } = await supabase
      .from('user_verifications')
      .insert({
        user_id: user_id,
        verified_by: currentUser.id,
        verification_notes: verification_notes || null
      })

    if (verificationError) {
      console.error('Verification record error:', verificationError)
      // Don't return error here as the user is already verified
    }

    return NextResponse.json({ 
      message: 'User verified successfully' 
    })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 