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

    // Get active workflows
    const workflows = await db.collection('workflows')
      .find({ 
        status: { $in: ['active', 'pending', 'running'] } 
      })
      .sort({ updatedAt: -1 })
      .limit(10)
      .toArray();

    // Transform workflow data
    const workflowStatus = workflows.map((workflow: any) => ({
      id: workflow._id.toString(),
      name: workflow.name || 'Unnamed Workflow',
      status: workflow.status,
      progress: workflow.progress || 0,
      lastUpdate: workflow.updatedAt ? new Date(workflow.updatedAt).toLocaleString() : 'Unknown'
    }));

    return NextResponse.json(workflowStatus);
  } catch (error) {
    console.error('Error fetching workflow status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflow status' },
      { status: 500 }
    );
  }
} 