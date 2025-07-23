/**
 * Script to disable static exports for all client components
 * This adds a special comment to prevent Next.js from attempting to export them statically
 */
const fs = require('fs');
const path = require('path');

console.log('Disabling static exports for client components...');

// List of directories to process
const directories = [
  'app',
  'pages'
];

// Counter for modified files
let modifiedCount = 0;

// Function to recursively process directories
function processDirectory(directory) {
  const fullPath = path.join(__dirname, '..', directory);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`Directory does not exist: ${directory}`);
    return;
  }
  
  const files = fs.readdirSync(fullPath);
  
  for (const file of files) {
    const filePath = path.join(fullPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      // Recursively process subdirectories
      processDirectory(path.join(directory, file));
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.ts')) {
      // Process TypeScript/JavaScript files
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        const isClientComponent = content.includes("'use client'") || content.includes('"use client"');
        
        if (isClientComponent) {
          // Add a special comment at the top of client components to prevent static export
          // This comment is processed by our prebuild script
          if (!content.includes('// @DISABLE_STATIC_EXPORT')) {
            const updatedContent = `// @DISABLE_STATIC_EXPORT
${content}`;
            fs.writeFileSync(filePath, updatedContent);
            console.log(`✓ Disabled static export for: ${path.join(directory, file)}`);
            modifiedCount++;
          }
        }
      } catch (error) {
        console.error(`Error processing file ${path.join(directory, file)}:`, error);
      }
    }
  }
}

// Process all directories
for (const directory of directories) {
  processDirectory(directory);
}

console.log(`✅ Disabled static exports for ${modifiedCount} client components`); 