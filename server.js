// Custom server wrapper for Next.js that bypasses static export issues
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');

// Load environment variables from .env file if available
try {
  require('dotenv').config();
  console.log('Environment variables loaded from .env file');
} catch (error) {
  console.log('Failed to load dotenv, continuing without it:', error.message);
}

// Configure environment
const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = process.env.PORT || 3000;

// Log important environment variables (without sensitive values)
console.log('Starting server with environment:');
console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`- PORT: ${port}`);
console.log(`- MONGODB_URI: ${process.env.MONGODB_URI ? 'set (hidden)' : 'not set'}`);
console.log(`- NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || 'not set'}`);

// Initialize Next.js with custom configuration
const app = next({ 
  dev, 
  hostname, 
  port,
  conf: {
    // Force dynamic rendering
    staticPageGenerationTimeout: 1,
    // Disable static exports
    output: 'standalone',
  }
});
const handle = app.getRequestHandler();

// Prepare the app
app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Parse the URL
      const parsedUrl = parse(req.url, true);
      const { pathname, query } = parsedUrl;
      
      // Health check endpoints for Railway
      if ((pathname === '/' && req.method === 'HEAD') || pathname === '/api/health') {
        console.log(`Responding to health check: ${pathname}`);
        res.statusCode = 200;
        
        if (req.method === 'HEAD') {
          res.end();
          return;
        }
        
        if (pathname === '/api/health') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            status: 'ok',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'unknown'
          }));
          return;
        }
      }
      
      // Let Next.js handle the request
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}); 