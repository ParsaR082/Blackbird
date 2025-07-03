'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import LogoBird from '@/components/LogoBird'
import CategoryRing from '@/components/CategoryRing'
import CategoryList from '@/components/CategoryList'
import BackgroundNodes from '@/components/BackgroundNodes'

export default function HomePage() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Interactive Background */}
      <BackgroundNodes isMobile={isMobile} />
      
      {/* Main Content */}
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
          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
          >
            <h1 className="text-2xl font-light text-white/80 tracking-wide">
              Welcome to the Portal
            </h1>
            <p className="text-sm text-white/60 mt-2 max-w-md mx-auto">
              Explore our interconnected universe of innovation, creativity, and discovery
            </p>
          </motion.div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex flex-col items-center justify-center text-center">
          {/* Title */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-3xl font-light text-white tracking-wide">
              Blackbird Portal
            </h1>
            <p className="text-sm text-white/60 mt-2 max-w-sm">
              Explore our universe of innovation and creativity
            </p>
          </motion.div>
          
          {/* Central Bird Logo */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <LogoBird />
          </motion.div>
          
          {/* Category List */}
          <CategoryList />
        </div>
      </div>
      
      {/* Bottom decoration */}
      <motion.div 
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
      >
        <div className="flex items-center space-x-2 text-white/40 text-xs">
          <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse" />
          <span>Portal Active</span>
          <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
      </motion.div>
    </div>
  )
} 