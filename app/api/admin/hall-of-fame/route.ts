import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import { HallOfFame, UserStats } from '@/lib/models/hall-of-fame'
import mongoose from 'mongoose'
import { getUserFromRequest } from '@/lib/server-utils'
import { z } from 'zod'

// Validation schemas
const addToHallOfFameSchema = z.object({
  userId: z.string().min(1),
  title: z.string().min(1).max(100),
  achievement: z.string().min(1).max(500),
  category: z.enum(['Innovation', 'Leadership', 'Research', 'Community']),
  yearAchieved: z.string().regex(/^\d{4}$/)
})

const updateHallOfFameSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(100).optional(),
  achievement: z.string().min(1).max(500).optional(),
  category: z.enum(['Innovation', 'Leadership', 'Research', 'Community']).optional(),
  yearAchieved: z.string().regex(/^\d{4}$/).optional(),
  order: z.number().min(0).optional(),
  isActive: z.boolean().optional()
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

    const data = await request.json()
    
    // Validate input
    const result = addToHallOfFameSchema.safeParse(data)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation error', details: result.error.format() },
        { status: 400 }
      )
    }

    const { userId, title, achievement, category, yearAchieved } = result.data

    // Check if user exists
    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user is already in Hall of Fame
    const existingEntry = await HallOfFame.findOne({ userId })
    if (existingEntry) {
      return NextResponse.json(
        { error: 'User is already in the Hall of Fame' },
        { status: 409 }
      )
    }

    // Get the highest order number and increment
    const lastEntry = await HallOfFame.findOne().sort({ order: -1 })
    const newOrder = lastEntry ? lastEntry.order + 1 : 1

    // Create Hall of Fame entry
    const hallOfFameEntry = await HallOfFame.create({
      userId,
      title,
      achievement,
      category,
      yearAchieved,
      addedBy: currentUser.id,
      order: newOrder
    })

    // Update or create user stats to set tier to 'halloffame'
    await UserStats.findOneAndUpdate(
      { userId },
      { 
        $set: { tier: 'halloffame' },
        $setOnInsert: {
          points: 50000, // Minimum points for Hall of Fame
          contributions: 1000,
          specialAchievements: ['Hall of Fame Inductee'],
          joinDate: user.createdAt || new Date(),
          totalProjects: 0,
          totalCollaborations: 0,
          totalMentees: 0,
          industryRecognitions: [],
          publications: []
        }
      },
      { upsert: true, new: true }
    )

    return NextResponse.json({
      success: true,
      message: 'User successfully added to Hall of Fame',
      entry: {
        id: hallOfFameEntry._id.toString(),
        user: {
          id: user._id.toString(),
          name: user.fullName,
          username: user.username
        },
        title,
        achievement,
        category,
        yearAchieved,
        order: newOrder
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Add to Hall of Fame error:', error)
    return NextResponse.json(
      { error: 'Failed to add user to Hall of Fame' },
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
    const result = updateHallOfFameSchema.safeParse(data)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation error', details: result.error.format() },
        { status: 400 }
      )
    }

    const { id, ...updateData } = result.data

    // Update Hall of Fame entry
    const updatedEntry = await HallOfFame.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).populate({
      path: 'userId',
      select: 'fullName username'
    })

    if (!updatedEntry) {
      return NextResponse.json(
        { error: 'Hall of Fame entry not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Hall of Fame entry updated successfully',
      entry: {
        id: updatedEntry._id.toString(),
        user: {
          id: updatedEntry.userId._id.toString(),
          name: updatedEntry.userId.fullName,
          username: updatedEntry.userId.username
        },
        title: updatedEntry.title,
        achievement: updatedEntry.achievement,
        category: updatedEntry.category,
        yearAchieved: updatedEntry.yearAchieved,
        order: updatedEntry.order,
        isActive: updatedEntry.isActive
      }
    })

  } catch (error) {
    console.error('Update Hall of Fame error:', error)
    return NextResponse.json(
      { error: 'Failed to update Hall of Fame entry' },
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
        { error: 'Entry ID is required' },
        { status: 400 }
      )
    }

    // Get the entry to find the user
    const entry = await HallOfFame.findById(id)
    if (!entry) {
      return NextResponse.json(
        { error: 'Hall of Fame entry not found' },
        { status: 404 }
      )
    }

    // Remove from Hall of Fame
    await HallOfFame.findByIdAndDelete(id)

    // Update user stats to remove Hall of Fame tier
    await UserStats.findOneAndUpdate(
      { userId: entry.userId },
      { 
        $set: { tier: 'legend' }, // Downgrade to legend tier
        $pull: { specialAchievements: 'Hall of Fame Inductee' }
      }
    )

    return NextResponse.json({
      success: true,
      message: 'User removed from Hall of Fame successfully'
    })

  } catch (error) {
    console.error('Remove from Hall of Fame error:', error)
    return NextResponse.json(
      { error: 'Failed to remove user from Hall of Fame' },
      { status: 500 }
    )
  }
} 