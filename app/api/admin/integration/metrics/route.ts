import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock metrics data - in production, this would come from monitoring systems
    const metrics = {
      apiCalls: Math.floor(Math.random() * 1000) + 500, // 500-1500 calls per hour
      responseTime: Math.floor(Math.random() * 100) + 50, // 50-150ms average
      errorRate: Math.random() * 2, // 0-2% error rate
      activeConnections: Math.floor(Math.random() * 50) + 10 // 10-60 active connections
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching integration metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch integration metrics' },
      { status: 500 }
    );
  }
} 