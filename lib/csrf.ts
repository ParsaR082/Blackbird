import { cookies } from 'next/headers'

const CSRF_SECRET = process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production'
const CSRF_COOKIE_NAME = 'csrf_token'
const CSRF_HEADER_NAME = 'x-csrf-token'

// Debug logging helper
function debugLog(message: string, data?: any) {
  if (process.env.NODE_ENV === 'development' || process.env.CSRF_DEBUG === 'true') {
    console.log(`[CSRF Debug] ${message}`, data || '')
  }
}

/**
 * Generate random bytes using Web Crypto API (Edge Runtime compatible)
 */
function generateRandomToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Create SHA-256 hash using Web Crypto API (Edge Runtime compatible)
 */
async function createHash(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data))
  const hashArray = new Uint8Array(hashBuffer)
  return Array.from(hashArray, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Get production-safe cookie configuration
 */
function getCookieConfig() {
  const isProduction = process.env.NODE_ENV === 'production'
  const isSecure = isProduction || process.env.FORCE_SECURE_COOKIES === 'true'
  
  debugLog('Cookie config', { 
    isProduction, 
    isSecure, 
    nodeEnv: process.env.NODE_ENV,
    forceSecure: process.env.FORCE_SECURE_COOKIES 
  })
  
  return {
    httpOnly: true,
    secure: isSecure,
    // Use 'lax' for better compatibility in production
    // 'lax' allows the cookie to be sent with top-level navigation and same-site requests
    // This is more compatible with Docker/proxy environments than 'strict'
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 // 1 hour
  }
}

/**
 * Generates a new CSRF token and sets it as a cookie (only for route handlers)
 */
export async function generateCsrfTokenWithCookie(): Promise<string> {
  try {
    // Generate a random token
    const token = generateRandomToken()
    debugLog('Generated raw token', token.substring(0, 8) + '...')
    
    // Create a hash of the token with a secret
    const hash = await createHash(`${token}${CSRF_SECRET}`)
    debugLog('Generated hash', hash.substring(0, 8) + '...')
    
    // Get cookie configuration
    const cookieConfig = getCookieConfig()
    
    // Set the token as a cookie
    cookies().set({
      name: CSRF_COOKIE_NAME,
      value: token,
      ...cookieConfig
    })
    
    debugLog('Cookie set successfully', { 
      name: CSRF_COOKIE_NAME, 
      config: cookieConfig,
      tokenLength: token.length,
      hashLength: hash.length
    })
    
    // Return the hash that will be sent in the form/header
    return hash
  } catch (error) {
    console.error('[CSRF Error] Failed to generate token with cookie:', error)
    throw error
  }
}

/**
 * Generates a CSRF token pair (token and hash) without setting cookies
 */
export async function generateCsrfTokenPair(): Promise<{ token: string; hash: string }> {
  const token = generateRandomToken()
  const hash = await createHash(`${token}${CSRF_SECRET}`)
  return { token, hash }
}

/**
 * Validates a CSRF token against the stored cookie
 */
export async function validateCsrfToken(token?: string | null): Promise<boolean> {
  try {
    debugLog('Starting CSRF validation', { 
      hasToken: !!token, 
      tokenLength: token?.length,
      tokenPreview: token?.substring(0, 8) + '...' 
    })
    
    if (!token) {
      debugLog('Validation failed: No token provided')
      return false
    }
    
    // Get the original token from the cookie
    const cookieStore = cookies()
    const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value
    
    debugLog('Cookie retrieval', { 
      hasCookie: !!cookieToken, 
      cookieLength: cookieToken?.length,
      cookiePreview: cookieToken?.substring(0, 8) + '...',
      cookieName: CSRF_COOKIE_NAME
    })
    
    if (!cookieToken) {
      debugLog('Validation failed: No cookie token found')
      // Log all available cookies for debugging
      const allCookies = cookieStore.getAll()
      debugLog('Available cookies', allCookies.map(c => ({ name: c.name, hasValue: !!c.value })))
      return false
    }
    
    // Recreate the hash from the cookie value
    const expectedHash = await createHash(`${cookieToken}${CSRF_SECRET}`)
    debugLog('Hash comparison', { 
      expectedHashPreview: expectedHash.substring(0, 8) + '...',
      providedTokenPreview: token.substring(0, 8) + '...',
      expectedLength: expectedHash.length,
      providedLength: token.length
    })
    
    // Compare in constant time to prevent timing attacks
    const isValid = timingSafeEqual(token, expectedHash)
    debugLog('Validation result', { isValid })
    
    return isValid
  } catch (error) {
    console.error('[CSRF Error] Token validation failed:', error)
    debugLog('Validation error', error)
    return false
  }
}

/**
 * Constant time comparison of two strings to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }
  
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  
  return result === 0
}

/**
 * Middleware to inject CSRF token into the request
 */
export function withCsrf(handler: Function) {
  return async (req: Request, ...args: any[]) => {
    const { hash: csrfToken } = await generateCsrfTokenPair()
    // Add CSRF token to response headers
    const response = await handler(req, ...args)
    response.headers.set(CSRF_HEADER_NAME, csrfToken)
    return response
  }
}