import { createHash, randomBytes } from 'crypto'
import { cookies } from 'next/headers'

const CSRF_SECRET = process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production'
const CSRF_COOKIE_NAME = 'csrf_token'
const CSRF_HEADER_NAME = 'x-csrf-token'

/**
 * Generates a new CSRF token and sets it as a cookie
 */
export function generateCsrfToken(): string {
  // Generate a random token
  const token = randomBytes(32).toString('hex')
  
  // Create a hash of the token with a secret
  const hash = createHash('sha256')
    .update(`${token}${CSRF_SECRET}`)
    .digest('hex')
  
  // Set the token as a cookie
  cookies().set({
    name: CSRF_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    // Short expiration for CSRF tokens
    maxAge: 60 * 60 // 1 hour
  })
  
  // Return the hash that will be sent in the form/header
  return hash
}

/**
 * Validates a CSRF token against the stored cookie
 */
export function validateCsrfToken(token?: string | null): boolean {
  if (!token) {
    return false
  }
  
  // Get the original token from the cookie
  const cookieToken = cookies().get(CSRF_COOKIE_NAME)?.value
  
  if (!cookieToken) {
    return false
  }
  
  // Recreate the hash from the cookie value
  const expectedHash = createHash('sha256')
    .update(`${cookieToken}${CSRF_SECRET}`)
    .digest('hex')
  
  // Compare in constant time to prevent timing attacks
  return timingSafeEqual(token, expectedHash)
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
    const csrfToken = generateCsrfToken()
    // Add CSRF token to response headers
    const response = await handler(req, ...args)
    response.headers.set(CSRF_HEADER_NAME, csrfToken)
    return response
  }
} 