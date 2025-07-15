import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { Event, EventRegistration } from '@/lib/models/event'
import { getUserFromRequest } from '@/lib/server-utils'
import { z } from 'zod'
import mongoose from 'mongoose'

const exportSchema = z.object({
  type: z.enum(['events', 'registrations', 'analytics']),
  format: z.enum(['csv']).optional().default('csv'),
  eventId: z.string().optional(),
  status: z.string().optional(),
  category: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  registrationType: z.enum(['user', 'guest']).optional()
})

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
    const result = exportSchema.safeParse(data)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation error', details: result.error.format() },
        { status: 400 }
      )
    }

    const { type, format, eventId, status, category, startDate, endDate, registrationType } = result.data

    // Build date filter
    const dateFilter: any = {}
    if (startDate) {
      dateFilter.$gte = new Date(startDate)
    }
    if (endDate) {
      dateFilter.$lte = new Date(endDate)
    }

    // PDF export for analytics
    if (type === 'analytics' && format === 'pdf') {
      const analyticsData = await getAnalyticsDataForPDF({ eventId, category, dateFilter })
      const pdfBuffer = await generateAnalyticsPDF(analyticsData)
      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="analytics_report_${new Date().toISOString().split('T')[0]}.pdf"`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
    }

    let csvContent = ''
    let filename = ''

    switch (type) {
      case 'events':
        csvContent = await exportEvents({ eventId, status, category, dateFilter })
        filename = `events_export_${new Date().toISOString().split('T')[0]}.csv`
        break
      case 'registrations':
        csvContent = await exportRegistrations({ eventId, status, registrationType, dateFilter })
        filename = `registrations_export_${new Date().toISOString().split('T')[0]}.csv`
        break
      case 'analytics':
        csvContent = await exportAnalytics({ eventId, category, dateFilter })
        filename = `analytics_export_${new Date().toISOString().split('T')[0]}.csv`
        break
      default:
        return NextResponse.json(
          { error: 'Invalid export type' },
          { status: 400 }
        )
    }

    // Return CSV as response
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}

async function exportEvents(filters: any) {
  const { eventId, status, category, dateFilter } = filters

  // Build query
  const query: any = { isActive: true }
  
  if (eventId) {
    query._id = eventId
  }
  
  if (status) {
    query.status = status
  }
  
  if (category) {
    query.category = category
  }
  
  if (Object.keys(dateFilter).length > 0) {
    query.createdAt = dateFilter
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

  const events = await Event.find(query)
    .populate({
      path: 'createdBy',
      model: User,
      select: 'fullName email username'
    })
    .sort({ createdAt: -1 })

  // CSV headers
  const headers = [
    'Event ID',
    'Title',
    'Description',
    'Date',
    'Time',
    'Duration (hours)',
    'Location',
    'Category',
    'Max Attendees',
    'Current Attendees',
    'Fill Rate (%)',
    'Status',
    'Featured',
    'Prerequisites',
    'Learning Outcomes',
    'Created By',
    'Creator Email',
    'Created At',
    'Updated At'
  ]

  let csvContent = headers.join(',') + '\n'

  for (const event of events) {
    const fillRate = event.maxAttendees > 0 ? ((event.currentAttendees / event.maxAttendees) * 100).toFixed(2) : '0'
    
    const row = [
      event._id.toString(),
      `"${event.title.replace(/"/g, '""')}"`,
      `"${event.description.replace(/"/g, '""')}"`,
      event.date.toISOString().split('T')[0],
      event.time,
      event.duration,
      `"${event.location.replace(/"/g, '""')}"`,
      event.category,
      event.maxAttendees,
      event.currentAttendees,
      fillRate,
      event.status,
      event.featured ? 'Yes' : 'No',
      `"${event.prerequisites.join('; ').replace(/"/g, '""')}"`,
      `"${event.whatYouWillLearn.join('; ').replace(/"/g, '""')}"`,
      `"${event.createdBy.fullName.replace(/"/g, '""')}"`,
      event.createdBy.email,
      event.createdAt.toISOString(),
      event.updatedAt.toISOString()
    ]
    
    csvContent += row.join(',') + '\n'
  }

  return csvContent
}

async function exportRegistrations(filters: any) {
  const { eventId, status, registrationType, dateFilter } = filters

  // Build query
  const query: any = {}
  
  if (eventId) {
    query.eventId = eventId
  }
  
  if (status) {
    query.status = status
  }
  
  if (registrationType) {
    query.registrationType = registrationType
  }
  
  if (Object.keys(dateFilter).length > 0) {
    query.registeredAt = dateFilter
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

  const registrations = await EventRegistration.find(query)
    .populate({
      path: 'eventId',
      select: 'title date time location category'
    })
    .populate({
      path: 'userId',
      model: User,
      select: 'fullName email username studentId phoneNumber'
    })
    .sort({ registeredAt: -1 })

  // CSV headers
  const headers = [
    'Registration ID',
    'Event Title',
    'Event Date',
    'Event Time',
    'Event Location',
    'Event Category',
    'Registration Type',
    'Status',
    'Registered At',
    'Cancelled At',
    'User Name',
    'User Email',
    'User Phone',
    'Student ID',
    'Guest Name',
    'Guest Email',
    'Guest Phone',
    'Guest Company',
    'Guest Notes'
  ]

  let csvContent = headers.join(',') + '\n'

  for (const reg of registrations) {
    const row = [
      reg._id.toString(),
      `"${reg.eventId.title.replace(/"/g, '""')}"`,
      reg.eventId.date.toISOString().split('T')[0],
      reg.eventId.time,
      `"${reg.eventId.location.replace(/"/g, '""')}"`,
      reg.eventId.category,
      reg.registrationType,
      reg.status,
      reg.registeredAt.toISOString(),
      reg.cancelledAt ? reg.cancelledAt.toISOString() : '',
      reg.userId ? `"${reg.userId.fullName.replace(/"/g, '""')}"` : '',
      reg.userId ? reg.userId.email : '',
      reg.userId ? reg.userId.phoneNumber || '' : '',
      reg.userId ? reg.userId.studentId || '' : '',
      reg.guestInfo ? `"${reg.guestInfo.fullName.replace(/"/g, '""')}"` : '',
      reg.guestInfo ? reg.guestInfo.email : '',
      reg.guestInfo ? reg.guestInfo.phoneNumber : '',
      reg.guestInfo ? `"${(reg.guestInfo.company || '').replace(/"/g, '""')}"` : '',
      reg.guestInfo ? `"${(reg.guestInfo.notes || '').replace(/"/g, '""')}"` : ''
    ]
    
    csvContent += row.join(',') + '\n'
  }

  return csvContent
}

async function exportAnalytics(filters: any) {
  const { eventId, category, dateFilter } = filters

  // Build match query
  const baseMatch: any = { isActive: true }
  
  if (eventId) {
    baseMatch._id = new mongoose.Types.ObjectId(eventId)
  }
  
  if (category) {
    baseMatch.category = category
  }
  
  if (Object.keys(dateFilter).length > 0) {
    baseMatch.createdAt = dateFilter
  }

  // Get aggregated analytics data
  const analyticsData = await Event.aggregate([
    { $match: baseMatch },
    {
      $lookup: {
        from: 'eventregistrations',
        localField: '_id',
        foreignField: 'eventId',
        as: 'registrations'
      }
    },
    {
      $addFields: {
        totalRegistrations: { $size: '$registrations' },
        userRegistrations: {
          $size: {
            $filter: {
              input: '$registrations',
              cond: { $eq: ['$$this.registrationType', 'user'] }
            }
          }
        },
        guestRegistrations: {
          $size: {
            $filter: {
              input: '$registrations',
              cond: { $eq: ['$$this.registrationType', 'guest'] }
            }
          }
        },
        activeRegistrations: {
          $size: {
            $filter: {
              input: '$registrations',
              cond: { $eq: ['$$this.status', 'registered'] }
            }
          }
        },
        waitlistedRegistrations: {
          $size: {
            $filter: {
              input: '$registrations',
              cond: { $eq: ['$$this.status', 'waitlisted'] }
            }
          }
        },
        cancelledRegistrations: {
          $size: {
            $filter: {
              input: '$registrations',
              cond: { $eq: ['$$this.status', 'cancelled'] }
            }
          }
        },
        attendedRegistrations: {
          $size: {
            $filter: {
              input: '$registrations',
              cond: { $eq: ['$$this.status', 'attended'] }
            }
          }
        },
        fillRate: {
          $cond: [
            { $gt: ['$maxAttendees', 0] },
            { $multiply: [{ $divide: ['$currentAttendees', '$maxAttendees'] }, 100] },
            0
          ]
        }
      }
    },
    {
      $project: {
        registrations: 0 // Remove the large registrations array from output
      }
    }
  ])

  // CSV headers
  const headers = [
    'Event ID',
    'Event Title',
    'Category',
    'Date',
    'Status',
    'Max Attendees',
    'Current Attendees',
    'Fill Rate (%)',
    'Total Registrations',
    'User Registrations',
    'Guest Registrations',
    'Active Registrations',
    'Waitlisted',
    'Cancelled',
    'Attended',
    'Attendance Rate (%)',
    'Cancellation Rate (%)'
  ]

  let csvContent = headers.join(',') + '\n'

  for (const event of analyticsData) {
    const attendanceRate = event.totalRegistrations > 0 
      ? ((event.attendedRegistrations / event.totalRegistrations) * 100).toFixed(2)
      : '0'
    
    const cancellationRate = event.totalRegistrations > 0 
      ? ((event.cancelledRegistrations / event.totalRegistrations) * 100).toFixed(2)
      : '0'

    const row = [
      event._id.toString(),
      `"${event.title.replace(/"/g, '""')}"`,
      event.category,
      event.date.toISOString().split('T')[0],
      event.status,
      event.maxAttendees,
      event.currentAttendees,
      event.fillRate.toFixed(2),
      event.totalRegistrations,
      event.userRegistrations,
      event.guestRegistrations,
      event.activeRegistrations,
      event.waitlistedRegistrations,
      event.cancelledRegistrations,
      event.attendedRegistrations,
      attendanceRate,
      cancellationRate
    ]
    
    csvContent += row.join(',') + '\n'
  }

  return csvContent
} 

// Helper to get analytics data for PDF
async function getAnalyticsDataForPDF(filters: any) {
  // Use the same aggregation as exportAnalytics, but return the array
  const { eventId, category, dateFilter } = filters
  const baseMatch: any = { isActive: true }
  if (eventId) baseMatch._id = new mongoose.Types.ObjectId(eventId)
  if (category) baseMatch.category = category
  if (Object.keys(dateFilter).length > 0) baseMatch.createdAt = dateFilter
  const analyticsData = await Event.aggregate([
    { $match: baseMatch },
    {
      $lookup: {
        from: 'eventregistrations',
        localField: '_id',
        foreignField: 'eventId',
        as: 'registrations'
      }
    },
    {
      $addFields: {
        totalRegistrations: { $size: '$registrations' },
        userRegistrations: {
          $size: {
            $filter: {
              input: '$registrations',
              cond: { $eq: ['$$this.registrationType', 'user'] }
            }
          }
        },
        guestRegistrations: {
          $size: {
            $filter: {
              input: '$registrations',
              cond: { $eq: ['$$this.registrationType', 'guest'] }
            }
          }
        },
        activeRegistrations: {
          $size: {
            $filter: {
              input: '$registrations',
              cond: { $eq: ['$$this.status', 'registered'] }
            }
          }
        },
        waitlistedRegistrations: {
          $size: {
            $filter: {
              input: '$registrations',
              cond: { $eq: ['$$this.status', 'waitlisted'] }
            }
          }
        },
        cancelledRegistrations: {
          $size: {
            $filter: {
              input: '$registrations',
              cond: { $eq: ['$$this.status', 'cancelled'] }
            }
          }
        },
        attendedRegistrations: {
          $size: {
            $filter: {
              input: '$registrations',
              cond: { $eq: ['$$this.status', 'attended'] }
            }
          }
        },
        fillRate: {
          $cond: [
            { $gt: ['$maxAttendees', 0] },
            { $multiply: [{ $divide: ['$currentAttendees', '$maxAttendees'] }, 100] },
            0
          ]
        }
      }
    },
    {
      $project: {
        registrations: 0
      }
    }
  ])
  return analyticsData
}

// PDF generation helper
import PDFDocument from 'pdfkit'
import { ChartJSNodeCanvas } from 'chartjs-node-canvas'

async function generateAnalyticsPDF(analyticsData) {
  const doc = new PDFDocument({ margin: 40 })
  const buffers: Buffer[] = []
  doc.on('data', buffers.push.bind(buffers))
  doc.on('end', () => {})

  doc.fontSize(20).text('Analytics Report', { align: 'center' })
  doc.moveDown()
  doc.fontSize(12).text(`Generated at: ${new Date().toLocaleString()}`)
  doc.moveDown()

  // Table header
  doc.fontSize(14).text('Event Analytics', { underline: true })
  doc.moveDown(0.5)

  // Table columns
  const headers = [
    'Title', 'Category', 'Date', 'Status', 'Max', 'Current', 'Fill %', 'Total', 'Users', 'Guests', 'Active', 'Waitlist', 'Cancelled', 'Attended', 'Attend %', 'Cancel %'
  ]
  doc.fontSize(10)
  doc.text(headers.join(' | '))
  doc.moveDown(0.5)

  for (const event of analyticsData) {
    const attendanceRate = event.totalRegistrations > 0 
      ? ((event.attendedRegistrations / event.totalRegistrations) * 100).toFixed(2)
      : '0'
    const cancellationRate = event.totalRegistrations > 0 
      ? ((event.cancelledRegistrations / event.totalRegistrations) * 100).toFixed(2)
      : '0'
    const row = [
      event.title,
      event.category,
      event.date ? event.date.toISOString().split('T')[0] : '',
      event.status,
      event.maxAttendees,
      event.currentAttendees,
      event.fillRate ? event.fillRate.toFixed(2) : '0',
      event.totalRegistrations,
      event.userRegistrations,
      event.guestRegistrations,
      event.activeRegistrations,
      event.waitlistedRegistrations,
      event.cancelledRegistrations,
      event.attendedRegistrations,
      attendanceRate,
      cancellationRate
    ]
    doc.text(row.join(' | '))
  }
  doc.moveDown()

  // Example: Add a chart (e.g., total registrations per event)
  if (analyticsData.length > 0) {
    const chartCanvas = new ChartJSNodeCanvas({ width: 600, height: 300 })
    const chartConfig = {
      type: 'bar',
      data: {
        labels: analyticsData.map(e => e.title),
        datasets: [{
          label: 'Total Registrations',
          data: analyticsData.map(e => e.totalRegistrations),
          backgroundColor: 'rgba(54, 162, 235, 0.5)'
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: { x: { title: { display: true, text: 'Event' } }, y: { title: { display: true, text: 'Registrations' } } }
      }
    }
    const image = await chartCanvas.renderToBuffer(chartConfig)
    doc.addPage()
    doc.fontSize(16).text('Total Registrations per Event', { align: 'center' })
    doc.moveDown()
    doc.image(image, { fit: [500, 250], align: 'center' })
  }

  doc.end()
  return Buffer.concat(buffers)
} 