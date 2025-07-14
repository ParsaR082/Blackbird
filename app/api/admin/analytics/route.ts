import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { getUserFromRequest } from '@/lib/server-utils'
import { Product, Purchase } from '@/lib/models/product'
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

    // Define User schema for analytics
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

    // Define Event schema
    const EventSchema = new mongoose.Schema({
      title: String,
      description: String,
      startDate: Date,
      endDate: Date,
      location: String,
      category: String,
      isActive: Boolean,
      isFeatured: Boolean,
      maxParticipants: Number,
      createdBy: mongoose.Schema.Types.ObjectId,
      createdAt: Date,
      updatedAt: Date
    })

    const Event = mongoose.models.Event || mongoose.model('Event', EventSchema)

    // Get user count
    const usersCount = await User.countDocuments()
    
    // Get active events count
    const eventsCount = await Event.countDocuments({ isActive: true })
    
    // Get purchases count
    const purchasesCount = await Purchase.countDocuments()
    
    // Get pending purchases count
    const pendingPurchasesCount = await Purchase.countDocuments({ status: 'pending' })

    // Get product count
    const productsCount = await Product.countDocuments({ isActive: true })

    // Get recent purchases
    const recentPurchases = await Purchase.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: 'productId',
        model: Product,
        select: 'name'
      })
      .lean()

    // Format recent purchases
    const formattedRecentPurchases = recentPurchases.map((purchase: any) => ({
      id: purchase._id.toString(),
      productName: purchase.productId?.name || 'Unknown Product',
      totalAmount: purchase.totalAmount,
      currency: purchase.currency,
      buyerType: purchase.buyerType,
      status: purchase.status,
      createdAt: purchase.createdAt
    }))

    return NextResponse.json({
      success: true,
      stats: {
        usersCount,
        eventsCount,
        purchasesCount,
        pendingPurchasesCount,
        productsCount
      },
      recentActivity: {
        purchases: formattedRecentPurchases
      }
    })

  } catch (error) {
    console.error('Admin analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
} 