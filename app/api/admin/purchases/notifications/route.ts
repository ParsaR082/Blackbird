import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { GuestNotification } from '@/lib/models/product'
import { getUserFromRequest } from '@/lib/server-utils'

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
    const purchaseId = searchParams.get('purchaseId')

    if (!purchaseId) {
      return NextResponse.json(
        { error: 'Purchase ID is required' },
        { status: 400 }
      )
    }

    // Get notifications for the purchase
    const notifications = await GuestNotification.find({ purchaseId })
      .sort({ createdAt: -1 })

    const formattedNotifications = notifications.map(notification => ({
      id: notification._id.toString(),
      type: notification.type,
      message: notification.message,
      sentAt: notification.sentAt,
      isRead: notification.isRead,
      createdAt: notification.createdAt
    }))

    return NextResponse.json({
      success: true,
      notifications: formattedNotifications
    })

  } catch (error) {
    console.error('Fetch notifications error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

// Mark a notification as read
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
    const { notificationId, isRead = true } = data
    
    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      )
    }

    // Update the notification
    const updatedNotification = await GuestNotification.findByIdAndUpdate(
      notificationId,
      { $set: { isRead } },
      { new: true }
    )

    if (!updatedNotification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      notification: {
        id: updatedNotification._id.toString(),
        isRead: updatedNotification.isRead
      }
    })

  } catch (error) {
    console.error('Update notification error:', error)
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    )
  }
} 