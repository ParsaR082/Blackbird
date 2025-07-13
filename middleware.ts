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

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

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
    // Apply to all routes except static assets and API routes
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 