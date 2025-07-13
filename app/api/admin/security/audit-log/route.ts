import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;

    // Get audit log entries from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const auditLog = await db.collection('auditLog')
      .find({
        timestamp: { $gte: sevenDaysAgo }
      })
      .sort({ timestamp: -1 })
      .limit(500)
      .toArray();

    // Transform audit log data
    const auditEvents = auditLog.map(event => ({
      id: event._id.toString(),
      timestamp: event.timestamp,
      eventType: event.eventType,
      severity: event.severity,
      description: event.description,
      userId: event.userId,
      userEmail: event.userEmail,
      userRole: event.userRole,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      location: event.location,
      sessionId: event.sessionId,
      requestId: event.requestId,
      resourceAccessed: event.resourceAccessed,
      actionPerformed: event.actionPerformed,
      details: event.details,
      metadata: event.metadata
    }));

    return NextResponse.json(auditEvents);
  } catch (error) {
    console.error('Error fetching audit log:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit log' },
      { status: 500 }
    );
  }
} 