import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Journal from '@/lib/models/journal'
import { getUserFromRequest } from '@/lib/server-utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  await connectToDatabase()
  const currentUser = await getUserFromRequest(request)
  if (!currentUser || currentUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  // Show journals visible to this admin
  const userId = currentUser.id || currentUser.email
  const journals = await Journal.find({
    $or: [
      { author: userId },
      { visibility: 'admins' },
      { visibility: 'custom', allowedAdmins: userId }
    ]
  }).sort({ createdAt: -1 })
  return NextResponse.json(journals)
}

export async function POST(request: NextRequest) {
  await connectToDatabase()
  const currentUser = await getUserFromRequest(request)
  if (!currentUser || currentUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  const body = await request.json()
  const { content, tags, visibility, allowedAdmins } = body
  if (!content) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 })
  }
  const userId = currentUser.id || currentUser.email
  const journal = await Journal.create({
    content,
    tags: tags || [],
    author: userId,
    visibility: visibility || 'private',
    allowedAdmins: visibility === 'custom' ? (allowedAdmins || []) : [],
    createdAt: new Date()
  })
  return NextResponse.json(journal)
} 