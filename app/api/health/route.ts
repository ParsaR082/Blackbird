/**
 * Health check endpoint for Railway deployment
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { 
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown'
    },
    { status: 200 }
  );
}

export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
} 