import { NextRequest, NextResponse } from 'next/server';
import { verifySignature, getWebhookSecret } from '@/lib/hmac-signer';
import { connectToDatabase } from '@/lib/mongodb';

/**
 * This is a webhook endpoint that n8n can call back to if needed
 * It verifies the HMAC signature before processing
 */
export async function POST(request: NextRequest) {
  try {
    // Get the signature from headers
    const signature = request.headers.get('x-bubot-sig');
    
    if (!signature) {
      console.error('Missing signature header');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the raw request body as text
    const bodyText = await request.text();
    
    // Get the webhook secret
    let secret;
    try {
      secret = getWebhookSecret();
    } catch (error) {
      console.error('Webhook secret not configured:', error);
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
    }
    
    // Verify the signature
    const isValid = verifySignature(bodyText, secret, signature);
    
    if (!isValid) {
      console.error('Invalid signature');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse the body
    const body = JSON.parse(bodyText);
    
    // Process the webhook based on action type
    const { action, data } = body;
    
    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 });
    }
    
    // Connect to the database if needed
    await connectToDatabase();
    
    // Handle different action types
    switch (action) {
      case 'callback_study_plan':
        // TODO: Implement callback processing if needed
        return NextResponse.json({ status: 'ok', action });
        
      case 'callback_feedback':
        // TODO: Implement callback processing if needed
        return NextResponse.json({ status: 'ok', action });
        
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 