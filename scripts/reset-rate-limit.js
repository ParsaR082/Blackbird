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
  
  console.log('✅ Rate limit settings updated successfully!');
  console.log('Login limit increased to 20 requests per minute');
  
  // In a real application, we would also clear Redis or other persistent storage
  // For this in-memory implementation, restarting the server will clear the rate limits
  console.log('Please restart the server to apply changes');
  
} catch (error) {
  console.error('❌ Error updating rate limit settings:', error);
} 