// Custom server for Node.js deployment
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');
const fs = require('fs');

// Enhanced environment variable loading from multiple possible locations
function loadEnvFromPossibleLocations() {
  const possibleLocations = [
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), '.env.local'),
    path.join(process.cwd(), '.env.production'),
    path.join(__dirname, '.env'),
    path.join(__dirname, '..', '.env')
  ];
  
  console.log('Searching for .env files in:');
  possibleLocations.forEach(location => console.log(`- ${location}`));
  
  let loaded = false;
  
  for (const location of possibleLocations) {
    try {
      if (fs.existsSync(location)) {
        console.log(`Found .env file at: ${location}`);
        require('dotenv').config({ path: location });
        console.log('Loaded environment variables from:', location);
        loaded = true;
        break;
      }
    } catch (error) {
      console.error(`Error checking/loading .env at ${location}:`, error.message);
    }
  }
  
  if (!loaded) {
    console.log('No .env file found in any of the expected locations');
    console.log('Using environment variables from process.env only');
  }
  
  // Check for critical environment variables
  const criticalVars = ['MONGODB_URI', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'];
  const missing = criticalVars.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    console.warn(`WARNING: Missing critical environment variables: ${missing.join(', ')}`);
  } else {
    console.log('All critical environment variables are present');
  }
}

// Load environment variables from all possible locations
loadEnvFromPossibleLocations();

// Force production mode
process.env.NODE_ENV = 'production';

// Disable Next.js telemetry
process.env.NEXT_TELEMETRY_DISABLED = '1';

// Ensure NEXTAUTH_URL is set correctly in production
if (process.env.NODE_ENV === 'production') {
  // If we're in Railway, use the Railway URL
  if (process.env.RAILWAY_STATIC_URL) {
    console.log(`Setting NEXTAUTH_URL from RAILWAY_STATIC_URL: ${process.env.RAILWAY_STATIC_URL}`);
    process.env.NEXTAUTH_URL = process.env.RAILWAY_STATIC_URL;
  }
  // If we're in Railway with a custom domain
  else if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    console.log(`Setting NEXTAUTH_URL from RAILWAY_PUBLIC_DOMAIN: ${process.env.RAILWAY_PUBLIC_DOMAIN}`);
    process.env.NEXTAUTH_URL = `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  }
  // Fallback to the Railway service URL
  else if (process.env.RAILWAY_SERVICE_URL) {
    console.log(`Setting NEXTAUTH_URL from RAILWAY_SERVICE_URL: ${process.env.RAILWAY_SERVICE_URL}`);
    process.env.NEXTAUTH_URL = process.env.RAILWAY_SERVICE_URL;
  }
  // If NEXTAUTH_URL is localhost in production, set a default
  else if (process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.includes('localhost')) {
    console.log('NEXTAUTH_URL contains localhost but we are in production, setting to default Railway URL');
    process.env.NEXTAUTH_URL = 'https://blackbird-production.up.railway.app';
  }
}

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
console.log(`- __dirname: ${__dirname}`);

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
        
        // Health check endpoint for Railway (root path)
        if (pathname === '/' && (req.method === 'HEAD' || req.method === 'GET')) {
          console.log('Responding to / health check');
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/plain');
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
              PORT: port,
              MONGODB_URI: process.env.MONGODB_URI ? 'set' : 'not set',
              NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'not set',
              cwd: process.cwd(),
              dirname: __dirname
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