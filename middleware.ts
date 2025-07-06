import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { generateCsrfToken } from './lib/csrf'

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/admin',
  '/profile',
  '/settings',
  '/training'
]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // CSRF Protection
  // Skip CSRF for non-mutation methods
  if (!(req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS')) {
    // For API routes, we'll validate the token in the route handler
    if (pathname.startsWith('/api/auth/')) {
      // Just continue to the route handler which will validate the token
    }
  }
  
  // Generate CSRF token for page requests
  if (
    req.method === 'GET' &&
    !pathname.startsWith('/api/') &&
    !pathname.startsWith('/_next/') &&
    !pathname.includes('.')
  ) {
    const csrfToken = generateCsrfToken()
    const response = NextResponse.next()
    response.headers.set('x-csrf-token', csrfToken)
    return response
  }

  // Authentication Check for Protected Routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    // Get the session token from cookie
    const sessionToken = req.cookies.get('session_token')?.value
    
    if (!sessionToken) {
      // Redirect to login if no session token
      const url = new URL('/auth/login', req.url)
      url.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(url)
    }
    
    // Validate session token by calling the API
    try {
      const validateRes = await fetch(new URL('/api/auth/validate', req.url), {
        headers: {
          Cookie: `session_token=${sessionToken}`
        }
      })
      
      if (!validateRes.ok) {
        // Session is invalid, redirect to login
        const url = new URL('/auth/login', req.url)
        url.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(url)
      }
    } catch (error) {
      console.error('Session validation error:', error)
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
    // Apply to all routes except static assets
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 