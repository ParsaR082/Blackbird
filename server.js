// Custom server for Node.js deployment
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');

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

// Improved error handling for the server
const startServer = async () => {
  try {
    await app.prepare();
    
    const server = createServer((req, res) => {
      try {
        // Parse the URL
        const parsedUrl = parse(req.url, true);
        const { pathname } = parsedUrl;
        
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