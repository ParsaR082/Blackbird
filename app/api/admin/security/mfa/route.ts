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

    // Get MFA settings
    const settings = await db.collection('securitySettings').findOne({ key: 'mfa' });
    
    const mfaSettings = settings?.value || {
      enabled: false,
      methods: ['email', 'totp'],
      requiredForAdmins: true,
      requiredForUsers: false,
      gracePeriod: 7
    };

    return NextResponse.json(mfaSettings);
  } catch (error) {
    console.error('Error fetching MFA settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch MFA settings' },
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

    // Update MFA settings
    await db.collection('securitySettings').updateOne(
      { key: 'mfa' },
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
      message: 'MFA settings updated successfully',
      settings: updates
    });
  } catch (error) {
    console.error('Error updating MFA settings:', error);
    return NextResponse.json(
      { error: 'Failed to update MFA settings' },
      { status: 500 }
    );
  }
} 