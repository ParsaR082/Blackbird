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

    const { taskId } = await request.json();

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    await connectToDatabase();
    const db = (await import('mongoose')).default.connection.db;

    // Update task status to running
    await db.collection('optimizationTasks').updateOne(
      { _id: taskId },
      { 
        $set: { 
          status: 'running',
          progress: 0,
          startedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );

    // Simulate optimization process (in production, this would be actual optimization)
    setTimeout(async () => {
      try {
        // Update progress to 50%
        await db.collection('optimizationTasks').updateOne(
          { _id: taskId },
          { 
            $set: { 
              progress: 50,
              updatedAt: new Date()
            }
          }
        );

        // Simulate more work
        setTimeout(async () => {
          try {
            // Complete the task
            await db.collection('optimizationTasks').updateOne(
              { _id: taskId },
              { 
                $set: { 
                  status: 'completed',
                  progress: 100,
                  completedAt: new Date(),
                  updatedAt: new Date()
                }
              }
            );

            // Update last optimization time
            await db.collection('settings').updateOne(
              { key: 'lastOptimization' },
              { 
                $set: { 
                  value: new Date().toISOString(),
                  updatedAt: new Date()
                }
              },
              { upsert: true }
            );
          } catch (error) {
            console.error('Error completing optimization task:', error);
            await db.collection('optimizationTasks').updateOne(
              { _id: taskId },
              { 
                $set: { 
                  status: 'failed',
                  error: (error as Error).message,
                  updatedAt: new Date()
                }
              }
            );
          }
        }, 3000); // 3 seconds for second phase
      } catch (error) {
        console.error('Error during optimization task:', error);
        await db.collection('optimizationTasks').updateOne(
          { _id: taskId },
          { 
            $set: { 
              status: 'failed',
              error: (error as Error).message,
              updatedAt: new Date()
            }
          }
        );
      }
    }, 2000); // 2 seconds for first phase

    return NextResponse.json({ 
      message: 'Optimization task started successfully',
      taskId 
    });
  } catch (error) {
    console.error('Error starting optimization task:', error);
    return NextResponse.json(
      { error: 'Failed to start optimization task' },
      { status: 500 }
    );
  }
} 