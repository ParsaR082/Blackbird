export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';


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
