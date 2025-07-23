export const dynamic = 'force-dynamic';
export const revalidate = 0;

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import CategoryRing from '@/components/CategoryRing'
import LogoBird from '@/components/LogoBird'
import BackgroundNodes from '@/components/BackgroundNodes'

export default function HomePage() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check mobile on mount
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <>
      <BackgroundNodes isMobile={isMobile} />
      
      {/* Hero Section */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {/* Desktop Layout */}
        <div className="hidden md:block relative w-full max-w-4xl">
          {/* Container for the circular layout */}
          <motion.div 
            className="relative w-full h-[600px] flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            {/* Category Ring - positioned absolutely to allow proper circular layout */}
            <div className="absolute inset-0">
              <CategoryRing />
            </div>
            
            {/* Central Bird Logo - positioned in the center */}
            <div className="relative z-20 flex items-center justify-center">
              <LogoBird />
            </div>
          </motion.div>
          
          {/* Subtitle */}
          {/* Removed welcome text and description */}
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden text-center">
          <motion.div 
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <LogoBird />
            {/* Removed welcome text and description for mobile */}
          </motion.div>
        </div>
      </div>
    </>
  )
} 