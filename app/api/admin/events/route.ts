import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { Event } from '@/lib/models/event'
import mongoose from 'mongoose'
import { getUserFromRequest } from '@/lib/server-utils'
import { z } from 'zod'

// Validation schemas
const createEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(500),
  detailDescription: z.string().max(2000).optional(),
  dateTime: z.string().min(1), // Will be parsed to separate date and time
  duration: z.number().min(0.5).max(72),
  location: z.string().min(1).max(200),
  category: z.enum(['workshops', 'hackathons', 'conferences', 'networking']),
  maxAttendees: z.number().min(1),
  featured: z.boolean().optional(),
  prerequisites: z.array(z.string().max(200)).optional(),
  whatYouWillLearn: z.array(z.string().max(200)).optional(),
  imageUrl: z.string().url().optional()
})

const updateEventSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(500).optional(),
  detailDescription: z.string().max(2000).optional(),
  dateTime: z.string().optional(),
  duration: z.number().min(0.5).max(72).optional(),
  location: z.string().min(1).max(200).optional(),
  category: z.enum(['workshops', 'hackathons', 'conferences', 'networking']).optional(),
  maxAttendees: z.number().min(1).optional(),
  status: z.enum(['upcoming', 'registration-open', 'full', 'completed', 'cancelled']).optional(),
  featured: z.boolean().optional(),
  prerequisites: z.array(z.string().max(200)).optional(),
  whatYouWillLearn: z.array(z.string().max(200)).optional(),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().optional()
})

export async function POST(request: NextRequest) {
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

    const data = await request.json()
    
    // Validate input
    const result = createEventSchema.safeParse(data)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation error', details: result.error.format() },
        { status: 400 }
      )
    }

    const eventData = result.data

    // Parse dateTime into date and time
    const dateTime = new Date(eventData.dateTime)
    const date = new Date(dateTime.getFullYear(), dateTime.getMonth(), dateTime.getDate())
    const time = `${dateTime.getHours().toString().padStart(2, '0')}:${dateTime.getMinutes().toString().padStart(2, '0')}`

    // Create event
    const event = await Event.create({
      title: eventData.title,
      description: eventData.description,
      detailDescription: eventData.detailDescription || eventData.description,
      date,
      time,
      duration: eventData.duration,
      location: eventData.location,
      category: eventData.category,
      maxAttendees: eventData.maxAttendees,
      featured: eventData.featured || false,
      prerequisites: eventData.prerequisites || [],
      whatYouWillLearn: eventData.whatYouWillLearn || [],
      imageUrl: eventData.imageUrl,
      createdBy: currentUser.id,
      status: 'upcoming'
    })

    return NextResponse.json({
      success: true,
      message: 'Event created successfully',
      event: {
        id: event._id.toString(),
        title: event.title,
        description: event.description,
        detailDescription: event.detailDescription,
        date: event.date.toISOString().split('T')[0],
        time: event.time,
        duration: event.duration,
        location: event.location,
        category: event.category,
        maxAttendees: event.maxAttendees,
        currentAttendees: event.currentAttendees,
        status: event.status,
        featured: event.featured,
        prerequisites: event.prerequisites,
        whatYouWillLearn: event.whatYouWillLearn,
        imageUrl: event.imageUrl,
        isActive: event.isActive,
        createdAt: event.createdAt
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Create event error:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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

    const data = await request.json()
    
    // Validate input
    const result = updateEventSchema.safeParse(data)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation error', details: result.error.format() },
        { status: 400 }
      )
    }

    const { id, dateTime, ...updateData } = result.data

    // Prepare update object
    const updateObject: any = { ...updateData }

    // Handle dateTime parsing if provided
    if (dateTime) {
      const parsedDateTime = new Date(dateTime)
      updateObject.date = new Date(parsedDateTime.getFullYear(), parsedDateTime.getMonth(), parsedDateTime.getDate())
      updateObject.time = `${parsedDateTime.getHours().toString().padStart(2, '0')}:${parsedDateTime.getMinutes().toString().padStart(2, '0')}`
    }

    // Update event
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { $set: updateObject },
      { new: true }
    )

    if (!updatedEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Event updated successfully',
      event: {
        id: updatedEvent._id.toString(),
        title: updatedEvent.title,
        description: updatedEvent.description,
        detailDescription: updatedEvent.detailDescription,
        date: updatedEvent.date.toISOString().split('T')[0],
        time: updatedEvent.time,
        duration: updatedEvent.duration,
        location: updatedEvent.location,
        category: updatedEvent.category,
        maxAttendees: updatedEvent.maxAttendees,
        currentAttendees: updatedEvent.currentAttendees,
        status: updatedEvent.status,
        featured: updatedEvent.featured,
        prerequisites: updatedEvent.prerequisites,
        whatYouWillLearn: updatedEvent.whatYouWillLearn,
        imageUrl: updatedEvent.imageUrl,
        isActive: updatedEvent.isActive,
        updatedAt: updatedEvent.updatedAt
      }
    })

  } catch (error) {
    console.error('Update event error:', error)
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    // Soft delete event by setting isActive to false
    const deletedEvent = await Event.findByIdAndUpdate(
      id,
      { $set: { isActive: false, status: 'cancelled' } },
      { new: true }
    )

    if (!deletedEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully'
    })

  } catch (error) {
    console.error('Delete event error:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}

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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const includeInactive = searchParams.get('includeInactive') === 'true'

    // Build query
    const query: any = {}
    
    if (!includeInactive) {
      query.isActive = true
    }

    if (category && ['workshops', 'hackathons', 'conferences', 'networking'].includes(category)) {
      query.category = category
    }

    if (status && ['upcoming', 'registration-open', 'full', 'completed', 'cancelled'].includes(status)) {
      query.status = status
    }

    // Define User schema
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
        select: 'fullName username email'
      })
      .sort({ createdAt: -1 })
      .limit(limit)

    // Get status counts
    const statusCounts = await Event.aggregate([
      { $match: includeInactive ? {} : { isActive: true } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    const statusCountsFormatted = {
      upcoming: 0,
      'registration-open': 0,
      full: 0,
      completed: 0,
      cancelled: 0
    }

    statusCounts.forEach(item => {
      if (item._id && statusCountsFormatted.hasOwnProperty(item._id)) {
        statusCountsFormatted[item._id as keyof typeof statusCountsFormatted] = item.count
      }
    })

    // Format events
    const formattedEvents = events.map(event => ({
      id: event._id.toString(),
      title: event.title,
      description: event.description,
      detailDescription: event.detailDescription,
      date: event.date.toISOString().split('T')[0],
      time: event.time,
      duration: event.duration,
      location: event.location,
      category: event.category,
      maxAttendees: event.maxAttendees,
      currentAttendees: event.currentAttendees,
      status: event.status,
      featured: event.featured,
      prerequisites: event.prerequisites,
      whatYouWillLearn: event.whatYouWillLearn,
      imageUrl: event.imageUrl,
      isActive: event.isActive,
      createdBy: {
        id: event.createdBy._id.toString(),
        name: event.createdBy.fullName,
        username: event.createdBy.username,
        email: event.createdBy.email
      },
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    }))

    return NextResponse.json({
      success: true,
      events: formattedEvents,
      statusCounts: statusCountsFormatted,
      total: formattedEvents.length
    })

  } catch (error) {
    console.error('Admin get events error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
} 