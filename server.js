// Custom server for Railway deployment
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

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

app.prepare()
  .then(() => {
    createServer((req, res) => {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true);
      
      // Special handling for API routes to ensure they're treated as dynamic
      if (parsedUrl.pathname?.startsWith('/api/')) {
        res.setHeader('Cache-Control', 'no-store, max-age=0');
      }
      
      handle(req, res, parsedUrl);
    })
    .once('error', (err) => {
      console.error('Server error:', err);
      process.exit(1);
    })
    .listen(port, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://localhost:${port}`);
    });
  })
  .catch((ex) => {
    console.error('An error occurred starting the app:', ex);
    process.exit(1);
  }); 