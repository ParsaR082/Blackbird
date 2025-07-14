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

    // Get optimization tasks from database
    const tasks = await db.collection('optimizationTasks')
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    // Transform tasks data
    const optimizationTasks = tasks.map((task: any) => ({
      id: task._id.toString(),
      name: task.name,
      status: task.status,
      progress: task.progress || 0,
      estimatedTime: task.estimatedTime || 'Unknown'
    }));

    // If no tasks exist, create some default ones
    if (optimizationTasks.length === 0) {
      const defaultTasks = [
        {
          name: 'Database Index Optimization',
          status: 'pending',
          progress: 0,
          estimatedTime: '5-10 minutes'
        },
        {
          name: 'Cache Cleanup',
          status: 'pending',
          progress: 0,
          estimatedTime: '2-3 minutes'
        },
        {
          name: 'Log File Cleanup',
          status: 'pending',
          progress: 0,
          estimatedTime: '1-2 minutes'
        }
      ];

      // Insert default tasks
      for (const task of defaultTasks) {
        await db.collection('optimizationTasks').insertOne({
          ...task,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      // Return the default tasks
      return NextResponse.json(defaultTasks.map((task, index) => ({
        id: `default-${index}`,
        ...task
      })));
    }

    return NextResponse.json(optimizationTasks);
  } catch (error) {
    console.error('Error fetching optimization tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch optimization tasks' },
      { status: 500 }
    );
  }
} 