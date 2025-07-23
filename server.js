// Custom server for Node.js deployment
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env file if available
try {
  if (fs.existsSync(path.join(process.cwd(), '.env'))) {
    console.log('Loading .env file from:', path.join(process.cwd(), '.env'));
    require('dotenv').config();
    console.log('Environment variables loaded from .env file');
  }
} catch (error) {
  console.error('Error loading .env file:', error);
}

// Force production mode
process.env.NODE_ENV = 'production';

// Disable Next.js telemetry
process.env.NEXT_TELEMETRY_DISABLED = '1';

// Configure app
const app = next({ 
  dev: false,
  dir: process.cwd(),
  conf: {
    compress: true,
    poweredByHeader: false
  }
});

const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;

// Log important environment variables (without sensitive values)
console.log('Starting server with environment:');
console.log(`- NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`- PORT: ${port}`);
console.log(`- MONGODB_URI: ${process.env.MONGODB_URI ? 'set (hidden)' : 'not set'}`);
console.log(`- NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || 'not set'}`);
console.log(`- Current directory: ${process.cwd()}`);

// Improved error handling for the server
const startServer = async () => {
  try {
    console.log('Preparing Next.js app...');
    await app.prepare();
    console.log('Next.js app prepared successfully');
    
    const server = createServer((req, res) => {
      try {
        // Log all incoming requests for debugging
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
        
        // Parse the URL
        const parsedUrl = parse(req.url, true);
        const { pathname } = parsedUrl;
        
        // Health check endpoint for Railway
        if (pathname === '/' && req.method === 'HEAD') {
          console.log('Responding to HEAD / health check');
          res.statusCode = 200;
          res.end('OK');
          return;
        }
        
        // Explicit health check endpoint
        if (pathname === '/health') {
          console.log('Responding to /health endpoint');
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ 
            status: 'ok', 
            timestamp: new Date().toISOString(),
            env: {
              NODE_ENV: process.env.NODE_ENV || 'not set',
              PORT: port
            }
          }));
          return;
        }
        
        // Special handling for API routes to ensure they're treated as dynamic
        if (pathname?.startsWith('/api/')) {
          // Add headers to ensure dynamic behavior
          res.setHeader('Cache-Control', 'no-store, max-age=0');
          res.setHeader('Surrogate-Control', 'no-store');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
          
          // Log API requests in production for debugging
          console.log(`API Request: ${req.method} ${pathname}`);
        }
        
        // Let Next.js handle the request
        handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error handling request:', err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    });

    // Global error handling
    server.on('error', (err) => {
      console.error('Server error:', err);
      
      // Only exit in critical cases
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use`);
        process.exit(1);
      }
    });

    // Start listening
    server.listen(port, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://localhost:${port}`);
      console.log(`> Environment: ${process.env.NODE_ENV}`);
      console.log(`> Server mode: standalone`);
    });
    
    // Handle graceful shutdown
    const signals = ['SIGTERM', 'SIGINT'];
    signals.forEach(signal => {
      process.on(signal, () => {
        console.log(`> ${signal} received, shutting down...`);
        server.close(() => {
          console.log('> Server closed');
          process.exit(0);
        });
        
        // Force close after 10s
        setTimeout(() => {
          console.error('> Forcing shutdown after timeout');
          process.exit(1);
        }, 10000);
      });
    });
  } catch (err) {
    console.error('An error occurred starting the app:', err);
    process.exit(1);
  }
};

// Start the server
startServer(); 