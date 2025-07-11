import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { Product, Purchase, GuestNotification } from '@/lib/models/product'
import mongoose from 'mongoose'
import { getUserFromRequest } from '@/lib/server-utils'
import { sendPurchaseNotification } from '@/lib/email-service'
import { z } from 'zod'

// Validation schema
const updatePurchaseSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['pending', 'approved', 'rejected', 'completed', 'cancelled']),
  adminNotes: z.string().max(1000).optional()
})

// GET - Get all purchases for admin review
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
    const status = searchParams.get('status')
    const buyerType = searchParams.get('buyerType')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build query
    const query: any = {}
    if (status && ['pending', 'approved', 'rejected', 'completed', 'cancelled'].includes(status)) {
      query.status = status
    }
    if (buyerType && ['guest', 'user', 'admin'].includes(buyerType)) {
      query.buyerType = buyerType
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

    // Get purchases with all related data
    const purchases = await Purchase.find(query)
      .populate({
        path: 'productId',
        model: Product,
        select: 'name description price currency category imageUrl'
      })
      .populate({
        path: 'userId',
        model: User,
        select: 'fullName username email'
      })
      .populate({
        path: 'approvedBy',
        model: User,
        select: 'fullName username'
      })
      .sort({ createdAt: -1 })
      .limit(limit)

    // Get status counts
    const statusCounts = await Purchase.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    const statusCountsFormatted = {
      pending: 0,
      approved: 0,
      rejected: 0,
      completed: 0,
      cancelled: 0
    }

    statusCounts.forEach(item => {
      if (item._id && statusCountsFormatted.hasOwnProperty(item._id)) {
        statusCountsFormatted[item._id as keyof typeof statusCountsFormatted] = item.count
      }
    })

    // Format purchases
    const formattedPurchases = purchases.map(purchase => ({
      id: purchase._id.toString(),
      product: {
        id: purchase.productId._id.toString(),
        name: purchase.productId.name,
        description: purchase.productId.description,
        price: purchase.productId.price,
        currency: purchase.productId.currency,
        category: purchase.productId.category,
        imageUrl: purchase.productId.imageUrl
      },
      quantity: purchase.quantity,
      totalAmount: purchase.totalAmount,
      currency: purchase.currency,
      buyerType: purchase.buyerType,
      buyer: purchase.buyerType === 'guest' ? {
        type: 'guest',
        info: purchase.guestInfo
      } : {
        type: purchase.buyerType,
        info: {
          id: purchase.userId._id.toString(),
          name: purchase.userId.fullName,
          username: purchase.userId.username,
          email: purchase.userId.email
        }
      },
      status: purchase.status,
      adminNotes: purchase.adminNotes,
      approvedBy: purchase.approvedBy ? {
        name: purchase.approvedBy.fullName,
        username: purchase.approvedBy.username
      } : null,
      approvedAt: purchase.approvedAt,
      createdAt: purchase.createdAt
    }))

    return NextResponse.json({
      success: true,
      purchases: formattedPurchases,
      statusCounts: statusCountsFormatted,
      total: formattedPurchases.length
    })

  } catch (error) {
    console.error('Admin get purchases error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch purchases' },
      { status: 500 }
    )
  }
}

// PUT - Update purchase status (approve/reject/complete)
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
    const result = updatePurchaseSchema.safeParse(data)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation error', details: result.error.format() },
        { status: 400 }
      )
    }

    const { id, status, adminNotes } = result.data

    // Get purchase details
    const purchase = await Purchase.findById(id)
      .populate({
        path: 'productId',
        model: Product,
        select: 'name'
      })

    if (!purchase) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      )
    }

    // Update purchase
    const updatedPurchase = await Purchase.findByIdAndUpdate(
      id,
      {
        $set: {
          status,
          adminNotes,
          approvedBy: currentUser.id,
          approvedAt: new Date()
        }
      },
      { new: true }
    )

    // Send notification to guest if applicable
    if (purchase.buyerType === 'guest' && purchase.guestInfo) {
      let notificationMessage = ''
      
      switch (status) {
        case 'approved':
          notificationMessage = `Great news! Your purchase request for "${purchase.productId.name}" has been approved. Our team will contact you soon to finalize the details and arrange delivery.`
          break
        case 'rejected':
          notificationMessage = `We regret to inform you that your purchase request for "${purchase.productId.name}" could not be processed at this time. ${adminNotes ? `Reason: ${adminNotes}` : ''} Please contact us if you have any questions.`
          break
        case 'completed':
          notificationMessage = `Your purchase of "${purchase.productId.name}" has been completed successfully. Thank you for choosing our services!`
          break
        case 'cancelled':
          notificationMessage = `Your purchase request for "${purchase.productId.name}" has been cancelled. ${adminNotes ? `Reason: ${adminNotes}` : ''} Please contact us if you need assistance.`
          break
      }

      if (notificationMessage) {
        // Create notification in database
        const notification = await GuestNotification.create({
          purchaseId: purchase._id,
          email: purchase.guestInfo.email,
          type: 'status_update',
          message: notificationMessage
        })
        
        // Send email notification
        await sendPurchaseNotification(
          purchase.guestInfo.email,
          'status_update',
          notificationMessage,
          {
            productName: purchase.productId.name,
            quantity: purchase.quantity,
            totalAmount: purchase.totalAmount,
            currency: purchase.currency,
            status: status
          }
        )
      }
    }

    // If rejected or cancelled, restore stock
    if ((status === 'rejected' || status === 'cancelled') && purchase.status !== 'rejected' && purchase.status !== 'cancelled') {
      const product = await Product.findById(purchase.productId)
      if (product && product.stock !== null) {
        await Product.findByIdAndUpdate(
          purchase.productId,
          { $inc: { stock: purchase.quantity } }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: `Purchase ${status} successfully`,
      purchase: {
        id: updatedPurchase._id.toString(),
        status: updatedPurchase.status,
        adminNotes: updatedPurchase.adminNotes,
        approvedAt: updatedPurchase.approvedAt
      }
    })

  } catch (error) {
    console.error('Update purchase error:', error)
    return NextResponse.json(
      { error: 'Failed to update purchase' },
      { status: 500 }
    )
  }
} 