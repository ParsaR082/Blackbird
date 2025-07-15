import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { getUserFromRequest } from '@/lib/server-utils'
import mongoose from 'mongoose'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Verify the current user is an admin
    const currentUser = await getUserFromRequest(request)
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    await connectToDatabase()
    
    // Define SystemSettings schema
    const SystemSettingsSchema = new mongoose.Schema({
      general: {
        siteName: String,
        siteDescription: String,
        contactEmail: String,
        timezone: String,
        dateFormat: String,
        maintenanceMode: Boolean
      },
      security: {
        sessionTimeout: Number,
        maxLoginAttempts: Number,
        passwordMinLength: Number,
        requireTwoFactor: Boolean,
        allowedFileTypes: [String],
        maxFileSize: Number
      },
      email: {
        smtpHost: String,
        smtpPort: Number,
        smtpUser: String,
        smtpPassword: String,
        fromEmail: String,
        fromName: String,
        enableEmailNotifications: Boolean
      },
      database: {
        backupEnabled: Boolean,
        backupFrequency: String,
        backupRetention: Number,
        lastBackup: Date
      },
      updatedAt: Date
    })
    
    const SystemSettings = mongoose.models.SystemSettings || mongoose.model('SystemSettings', SystemSettingsSchema)
    
    // Get settings or create default
    let settings = await SystemSettings.findOne({})
    
    if (!settings) {
      // Create default settings
      settings = new SystemSettings({
        general: {
          siteName: 'Blackbird Portal',
          siteDescription: 'University Management System',
          contactEmail: 'admin@blackbird.edu',
          timezone: 'UTC',
          dateFormat: 'MM/DD/YYYY',
          maintenanceMode: false
        },
        security: {
          sessionTimeout: 30,
          maxLoginAttempts: 5,
          passwordMinLength: 8,
          requireTwoFactor: false,
          allowedFileTypes: ['jpg', 'png', 'pdf', 'doc', 'docx'],
          maxFileSize: 10
        },
        email: {
          smtpHost: '',
          smtpPort: 587,
          smtpUser: '',
          smtpPassword: '',
          fromEmail: 'noreply@blackbird.edu',
          fromName: 'Blackbird Portal',
          enableEmailNotifications: true
        },
        database: {
          backupEnabled: false,
          backupFrequency: 'daily',
          backupRetention: 30,
          lastBackup: null
        },
        updatedAt: new Date()
      })
      
      await settings.save()
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Fetch settings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify the current user is an admin
    const currentUser = await getUserFromRequest(request)
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    await connectToDatabase()
    
    // Define SystemSettings schema
    const SystemSettingsSchema = new mongoose.Schema({
      general: {
        siteName: String,
        siteDescription: String,
        contactEmail: String,
        timezone: String,
        dateFormat: String,
        maintenanceMode: Boolean
      },
      security: {
        sessionTimeout: Number,
        maxLoginAttempts: Number,
        passwordMinLength: Number,
        requireTwoFactor: Boolean,
        allowedFileTypes: [String],
        maxFileSize: Number
      },
      email: {
        smtpHost: String,
        smtpPort: Number,
        smtpUser: String,
        smtpPassword: String,
        fromEmail: String,
        fromName: String,
        enableEmailNotifications: Boolean
      },
      database: {
        backupEnabled: Boolean,
        backupFrequency: String,
        backupRetention: Number,
        lastBackup: Date
      },
      updatedAt: Date
    })
    
    const SystemSettings = mongoose.models.SystemSettings || mongoose.model('SystemSettings', SystemSettingsSchema)

    const body = await request.json()
    const { general, security, email, database } = body

    // Validate required fields
    if (!general?.siteName || !general?.contactEmail) {
      return NextResponse.json(
        { error: 'Site name and contact email are required' },
        { status: 400 }
      )
    }

    // Update or create settings
    const updatedSettings = await SystemSettings.findOneAndUpdate(
      {},
      {
        general,
        security,
        email,
        database,
        updatedAt: new Date()
      },
      { new: true, upsert: true, runValidators: true }
    )

    return NextResponse.json(updatedSettings)
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 