import { NextRequest, NextResponse } from 'next/server'
import { generateCsrfTokenWithCookie } from '@/lib/csrf'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Generate a new CSRF token
    const csrfToken = await generateCsrfTokenWithCookie()
    
    // Return the CSRF token in the response body
    const response = new NextResponse(JSON.stringify({ token: csrfToken }), {
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