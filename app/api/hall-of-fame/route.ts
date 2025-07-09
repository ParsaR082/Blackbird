import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { HallOfFame } from '@/lib/models/hall-of-fame'
import mongoose from 'mongoose'

export async function GET(request: NextRequest) {
  try {
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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build query
    const query: any = { isActive: true }
    if (category && ['Innovation', 'Leadership', 'Research', 'Community'].includes(category)) {
      query.category = category
    }

    // Get Hall of Fame entries with user data
    const hallOfFameEntries = await HallOfFame.find(query)
      .populate({
        path: 'userId',
        model: User,
        select: 'fullName email username avatarUrl'
      })
      .sort({ order: 1, dateInducted: -1 })
      .limit(limit)

    // Get category counts
    const categoryAggregation = await HallOfFame.aggregate([
      { $match: { isActive: true } },
      { 
        $group: { 
          _id: '$category', 
          count: { $sum: 1 } 
        } 
      }
    ])

    const categoryCounts = {
      Innovation: 0,
      Leadership: 0,
      Research: 0,
      Community: 0
    }

    categoryAggregation.forEach(item => {
      if (item._id && categoryCounts.hasOwnProperty(item._id)) {
        categoryCounts[item._id as keyof typeof categoryCounts] = item.count
      }
    })

    // Format the response
    const formattedEntries = hallOfFameEntries.map((entry, index) => ({
      id: entry._id.toString(),
      user: {
        id: entry.userId._id.toString(),
        name: entry.userId.fullName,
        username: entry.userId.username,
        avatarUrl: entry.userId.avatarUrl
      },
      title: entry.title,
      achievement: entry.achievement,
      category: entry.category,
      yearAchieved: entry.yearAchieved,
      dateInducted: entry.dateInducted,
      rank: index + 1
    }))

    return NextResponse.json({
      success: true,
      entries: formattedEntries,
      categoryCounts,
      total: formattedEntries.length
    })

  } catch (error) {
    console.error('Hall of Fame fetch error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch Hall of Fame entries' 
      },
      { status: 500 }
    )
  }
} 