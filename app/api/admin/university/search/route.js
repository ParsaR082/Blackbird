import { createSafeRouteHandler, getSafeAuthUser } from '../../../../../lib/api-utils';

// Make sure we're using dynamic mode
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Define the actual handler logic
async function handler(req) {
  try {
    // Get the user safely
    const user = getSafeAuthUser(req);
    
    if (!user) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Unauthorized access' 
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Your actual route logic here
    // This is a placeholder implementation
    const searchResults = {
      success: true,
      data: [
        { id: 1, name: "Sample Result 1" },
        { id: 2, name: "Sample Result 2" },
      ]
    };
    
    return new Response(
      JSON.stringify(searchResults),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in university search API:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Internal server error',
        error: error.message
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Export the handler wrapped with our safe route handler
export const GET = createSafeRouteHandler(handler);
export const POST = createSafeRouteHandler(handler); 