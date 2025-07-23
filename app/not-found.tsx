'use client'

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
} 