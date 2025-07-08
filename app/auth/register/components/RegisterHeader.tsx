'use client'

import Link from 'next/link'
import { UserPlus, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function RegisterHeader() {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center mb-6">
        <div className="p-3 rounded-full backdrop-blur-sm transition-colors duration-300" style={{
          backgroundColor: 'var(--header-bg)',
          borderColor: 'var(--header-border)',
          border: '1px solid'
        }}>
          <UserPlus className="w-8 h-8 transition-colors duration-300" style={{ color: 'var(--text-color)' }} />
        </div>
      </div>
      
      <h1 className="text-3xl font-light tracking-wide mb-2 transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
        Join Blackbird Portal
      </h1>
      <p className="transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
        Create your student account
      </p>
      
      <Link href="/" className="inline-block mt-6">
        <Button variant="ghost" size="sm" className="transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Portal
        </Button>
      </Link>
    </div>
  )
} 