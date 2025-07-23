export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Product } from '@/lib/models/product'
import mongoose from 'mongoose'

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    // Get query parameters
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const search = url.searchParams.get('search')

    // Build query
    const query: any = { isActive: true }
    
    if (category && ['Software', 'Hardware', 'Service', 'Consultation', 'Training', 'License', 'Other'].includes(category)) {
      query.category = category
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

    // Get products with creator info
    const products = await Product.find(query)
      .populate({
        path: 'createdBy',
        model: User,
        select: 'fullName username'
      })
      .sort({ createdAt: -1 })
      .limit(limit)

    // Get category counts
    const categoryAggregation = await Product.aggregate([
      { $match: { isActive: true } },
      { 
        $group: { 
          _id: '$category', 
          count: { $sum: 1 } 
        } 
      }
    ])

    const categoryCounts = {
      Software: 0,
      Hardware: 0,
      Service: 0,
      Consultation: 0,
      Training: 0,
      License: 0,
      Other: 0
    }

    categoryAggregation.forEach(item => {
      if (item._id && categoryCounts.hasOwnProperty(item._id)) {
        categoryCounts[item._id as keyof typeof categoryCounts] = item.count
      }
    })

    // Format the response
    const formattedProducts = products
      .filter(product => product.createdBy) // Filter out products with null createdBy
      .map(product => ({
        id: product._id.toString(),
        name: product.name,
        description: product.description,
        price: product.price,
        currency: product.currency,
        category: product.category,
        imageUrl: product.imageUrl,
        features: product.features,
        specifications: product.specifications,
        stock: product.stock,
        createdBy: {
          name: product.createdBy.fullName || 'Unknown User',
          username: product.createdBy.username || 'unknown'
        },
        createdAt: product.createdAt
      }))

    return NextResponse.json({
      success: true,
      products: formattedProducts,
      categoryCounts,
      total: formattedProducts.length
    })

  } catch (error) {
    console.error('Products fetch error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch products' 
      },
      { status: 500 }
    )
  }
} 