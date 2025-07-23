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

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const days = parseInt(searchParams.get('days') || '7');

    await connectToDatabase();
    const db = (await import('mongoose')).default.connection.db;

    // Get audit log entries
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const auditLog = await db.collection('auditLog')
      .find({
        timestamp: { $gte: startDate }
      })
      .sort({ timestamp: -1 })
      .toArray();

    if (format === 'csv') {
      // Generate CSV
      const csvHeaders = [
        'Timestamp',
        'Event Type',
        'Severity',
        'Description',
        'User Email',
        'User Role',
        'IP Address',
        'Location',
        'Resource Accessed',
        'Action Performed'
      ];

      const csvRows = auditLog.map((event: any) => [
        new Date(event.timestamp).toISOString(),
        event.eventType,
        event.severity,
        event.description,
        event.userEmail || '',
        event.userRole || '',
        event.ipAddress || '',
        event.location || '',
        event.resourceAccessed || '',
        event.actionPerformed || ''
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map((row: any) => row.map((field: any) => `"${field}"`).join(','))
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="audit-log-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    } else {
      // Return JSON
      return NextResponse.json(auditLog);
    }
  } catch (error) {
    console.error('Error exporting audit log:', error);
    return NextResponse.json(
      { error: 'Failed to export audit log' },
      { status: 500 }
    );
  }
} 