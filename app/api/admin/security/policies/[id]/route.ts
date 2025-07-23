export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { enabled } = await request.json();
    const { id } = params;

    if (typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'Enabled flag is required' }, { status: 400 });
    }

    await connectToDatabase();
    const db = (await import('mongoose')).default.connection.db;

    // Update policy
    const result = await db.collection('securityPolicies').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          enabled,
          updatedAt: new Date(),
          updatedBy: session.user.email
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: `Policy ${enabled ? 'enabled' : 'disabled'} successfully`,
      enabled
    });
  } catch (error) {
    console.error('Error updating security policy:', error);
    return NextResponse.json(
      { error: 'Failed to update security policy' },
      { status: 500 }
    );
  }
} 