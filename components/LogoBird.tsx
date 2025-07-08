'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/theme-context'

const LogoBird = () => {
  const { theme } = useTheme()
  const logoColor = theme === 'light' ? '#000000' : '#ffffff'
  
  return (
    <div className="flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative"
      >
        {/* Blackbird Logo Image - Increased size to match ring */}
        <Image
          src="/blackbirdlogo.svg"
          alt="Blackbird Logo"
          width={220}
          height={220}
          className="drop-shadow-2xl relative z-10"
          style={{ 
            color: logoColor,
            filter: theme === 'light' ? 'brightness(0)' : 'brightness(1)'
          }}
          priority
        />
        
        {/* Enhanced Glow effect - KEEPING THE ANIMATIONS */}
        <motion.div
          className="absolute inset-0 rounded-full opacity-10 blur-xl"
          style={{ 
            backgroundColor: logoColor,
            filter: 'blur(20px)'
          }}
          animate={{ 
            opacity: [0.1, 0.2, 0.1],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Subtle outer glow - KEEPING THE ANIMATIONS */}
        <motion.div
          className="absolute inset-0 rounded-full opacity-5 blur-2xl"
          style={{ 
            backgroundColor: logoColor,
            filter: 'blur(30px)'
          }}
          animate={{ 
            opacity: [0.05, 0.1, 0.05],
            scale: [1.1, 1.3, 1.1]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
    </div>
  )
}

export default LogoBird 