/**
 * Script to create or fix Next.js error pages
 * This handles special pages like _error, 404, and 500
 */
const fs = require('fs');
const path = require('path');

console.log('Fixing Next.js error pages...');
let fixedCount = 0;

// Create pages directory if it doesn't exist (for legacy _error pages)
const pagesDir = path.join(__dirname, '..', 'pages');
if (!fs.existsSync(pagesDir)) {
  console.log('Creating pages directory');
  fs.mkdirSync(pagesDir, { recursive: true });
}

// Create _error.tsx in pages directory
const errorPage = path.join(pagesDir, '_error.tsx');
if (!fs.existsSync(errorPage)) {
  console.log('Creating pages/_error.tsx');
  const errorContent = `import { NextPage } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import BackgroundNodes from '@/components/BackgroundNodes';

interface ErrorProps {
  statusCode?: number;
}

const Error: NextPage<ErrorProps> = ({ statusCode }) => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
      <BackgroundNodes isMobile={false} />
      
      <div className="relative z-10 text-center max-w-md px-4">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-4">
          {statusCode || 'Error'}
        </h1>
        <h2 className="text-2xl font-semibold mb-4">
          {statusCode === 404 
            ? 'Page Not Found' 
            : 'Something went wrong'}
        </h2>
        <p className="text-gray-400 mb-8">
          {statusCode === 404
            ? "The page you're looking for doesn't exist or has been moved."
            : "We apologize for the inconvenience. Please try again later."}
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
  );
};

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;`;
  fs.writeFileSync(errorPage, errorContent);
  console.log('✓ Created pages/_error.tsx');
  fixedCount++;
}

// Create 404.tsx in pages directory
const notFoundPage = path.join(pagesDir, '404.tsx');
if (!fs.existsSync(notFoundPage)) {
  console.log('Creating pages/404.tsx');
  const notFoundContent = `import Error from './_error';

export default function NotFound() {
  return <Error statusCode={404} />;
}`;
  fs.writeFileSync(notFoundPage, notFoundContent);
  console.log('✓ Created pages/404.tsx');
  fixedCount++;
}

// Create 500.tsx in pages directory
const serverErrorPage = path.join(pagesDir, '500.tsx');
if (!fs.existsSync(serverErrorPage)) {
  console.log('Creating pages/500.tsx');
  const serverErrorContent = `import Error from './_error';

export default function ServerError() {
  return <Error statusCode={500} />;
}`;
  fs.writeFileSync(serverErrorPage, serverErrorContent);
  console.log('✓ Created pages/500.tsx');
  fixedCount++;
}

console.log(`✅ Fixed ${fixedCount} error pages!`); 