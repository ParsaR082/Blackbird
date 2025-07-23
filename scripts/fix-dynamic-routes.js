/**
 * Script to add dynamic export configurations to API route files
 * This fixes "Dynamic server usage" errors during build
 */
const fs = require('fs');
const path = require('path');

// Configuration to add at the top of each API route file
const dynamicConfig = `export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

`;

// Function to recursively process directories
function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stats = fs.statSync(fullPath);
    
    if (stats.isDirectory()) {
      // Recursively process subdirectories
      processDirectory(fullPath);
    } else if (file === 'route.js' || file === 'route.ts' || file === 'route.tsx') {
      // Process API route files
      console.log(`Processing API route: ${fullPath}`);
      
      // Read the file content
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Check if it's a client component
      if (content.includes("'use client'") || content.includes('"use client"')) {
        console.log(`Client component detected in API route: ${fullPath}`);
        
        // For client components, we need to ensure 'use client' is at the top
        // Remove any existing dynamic exports
        let updatedContent = content;
        
        // Remove dynamic exports if they exist
        updatedContent = updatedContent.replace(/export const dynamic\s*=\s*['"]force-dynamic['"];?(\r?\n|\r)?/g, '');
        updatedContent = updatedContent.replace(/export const revalidate\s*=\s*0;?(\r?\n|\r)?/g, '');
        updatedContent = updatedContent.replace(/export const fetchCache\s*=\s*['"]force-no-store['"];?(\r?\n|\r)?/g, '');
        
        // Now write the file without any dynamic exports
        fs.writeFileSync(fullPath, updatedContent);
        console.log(`✓ Removed dynamic exports from client component API route: ${fullPath}`);
      } else {
        // For server components, add at the top if not already present
        if (!content.includes('export const dynamic =')) {
          content = dynamicConfig + content;
          fs.writeFileSync(fullPath, content);
          console.log(`✓ Added dynamic config to API route: ${fullPath}`);
        } else {
          console.log(`✓ API route already has dynamic config: ${fullPath}`);
        }
      }
    }
  }
}

// Start processing from the API directory
console.log('Adding dynamic export configurations to API routes...');
try {
  processDirectory(path.join(__dirname, '..', 'app', 'api'));
  console.log('✅ Successfully processed all API routes!');
} catch (error) {
  console.error('❌ Error processing API routes:', error);
  process.exit(1);
} 