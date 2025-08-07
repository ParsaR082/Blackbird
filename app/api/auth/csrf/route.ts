import { NextRequest, NextResponse } from 'next/server'
import { generateCsrfTokenWithCookie } from '@/lib/csrf'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('[CSRF Route] Generating new CSRF token')
    console.log('[CSRF Route] Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      FORCE_SECURE_COOKIES: process.env.FORCE_SECURE_COOKIES
    })
    
    // Generate a new CSRF token
    const csrfToken = await generateCsrfTokenWithCookie()
    
    console.log('[CSRF Route] Token generated successfully, length:', csrfToken.length)
    
    // Return the CSRF token in the response body
    const response = new NextResponse(JSON.stringify({ token: csrfToken }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
        // Add cache control headers to prevent caching
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
    console.log('[CSRF Route] Response created with token in body and header')
    return response
  } catch (error) {
    console.error('CSRF token generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate CSRF token', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}