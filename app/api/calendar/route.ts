export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { getUserFromRequest } from '@/lib/server-utils'
import mongoose from 'mongoose'

// Calendar Event Schema
const calendarEventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  date: {
    type: Date,
    required: true
  },
  time: String,
  duration: Number,
  location: String,
  category: String,
  color: {
    type: String,
    default: '#2D8EFF'
  },
  reminder: {
    type: Boolean,
    default: true
  },
  reminderTime: {
    type: Number, // minutes before event
    default: 30
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Create model if it doesn't exist
const CalendarEvent = mongoose.models.CalendarEvent || mongoose.model('CalendarEvent', calendarEventSchema)

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request)
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDatabase()

    const data = await request.json()
    const { eventId, title, description, date, time, duration, location, category } = data

    // Check if event is already in user's calendar
    const existingEvent = await CalendarEvent.findOne({
      userId: currentUser.id,
      eventId: eventId
    })

    if (existingEvent) {
      return NextResponse.json(
        { error: 'Event already in calendar' },
        { status: 400 }
      )
    }

    // Create calendar event
    const calendarEvent = await CalendarEvent.create({
      userId: currentUser.id,
      eventId: eventId,
      title,
      description,
      date: new Date(date),
      time,
      duration,
      location,
      category
    })

    return NextResponse.json({
      success: true,
      message: 'Event added to calendar',
      calendarEvent
    })

  } catch (error) {
    console.error('Add to calendar error:', error)
    return NextResponse.json(
      { error: 'Failed to add event to calendar' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request)
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build query
    const query: any = { userId: currentUser.id }
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }

    // Get calendar events
    const calendarEvents = await CalendarEvent.find(query)
      .sort({ date: 1 })
      .populate('eventId', 'title description imageUrl')

    return NextResponse.json({
      success: true,
      calendarEvents: calendarEvents.map(event => ({
        id: event._id.toString(),
        eventId: event.eventId._id.toString(),
        title: event.title,
        description: event.description,
        date: event.date.toISOString().split('T')[0],
        time: event.time,
        duration: event.duration,
        location: event.location,
        category: event.category,
        color: event.color,
        reminder: event.reminder,
        reminderTime: event.reminderTime,
        createdAt: event.createdAt
      }))
    })

  } catch (error) {
    console.error('Get calendar events error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request)
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    // Delete calendar event
    const deletedEvent = await CalendarEvent.findOneAndDelete({
      userId: currentUser.id,
      eventId: eventId
    })

    if (!deletedEvent) {
      return NextResponse.json(
        { error: 'Calendar event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Event removed from calendar'
    })

  } catch (error) {
    console.error('Remove from calendar error:', error)
    return NextResponse.json(
      { error: 'Failed to remove event from calendar' },
      { status: 500 }
    )
  }
} 