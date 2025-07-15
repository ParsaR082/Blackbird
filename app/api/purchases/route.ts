import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Product, Purchase, GuestNotification } from '@/lib/models/product'
import mongoose from 'mongoose'
import { getUserFromRequest } from '@/lib/server-utils'
import { sendPurchaseNotification } from '@/lib/email-service'
import { z } from 'zod'

// Validation schemas
const guestPurchaseSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().min(1),
  guestInfo: z.object({
    fullName: z.string().min(1).max(100),
    email: z.string().email(),
    phoneNumber: z.string().min(1),
    company: z.string().max(100).optional(),
    address: z.string().min(1).max(200),
    city: z.string().min(1).max(50),
    country: z.string().min(1).max(50),
    notes: z.string().max(500).optional()
  })
})

const userPurchaseSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().min(1)
})

// GET - Get user's purchases (for authenticated users)
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

    // Get user's purchases with product details
    const purchases = await Purchase.find({ 
      buyerType: { $in: ['user', 'admin'] },
      userId: currentUser.id 
    })
    .populate({
      path: 'productId',
      model: Product,
      select: 'name description price currency category imageUrl'
    })
    .populate({
      path: 'approvedBy',
      model: User,
      select: 'fullName username'
    })
    .sort({ createdAt: -1 })

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
      purchases: formattedPurchases
    })

  } catch (error) {
    console.error('Get purchases error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch purchases' },
      { status: 500 }
    )
  }
}

// POST - Create new purchase
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const data = await request.json()
    const currentUser = await getUserFromRequest(request)
    
    let purchaseData: any
    let buyerType: 'guest' | 'user' | 'admin'

    if (currentUser) {
      // Authenticated user/admin purchase
      const result = userPurchaseSchema.safeParse(data)
      if (!result.success) {
        return NextResponse.json(
          { error: 'Validation error', details: result.error.format() },
          { status: 400 }
        )
      }

      buyerType = currentUser.role === 'ADMIN' ? 'admin' : 'user'
      purchaseData = {
        ...result.data,
        buyerType,
        userId: currentUser.id
      }
    } else {
      // Guest purchase
      const result = guestPurchaseSchema.safeParse(data)
      if (!result.success) {
        return NextResponse.json(
          { error: 'Validation error', details: result.error.format() },
          { status: 400 }
        )
      }

      buyerType = 'guest'
      purchaseData = {
        ...result.data,
        buyerType
      }
    }

    // Get product details
    const product = await Product.findById(purchaseData.productId)
    if (!product || !product.isActive) {
      return NextResponse.json(
        { error: 'Product not found or not available' },
        { status: 404 }
      )
    }

    // Check stock if applicable
    if (product.stock !== null && product.stock < purchaseData.quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      )
    }

    // Calculate total amount
    const totalAmount = product.price * purchaseData.quantity

    // Create purchase
    const purchase = await Purchase.create({
      productId: product._id,
      quantity: purchaseData.quantity,
      totalAmount,
      currency: product.currency,
      buyerType,
      userId: purchaseData.userId,
      guestInfo: purchaseData.guestInfo,
      status: 'pending'
    })

    // Update stock if applicable
    if (product.stock !== null) {
      await Product.findByIdAndUpdate(
        product._id,
        { $inc: { stock: -purchaseData.quantity } }
      )
    }

    // Send notification to guest if applicable
    if (buyerType === 'guest') {
      const notificationMessage = `Thank you for your interest in "${product.name}". We have received your purchase request and will contact you shortly regarding the details. Our team will reach out to you within 24 hours to process your order.`
      
      // Create notification in database
      const notification = await GuestNotification.create({
        purchaseId: purchase._id,
        email: purchaseData.guestInfo.email,
        type: 'purchase_received',
        message: notificationMessage
      })
      
      // Send email notification
      await sendPurchaseNotification(
        purchaseData.guestInfo.email,
        'purchase_received',
        notificationMessage,
        {
          productName: product.name,
          quantity: purchase.quantity,
          totalAmount: purchase.totalAmount,
          currency: purchase.currency,
          status: 'pending'
        }
      )
    }

    return NextResponse.json({
      success: true,
      message: buyerType === 'guest' 
        ? 'Purchase request submitted successfully. We will contact you shortly.'
        : 'Purchase request submitted successfully. Please wait for admin approval.',
      purchase: {
        id: purchase._id.toString(),
        productName: product.name,
        quantity: purchase.quantity,
        totalAmount: purchase.totalAmount,
        currency: purchase.currency,
        status: purchase.status,
        redirectToAdmin: buyerType !== 'guest'
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Create purchase error:', error)
    return NextResponse.json(
      { error: 'Failed to create purchase' },
      { status: 500 }
    )
  }
} 