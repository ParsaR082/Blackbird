/**
 * Simple in-memory rate limiter for API routes
 * In production, you should use a Redis-based solution like @upstash/ratelimit
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export interface RateLimitOptions {
  interval: number; // in milliseconds
  limit: number;    // max requests per interval
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Rate limiter for API routes
 */
export class RateLimit {
  private options: RateLimitOptions;
  
  constructor(options: RateLimitOptions) {
    this.options = {
      interval: options.interval || 60 * 1000, // Default: 1 minute
      limit: options.limit || 10              // Default: 10 requests per minute
    };
  }
  
  /**
   * Check if a request is within rate limits
   * @param key Identifier for the request (e.g., IP address)
   * @returns Result of the rate limit check
   */
  async limit(key: string): Promise<RateLimitResult> {
    const now = Date.now();
    
    // Clean up expired entries
    this.cleanup(now);
    
    // Get or create entry for this key
    if (!store[key]) {
      store[key] = {
        count: 0,
        resetTime: now + this.options.interval
      };
    }
    
    // Reset if interval has passed
    if (now > store[key].resetTime) {
      store[key] = {
        count: 0,
        resetTime: now + this.options.interval
      };
    }
    
    // Increment count
    store[key].count += 1;
    
    // Check if limit is exceeded
    const success = store[key].count <= this.options.limit;
    
    return {
      success,
      limit: this.options.limit,
      remaining: Math.max(0, this.options.limit - store[key].count),
      reset: store[key].resetTime
    };
  }
  
  /**
   * Clean up expired entries to prevent memory leaks
   */
  private cleanup(now: number) {
    Object.keys(store).forEach(key => {
      if (now > store[key].resetTime) {
        delete store[key];
      }
    });
  }
}

// Export preconfigured rate limiters
export const loginLimiter = new RateLimit({
  interval: 60 * 1000,     // 1 minute
  limit: 50                // 50 requests per minute
});

export const registerLimiter = new RateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  limit: 3                 // 3 accounts per hour
});

export const passwordResetLimiter = new RateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  limit: 3                 // 3 reset requests per hour
}); 