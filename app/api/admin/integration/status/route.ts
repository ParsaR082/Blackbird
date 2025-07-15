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

    // Get user statistics
    const totalUsers = await db.collection('users').countDocuments();
    const activeUsers = await db.collection('users').countDocuments({ status: 'active' });
    const suspendedUsers = await db.collection('users').countDocuments({ status: 'suspended' });
    
    // Users created this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newUsersThisWeek = await db.collection('users').countDocuments({
      createdAt: { $gte: oneWeekAgo }
    });

    // Content statistics
    const announcements = await db.collection('content').countDocuments({ type: 'announcement' });
    const pages = await db.collection('content').countDocuments({ type: 'page' });
    const faqs = await db.collection('content').countDocuments({ type: 'faq' });

    // Notification statistics
    const templates = await db.collection('notificationTemplates').countDocuments();
    const campaigns = await db.collection('notificationCampaigns').countDocuments();
    
    // Notifications sent today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sentToday = await db.collection('notificationLogs').countDocuments({
      sentAt: { $gte: today }
    });

    // Workflow statistics
    const activeWorkflows = await db.collection('workflows').countDocuments({ status: 'active' });
    const completedWorkflows = await db.collection('workflows').countDocuments({ status: 'completed' });
    const pendingWorkflows = await db.collection('workflows').countDocuments({ status: 'pending' });

    // System status (mock data for now)
    const systemStatus = {
      uptime: 99.9,
      performance: 95,
      errors: 2,
      lastBackup: new Date().toISOString()
    };

    const status = {
      users: {
        total: totalUsers,
        active: activeUsers,
        suspended: suspendedUsers,
        newThisWeek: newUsersThisWeek
      },
      content: {
        announcements,
        pages,
        faqs
      },
      notifications: {
        templates,
        campaigns,
        sentToday
      },
      workflows: {
        active: activeWorkflows,
        completed: completedWorkflows,
        pending: pendingWorkflows
      },
      system: systemStatus
    };

    return NextResponse.json(status);
  } catch (error) {
    console.error('Error fetching integration status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch integration status' },
      { status: 500 }
    );
  }
} 