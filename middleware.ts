import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/admin',
  '/profile',
  '/settings',
  '/training',
  '/university'
]

// Routes to exclude from authentication checks
const excludedRoutes = [
  '/api/admin/dmig991100293848'
]

// API routes that must be treated as dynamic (using cookies/headers)
const dynamicApiRoutes = [
  '/api/events',
  '/api/products',
  '/api/hall-of-fame',
  '/api/university',
  '/api/admin/analytics',
  '/api/admin/integration',
  '/api/admin/security',
  '/api/admin/university',
  '/api/admin/purchases',
  '/api/admin/optimization'
]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // For static generation/build time, skip validation
  const userAgent = req.headers.get('user-agent') || ''
  if (userAgent.includes('Node.js') && process.env.NODE_ENV === 'production' && 
      (dynamicApiRoutes.some(route => pathname.startsWith(route)))) {
    console.log(`[Middleware] Skipping validation for build-time request: ${pathname}`)
    return NextResponse.next()
  }

  // Skip authentication for excluded routes
  if (excludedRoutes.some(route => pathname === route)) {
    return NextResponse.next()
  }

  // Authentication Check for Protected Routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    // Get the session token from cookie
    const sessionToken = req.cookies.get('session_token')?.value
    const allCookies = req.cookies.getAll()
    
    console.log(`[Middleware] Checking ${pathname}, cookies:`, allCookies.map(c => ({ name: c.name, value: c.value ? `${c.value.substring(0, 8)}...` : null })))
    
    if (!sessionToken) {
      console.log(`[Middleware] No session token found, redirecting from ${pathname} to login`)
      // Redirect to login if no session token
      const url = new URL('/auth/login', req.url)
      url.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(url)
    }
    
    // Validate session token by calling the API
    try {
      // Use NEXTAUTH_URL in production, local origin in development
      const baseUrl =
        process.env.NODE_ENV === 'production'
          ? process.env.NEXTAUTH_URL || 'https://blackbird-production.up.railway.app'
          : new URL('/', req.url).origin
      const validateUrl = `${baseUrl}/api/auth/validate`
      
      console.log(`[Middleware] Validating session for ${pathname}, calling ${validateUrl}`)
      
      const validateRes = await fetch(validateUrl, {
        headers: {
          Cookie: `session_token=${sessionToken}`,
          'User-Agent': 'Railway-Middleware/1.0'
        },
        cache: 'no-store'
      })
      
      if (!validateRes.ok) {
        console.log(`[Middleware] Session validation failed with status ${validateRes.status}`)
        // Session is invalid, redirect to login
        const url = new URL('/auth/login', req.url)
        url.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(url)
      }
      
      console.log(`[Middleware] Session validated successfully for ${pathname}`)
    } catch (error) {
      console.error('[Middleware] Session validation error:', error)
      // On error, redirect to login
      const url = new URL('/auth/login', req.url)
      url.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    // Apply only to protected routes and exclude API routes
    '/dashboard/:path*',
    '/admin/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/training/:path*',
    '/university/:path*',
    '/users/:path*',
    '/auth/:path*',
    '/api/admin/:path*'  // Add API routes to matcher
  ],
} 