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

    // Get security events from the last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const events = await db.collection('securityEvents')
      .find({
        timestamp: { $gte: oneDayAgo }
      })
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();

    // Transform events data
    const securityEvents = events.map((event: any) => ({
      id: event._id.toString(),
      timestamp: event.timestamp,
      eventType: event.eventType,
      severity: event.severity,
      description: event.description,
      userId: event.userId,
      userEmail: event.userEmail,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      location: event.location,
      details: event.details
    }));

    return NextResponse.json(securityEvents);
  } catch (error) {
    console.error('Error fetching security events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch security events' },
      { status: 500 }
    );
  }
} 