import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { Event } from '@/lib/models/event'
import mongoose from 'mongoose'

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    // Get query parameters
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const search = url.searchParams.get('search')
    const status = url.searchParams.get('status') || 'upcoming,registration-open'

    // Build query
    const query: any = { isActive: true }
    
    if (category && ['workshops', 'hackathons', 'conferences', 'networking'].includes(category)) {
      query.category = category
    }

    // Handle multiple statuses
    const statusArray = status.split(',').filter(s => 
      ['upcoming', 'registration-open', 'full', 'completed', 'cancelled'].includes(s)
    )
    if (statusArray.length > 0) {
      query.status = { $in: statusArray }
    }

    if (search) {
      query.$text = { $search: search }
    }

    // Define User schema for populated data
    const UserSchema = new mongoose.Schema({
      studentId: String,
      phoneNumber: String,
      username: String,
      email: String,
      password: String,
      fullName: String,
      role: String,
      isVerified: Boolean,
      avatarUrl: String,
      createdAt: Date,
      updatedAt: Date
    })

    const User = mongoose.models.User || mongoose.model('User', UserSchema)

    // Get events with creator info
    const events = await Event.find(query)
      .populate({
        path: 'createdBy',
        model: User,
        select: 'fullName username'
      })
      .sort({ date: 1, featured: -1 }) // Sort by date, featured events first
      .limit(limit)

    // Get category counts for active events
    const categoryAggregation = await Event.aggregate([
      { $match: { isActive: true, status: { $in: statusArray } } },
      { 
        $group: { 
          _id: '$category', 
          count: { $sum: 1 } 
        } 
      }
    ])

    const categoryCounts = {
      workshops: 0,
      hackathons: 0,
      conferences: 0,
      networking: 0
    }

    categoryAggregation.forEach(item => {
      if (item._id && categoryCounts.hasOwnProperty(item._id)) {
        categoryCounts[item._id as keyof typeof categoryCounts] = item.count
      }
    })

    // Calculate total count
    const totalCount = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0)

    // Format the response
    const formattedEvents = events
      .filter(event => event.createdBy) // Filter out events with null createdBy
      .map(event => {
        // Calculate time until event
        const now = new Date()
        const eventDateTime = new Date(event.date)
        const [hours, minutes] = event.time.split(':').map(Number)
        eventDateTime.setHours(hours, minutes)
        
        const timeDiff = eventDateTime.getTime() - now.getTime()
        let timeUntilEvent = "Event has started"
        
        if (timeDiff > 0) {
          const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
          const hoursLeft = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
          
          if (days > 0) {
            timeUntilEvent = `Starts in ${days} day${days > 1 ? 's' : ''}, ${hoursLeft} hour${hoursLeft > 1 ? 's' : ''}`
          } else if (hoursLeft > 0) {
            timeUntilEvent = `Starts in ${hoursLeft} hour${hoursLeft > 1 ? 's' : ''}, ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}`
          } else {
            timeUntilEvent = `Starts in ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}`
          }
        }

        return {
          id: event._id.toString(),
          title: event.title,
          description: event.description,
          detailDescription: event.detailDescription || event.description,
          date: event.date.toISOString().split('T')[0], // YYYY-MM-DD format
          time: event.time,
          duration: `${event.duration} hour${event.duration !== 1 ? 's' : ''}`,
          location: event.location,
          category: event.category,
          attendees: event.currentAttendees,
          maxAttendees: event.maxAttendees,
          status: event.status,
          featured: event.featured,
          prerequisites: event.prerequisites,
          whatYouWillLearn: event.whatYouWillLearn,
          imageUrl: event.imageUrl,
          createdBy: {
            name: event.createdBy.fullName || 'Unknown User',
            username: event.createdBy.username || 'unknown'
          },
          timeUntilEvent,
          createdAt: event.createdAt
        }
      })

    return NextResponse.json({
      success: true,
      events: formattedEvents,
      categoryCounts: {
        all: totalCount,
        ...categoryCounts
      },
      total: formattedEvents.length
    })

  } catch (error) {
    console.error('Events fetch error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch events' 
      },
      { status: 500 }
    )
  }
} 