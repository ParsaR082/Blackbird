import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { getUserFromRequest } from '@/lib/server-utils'

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

    // Simulate system metrics (in a real application, these would come from system monitoring tools)
    const metrics = {
      cpu: {
        usage: Math.floor(Math.random() * 30) + 20, // 20-50%
        cores: 8,
        temperature: Math.floor(Math.random() * 20) + 40 // 40-60°C
      },
      memory: {
        total: 16 * 1024 * 1024 * 1024, // 16GB
        used: Math.floor(Math.random() * 8 * 1024 * 1024 * 1024) + 4 * 1024 * 1024 * 1024, // 4-12GB
        available: 0,
        usage: 0
      },
      disk: {
        total: 500 * 1024 * 1024 * 1024, // 500GB
        used: Math.floor(Math.random() * 200 * 1024 * 1024 * 1024) + 100 * 1024 * 1024 * 1024, // 100-300GB
        available: 0,
        usage: 0
      },
      network: {
        bytesIn: Math.floor(Math.random() * 1000000000) + 500000000, // 500MB-1.5GB
        bytesOut: Math.floor(Math.random() * 500000000) + 100000000, // 100MB-600MB
        connections: Math.floor(Math.random() * 1000) + 100 // 100-1100 connections
      },
      database: {
        connections: Math.floor(Math.random() * 50) + 10, // 10-60 connections
        queries: Math.floor(Math.random() * 10000) + 1000, // 1000-11000 queries
        responseTime: Math.floor(Math.random() * 50) + 10 // 10-60ms
      },
      uptime: Math.floor(Math.random() * 86400 * 30) + 86400 * 7, // 7-37 days
      loadAverage: [
        Math.random() * 2 + 0.5, // 0.5-2.5
        Math.random() * 2 + 0.5,
        Math.random() * 2 + 0.5
      ]
    }

    // Calculate derived values
    metrics.memory.available = metrics.memory.total - metrics.memory.used
    metrics.memory.usage = Math.round((metrics.memory.used / metrics.memory.total) * 100)
    
    metrics.disk.available = metrics.disk.total - metrics.disk.used
    metrics.disk.usage = Math.round((metrics.disk.used / metrics.disk.total) * 100)

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('System metrics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 