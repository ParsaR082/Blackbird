/**
 * Script to add dynamic export configurations to page files
 * This fixes "Export encountered errors" during build
 */
const fs = require('fs');
const path = require('path');

// Configuration to add for server components
const dynamicConfig = `export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    } else if (file === 'page.tsx' || file === 'page.jsx' || file === 'page.js' || file === 'page.ts') {
      // Process page files
      console.log(`Processing page: ${fullPath}`);
      
      // Read the file content
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Check if it's a client component
      if (content.includes("'use client'") || content.includes('"use client"')) {
        console.log(`Client component detected: ${fullPath}`);
        
        // For client components, we need to move any dynamic exports AFTER the 'use client' directive
        // First, remove any existing dynamic exports
        let updatedContent = content;
        
        // Remove dynamic exports if they exist
        updatedContent = updatedContent.replace(/export const dynamic\s*=\s*['"]force-dynamic['"];?(\r?\n|\r)?/g, '');
        updatedContent = updatedContent.replace(/export const revalidate\s*=\s*0;?(\r?\n|\r)?/g, '');
        updatedContent = updatedContent.replace(/export const fetchCache\s*=\s*['"]force-no-store['"];?(\r?\n|\r)?/g, '');
        
        // Now write the file without any dynamic exports
        fs.writeFileSync(fullPath, updatedContent);
        console.log(`✓ Removed dynamic exports from client component: ${fullPath}`);
      } else {
        // For server components, add at the top if not already present
        if (!content.includes('export const dynamic =')) {
          content = dynamicConfig + content;
          fs.writeFileSync(fullPath, content);
          console.log(`✓ Added dynamic config to server component: ${fullPath}`);
        } else {
          console.log(`✓ Server component already has dynamic config: ${fullPath}`);
        }
      }
    }
  }
}

// Start processing from the app directory
console.log('Adding dynamic export configurations to page files...');
try {
  processDirectory(path.join(__dirname, '..', 'app'));
  console.log('✅ Successfully processed all page files!');
} catch (error) {
  console.error('❌ Error processing page files:', error);
  process.exit(1);
} 