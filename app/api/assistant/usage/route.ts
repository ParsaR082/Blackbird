export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/server-utils'
import { connectToDatabase } from '@/lib/mongodb'
import { 
  AssistantUsage, 
  AssistantAccess,
  DAILY_TOKEN_LIMIT, 
  LOCKOUT_DURATION_HOURS,
  getTodayString,
  isUserLocked,
  getRemainingTokens
} from '@/lib/models/assistant-usage'

// Get current token usage
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    // Check if user has access
    const access = await AssistantAccess.findOne({ userId: user.id })
    if (!access || !access.isApproved) {
      return NextResponse.json({ 
        error: 'Assistant access not approved',
        hasAccess: false 
      }, { status: 403 })
    }

    const today = getTodayString()
    let usage = await AssistantUsage.findOne({ 
      userId: user.id, 
      date: today 
    })

    if (!usage) {
      usage = new AssistantUsage({
        userId: user.id,
        date: today,
        tokensUsed: 0,
        interactionCount: 0
      })
      await usage.save()
    }

    const isLocked = isUserLocked(usage)
    const remainingTokens = getRemainingTokens(usage)

    return NextResponse.json({
      hasAccess: true,
      tokensUsed: usage.tokensUsed,
      remainingTokens,
      dailyLimit: DAILY_TOKEN_LIMIT,
      interactionCount: usage.interactionCount,
      isLocked,
      lockExpiresAt: usage.lockExpiresAt,
      lastInteraction: usage.lastInteraction
    })
  } catch (error) {
    console.error('Token usage check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Track token usage
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tokensUsed, interactionType } = await request.json()
    
    if (!tokensUsed || tokensUsed <= 0) {
      return NextResponse.json({ error: 'Invalid token count' }, { status: 400 })
    }

    await connectToDatabase()

    // Check if user has access
    const access = await AssistantAccess.findOne({ userId: user.id })
    if (!access || !access.isApproved) {
      return NextResponse.json({ 
        error: 'Assistant access not approved',
        hasAccess: false 
      }, { status: 403 })
    }

    const today = getTodayString()
    let usage = await AssistantUsage.findOne({ 
      userId: user.id, 
      date: today 
    })

    if (!usage) {
      usage = new AssistantUsage({
        userId: user.id,
        date: today,
        tokensUsed: 0,
        interactionCount: 0
      })
    }

    // Check if user is already locked
    if (isUserLocked(usage)) {
      return NextResponse.json({ 
        error: 'Daily limit exceeded. Access locked until tomorrow.',
        isLocked: true,
        lockExpiresAt: usage.lockExpiresAt
      }, { status: 429 })
    }

    // Update usage
    usage.tokensUsed += tokensUsed
    usage.interactionCount += 1
    usage.lastInteraction = new Date()

    // Check if limit exceeded after this interaction
    if (usage.tokensUsed >= DAILY_TOKEN_LIMIT) {
      usage.isLocked = true
      usage.lockExpiresAt = new Date(Date.now() + LOCKOUT_DURATION_HOURS * 60 * 60 * 1000)
    }

    await usage.save()

    const remainingTokens = getRemainingTokens(usage)
    const isLocked = isUserLocked(usage)

    return NextResponse.json({
      success: true,
      tokensUsed: usage.tokensUsed,
      remainingTokens,
      dailyLimit: DAILY_TOKEN_LIMIT,
      interactionCount: usage.interactionCount,
      isLocked,
      lockExpiresAt: usage.lockExpiresAt,
      message: isLocked ? 'Daily limit reached. Access locked for 24 hours.' : 'Usage tracked successfully'
    })
  } catch (error) {
    console.error('Token usage tracking error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 