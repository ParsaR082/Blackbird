import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
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

// Member+ routes (requires member or higher role)
const memberRoutes = [
  '/archives',
  '/training'
]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Check if Supabase environment variables are configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not configured. Middleware will skip authentication checks.')
    return res
  }

  const supabase = createMiddlewareClient({ req, res })

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
    // Get the session
    const {
      data: { session },
      error
    } = await supabase.auth.getSession()

    // If there's an error getting the session, log it and continue
    if (error) {
      console.error('Error getting session:', error)
      return res
    }

    // If no session and trying to access protected route, redirect to sign in
    if (!session && isProtectedRoute) {
      const redirectUrl = new URL('/auth/signin', req.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If session exists, check role-based permissions
    if (session) {
      try {
        // Get user profile to check role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        const userRole = profile?.role || 'guest'

        // Check admin routes
        if (adminRoutes.some(route => pathname.startsWith(route))) {
          if (userRole !== 'admin') {
            return NextResponse.redirect(new URL('/dashboard', req.url))
          }
        }

        // Check member+ routes
        if (memberRoutes.some(route => pathname.startsWith(route))) {
          if (!['admin', 'moderator', 'member'].includes(userRole)) {
            return NextResponse.redirect(new URL('/dashboard', req.url))
          }
        }
      } catch (profileError) {
        console.error('Error fetching user profile:', profileError)
        // Continue without role checking if there's an error
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