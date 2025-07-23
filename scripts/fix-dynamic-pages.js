/**
 * Script to add dynamic export configurations to page files
 * This fixes "Export encountered errors" during build
 */
const fs = require('fs');
const path = require('path');

// Configuration to add at the top of each page file
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

// Start processing from the app directory
console.log('Adding dynamic export configurations to page files...');
try {
  processDirectory(path.join(__dirname, '..', 'app'));
  console.log('✅ Successfully processed all page files!');
} catch (error) {
  console.error('❌ Error processing page files:', error);
  process.exit(1);
} 