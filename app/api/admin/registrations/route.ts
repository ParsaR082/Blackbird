import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { Event, EventRegistration } from '@/lib/models/event'
import { getUserFromRequest } from '@/lib/server-utils'
import { z } from 'zod'
import mongoose from 'mongoose'

// Validation schemas
const updateRegistrationSchema = z.object({
  registrationId: z.string().min(1),
  status: z.enum(['registered', 'waitlisted', 'cancelled', 'attended']).optional(),
  notes: z.string().max(500).optional()
})

const bulkUpdateSchema = z.object({
  registrationIds: z.array(z.string().min(1)),
  action: z.enum(['cancel', 'promote', 'mark_attended']),
  sendNotification: z.boolean().optional()
})

// Get all registrations with filtering and search
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
    const status = searchParams.get('status')
    const registrationType = searchParams.get('registrationType')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    const sortBy = searchParams.get('sortBy') || 'registeredAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build query
    const query: any = {}
    
    if (eventId) {
      query.eventId = eventId
    }

    if (status && ['registered', 'waitlisted', 'cancelled', 'attended'].includes(status)) {
      query.status = status
    }

    if (registrationType && ['user', 'guest'].includes(registrationType)) {
      query.registrationType = registrationType
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

    // Search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i')
      query.$or = [
        { 'guestInfo.fullName': searchRegex },
        { 'guestInfo.email': searchRegex },
        { 'guestInfo.company': searchRegex }
      ]
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit

    // Build sort object
    const sortObj: any = {}
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1

    // Get registrations with populated data
    const registrations = await EventRegistration.find(query)
      .populate({
        path: 'eventId',
        select: 'title date time location category maxAttendees currentAttendees status'
      })
      .populate({
        path: 'userId',
        model: User,
        select: 'fullName email username studentId phoneNumber'
      })
      .sort(sortObj)
      .skip(skip)
      .limit(limit)

    // Get total count for pagination
    const totalCount = await EventRegistration.countDocuments(query)
    const totalPages = Math.ceil(totalCount / limit)

    // Get statistics
    const stats = await EventRegistration.aggregate([
      ...(eventId ? [{ $match: { eventId: new mongoose.Types.ObjectId(eventId) } }] : []),
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    const statusStats = {
      registered: 0,
      waitlisted: 0,
      cancelled: 0,
      attended: 0
    }

    stats.forEach(stat => {
      if (statusStats.hasOwnProperty(stat._id)) {
        statusStats[stat._id as keyof typeof statusStats] = stat.count
      }
    })

    // Format registrations
    const formattedRegistrations = registrations.map(reg => ({
      id: reg._id.toString(),
      eventId: reg.eventId._id.toString(),
      event: {
        title: reg.eventId.title,
        date: reg.eventId.date,
        time: reg.eventId.time,
        location: reg.eventId.location,
        category: reg.eventId.category,
        maxAttendees: reg.eventId.maxAttendees,
        currentAttendees: reg.eventId.currentAttendees,
        status: reg.eventId.status
      },
      registrationType: reg.registrationType,
      status: reg.status,
      registeredAt: reg.registeredAt,
      cancelledAt: reg.cancelledAt,
      user: reg.userId ? {
        id: reg.userId._id.toString(),
        fullName: reg.userId.fullName,
        email: reg.userId.email,
        username: reg.userId.username,
        studentId: reg.userId.studentId,
        phoneNumber: reg.userId.phoneNumber
      } : null,
      guestInfo: reg.guestInfo || null,
      createdAt: reg.createdAt,
      updatedAt: reg.updatedAt
    }))

    return NextResponse.json({
      success: true,
      registrations: formattedRegistrations,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      },
      stats: statusStats
    })

  } catch (error) {
    console.error('Admin get registrations error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    )
  }
}

// Update individual registration
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
    const result = updateRegistrationSchema.safeParse(data)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation error', details: result.error.format() },
        { status: 400 }
      )
    }

    const { registrationId, status, notes } = result.data

    // Find the registration
    const registration = await EventRegistration.findById(registrationId)
    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (status) updateData.status = status
    if (notes !== undefined) updateData.notes = notes

    // Handle status changes that affect capacity
    if (status && status !== registration.status) {
      const eventId = registration.eventId

      // Handle transitions from/to registered status
      if (registration.status === 'registered' && status !== 'registered') {
        // Moving away from registered - decrease count
        await Event.findByIdAndUpdate(eventId, {
          $inc: { currentAttendees: -1 }
        })
      } else if (registration.status !== 'registered' && status === 'registered') {
        // Moving to registered - increase count
        await Event.findByIdAndUpdate(eventId, {
          $inc: { currentAttendees: 1 }
        })
      }

      // Update event status based on capacity
      const event = await Event.findById(eventId)
      if (event) {
        if (event.currentAttendees >= event.maxAttendees && event.status !== 'full') {
          await Event.findByIdAndUpdate(eventId, { status: 'full' })
        } else if (event.currentAttendees < event.maxAttendees && event.status === 'full') {
          await Event.findByIdAndUpdate(eventId, { status: 'registration-open' })
        }
      }

      // Add cancellation timestamp if cancelling
      if (status === 'cancelled') {
        updateData.cancelledAt = new Date()
      }
    }

    // Update the registration
    const updatedRegistration = await EventRegistration.findByIdAndUpdate(
      registrationId,
      updateData,
      { new: true }
    ).populate('eventId', 'title date time location')

    return NextResponse.json({
      success: true,
      message: 'Registration updated successfully',
      registration: {
        id: updatedRegistration._id.toString(),
        status: updatedRegistration.status,
        cancelledAt: updatedRegistration.cancelledAt,
        notes: updatedRegistration.notes,
        updatedAt: updatedRegistration.updatedAt
      }
    })

  } catch (error) {
    console.error('Update registration error:', error)
    return NextResponse.json(
      { error: 'Failed to update registration' },
      { status: 500 }
    )
  }
}

// Bulk operations on registrations
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
    const result = bulkUpdateSchema.safeParse(data)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation error', details: result.error.format() },
        { status: 400 }
      )
    }

    const { registrationIds, action, sendNotification } = result.data

    // Find all registrations
    const registrations = await EventRegistration.find({
      _id: { $in: registrationIds }
    })

    if (registrations.length === 0) {
      return NextResponse.json(
        { error: 'No registrations found' },
        { status: 404 }
      )
    }

    let updateResult: any = { modifiedCount: 0, eventUpdates: [] }

    switch (action) {
      case 'cancel':
        // Cancel all selected registrations
        const cancelResult = await EventRegistration.updateMany(
          { _id: { $in: registrationIds }, status: { $ne: 'cancelled' } },
          { 
            status: 'cancelled',
            cancelledAt: new Date()
          }
        )

        // Update event attendee counts for cancelled registrations
        const eventUpdates = new Map()
        for (const reg of registrations) {
          if (reg.status === 'registered') {
            const eventId = reg.eventId.toString()
            eventUpdates.set(eventId, (eventUpdates.get(eventId) || 0) + 1)
          }
        }

        // Apply event updates
        for (const [eventId, decreaseCount] of Array.from(eventUpdates.entries())) {
          await Event.findByIdAndUpdate(eventId, {
            $inc: { currentAttendees: -decreaseCount }
          })

          // Update event status if no longer full
          const event = await Event.findById(eventId)
          if (event && event.status === 'full' && event.currentAttendees < event.maxAttendees) {
            await Event.findByIdAndUpdate(eventId, { status: 'registration-open' })
          }
        }

        updateResult = { modifiedCount: cancelResult.modifiedCount, eventUpdates: Array.from(eventUpdates.keys()) }
        break

      case 'promote':
        // Promote waitlisted registrations to registered
        const promoteResult = await EventRegistration.updateMany(
          { _id: { $in: registrationIds }, status: 'waitlisted' },
          { status: 'registered' }
        )

        // Update event attendee counts
        const promoteEventUpdates = new Map()
        for (const reg of registrations) {
          if (reg.status === 'waitlisted') {
            const eventId = reg.eventId.toString()
            promoteEventUpdates.set(eventId, (promoteEventUpdates.get(eventId) || 0) + 1)
          }
        }

        // Apply event updates
        for (const [eventId, increaseCount] of Array.from(promoteEventUpdates.entries())) {
          await Event.findByIdAndUpdate(eventId, {
            $inc: { currentAttendees: increaseCount }
          })

          // Update event status if now full
          const event = await Event.findById(eventId)
          if (event && event.currentAttendees >= event.maxAttendees) {
            await Event.findByIdAndUpdate(eventId, { status: 'full' })
          }
        }

        updateResult = { modifiedCount: promoteResult.modifiedCount, eventUpdates: Array.from(promoteEventUpdates.keys()) }
        break

      case 'mark_attended':
        // Mark as attended
        const attendResult = await EventRegistration.updateMany(
          { _id: { $in: registrationIds }, status: 'registered' },
          { status: 'attended' }
        )

        updateResult = { modifiedCount: attendResult.modifiedCount }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    // TODO: Send notifications if requested
    if (sendNotification) {
      console.log(`Should send notifications for ${action} to ${registrationIds.length} registrations`)
    }

    return NextResponse.json({
      success: true,
      message: `Bulk ${action} completed successfully`,
      result: updateResult
    })

  } catch (error) {
    console.error('Bulk update error:', error)
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    )
  }
} 