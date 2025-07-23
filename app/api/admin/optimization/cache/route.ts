export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock cache statistics - in production, this would come from Redis or similar
    const cacheStats = {
      hitRate: Math.floor(Math.random() * 30) + 70, // 70-100%
      memoryUsage: `${Math.floor(Math.random() * 500) + 100} MB`, // 100-600 MB
      keys: Math.floor(Math.random() * 10000) + 1000, // 1000-11000 keys
      evictions: Math.floor(Math.random() * 50) // 0-50 evictions
    };

    return NextResponse.json(cacheStats);
  } catch (error) {
    console.error('Error fetching cache stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cache statistics' },
      { status: 500 }
    );
  }
} 