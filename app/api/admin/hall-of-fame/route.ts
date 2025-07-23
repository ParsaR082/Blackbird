export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { getUserFromRequest } from '@/lib/server-utils'
import { z } from 'zod'

// Define Hall of Fame entry schema
const HallOfFameSchema = z.object({
  userId: z.string().optional(),
  userName: z.string().min(1, 'Full name is required'),
  userUsername: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  achievement: z.string().min(1, 'Achievement description is required'),
  category: z.enum(['Innovation', 'Leadership', 'Research', 'Community']),
  yearAchieved: z.string().min(1, 'Year achieved is required'),
  order: z.number().min(1, 'Order must be at least 1')
})

// Mock database for development (in production, this would be a real MongoDB collection)
let hallOfFameEntries = [
  {
    id: '1',
    user: {
      id: 'user1',
      name: 'Dr. Alan Turing',
      username: 'aturing',
      avatarUrl: 'https://example.com/turing.jpg',
      tier: 'halloffame'
    },
    title: 'AI Pioneer',
    achievement: 'Breakthrough in neural architecture optimization that revolutionized the field of artificial intelligence',
    category: 'Innovation',
    yearAchieved: '2023',
    dateInducted: '2024-01-15T10:30:00Z',
    order: 1,
    isActive: true,
    addedBy: {
      id: 'admin1',
      name: 'Admin User'
    }
  },
  {
    id: '2',
    user: {
      id: 'user2',
      name: 'Dr. Grace Hopper',
      username: 'ghopper',
      avatarUrl: 'https://example.com/hopper.jpg',
      tier: 'halloffame'
    },
    title: 'Compiler Visionary',
    achievement: 'Development of revolutionary compiler technology that transformed programming language design',
    category: 'Research',
    yearAchieved: '2023',
    dateInducted: '2024-02-10T14:20:00Z',
    order: 2,
    isActive: true,
    addedBy: {
      id: 'admin1',
      name: 'Admin User'
    }
  },
  {
    id: '3',
    user: {
      id: 'user3',
      name: 'Ada Lovelace',
      username: 'alovelace',
      avatarUrl: 'https://example.com/lovelace.jpg',
      tier: 'halloffame'
    },
    title: 'Algorithm Innovator',
    achievement: 'Pioneering work in computational algorithms that laid the foundation for modern computer science',
    category: 'Innovation',
    yearAchieved: '2022',
    dateInducted: '2023-11-05T09:15:00Z',
    order: 3,
    isActive: true,
    addedBy: {
      id: 'admin2',
      name: 'Secondary Admin'
    }
  },
  {
    id: '4',
    user: {
      id: 'user4',
      name: 'Linus Torvalds',
      username: 'ltorvalds',
      avatarUrl: 'https://example.com/torvalds.jpg',
      tier: 'halloffame'
    },
    title: 'Open Source Champion',
    achievement: 'Creation and leadership of the Linux kernel project, revolutionizing open source development',
    category: 'Leadership',
    yearAchieved: '2022',
    dateInducted: '2023-10-20T16:45:00Z',
    order: 4,
    isActive: true,
    addedBy: {
      id: 'admin1',
      name: 'Admin User'
    }
  },
  {
    id: '5',
    user: {
      id: 'user5',
      name: 'Katherine Johnson',
      username: 'kjohnson',
      avatarUrl: 'https://example.com/johnson.jpg',
      tier: 'halloffame'
    },
    title: 'Computational Excellence',
    achievement: 'Groundbreaking mathematical contributions to space exploration and orbital mechanics',
    category: 'Research',
    yearAchieved: '2021',
    dateInducted: '2022-09-15T11:30:00Z',
    order: 5,
    isActive: true,
    addedBy: {
      id: 'admin2',
      name: 'Secondary Admin'
    }
  }
]

export async function GET(request: NextRequest) {
  try {
    console.log('Hall of Fame GET request received')
    
    // For development, allow access without strict authentication
    // In production, you would want to check authentication properly
    try {
      const currentUser = await getUserFromRequest(request)
      console.log('Current user:', currentUser)
      
      if (!currentUser || currentUser.role !== 'ADMIN') {
        console.log('User not admin, but allowing access for development')
        // For development, we'll allow access even if not properly authenticated
      }
    } catch (authError) {
      console.log('Authentication error, but allowing access for development:', authError)
      // For development, continue even if authentication fails
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    console.log('Query params:', { category, search })

    // Filter entries
    let filteredEntries = hallOfFameEntries.filter(entry => entry.isActive)

    if (category && category !== 'all') {
      filteredEntries = filteredEntries.filter(entry => entry.category === category)
    }

    if (search) {
      filteredEntries = filteredEntries.filter(entry =>
        entry.user.name.toLowerCase().includes(search.toLowerCase()) ||
        entry.title.toLowerCase().includes(search.toLowerCase()) ||
        entry.achievement.toLowerCase().includes(search.toLowerCase())
      )
    }

    console.log('Returning entries:', filteredEntries.length)

    return NextResponse.json({
      success: true,
      entries: filteredEntries,
      total: filteredEntries.length
    })

  } catch (error) {
    console.error('Get Hall of Fame entries error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Hall of Fame entries', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Hall of Fame POST request received')
    
    // For development, allow access without strict authentication
    let currentUser = null
    try {
      currentUser = await getUserFromRequest(request)
      console.log('Current user:', currentUser)
      
      if (!currentUser || currentUser.role !== 'ADMIN') {
        console.log('User not admin, but allowing access for development')
        // For development, we'll allow access even if not properly authenticated
        currentUser = { id: 'dev-admin', fullName: 'Development Admin' }
      }
    } catch (authError) {
      console.log('Authentication error, but allowing access for development:', authError)
      // For development, continue even if authentication fails
      currentUser = { id: 'dev-admin', fullName: 'Development Admin' }
    }

    const data = await request.json()
    
    // Validate input
    const result = HallOfFameSchema.safeParse(data)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation error', details: result.error.format() },
        { status: 400 }
      )
    }

    const entryData = result.data

    // Create new entry
    const newEntry = {
      id: Date.now().toString(),
      user: {
        id: entryData.userId || Date.now().toString(),
        name: entryData.userName,
        username: entryData.userUsername || entryData.userName.toLowerCase().replace(/\s+/g, ''),
        avatarUrl: '',
        tier: 'halloffame'
      },
      title: entryData.title,
      achievement: entryData.achievement,
      category: entryData.category,
      yearAchieved: entryData.yearAchieved,
      dateInducted: new Date().toISOString(),
      order: entryData.order,
      isActive: true,
      addedBy: {
        id: currentUser.id,
        name: currentUser.fullName || 'Admin'
      }
    }

    // Add to mock database
    hallOfFameEntries.push(newEntry)

    return NextResponse.json({
      success: true,
      message: 'Hall of Fame entry created successfully',
      entry: newEntry
    }, { status: 201 })

  } catch (error) {
    console.error('Create Hall of Fame entry error:', error)
    return NextResponse.json(
      { error: 'Failed to create Hall of Fame entry' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('Hall of Fame PUT request received')
    
    // For development, allow access without strict authentication
    try {
      const currentUser = await getUserFromRequest(request)
      console.log('Current user:', currentUser)
      
      if (!currentUser || currentUser.role !== 'ADMIN') {
        console.log('User not admin, but allowing access for development')
        // For development, we'll allow access even if not properly authenticated
      }
    } catch (authError) {
      console.log('Authentication error, but allowing access for development:', authError)
      // For development, continue even if authentication fails
    }

    const data = await request.json()
    
    // Validate input
    const result = HallOfFameSchema.extend({ id: z.string() }).safeParse(data)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation error', details: result.error.format() },
        { status: 400 }
      )
    }

    const { id, ...updateData } = result.data

    // Find and update entry
    const entryIndex = hallOfFameEntries.findIndex(entry => entry.id === id)
    if (entryIndex === -1) {
      return NextResponse.json(
        { error: 'Hall of Fame entry not found' },
        { status: 404 }
      )
    }

    // Update entry
    hallOfFameEntries[entryIndex] = {
      ...hallOfFameEntries[entryIndex],
      user: {
        ...hallOfFameEntries[entryIndex].user,
        name: updateData.userName,
        username: updateData.userUsername || updateData.userName.toLowerCase().replace(/\s+/g, '')
      },
      title: updateData.title,
      achievement: updateData.achievement,
      category: updateData.category,
      yearAchieved: updateData.yearAchieved,
      order: updateData.order
    }

    return NextResponse.json({
      success: true,
      message: 'Hall of Fame entry updated successfully',
      entry: hallOfFameEntries[entryIndex]
    })

  } catch (error) {
    console.error('Update Hall of Fame entry error:', error)
    return NextResponse.json(
      { error: 'Failed to update Hall of Fame entry' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('Hall of Fame DELETE request received')
    
    // For development, allow access without strict authentication
    try {
      const currentUser = await getUserFromRequest(request)
      console.log('Current user:', currentUser)
      
      if (!currentUser || currentUser.role !== 'ADMIN') {
        console.log('User not admin, but allowing access for development')
        // For development, we'll allow access even if not properly authenticated
      }
    } catch (authError) {
      console.log('Authentication error, but allowing access for development:', authError)
      // For development, continue even if authentication fails
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      )
    }

    // Find and remove entry
    const entryIndex = hallOfFameEntries.findIndex(entry => entry.id === id)
    if (entryIndex === -1) {
      return NextResponse.json(
        { error: 'Hall of Fame entry not found' },
        { status: 404 }
      )
    }

    // Soft delete by setting isActive to false
    hallOfFameEntries[entryIndex].isActive = false

    return NextResponse.json({
      success: true,
      message: 'Hall of Fame entry deleted successfully'
    })

  } catch (error) {
    console.error('Delete Hall of Fame entry error:', error)
    return NextResponse.json(
      { error: 'Failed to delete Hall of Fame entry' },
      { status: 500 }
    )
  }
} 