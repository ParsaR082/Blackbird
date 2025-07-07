import { NextRequest, NextResponse } from 'next/server'
import { generateCsrfTokenWithCookie } from '@/lib/csrf'

export async function GET(request: NextRequest) {
  try {
    // Generate a new CSRF token
    const csrfToken = await generateCsrfTokenWithCookie()
    
    // Return an empty response with the CSRF token in the header
    const response = new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken
      }
    })
    
    return response
  } catch (error) {
    console.error('CSRF token generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    )
  }
} 