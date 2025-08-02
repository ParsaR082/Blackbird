import crypto from 'crypto';

/**
 * Generates an HMAC signature for n8n webhook requests
 * 
 * @param payload The request body to sign
 * @param secret The shared secret used for signing
 * @returns The HMAC signature as a hex string
 */
export function signPayload(payload: any, secret: string): string {
  // Convert payload to string if it's an object
  const stringPayload = typeof payload === 'string' 
    ? payload 
    : JSON.stringify(payload);
  
  // Create HMAC using SHA-256
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(stringPayload);
  
  // Return hex digest
  return hmac.digest('hex');
}

/**
 * Verifies if a signature matches the expected signature for a payload
 * 
 * @param payload The request body that was signed
 * @param secret The shared secret used for signing
 * @param signature The signature to verify
 * @returns True if the signature is valid, false otherwise
 */
export function verifySignature(payload: any, secret: string, signature: string): boolean {
  const expectedSignature = signPayload(payload, secret);

  const expectedBuffer = Buffer.from(expectedSignature, 'hex');
  const providedBuffer = Buffer.from(signature, 'hex');

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  // Use timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
}

/**
 * Helper function to get the webhook secret from environment variables
 * 
 * @returns The webhook secret or throws an error if not configured
 */
export function getWebhookSecret(): string {
  const secret = process.env.BUBOT_WEBHOOK_SECRET;
  
  if (!secret) {
    throw new Error('BUBOT_WEBHOOK_SECRET environment variable is not configured');
  }
  
  return secret;
} 