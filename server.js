// Simple server wrapper for Next.js
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Configure environment
const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Initialize Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Prepare the app
app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Health check endpoint for Railway
      if (req.url === '/') {
        // For HEAD requests (used by Railway healthcheck)
        if (req.method === 'HEAD') {
          res.statusCode = 200;
          res.end();
          return;
        }
      }

      // Parse the URL
      const parsedUrl = parse(req.url, true);
      
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
  });
}); 