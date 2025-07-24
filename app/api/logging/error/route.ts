import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';

// Define error log schema
const ErrorLogSchema = new mongoose.Schema({
  source: {
    type: String,
    required: true,
    trim: true
  },
  error: {
    type: String,
    required: true
  },
  context: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  resolved: {
    type: Boolean,
    default: false
  }
});

/**
 * Handle POST request to log errors
 */
export async function POST(request: NextRequest) {
  try {
    // Get the error information from the request body
    const { source, error, context } = await request.json();

    if (!source || !error) {
      return NextResponse.json(
        { error: 'Missing required fields: source, error' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get or create the ErrorLog model
    const ErrorLog = mongoose.models.ErrorLog || mongoose.model('ErrorLog', ErrorLogSchema);

    // Create the error log
    await ErrorLog.create({
      source,
      error,
      context: context || {},
      timestamp: new Date()
    });

    // If source is n8n-integration, try to notify administrators
    if (source === 'n8n-integration' && process.env.ADMIN_EMAIL) {
      try {
        // This would typically be implemented using a notification service
        console.warn(`N8N integration error: ${error}`);
        
        // In a real implementation, you might send an email or a notification
        // to the administrators, but we'll just log it for now
      } catch (notifyError) {
        console.error('Failed to notify administrators:', notifyError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Error logged successfully'
    });
  } catch (error) {
    console.error('Error logging error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 