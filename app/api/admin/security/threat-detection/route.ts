export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const db = (await import('mongoose')).default.connection.db;

    // Get threat detection settings
    const settings = await db.collection('securitySettings').findOne({ key: 'threatDetection' });
    
    const threatDetection = settings?.value || {
      enabled: true,
      suspiciousLoginAttempts: 0,
      failedLoginThreshold: 5,
      ipBlockingEnabled: true,
      geoBlockingEnabled: false,
      rateLimitingEnabled: true
    };

    return NextResponse.json(threatDetection);
  } catch (error) {
    console.error('Error fetching threat detection settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch threat detection settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();
    await connectToDatabase();
    const db = (await import('mongoose')).default.connection.db;

    // Update threat detection settings
    await db.collection('securitySettings').updateOne(
      { key: 'threatDetection' },
      { 
        $set: { 
          value: updates,
          updatedAt: new Date(),
          updatedBy: session.user.email
        }
      },
      { upsert: true }
    );

    return NextResponse.json({ 
      message: 'Threat detection settings updated successfully',
      settings: updates
    });
  } catch (error) {
    console.error('Error updating threat detection settings:', error);
    return NextResponse.json(
      { error: 'Failed to update threat detection settings' },
      { status: 500 }
    );
  }
} 