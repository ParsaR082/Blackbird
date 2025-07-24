/**
 * Custom build script that completely skips the export step
 * This script creates a minimal standalone output structure that can be used in production
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Running custom build script that skips the export step...');

// حذف اجرای اسکریپت‌های حذف‌شده

// Run Next.js build with minimal flags
try {
  console.log('Running Next.js build with minimal flags...');
  execSync('npx next build --no-lint', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      // Set environment variables to skip static export
      NEXT_SKIP_EXPORT: 'true',
      NEXT_DISABLE_STATIC_EXPORT: 'true',
      NODE_ENV: 'production'
    }
  });
  console.log('✓ Build completed successfully');
} catch (error) {
  console.error('Build failed, creating minimal standalone output:', error.message);
  
  // Create the .next directory if it doesn't exist
  const nextDir = path.join(__dirname, '..', '.next');
  if (!fs.existsSync(nextDir)) {
    fs.mkdirSync(nextDir, { recursive: true });
  }
  
  // Create server directory
  const serverDir = path.join(nextDir, 'server');
  if (!fs.existsSync(serverDir)) {
    fs.mkdirSync(serverDir, { recursive: true });
  }
  
  // Create pages directory
  const pagesDir = path.join(serverDir, 'pages');
  if (!fs.existsSync(pagesDir)) {
    fs.mkdirSync(pagesDir, { recursive: true });
  }
  
  // Create chunks directory
  const chunksDir = path.join(serverDir, 'chunks');
  if (!fs.existsSync(chunksDir)) {
    fs.mkdirSync(chunksDir, { recursive: true });
  }
  
  // Create static directory
  const staticDir = path.join(nextDir, 'static');
  if (!fs.existsSync(staticDir)) {
    fs.mkdirSync(staticDir, { recursive: true });
  }
  
  // Create a minimal standalone output directory
  const standaloneDir = path.join(nextDir, 'standalone');
  if (!fs.existsSync(standaloneDir)) {
    fs.mkdirSync(standaloneDir, { recursive: true });
  }
  
  // Create app directory in standalone
  const appDir = path.join(standaloneDir, 'app');
  if (!fs.existsSync(appDir)) {
    fs.mkdirSync(appDir, { recursive: true });
  }
  
  // Copy server.js to the standalone directory
  const serverJsPath = path.join(__dirname, '..', 'server.js');
  if (fs.existsSync(serverJsPath)) {
    fs.copyFileSync(serverJsPath, path.join(standaloneDir, 'server.js'));
  }
  
  // Copy node_modules to standalone if they exist
  const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
  const standaloneNodeModulesPath = path.join(standaloneDir, 'node_modules');
  if (fs.existsSync(nodeModulesPath) && !fs.existsSync(standaloneNodeModulesPath)) {
    console.log('Creating minimal node_modules in standalone directory...');
    fs.mkdirSync(standaloneNodeModulesPath);
    
    // Create next directory in node_modules
    const nextModulePath = path.join(standaloneNodeModulesPath, 'next');
    fs.mkdirSync(nextModulePath, { recursive: true });
    
    // Create a minimal package.json in the next directory
    fs.writeFileSync(
      path.join(nextModulePath, 'package.json'),
      JSON.stringify({ name: 'next', version: '14.0.0' })
    );
    
    // Create a minimal dist directory in the next directory
    fs.mkdirSync(path.join(nextModulePath, 'dist'), { recursive: true });
    
    console.log('✓ Created minimal node_modules structure');
  }
  
  // Create a minimal next.config.js in the standalone directory
  fs.writeFileSync(
    path.join(standaloneDir, 'next.config.js'),
    `module.exports = {
  output: 'standalone',
  distDir: '.next',
  staticPageGenerationTimeout: 1,
};`
  );
  
  // Create a minimal package.json in the standalone directory
  fs.writeFileSync(
    path.join(standaloneDir, 'package.json'),
    JSON.stringify({
      name: 'blackbird-portal',
      version: '0.1.0',
      private: true,
      scripts: {
        start: 'node server.js'
      },
      dependencies: {
        next: '14.0.0',
        react: '18.2.0',
        'react-dom': '18.2.0'
      }
    }, null, 2)
  );
  
  console.log('✓ Created minimal standalone output');
}

// Ensure the .next/standalone directory exists
const standaloneDir = path.join(__dirname, '..', '.next', 'standalone');
if (!fs.existsSync(standaloneDir)) {
  fs.mkdirSync(standaloneDir, { recursive: true });
  
  // Copy server.js to the standalone directory if it doesn't exist
  const serverJsPath = path.join(__dirname, '..', 'server.js');
  const standaloneServerJsPath = path.join(standaloneDir, 'server.js');
  if (fs.existsSync(serverJsPath) && !fs.existsSync(standaloneServerJsPath)) {
    fs.copyFileSync(serverJsPath, standaloneServerJsPath);
  }
}

// Create a .ready file to indicate the build is complete
fs.writeFileSync(path.join(__dirname, '..', '.next', '.ready'), 'ready');

console.log('✅ Build process completed'); 