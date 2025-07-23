
'use client'



import React from 'react'
import { useTheme } from '@/contexts/theme-context'
import BackgroundNodes from '@/components/BackgroundNodes'
import EventArchive from '../EventArchive'

export default function EventArchivePage() {
  const { theme } = useTheme()

  return (
    <div className="min-h-screen overflow-hidden transition-colors duration-300" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      {/* Interactive Background */}
      <BackgroundNodes isMobile={false} />
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen px-4 pt-24 pb-8">
        <EventArchive />
      </div>
    </div>
  )
} 