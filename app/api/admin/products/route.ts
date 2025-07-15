import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Product } from '@/lib/models/product'
import mongoose from 'mongoose'
import { getUserFromRequest } from '@/lib/server-utils'
import { z } from 'zod'

// Validation schemas
const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  price: z.number().min(0),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD']),
  category: z.enum(['Software', 'Hardware', 'Service', 'Consultation', 'Training', 'License', 'Other']),
  imageUrl: z.string().url().optional(),
  features: z.array(z.string().max(200)),
  specifications: z.record(z.any()).optional(),
  stock: z.number().min(0).optional()
})

const updateProductSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(2000).optional(),
  price: z.number().min(0).optional(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD']).optional(),
  category: z.enum(['Software', 'Hardware', 'Service', 'Consultation', 'Training', 'License', 'Other']).optional(),
  imageUrl: z.string().url().optional(),
  features: z.array(z.string().max(200)).optional(),
  specifications: z.record(z.any()).optional(),
  stock: z.number().min(0).optional(),
  isActive: z.boolean().optional()
})

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
    const isActive = searchParams.get('isActive')
    const search = searchParams.get('search')

    // Build query
    let query: any = {}
    
    if (category && category !== 'all') {
      query.category = category
    }
    
    if (isActive !== null) {
      query.isActive = isActive === 'true'
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    // Fetch products with populated createdBy field
    const products = await Product.find(query)
      .populate('createdBy', 'full_name username')
      .sort({ createdAt: -1 })
      .lean() as Array<any>

    // Transform the data to match the expected format
    const transformedProducts = products.map(product => {
      const p = product as any;
      return {
        id: p._id.toString(),
        name: p.name,
        description: p.description,
        price: p.price,
        currency: p.currency,
        category: p.category,
        imageUrl: p.imageUrl,
        features: p.features || [],
        specifications: p.specifications || {},
        stock: p.stock,
        isActive: p.isActive !== false, // Default to true if not set
        createdBy: {
          id: p.createdBy?._id?.toString() || p.createdBy?.toString() || 'unknown',
          name: p.createdBy?.full_name || p.createdBy?.name || 'Unknown User',
          username: p.createdBy?.username || 'unknown'
        },
        createdAt: p.createdAt,
        updatedAt: p.updatedAt
      }
    })

    return NextResponse.json({
      success: true,
      products: transformedProducts,
      total: transformedProducts.length
    })

  } catch (error) {
    console.error('Get products error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

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
    const result = createProductSchema.safeParse(data)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation error', details: result.error.format() },
        { status: 400 }
      )
    }

    const productData = result.data

    // Create product
    const product = await Product.create({
      ...productData,
      createdBy: currentUser.id,
      specifications: productData.specifications || {},
      isActive: true
    })

    // Populate the createdBy field for the response
    await product.populate('createdBy', 'full_name username')

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      product: {
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
        isActive: product.isActive,
        createdBy: {
          id: product.createdBy._id.toString(),
          name: product.createdBy.full_name || product.createdBy.name || 'Unknown User',
          username: product.createdBy.username || 'unknown'
        },
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
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
    const result = updateProductSchema.safeParse(data)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation error', details: result.error.format() },
        { status: 400 }
      )
    }

    const { id, ...updateData } = result.data

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).populate('createdBy', 'full_name username')

    if (!updatedProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      product: {
        id: updatedProduct._id.toString(),
        name: updatedProduct.name,
        description: updatedProduct.description,
        price: updatedProduct.price,
        currency: updatedProduct.currency,
        category: updatedProduct.category,
        imageUrl: updatedProduct.imageUrl,
        features: updatedProduct.features,
        specifications: updatedProduct.specifications,
        stock: updatedProduct.stock,
        isActive: updatedProduct.isActive,
        createdBy: {
          id: updatedProduct.createdBy._id.toString(),
          name: updatedProduct.createdBy.full_name || updatedProduct.createdBy.name || 'Unknown User',
          username: updatedProduct.createdBy.username || 'unknown'
        },
        createdAt: updatedProduct.createdAt,
        updatedAt: updatedProduct.updatedAt
      }
    })

  } catch (error) {
    console.error('Update product error:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
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
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Delete product (soft delete by setting isActive to false)
    const deletedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { new: true }
    )

    if (!deletedProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    })

  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
} 