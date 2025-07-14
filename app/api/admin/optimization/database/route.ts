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

    // Get database statistics
    const stats = await db.stats();
    
    // Get collection count
    const collections = await db.listCollections().toArray();
    
    // Get index count
    let totalIndexes = 0;
    for (const collection of collections) {
      const indexes = await db.collection(collection.name).indexes();
      totalIndexes += indexes.length;
    }

    // Mock fragmentation data (in production, this would be calculated)
    const fragmentation = Math.random() * 30; // 0-30%

    // Get last optimization time from settings collection
    const settings = await db.collection('settings').findOne({ key: 'lastOptimization' });
    const lastOptimization = settings?.value || 'Never';

    const dbStats = {
      totalSize: `${(stats.dataSize / (1024 * 1024)).toFixed(2)} MB`,
      collections: collections.length,
      indexes: totalIndexes,
      fragmentation: Math.round(fragmentation),
      lastOptimization
    };

    return NextResponse.json(dbStats);
  } catch (error) {
    console.error('Error fetching database stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch database statistics' },
      { status: 500 }
    );
  }
} 