import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { getUserFromRequest } from '@/lib/server-utils'
import mongoose from 'mongoose'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Verify the current user is an admin
    const currentUser = await getUserFromRequest(request)
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    await connectToDatabase()
    
    // Define schemas
    const UserSchema = new mongoose.Schema({
      email: String,
      full_name: String,
      role: String,
      is_verified: Boolean,
      is_active: Boolean,
      created_at: Date,
      last_login: Date
    })
    
    const EventSchema = new mongoose.Schema({
      title: String,
      category: String,
      start_date: Date,
      end_date: Date,
      registrations: [String],
      attendees: [String]
    })
    
    const PurchaseSchema = new mongoose.Schema({
      product_id: String,
      user_id: String,
      status: String,
      amount: Number,
      created_at: Date
    })
    
    const ContentSchema = new mongoose.Schema({
      title: String,
      type: String,
      status: String,
      views: Number,
      created_at: Date
    })
    
    const User = mongoose.models.User || mongoose.model('User', UserSchema)
    const Event = mongoose.models.Event || mongoose.model('Event', EventSchema)
    const Purchase = mongoose.models.Purchase || mongoose.model('Purchase', PurchaseSchema)
    const Content = mongoose.models.Content || mongoose.model('Content', ContentSchema)

    // Get date range from query params
    const { searchParams } = new URL(request.url)
    const fromDate = searchParams.get('from') ? new Date(searchParams.get('from')!) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    const toDate = searchParams.get('to') ? new Date(searchParams.get('to')!) : new Date()

    // Fetch analytics data
    const [
      users,
      events,
      purchases,
      content
    ] = await Promise.all([
      User.find({}).lean(),
      Event.find({}).lean(),
      Purchase.find({}).lean(),
      Content.find({}).lean()
    ])

    // Process user analytics
    const userAnalytics = {
      total: users.length,
      active: users.filter(u => u.is_active).length,
      newThisMonth: users.filter(u => new Date(u.created_at) >= fromDate).length,
      verified: users.filter(u => u.is_verified).length,
      byRole: Object.entries(
        users.reduce((acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      ).map(([role, count]) => ({ role, count })),
      growth: generateGrowthData(users, fromDate, toDate)
    }

    // Process event analytics
    const eventAnalytics = {
      total: events.length,
      upcoming: events.filter(e => new Date(e.start_date) > new Date()).length,
      completed: events.filter(e => new Date(e.end_date) < new Date()).length,
      registrations: events.reduce((sum, e) => sum + (e.registrations?.length || 0), 0),
      byCategory: Object.entries(
        events.reduce((acc, event) => {
          acc[event.category] = (acc[event.category] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      ).map(([category, count]) => ({ category, count })),
      attendance: generateAttendanceData(events, fromDate, toDate)
    }

    // Process purchase analytics
    const purchaseAnalytics = {
      total: purchases.length,
      pending: purchases.filter(p => p.status === 'pending').length,
      completed: purchases.filter(p => p.status === 'completed').length,
      revenue: purchases.filter(p => p.status === 'completed').reduce((sum, p) => sum + (p.amount || 0), 0),
      byProduct: Object.entries(
        purchases.reduce((acc, purchase) => {
          acc[purchase.product_id] = (acc[purchase.product_id] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      ).map(([product, sales]) => ({ product, sales })),
      trends: generateRevenueData(purchases, fromDate, toDate)
    }

    // Process content analytics
    const contentAnalytics = {
      total: content.length,
      published: content.filter(c => c.status === 'published').length,
      drafts: content.filter(c => c.status === 'draft').length,
      views: content.reduce((sum, c) => sum + (c.views || 0), 0),
      byType: Object.entries(
        content.reduce((acc, item) => {
          acc[item.type] = (acc[item.type] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      ).map(([type, count]) => ({ type, count })),
      engagement: generateEngagementData(content, fromDate, toDate)
    }

    return NextResponse.json({
      users: userAnalytics,
      events: eventAnalytics,
      purchases: purchaseAnalytics,
      content: contentAnalytics
    })
  } catch (error) {
    console.error('Advanced analytics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions to generate time-series data
function generateGrowthData(users: any[], fromDate: Date, toDate: Date) {
  const days = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24))
  const growth = []
  
  for (let i = 0; i < days; i++) {
    const date = new Date(fromDate.getTime() + i * 24 * 60 * 60 * 1000)
    const count = users.filter(u => new Date(u.created_at) <= date).length
    growth.push({
      date: date.toISOString().split('T')[0],
      count
    })
  }
  
  return growth
}

function generateAttendanceData(events: any[], fromDate: Date, toDate: Date) {
  const days = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24))
  const attendance = []
  
  for (let i = 0; i < days; i++) {
    const date = new Date(fromDate.getTime() + i * 24 * 60 * 60 * 1000)
    const dayEvents = events.filter(e => {
      const eventDate = new Date(e.start_date)
      return eventDate.toDateString() === date.toDateString()
    })
    const attendees = dayEvents.reduce((sum, e) => sum + (e.attendees?.length || 0), 0)
    attendance.push({
      date: date.toISOString().split('T')[0],
      attendees
    })
  }
  
  return attendance
}

function generateRevenueData(purchases: any[], fromDate: Date, toDate: Date) {
  const days = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24))
  const revenue = []
  
  for (let i = 0; i < days; i++) {
    const date = new Date(fromDate.getTime() + i * 24 * 60 * 60 * 1000)
    const dayPurchases = purchases.filter(p => {
      const purchaseDate = new Date(p.created_at)
      return purchaseDate.toDateString() === date.toDateString() && p.status === 'completed'
    })
    const dayRevenue = dayPurchases.reduce((sum, p) => sum + (p.amount || 0), 0)
    revenue.push({
      date: date.toISOString().split('T')[0],
      revenue: dayRevenue
    })
  }
  
  return revenue
}

function generateEngagementData(content: any[], fromDate: Date, toDate: Date) {
  const days = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24))
  const engagement = []
  
  for (let i = 0; i < days; i++) {
    const date = new Date(fromDate.getTime() + i * 24 * 60 * 60 * 1000)
    const dayContent = content.filter(c => {
      const contentDate = new Date(c.created_at)
      return contentDate.toDateString() === date.toDateString()
    })
    const views = dayContent.reduce((sum, c) => sum + (c.views || 0), 0)
    engagement.push({
      date: date.toISOString().split('T')[0],
      views
    })
  }
  
  return engagement
} 