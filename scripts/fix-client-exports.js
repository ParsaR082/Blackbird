/**
 * Script to fix client component export errors during build
 * This targets specific page files that are causing export errors
 */
const fs = require('fs');
const path = require('path');

// List of page files that are causing export errors
const problemPages = [
  'app/(public)/page.tsx',
  'app/admin/events/page.tsx',
  'app/admin/hall-of-fame/page.tsx',
  'app/admin/page.tsx',
  'app/admin/products/page.tsx',
  'app/admin/purchases/page.tsx',
  'app/admin/roadmaps/page.tsx',
  'app/admin/university/academic-records/page.tsx',
  'app/admin/university/analytics/page.tsx',
  'app/admin/university/assignments/page.tsx',
  'app/admin/university/courses/page.tsx',
  'app/admin/university/page.tsx',
  'app/admin/university/semesters/page.tsx',
  'app/admin/university/students/page.tsx',
  'app/assistant/page.tsx',
  'app/auth-test/page.tsx',
  'app/auth/login/page.tsx',
  'app/auth/register/page.tsx',
  'app/calendar/page.tsx',
  'app/dashboard/page.tsx',
  'app/events/archive/page.tsx',
  'app/events/page.tsx',
  'app/hall-of-fame/page.tsx',
  'app/product-playground/page.tsx',
  'app/roadmaps/page.tsx',
  'app/university/assignments/page.tsx',
  'app/university/courses/page.tsx',
  'app/university/page.tsx',
  'app/university/progress/page.tsx',
  'app/university/semester-enrollment/page.tsx',
  'app/university/study-plans/page.tsx',
  'app/users/profile/[username]/page.tsx',
  'app/users/profile/page.tsx',
];

// Process each problem page
console.log('Fixing client component export errors...');
let fixedCount = 0;

for (const pagePath of problemPages) {
  const fullPath = path.join(__dirname, '..', pagePath);
  
  try {
    if (fs.existsSync(fullPath)) {
      console.log(`Processing: ${pagePath}`);
      
      // Read the file content
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Check if it's a client component
      const isClientComponent = content.includes("'use client'") || content.includes('"use client"');
      
      if (isClientComponent) {
        // For client components:
        // 1. Remove any dynamic exports
        // 2. Ensure 'use client' is at the very top
        let updatedContent = content;
        
        // Remove dynamic exports
        updatedContent = updatedContent.replace(/export const dynamic\s*=\s*['"]force-dynamic['"];?(\r?\n|\r)?/g, '');
        updatedContent = updatedContent.replace(/export const revalidate\s*=\s*0;?(\r?\n|\r)?/g, '');
        updatedContent = updatedContent.replace(/export const fetchCache\s*=\s*['"]force-no-store['"];?(\r?\n|\r)?/g, '');
        
        // Remove 'use client' directive to reposition it
        updatedContent = updatedContent.replace(/['"]use client['"];?(\r?\n|\r)?/g, '');
        
        // Add 'use client' at the very top
        updatedContent = "'use client'\n\n" + updatedContent.trim();
        
        // Write the updated content
        fs.writeFileSync(fullPath, updatedContent);
        console.log(`✓ Fixed client component: ${pagePath}`);
        fixedCount++;
      } else {
        // For server components, add dynamic config if not present
        if (!content.includes('export const dynamic =')) {
          const dynamicConfig = `export const dynamic = 'force-dynamic';\nexport const revalidate = 0;\n\n`;
          content = dynamicConfig + content;
          fs.writeFileSync(fullPath, content);
          console.log(`✓ Added dynamic config to server component: ${pagePath}`);
          fixedCount++;
        } else {
          console.log(`✓ Server component already has dynamic config: ${pagePath}`);
        }
      }
    } else {
      console.log(`⚠️ File not found: ${pagePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${pagePath}:`, error);
  }
}

console.log(`✅ Fixed ${fixedCount} page files!`); 