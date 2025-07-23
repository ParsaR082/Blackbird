// Test script for healthcheck debugging
const http = require('http');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
try {
  require('dotenv').config();
  console.log('Loaded environment variables from .env file');
} catch (error) {
  console.log('Failed to load dotenv, continuing without it:', error.message);
  // Try to load manually
  if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8');
    const envLines = envContent.split('\n');
    envLines.forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        if (!process.env[key]) {
          process.env[key] = value;
          console.log(`Manually set ${key}=${value.substring(0, 3)}...`);
        }
      }
    });
  }
}

// Set up a simple server with the same health check logic
const server = http.createServer((req, res) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // Log headers for debugging
  console.log('Request headers:', JSON.stringify(req.headers, null, 2));
  
  // Parse the URL
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;
  
  console.log(`Parsed pathname: ${pathname}`);
  
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
    const responseBody = JSON.stringify({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      env: {
        NODE_ENV: process.env.NODE_ENV || 'not set',
        PORT: process.env.PORT || '3000 (default)'
      }
    });
    console.log(`Health response: ${responseBody}`);
    res.end(responseBody);
    return;
  }
  
  // For any other path, return a simple message
  console.log(`Unhandled path: ${pathname}`);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end(`Debug server is running. Try /health for health check endpoint.`);
});

const port = process.env.PORT || 3000;

// Add error handling
server.on('error', (err) => {
  console.error('Server error:', err);
});

// Start the server
server.listen(port, () => {
  console.log(`Debug server running at http://localhost:${port}/`);
  console.log(`Try accessing http://localhost:${port}/health in your browser`);
  console.log(`Or run: curl -v http://localhost:${port}/health`);
  console.log(`For HEAD request: curl -I http://localhost:${port}/`);
  
  // Log environment for debugging
  console.log('\nEnvironment variables:');
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  console.log(`PORT: ${process.env.PORT || '3000 (default)'}`);
  console.log(`MONGODB_URI: ${process.env.MONGODB_URI ? 'set (hidden)' : 'not set'}`);
  console.log(`NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || 'not set'}`);
}); 