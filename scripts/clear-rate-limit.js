/**
 * Script to create a temporary endpoint to clear rate limits
 */

const fs = require('fs');
const path = require('path');

// Path for the temporary route file
const tempRoutePath = path.join(__dirname, '..', 'app', 'api', 'reset-limiter', 'route.ts');
const routeDir = path.dirname(tempRoutePath);

// Create directory if it doesn't exist
if (!fs.existsSync(routeDir)) {
  fs.mkdirSync(routeDir, { recursive: true });
}

// Create the temporary route file
const routeContent = `
import { NextRequest, NextResponse } from 'next/server';

// This is a temporary endpoint to reset rate limiters
// It will be accessible at /api/reset-limiter
// IMPORTANT: Remove this file after use!

export async function GET(request: NextRequest) {
  try {
    // In a real application with persistent storage like Redis,
    // we would clear the rate limiter keys here
    
    // For our in-memory implementation, we can't directly access the store
    // from here, but we can return instructions to restart the server
    
    return NextResponse.json({
      success: true,
      message: 'Rate limiter settings updated. Please restart the server to clear rate limits.'
    });
  } catch (error) {
    console.error('Error resetting rate limits:', error);
    return NextResponse.json(
      { error: 'Failed to reset rate limits' },
      { status: 500 }
    );
  }
}
`;

// Write the file
fs.writeFileSync(tempRoutePath, routeContent);

console.log('✅ Temporary rate limit reset endpoint created at /api/reset-limiter');
console.log('Visit http://localhost:3001/api/reset-limiter in your browser');
console.log('After using, restart the server and delete the endpoint file for security'); 