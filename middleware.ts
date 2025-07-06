import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/ai',
  '/robotics',
  '/forum',
  '/projects',
  '/competitions',
  '/training',
  '/languages',
  '/archives',
  '/admin',
  '/users'
]

// Admin-only routes
const adminRoutes = [
  '/admin'
]

// Routes requiring verification
const verifiedRoutes = [
  '/archives',
  '/training'
]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Get the pathname
  const pathname = req.nextUrl.pathname

  // Check if the route needs protection
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // If not a protected route, continue
  if (!isProtectedRoute) {
    return res
  }

  try {
    // Get session token from cookie
    const sessionToken = req.cookies.get('session_token')?.value
    
    // If no session and trying to access protected route, redirect to login
    if (!sessionToken && isProtectedRoute) {
      const redirectUrl = new URL('/?showAuth=login', req.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    if (sessionToken) {
      // Make API request to validate session and get user
      const validateResponse = await fetch(`${req.nextUrl.origin}/api/auth/validate`, {
        headers: {
          'Cookie': `session_token=${sessionToken}`
        }
      })

      if (!validateResponse.ok) {
        // Session is invalid, clear cookie and redirect to login
        const response = NextResponse.redirect(new URL('/?showAuth=login', req.url))
        response.cookies.delete('session_token')
        return response
      }

      const userData = await validateResponse.json()

      // Check admin routes
      if (adminRoutes.some(route => pathname.startsWith(route))) {
        if (userData.role !== 'admin') {
          return NextResponse.redirect(new URL('/dashboard', req.url))
        }
      }

      // Check verified routes
      if (verifiedRoutes.some(route => pathname.startsWith(route))) {
        if (!userData.is_verified) {
          return NextResponse.redirect(new URL('/dashboard?needVerification=true', req.url))
        }
      }

      // User is trying to access login/signup page but is already logged in
      if (pathname === '/' && req.nextUrl.searchParams.has('showAuth')) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }
  } catch (middlewareError) {
    console.error('Middleware error:', middlewareError)
    // Continue without authentication if there's an error
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 