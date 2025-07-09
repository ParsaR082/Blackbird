import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { Event, EventRegistration, EventStats } from '@/lib/models/event'
import { getUserFromRequest } from '@/lib/server-utils'
import mongoose from 'mongoose'

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const currentUser = await getUserFromRequest(request)
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    const timeframe = searchParams.get('timeframe') || '30days' // 7days, 30days, 90days, 1year
    const category = searchParams.get('category')

    // Calculate date range based on timeframe
    const now = new Date()
    let startDate: Date
    switch (timeframe) {
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default: // 30days
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Build base match query
    const baseMatch: any = {
      createdAt: { $gte: startDate }
    }

    if (eventId) {
      baseMatch._id = new mongoose.Types.ObjectId(eventId)
    }

    if (category) {
      baseMatch.category = category
    }

    // 1. Overall Event Statistics
    const eventStats = await Event.aggregate([
      { $match: { ...baseMatch, isActive: true } },
      {
        $group: {
          _id: null,
          totalEvents: { $sum: 1 },
          upcomingEvents: {
            $sum: {
              $cond: [
                { $in: ['$status', ['upcoming', 'registration-open']] },
                1,
                0
              ]
            }
          },
          completedEvents: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          },
          cancelledEvents: {
            $sum: {
              $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0]
            }
          },
          totalCapacity: { $sum: '$maxAttendees' },
          totalRegistered: { $sum: '$currentAttendees' },
          averageCapacityUtilization: {
            $avg: {
              $cond: [
                { $gt: ['$maxAttendees', 0] },
                { $divide: ['$currentAttendees', '$maxAttendees'] },
                0
              ]
            }
          }
        }
      }
    ])

    // 2. Registration Statistics
    const registrationStats = await EventRegistration.aggregate([
      {
        $lookup: {
          from: 'events',
          localField: 'eventId',
          foreignField: '_id',
          as: 'event'
        }
      },
      { $unwind: '$event' },
      {
        $match: {
          'event.createdAt': { $gte: startDate },
          ...(eventId && { eventId: new mongoose.Types.ObjectId(eventId) }),
          ...(category && { 'event.category': category })
        }
      },
      {
        $group: {
          _id: null,
          totalRegistrations: { $sum: 1 },
          userRegistrations: {
            $sum: {
              $cond: [{ $eq: ['$registrationType', 'user'] }, 1, 0]
            }
          },
          guestRegistrations: {
            $sum: {
              $cond: [{ $eq: ['$registrationType', 'guest'] }, 1, 0]
            }
          },
          activeRegistrations: {
            $sum: {
              $cond: [{ $eq: ['$status', 'registered'] }, 1, 0]
            }
          },
          waitlistedRegistrations: {
            $sum: {
              $cond: [{ $eq: ['$status', 'waitlisted'] }, 1, 0]
            }
          },
          cancelledRegistrations: {
            $sum: {
              $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0]
            }
          },
          attendedRegistrations: {
            $sum: {
              $cond: [{ $eq: ['$status', 'attended'] }, 1, 0]
            }
          }
        }
      }
    ])

    // 3. Category Performance
    const categoryStats = await Event.aggregate([
      { $match: { ...baseMatch, isActive: true } },
      {
        $group: {
          _id: '$category',
          eventCount: { $sum: 1 },
          totalCapacity: { $sum: '$maxAttendees' },
          totalRegistered: { $sum: '$currentAttendees' },
          averageAttendance: {
            $avg: {
              $cond: [
                { $gt: ['$maxAttendees', 0] },
                { $divide: ['$currentAttendees', '$maxAttendees'] },
                0
              ]
            }
          }
        }
      },
      { $sort: { eventCount: -1 } }
    ])

    // 4. Registration Trends (daily over timeframe)
    const registrationTrends = await EventRegistration.aggregate([
      {
        $lookup: {
          from: 'events',
          localField: 'eventId',
          foreignField: '_id',
          as: 'event'
        }
      },
      { $unwind: '$event' },
      {
        $match: {
          registeredAt: { $gte: startDate },
          ...(eventId && { eventId: new mongoose.Types.ObjectId(eventId) }),
          ...(category && { 'event.category': category })
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$registeredAt'
            }
          },
          registrations: { $sum: 1 },
          userRegistrations: {
            $sum: {
              $cond: [{ $eq: ['$registrationType', 'user'] }, 1, 0]
            }
          },
          guestRegistrations: {
            $sum: {
              $cond: [{ $eq: ['$registrationType', 'guest'] }, 1, 0]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ])

    // 5. Event Performance (top performing events)
    const topEvents = await Event.aggregate([
      { $match: { ...baseMatch, isActive: true } },
      {
        $addFields: {
          fillRate: {
            $cond: [
              { $gt: ['$maxAttendees', 0] },
              { $divide: ['$currentAttendees', '$maxAttendees'] },
              0
            ]
          }
        }
      },
      {
        $project: {
          title: 1,
          category: 1,
          date: 1,
          currentAttendees: 1,
          maxAttendees: 1,
          fillRate: 1,
          status: 1
        }
      },
      { $sort: { fillRate: -1, currentAttendees: -1 } },
      { $limit: 10 }
    ])

    // 6. Waitlist Analysis
    const waitlistStats = await EventRegistration.aggregate([
      {
        $lookup: {
          from: 'events',
          localField: 'eventId',
          foreignField: '_id',
          as: 'event'
        }
      },
      { $unwind: '$event' },
      {
        $match: {
          status: 'waitlisted',
          'event.createdAt': { $gte: startDate },
          ...(eventId && { eventId: new mongoose.Types.ObjectId(eventId) }),
          ...(category && { 'event.category': category })
        }
      },
      {
        $group: {
          _id: '$eventId',
          eventTitle: { $first: '$event.title' },
          waitlistCount: { $sum: 1 },
          eventCapacity: { $first: '$event.maxAttendees' },
          eventDate: { $first: '$event.date' }
        }
      },
      { $sort: { waitlistCount: -1 } },
      { $limit: 10 }
    ])

    // 7. Recent Activity Summary
    const recentActivity = await EventRegistration.aggregate([
      {
        $lookup: {
          from: 'events',
          localField: 'eventId',
          foreignField: '_id',
          as: 'event'
        }
      },
      { $unwind: '$event' },
      {
        $match: {
          registeredAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }, // Last 24 hours
          ...(eventId && { eventId: new mongoose.Types.ObjectId(eventId) }),
          ...(category && { 'event.category': category })
        }
      },
      {
        $group: {
          _id: null,
          registrationsLast24h: { $sum: 1 },
          uniqueEventsLast24h: { $addToSet: '$eventId' }
        }
      },
      {
        $addFields: {
          uniqueEventsCount: { $size: '$uniqueEventsLast24h' }
        }
      }
    ])

    // Format response
    const analytics = {
      timeframe,
      dateRange: {
        start: startDate.toISOString(),
        end: now.toISOString()
      },
      eventOverview: eventStats[0] || {
        totalEvents: 0,
        upcomingEvents: 0,
        completedEvents: 0,
        cancelledEvents: 0,
        totalCapacity: 0,
        totalRegistered: 0,
        averageCapacityUtilization: 0
      },
      registrationMetrics: registrationStats[0] || {
        totalRegistrations: 0,
        userRegistrations: 0,
        guestRegistrations: 0,
        activeRegistrations: 0,
        waitlistedRegistrations: 0,
        cancelledRegistrations: 0,
        attendedRegistrations: 0
      },
      categoryPerformance: categoryStats,
      registrationTrends: registrationTrends,
      topPerformingEvents: topEvents,
      waitlistAnalysis: waitlistStats,
      recentActivity: recentActivity[0] || {
        registrationsLast24h: 0,
        uniqueEventsCount: 0
      }
    }

    // Add calculated metrics
    const regMetrics = analytics.registrationMetrics
    analytics.registrationMetrics.attendanceRate = regMetrics.totalRegistrations > 0 
      ? (regMetrics.attendedRegistrations / regMetrics.totalRegistrations) * 100 
      : 0
    analytics.registrationMetrics.cancellationRate = regMetrics.totalRegistrations > 0 
      ? (regMetrics.cancelledRegistrations / regMetrics.totalRegistrations) * 100 
      : 0
    analytics.registrationMetrics.waitlistRate = regMetrics.totalRegistrations > 0 
      ? (regMetrics.waitlistedRegistrations / regMetrics.totalRegistrations) * 100 
      : 0

    return NextResponse.json({
      success: true,
      analytics
    })

  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
} 