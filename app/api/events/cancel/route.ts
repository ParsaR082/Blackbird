import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Event, EventRegistration } from '@/lib/models/event'
import { getUserFromRequest } from '@/lib/server-utils'
import { z } from 'zod'

const cancelRegistrationSchema = z.object({
  registrationId: z.string().min(1, 'Registration ID is required')
})

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const data = await request.json()
    
    // Validate input
    const result = cancelRegistrationSchema.safeParse(data)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation error', details: result.error.format() },
        { status: 400 }
      )
    }

    const { registrationId } = result.data

    // Find the registration
    const registration = await EventRegistration.findById(registrationId)
    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      )
    }

    // Check authorization - user can only cancel their own registration
    const currentUser = await getUserFromRequest(request)
    if (registration.registrationType === 'user') {
      if (!currentUser || registration.userId.toString() !== currentUser.id) {
        return NextResponse.json(
          { error: 'Unauthorized to cancel this registration' },
          { status: 403 }
        )
      }
    } else {
      // For guest cancellations, we might want to add email verification or other auth method
      // For now, allowing cancellation by registration ID (could be improved with email verification)
    }

    // Check if registration is already cancelled
    if (registration.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Registration is already cancelled' },
        { status: 409 }
      )
    }

    const eventId = registration.eventId
    const wasRegistered = registration.status === 'registered'

    // Cancel the registration
    await EventRegistration.findByIdAndUpdate(registrationId, {
      status: 'cancelled',
      cancelledAt: new Date()
    })

    // If the user was registered (not waitlisted), handle capacity management
    if (wasRegistered) {
      // Decrease current attendees count
      await Event.findByIdAndUpdate(eventId, {
        $inc: { currentAttendees: -1 }
      })

      // Find next waitlisted person and promote them
      const nextWaitlisted = await EventRegistration.findOne({
        eventId,
        status: 'waitlisted'
      }).sort({ registeredAt: 1 }) // First in, first promoted

      if (nextWaitlisted) {
        // Promote from waitlist to registered
        await EventRegistration.findByIdAndUpdate(nextWaitlisted._id, {
          status: 'registered'
        })

        // Increase attendees count
        await Event.findByIdAndUpdate(eventId, {
          $inc: { currentAttendees: 1 }
        })

        // TODO: Send notification to promoted user
        console.log(`Promoted registration ${nextWaitlisted._id} from waitlist for event ${eventId}`)
      }

      // Update event status if no longer full
      const event = await Event.findById(eventId)
      if (event && event.status === 'full' && event.currentAttendees < event.maxAttendees) {
        await Event.findByIdAndUpdate(eventId, {
          status: 'registration-open'
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Registration cancelled successfully'
    })

  } catch (error) {
    console.error('Cancel registration error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel registration' },
      { status: 500 }
    )
  }
}

// Get registration details for cancellation (optional endpoint for getting cancellation info)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const registrationId = searchParams.get('registrationId')

    if (!registrationId) {
      return NextResponse.json(
        { error: 'Registration ID is required' },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const registration = await EventRegistration.findById(registrationId)
      .populate('eventId', 'title date time location')

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      )
    }

    // Check authorization
    const currentUser = await getUserFromRequest(request)
    if (registration.registrationType === 'user') {
      if (!currentUser || registration.userId.toString() !== currentUser.id) {
        return NextResponse.json(
          { error: 'Unauthorized to view this registration' },
          { status: 403 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      registration: {
        id: registration._id.toString(),
        status: registration.status,
        registrationType: registration.registrationType,
        registeredAt: registration.registeredAt,
        cancelledAt: registration.cancelledAt,
        event: {
          id: registration.eventId._id.toString(),
          title: registration.eventId.title,
          date: registration.eventId.date,
          time: registration.eventId.time,
          location: registration.eventId.location
        }
      }
    })

  } catch (error) {
    console.error('Get registration error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch registration' },
      { status: 500 }
    )
  }
} 