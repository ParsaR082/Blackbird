import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { getUserFromRequest } from '@/lib/server-utils'
import mongoose from 'mongoose'

// Helper to check if user is admin
async function validateAdmin(request: NextRequest) {
  const user = await getUserFromRequest(request)
  
  if (!user) {
    return { isValid: false, error: 'Unauthorized', status: 401 }
  }
  
  if (user.role !== 'ADMIN') {
    return { isValid: false, error: 'Forbidden: Admin access required', status: 403 }
  }
  
  return { isValid: true, user }
}

// File Schema
const FileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true,
    trim: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  entityType: {
    type: String,
    enum: ['course', 'assignment', 'student', 'general'],
    default: 'general'
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  downloadCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

const File = mongoose.models.File || mongoose.model('File', FileSchema)

// GET - Retrieve files with optional filters
export async function GET(request: NextRequest) {
  try {
    // Validate admin access
    const validation = await validateAdmin(request)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: validation.status })
    }
    
    await connectToDatabase()
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')
    const entityType = searchParams.get('entityType')
    const entityId = searchParams.get('entityId')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')
    const skip = (page - 1) * limit
    
    if (fileId) {
      // Fetch a single file by ID
      const file = await File.findById(fileId)
      
      if (!file) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 })
      }
      
      return NextResponse.json({ 
        success: true,
        file
      })
    }
    
    // Build query
    const query: any = {}
    
    if (entityType) {
      query.entityType = entityType
    }
    
    if (entityId) {
      query.entityId = entityId
    }
    
    if (search) {
      query.$or = [
        { filename: { $regex: search, $options: 'i' } },
        { originalName: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ]
    }
    
    // Fetch files
    const files = await File.find(query)
      .populate('uploadedBy', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
    
    const total = await File.countDocuments(query)
    
    return NextResponse.json({
      success: true,
      files,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })
    
  } catch (error) {
    console.error('Admin files fetch error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch files' 
    }, { status: 500 })
  }
}

// POST - Upload a new file
export async function POST(request: NextRequest) {
  try {
    // Validate admin access
    const validation = await validateAdmin(request)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: validation.status })
    }
    
    await connectToDatabase()
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const entityType = formData.get('entityType') as string
    const entityId = formData.get('entityId') as string
    const tags = formData.get('tags') as string
    const isPublic = formData.get('isPublic') === 'true'
    
    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'No file provided' 
      }, { status: 400 })
    }
    
    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        success: false, 
        error: 'File size exceeds 10MB limit' 
      }, { status: 400 })
    }
    
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'audio/mpeg',
      'audio/wav'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'File type not allowed' 
      }, { status: 400 })
    }
    
    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop()
    const filename = `${timestamp}_${randomString}.${extension}`
    
    // In a real implementation, you would upload to cloud storage (AWS S3, Google Cloud Storage, etc.)
    // For now, we'll simulate file storage
    const fileUrl = `/uploads/${filename}`
    const filePath = `public/uploads/${filename}`
    
    // Create file record
    const newFile = await File.create({
      filename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      url: fileUrl,
      path: filePath,
      uploadedBy: validation.user!.id,
      entityType: entityType || 'general',
      entityId: entityId || null,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      isPublic,
      downloadCount: 0
    })
    
    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      file: newFile
    }, { status: 201 })
    
  } catch (error) {
    console.error('Admin file upload error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to upload file' 
    }, { status: 500 })
  }
}

// DELETE - Delete a file
export async function DELETE(request: NextRequest) {
  try {
    // Validate admin access
    const validation = await validateAdmin(request)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: validation.status })
    }
    
    await connectToDatabase()
    
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')
    
    if (!fileId) {
      return NextResponse.json({ 
        success: false, 
        error: 'File ID is required' 
      }, { status: 400 })
    }
    
    // Check if file exists
    const file = await File.findById(fileId)
    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'File not found' 
      }, { status: 404 })
    }
    
    // In a real implementation, you would delete from cloud storage
    // For now, we'll just delete the database record
    
    await File.findByIdAndDelete(fileId)
    
    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    })
    
  } catch (error) {
    console.error('Admin file deletion error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete file' 
    }, { status: 500 })
  }
} 