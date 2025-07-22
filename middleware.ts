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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware processing during build time
  const isBuildTime = process.env.NODE_ENV === 'production' && !request.cookies.has('next-auth.session-token');
  
  // For API routes, ensure they're treated as dynamic
  if (pathname.startsWith('/api/')) {
    // During build time, return a mock response for API routes
    if (isBuildTime) {
      return NextResponse.next();
    }
    
    // Add headers to ensure dynamic behavior
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    response.headers.set('Surrogate-Control', 'no-store');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isExcludedRoute = excludedRoutes.some(route => pathname.startsWith(route));

  // If it's not a protected route or it's excluded, continue
  if (!isProtectedRoute || isExcludedRoute) {
    return NextResponse.next();
  }

  // Skip auth check during build time
  if (isBuildTime) {
    return NextResponse.next();
  }

  // Check for authentication
  const authCookie = request.cookies.get('next-auth.session-token');
  
  // If no auth cookie, redirect to login
  if (!authCookie) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/auth/* (authentication routes)
     * 2. /_next/* (Next.js internals)
     * 3. /fonts/* (static font files)
     * 4. /images/* (static image files)
     * 5. /favicon.ico, /logo.svg (static files at root)
     */
    '/((?!api/auth|_next|fonts|images|favicon.ico|logo.svg).*)',
    '/api/:path*',
  ],
} 