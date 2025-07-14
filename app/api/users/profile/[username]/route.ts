import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import mongoose from 'mongoose'
import { HallOfFame } from '@/lib/models/hall-of-fame'

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params
    
    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
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

    // Find user by username
    const user = await User.findOne({ username }).select('-password')
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get user's achievements from Hall of Fame
    const hallOfFameEntries = await HallOfFame.find({ 
      userId: user._id,
      isActive: true
    }).sort({ dateInducted: -1 })

    const achievements = hallOfFameEntries.map(entry => ({
      id: entry._id.toString(),
      title: entry.title,
      description: entry.achievement,
      category: entry.category,
      dateAwarded: entry.yearAchieved
    }))

    return NextResponse.json({
      id: user._id.toString(),
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      achievements
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }
} 