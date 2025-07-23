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
      
      // Check if the file already has the dynamic config
      if (!content.includes('export const dynamic =')) {
        // Add the dynamic config at the top of the file
        content = dynamicConfig + content;
        
        // Write the updated content back to the file
        fs.writeFileSync(fullPath, content);
        console.log(`✓ Added dynamic config to ${fullPath}`);
      } else {
        console.log(`✓ File already has dynamic config: ${fullPath}`);
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