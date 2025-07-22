/**
 * API utilities to handle dynamic server usage in Next.js API routes
 */

/**
 * Creates a safe route handler that handles both static and dynamic contexts
 * @param {Function} handler - The API route handler function
 * @returns {Function} - A wrapped handler that's safe for both static generation and dynamic requests
 */
export function createSafeRouteHandler(handler) {
  return async (req, context) => {
    try {
      // Check if running in a static build context
      const isStaticBuild = 
        process.env.NODE_ENV === 'production' && 
        !req.cookies?.get && 
        typeof req.headers?.get !== 'function';
      
      // For static builds, return a mock response to prevent build errors
      if (isStaticBuild) {
        console.log('Static build detected, returning mock response');
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'This API route requires dynamic server features' 
          }),
          { 
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-store, max-age=0'
            }
          }
        );
      }
      
      // For normal dynamic requests, call the original handler
      return handler(req, context);
    } catch (error) {
      console.error('Error in API route:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Internal server error',
          error: error.message
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  };
}

/**
 * Gets the authenticated user from the request, safely handling static build context
 * @param {Request} req - The request object 
 * @returns {Object|null} - The user object or null
 */
export function getSafeAuthUser(req) {
  try {
    // Check if running in a static build context
    const isStaticBuild = 
      process.env.NODE_ENV === 'production' && 
      !req.cookies?.get && 
      typeof req.headers?.get !== 'function';
    
    if (isStaticBuild) {
      return null;
    }
    
    // Add your actual user authentication logic here
    // This is just a placeholder
    const sessionToken = req.cookies?.get('session_token')?.value;
    if (!sessionToken) return null;
    
    // Return mock user for now - replace with your actual auth logic
    return { id: 'mock-user-id', role: 'user' };
  } catch (error) {
    console.error('Error getting auth user:', error);
    return null;
  }
} 