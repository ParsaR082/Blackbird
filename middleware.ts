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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // For API routes, ensure they're treated as dynamic
  if (pathname.startsWith('/api/')) {
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
    '/((?!api/auth|_next|fonts|images|favicon.ico|logo.svg|blackbirdlogo.svg).*)',
    '/api/:path*',
  ],
}