/**
 * Script to reset rate limiters and update rate limit settings
 */

// Modify the rate-limit.ts file to increase login limit
const fs = require('fs');
const path = require('path');

// Path to the rate-limit.ts file
const rateLimitFilePath = path.join(__dirname, '..', 'lib', 'rate-limit.ts');

try {
  // Read the file
  let content = fs.readFileSync(rateLimitFilePath, 'utf8');
  
  // Replace the login limiter configuration
  content = content.replace(
    /export const loginLimiter = new RateLimit\({\s*interval: .*,\s*limit: \d+.*\}\);/s,
    `export const loginLimiter = new RateLimit({
  interval: 60 * 1000,     // 1 minute
  limit: 20                // 20 requests per minute
});`
  );
  
  // Write the file back
  fs.writeFileSync(rateLimitFilePath, content);
  
} catch (error) {
  // حذف تمام console.log و console.error غیرضروری
} 