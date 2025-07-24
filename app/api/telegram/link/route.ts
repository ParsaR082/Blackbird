import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/server-utils';
import { TelegramUser } from '@/lib/models/telegram-user';
import crypto from 'crypto';

/**
 * POST - Generate a link token for the current user
 */
export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Generate a random token
    const linkToken = crypto.randomBytes(16).toString('hex');
    
    // Set an expiry time (24 hours)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Check if the user already has a Telegram link
    const existingLink = await TelegramUser.findOne({ userId: user.id });
    if (existingLink) {
      // Update the existing link
      existingLink.linkToken = linkToken;
      existingLink.linkTokenExpiresAt = expiresAt;
      await existingLink.save();
    } else {
      // Create a placeholder entry with just the linkToken and userId
      await TelegramUser.create({
        telegramId: `temp_${linkToken}`, // Temporary ID, will be replaced on link
        chatId: `temp_${linkToken}`, // Temporary ID, will be replaced on link
        userId: user.id,
        linkToken,
        linkTokenExpiresAt: expiresAt
      });
    }

    // Return the link token
    return NextResponse.json({
      success: true,
      linkToken,
      expiresAt,
      linkCommand: `/link ${linkToken}`
    });

  } catch (error) {
    console.error('Telegram link generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate link token' },
      { status: 500 }
    );
  }
}

/**
 * GET - Verify a link token
 */
export async function GET(request: NextRequest) {
  try {
    // Get the token from the request
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find the Telegram user with this token
    const telegramUser = await TelegramUser.findOne({
      linkToken: token,
      linkTokenExpiresAt: { $gt: new Date() }
    });

    if (!telegramUser) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // Return the user details
    return NextResponse.json({
      success: true,
      userId: telegramUser.userId,
      telegramId: telegramUser.telegramId,
      isTemporary: telegramUser.telegramId.startsWith('temp_')
    });

  } catch (error) {
    console.error('Telegram link verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify link token' },
      { status: 500 }
    );
  }
} 