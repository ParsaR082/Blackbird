import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { enabled } = await request.json();

    if (typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'Enabled flag is required' }, { status: 400 });
    }

    await connectToDatabase();
    const db = (await import('mongoose')).default.connection.db;

    // Update auto-optimization setting
    await db.collection('settings').updateOne(
      { key: 'autoOptimization' },
      { 
        $set: { 
          value: enabled,
          updatedAt: new Date(),
          updatedBy: session.user.email
        }
      },
      { upsert: true }
    );

    return NextResponse.json({ 
      message: `Auto-optimization ${enabled ? 'enabled' : 'disabled'} successfully`,
      enabled,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating auto-optimization setting:', error);
    return NextResponse.json(
      { error: 'Failed to update auto-optimization setting' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const db = (await import('mongoose')).default.connection.db;

    // Get auto-optimization setting
    const setting = await db.collection('settings').findOne({ key: 'autoOptimization' });
    const enabled = setting?.value || false;

    return NextResponse.json({ enabled });
  } catch (error) {
    console.error('Error fetching auto-optimization setting:', error);
    return NextResponse.json(
      { error: 'Failed to fetch auto-optimization setting' },
      { status: 500 }
    );
  }
} 