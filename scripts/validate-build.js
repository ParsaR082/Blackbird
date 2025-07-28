const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Validating build configuration...');

// Check if Prisma client can be generated
try {
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated successfully');
} catch (error) {
  console.error('❌ Prisma client generation failed:', error.message);
  process.exit(1);
}

// Check if TypeScript compiles
try {
  console.log('🔧 Type checking...');
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log('✅ TypeScript compilation successful');
} catch (error) {
  console.error('❌ TypeScript compilation failed:', error.message);
  process.exit(1);
}

// Run Next.js build
try {
  console.log('🏗️ Running Next.js build...');
  execSync('npx next build', { stdio: 'inherit' });
  console.log('✅ Next.js build successful');
} catch (error) {
  console.error('❌ Next.js build failed:', error.message);
  process.exit(1);
}

// Check if .next directory was created properly
const nextDir = path.join(__dirname, '..', '.next');
if (!fs.existsSync(nextDir)) {
  console.error('❌ .next directory not found');
  process.exit(1);
}

// Check for serverless pages
const serverDir = path.join(nextDir, 'server');
if (fs.existsSync(serverDir)) {
  const pagesDir = path.join(serverDir, 'pages');
  if (fs.existsSync(pagesDir)) {
    const pages = fs.readdirSync(pagesDir);
    console.log(`✅ Found ${pages.length} serverless pages`);
  }
}

console.log('🎉 Build validation completed successfully!');