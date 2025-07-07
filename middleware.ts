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
    // Apply to all routes except static assets and API routes
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 