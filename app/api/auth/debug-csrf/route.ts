import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()
    
    // Get request headers for debugging
    const headers = Object.fromEntries(request.headers.entries())
    
    return NextResponse.json({
      environment: {
        nodeEnv: process.env.NODE_ENV,
        csrfSecret: process.env.CSRF_SECRET ? 'SET' : 'NOT_SET',
        forceSecure: process.env.FORCE_SECURE_COOKIES
      },
      request: {
        url: request.url,
        method: request.method,
        headers: {
          host: headers.host,
          'x-forwarded-for': headers['x-forwarded-for'],
          'x-forwarded-proto': headers['x-forwarded-proto'],
          'x-forwarded-host': headers['x-forwarded-host'],
          'user-agent': headers['user-agent'],
          cookie: headers.cookie
        }
      },
      cookies: {
        count: allCookies.length,
        names: allCookies.map(c => c.name),
        details: allCookies.map(c => ({
          name: c.name,
          hasValue: !!c.value,
          valueLength: c.value?.length || 0
        }))
      },
      csrfCookie: {
        exists: !!cookieStore.get('csrf_token'),
        value: cookieStore.get('csrf_token')?.value?.substring(0, 8) + '...' || 'NOT_FOUND'
      }
    })
  } catch (error) {
    console.error('Debug CSRF error:', error)
    return NextResponse.json(
      { error: 'Debug failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}