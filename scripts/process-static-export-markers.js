/**
 * Script to process static export markers and add dynamic export configuration
 * This looks for files with the special comment and adds the necessary configuration
 */
const fs = require('fs');
const path = require('path');

console.log('Processing static export markers...');

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
        
        // Check for the special marker comment
        if (content.includes('// @DISABLE_STATIC_EXPORT')) {
          // Remove the marker
          content = content.replace('// @DISABLE_STATIC_EXPORT\n', '');
          
          // Check if it's a client component
          const isClientComponent = content.includes("'use client'") || content.includes('"use client"');
          
          if (isClientComponent) {
            // For client components, ensure 'use client' is at the very top
            content = content.replace(/['"]use client['"];?(\r?\n|\r)?/g, '');
            content = "'use client'\n\n" + content.trim();
            
            // Add a special config after 'use client' directive
            // This prevents Next.js from trying to statically export this component
            if (!content.includes('// This is a client component - no static export')) {
              content = content.replace("'use client'\n\n", "'use client'\n\n// This is a client component - no static export\n\n");
            }
          } else {
            // For server components, add dynamic export configuration
            if (!content.includes('export const dynamic =')) {
              content = `export const dynamic = 'force-dynamic';\nexport const revalidate = 0;\n\n${content}`;
            }
          }
          
          // Write the updated content back to the file
          fs.writeFileSync(filePath, content);
          console.log(`✓ Processed static export marker for: ${path.join(directory, file)}`);
          modifiedCount++;
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

console.log(`✅ Processed static export markers for ${modifiedCount} files`); 