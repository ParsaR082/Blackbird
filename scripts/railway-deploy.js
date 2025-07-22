#!/usr/bin/env node
/**
 * Railway deployment script
 * This script prepares the application for deployment to Railway
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚂 Preparing for Railway deployment...');

// Ensure we're in production mode
process.env.NODE_ENV = 'production';

// Create necessary directories
const dirs = [
  '.next/standalone',
  '.next/static',
  'public',
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Copy necessary files for Railway deployment
function copyFileSync(source, target) {
  let targetFile = target;
  
  // If target is a directory, a new file with the same name will be created
  if (fs.existsSync(target) && fs.lstatSync(target).isDirectory()) {
    targetFile = path.join(target, path.basename(source));
  }
  
  try {
    fs.writeFileSync(targetFile, fs.readFileSync(source));
    console.log(`Copied: ${source} -> ${targetFile}`);
  } catch (err) {
    console.error(`Error copying ${source} to ${targetFile}:`, err);
  }
}

// Copy entire directory recursively
function copyDirSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
  
  console.log(`Copied directory: ${src} -> ${dest}`);
}

// Copy server.js to the root and standalone directory
if (fs.existsSync('server.js')) {
  copyFileSync('server.js', '.next/standalone/');
}

// Copy public directory to standalone
if (fs.existsSync('public')) {
  copyDirSync('public', '.next/standalone/public');
}

// Copy .next/static to standalone/.next/static
if (fs.existsSync('.next/static')) {
  copyDirSync('.next/static', '.next/standalone/.next/static');
}

// Create a minimal package.json for the standalone directory
const minimalPackageJson = {
  name: "blackbird-portal-standalone",
  version: "1.0.0",
  private: true,
  scripts: {
    "start": "node server.js"
  },
  dependencies: {
    "next": "^14.0.0"
  },
  engines: {
    "node": ">=18.17.0"
  }
};

fs.writeFileSync(
  '.next/standalone/package.json',
  JSON.stringify(minimalPackageJson, null, 2)
);

console.log('Created minimal package.json in .next/standalone');

// Create a .env.production file with necessary configurations
const envContent = `
# Production environment variables
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
NEXT_SHARP_PATH=/tmp/node_modules/sharp
NEXT_RUNTIME=nodejs
`;

fs.writeFileSync('.env.production', envContent);
console.log('Created .env.production file');

// Create a special next.config.js for the standalone directory
const standaloneNextConfig = `
/** @type {import('next').NextConfig} */
module.exports = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['mongodb', 'mongoose'],
  },
  swcMinify: true,
  poweredByHeader: false,
  // Force all API routes to be dynamic
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },
};
`;

fs.writeFileSync('.next/standalone/next.config.js', standaloneNextConfig);
console.log('Created next.config.js in standalone directory');

// Create a Procfile for Railway
const procfileContent = 'web: cd .next/standalone && node server.js';
fs.writeFileSync('Procfile', procfileContent);
console.log('Created Procfile for Railway');

console.log('✅ Railway deployment preparation complete!'); 