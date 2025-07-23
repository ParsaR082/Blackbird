/**
 * Script to fix client component export errors during build
 * This targets specific page files that are causing export errors
 */
const fs = require('fs');
const path = require('path');

// List of page files that are causing export errors
const problemPages = [
  // Regular pages
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
  
  // Special Next.js pages
  'app/not-found.tsx',
  'app/error.tsx',
  'app/global-error.tsx',
  'app/_not-found/page.tsx',
];

// Also check for these special Next.js files that might exist
const specialNextFiles = [
  'pages/_app.tsx',
  'pages/_document.tsx',
  'pages/_error.tsx',
  'pages/404.tsx',
  'pages/500.tsx',
];

// Add any existing special Next.js files to the problemPages array
specialNextFiles.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    problemPages.push(file);
  }
});

// Process each problem page
console.log('Fixing client component export errors...');
let fixedCount = 0;

// Create _not-found directory and page if it doesn't exist
const notFoundDir = path.join(__dirname, '..', 'app', '_not-found');
const notFoundPage = path.join(notFoundDir, 'page.tsx');

if (!fs.existsSync(notFoundDir)) {
  console.log('Creating _not-found directory');
  fs.mkdirSync(notFoundDir, { recursive: true });
}

if (!fs.existsSync(notFoundPage)) {
  console.log('Creating _not-found/page.tsx');
  const notFoundContent = `'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Home } from 'lucide-react'
import BackgroundNodes from '@/components/BackgroundNodes'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
      <BackgroundNodes isMobile={false} />
      
      <div className="relative z-10 text-center max-w-md px-4">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-4">
          404
        </h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/">
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="javascript:history.back()">
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}`;
  fs.writeFileSync(notFoundPage, notFoundContent);
  console.log('✓ Created _not-found/page.tsx');
  fixedCount++;
}

// Create error.tsx if it doesn't exist
const errorPage = path.join(__dirname, '..', 'app', 'error.tsx');
if (!fs.existsSync(errorPage)) {
  console.log('Creating error.tsx');
  const errorContent = `'use client'
 
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import BackgroundNodes from '@/components/BackgroundNodes'
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])
 
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
      <BackgroundNodes isMobile={false} />
      
      <div className="relative z-10 text-center max-w-md px-4">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-4">
          Error
        </h1>
        <h2 className="text-2xl font-semibold mb-4">Something went wrong</h2>
        <p className="text-gray-400 mb-8">
          We apologize for the inconvenience. Please try again.
        </p>
        
        <Button 
          onClick={reset}
          variant="outline" 
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </Button>
      </div>
    </div>
  )
}`;
  fs.writeFileSync(errorPage, errorContent);
  console.log('✓ Created error.tsx');
  fixedCount++;
}

// Create global-error.tsx if it doesn't exist
const globalErrorPage = path.join(__dirname, '..', 'app', 'global-error.tsx');
if (!fs.existsSync(globalErrorPage)) {
  console.log('Creating global-error.tsx');
  const globalErrorContent = `'use client'
 
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
 
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
          <div className="text-center max-w-md px-4">
            <h1 className="text-6xl font-bold text-red-500 mb-4">
              Critical Error
            </h1>
            <h2 className="text-2xl font-semibold mb-4">Something went seriously wrong</h2>
            <p className="text-gray-400 mb-8">
              We apologize for the inconvenience. Please try refreshing the page.
            </p>
            
            <Button 
              onClick={reset}
              variant="outline" 
              className="gap-2 bg-white/10 hover:bg-white/20 text-white"
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </Button>
          </div>
        </div>
      </body>
    </html>
  )
}`;
  fs.writeFileSync(globalErrorPage, globalErrorContent);
  console.log('✓ Created global-error.tsx');
  fixedCount++;
}

// Process each problem page
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