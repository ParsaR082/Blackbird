import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { Event, EventRegistration } from '@/lib/models/event'
import { getUserFromRequest } from '@/lib/server-utils'
import { z } from 'zod'

// Validation schemas
const userRegistrationSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required')
})

const guestRegistrationSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  guestInfo: z.object({
    fullName: z.string().min(1, 'Full name is required').max(100),
    email: z.string().email('Valid email is required'),
    phoneNumber: z.string().min(1, 'Phone number is required'),
    company: z.string().max(100).optional(),
    notes: z.string().max(500).optional()
  })
})

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const data = await request.json()
    const { registrationType } = data

    // Get current user for user registrations
    const currentUser = await getUserFromRequest(request)
    
    if (registrationType === 'user') {
      if (!currentUser) {
        return NextResponse.json(
          { error: 'Authentication required for user registration' },
          { status: 401 }
        )
      }

      // Validate user registration data
      const result = userRegistrationSchema.safeParse(data)
      if (!result.success) {
        return NextResponse.json(
          { error: 'Validation error', details: result.error.format() },
          { status: 400 }
        )
      }

      const { eventId } = result.data

      // Check if event exists and is active
      const event = await Event.findById(eventId)
      if (!event || !event.isActive) {
        return NextResponse.json(
          { error: 'Event not found or inactive' },
          { status: 404 }
        )
      }

      // Check if user is already registered
      const existingRegistration = await EventRegistration.findOne({
        eventId,
        userId: currentUser.id,
        status: { $in: ['registered', 'waitlisted'] }
      })

      if (existingRegistration) {
        return NextResponse.json(
          { error: 'You are already registered for this event' },
          { status: 409 }
        )
      }

      // Determine registration status based on capacity
      const currentRegistrations = await EventRegistration.countDocuments({
        eventId,
        status: 'registered'
      })

      const registrationStatus = currentRegistrations >= event.maxAttendees ? 'waitlisted' : 'registered'
      
      // Create registration
      const registration = await EventRegistration.create({
        eventId,
        userId: currentUser.id,
        registrationType: 'user',
        status: registrationStatus
      })

      // Update event attendee count if registered (not waitlisted)
      if (registrationStatus === 'registered') {
        await Event.findByIdAndUpdate(eventId, {
          $inc: { currentAttendees: 1 }
        })

        // Update event status if now full
        const updatedEvent = await Event.findById(eventId)
        if (updatedEvent && updatedEvent.currentAttendees >= updatedEvent.maxAttendees) {
          await Event.findByIdAndUpdate(eventId, {
            status: 'full'
          })
        }
      }

      return NextResponse.json({
        success: true,
        message: registrationStatus === 'registered' 
          ? 'Successfully registered for the event'
          : 'Event is full. You have been added to the waitlist',
        registration: {
          id: registration._id.toString(),
          status: registration.status,
          registeredAt: registration.registeredAt
        }
      }, { status: 201 })

    } else if (registrationType === 'guest') {
      // Validate guest registration data
      const result = guestRegistrationSchema.safeParse(data)
      if (!result.success) {
        return NextResponse.json(
          { error: 'Validation error', details: result.error.format() },
          { status: 400 }
        )
      }

      const { eventId, guestInfo } = result.data

      // Check if event exists and is active
      const event = await Event.findById(eventId)
      if (!event || !event.isActive) {
        return NextResponse.json(
          { error: 'Event not found or inactive' },
          { status: 404 }
        )
      }

      // Check if guest email is already registered
      const existingRegistration = await EventRegistration.findOne({
        eventId,
        'guestInfo.email': guestInfo.email.toLowerCase(),
        status: { $in: ['registered', 'waitlisted'] }
      })

      if (existingRegistration) {
        return NextResponse.json(
          { error: 'This email is already registered for this event' },
          { status: 409 }
        )
      }

      // Determine registration status based on capacity
      const currentRegistrations = await EventRegistration.countDocuments({
        eventId,
        status: 'registered'
      })

      const registrationStatus = currentRegistrations >= event.maxAttendees ? 'waitlisted' : 'registered'

      // Create registration
      const registration = await EventRegistration.create({
        eventId,
        guestInfo: {
          ...guestInfo,
          email: guestInfo.email.toLowerCase()
        },
        registrationType: 'guest',
        status: registrationStatus
      })

      // Update event attendee count if registered (not waitlisted)
      if (registrationStatus === 'registered') {
        await Event.findByIdAndUpdate(eventId, {
          $inc: { currentAttendees: 1 }
        })

        // Update event status if now full
        const updatedEvent = await Event.findById(eventId)
        if (updatedEvent && updatedEvent.currentAttendees >= updatedEvent.maxAttendees) {
          await Event.findByIdAndUpdate(eventId, {
            status: 'full'
          })
        }
      }

      return NextResponse.json({
        success: true,
        message: registrationStatus === 'registered' 
          ? 'Successfully registered for the event'
          : 'Event is full. You have been added to the waitlist',
        registration: {
          id: registration._id.toString(),
          status: registration.status,
          registeredAt: registration.registeredAt
        }
      }, { status: 201 })

    } else {
      return NextResponse.json(
        { error: 'Invalid registration type. Must be "user" or "guest"' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to register for event' },
      { status: 500 }
    )
  }
}

// Get user's registrations
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request)
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    if (eventId) {
      // Check specific event registration
      const registration = await EventRegistration.findOne({
        eventId,
        userId: currentUser.id,
        status: { $in: ['registered', 'waitlisted'] }
      })

      return NextResponse.json({
        success: true,
        isRegistered: !!registration,
        registration: registration ? {
          id: registration._id.toString(),
          status: registration.status,
          registeredAt: registration.registeredAt
        } : null
      })
    } else {
      // Get all user registrations
      const registrations = await EventRegistration.find({
        userId: currentUser.id,
        status: { $in: ['registered', 'waitlisted'] }
      }).populate('eventId')

      return NextResponse.json({
        success: true,
        registrations: registrations.map(reg => ({
          id: reg._id.toString(),
          status: reg.status,
          registeredAt: reg.registeredAt,
          event: {
            id: reg.eventId._id.toString(),
            title: reg.eventId.title,
            date: reg.eventId.date,
            time: reg.eventId.time,
            location: reg.eventId.location
          }
        }))
      })
    }

  } catch (error) {
    console.error('Get registrations error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    )
  }
} 