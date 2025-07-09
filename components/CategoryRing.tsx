'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useTheme } from '@/contexts/theme-context'

const categories = [
  { name: 'University', path: '/university' },
  { name: 'Hall of Fame', path: '/hall-of-fame' },
  { name: 'Games', path: '/games' },
  { name: 'Product Playground', path: '/product-playground' },
  { name: 'Roadmaps', path: '/roadmaps' },
  { name: 'Events', path: '/events' },
  { name: 'Assistant', path: '/assistant' }
]

const CategoryRing = () => {
  // Logo dimensions from LogoBird.tsx: 220x220 pixels
  const logoRadius = 110 // Half of logo width/height (220/2)
  const distanceFromLogoBorder = 140 // Space between logo edge and categories  
  const radius = logoRadius + distanceFromLogoBorder // Total distance from center (250px)
  const { theme } = useTheme()
  
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {categories.map((category, index) => {
        // Calculate position in perfect circle (starting from top and going clockwise)
        const angle = (index * (360 / categories.length)) - 90 // Equal spacing, start from top
        const radians = (angle * Math.PI) / 180
        const x = radius * Math.cos(radians)
        const y = radius * Math.sin(radians)

        return (
          <motion.div
            key={category.name}
            className="absolute"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.8, 
              delay: index * 0.15,
              ease: "easeOut"
            }}
            style={{
              left: `calc(50% + ${x}px - 25px)`,
              top: `calc(50% + ${y}px)`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <Link href={category.path}>
              <motion.div
                className="group relative cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Glow effect on hover */}
                <motion.div
                  className="absolute inset-0 rounded-full opacity-0 blur-lg group-hover:opacity-25"
                  style={{
                    backgroundColor: theme === 'light' ? '#000000' : '#ffffff'
                  }}
                  initial={{ scale: 0.8 }}
                  whileHover={{ scale: 1.5 }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Category text */}
                <motion.div
                  className="relative px-6 py-3 font-medium text-base text-center whitespace-nowrap rounded-full backdrop-blur-sm shadow-lg transition-colors duration-300"
                  style={{
                    backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
                    borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.3)',
                    color: theme === 'light' ? '#000000' : '#ffffff',
                    border: '1px solid'
                  }}
                  whileHover={{ 
                    backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(17, 17, 17, 0.95)',
                    borderColor: theme === 'light' ? '#000000' : '#ffffff',
                    boxShadow: theme === 'light' ? '0 0 25px rgba(0,0,0,0.2)' : '0 0 25px rgba(255,255,255,0.4)',
                    y: -2
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {category.name}
                </motion.div>
                
                {/* Pulse effect */}
                <motion.div
                  className="absolute inset-0 rounded-full border opacity-0 group-hover:opacity-60"
                  style={{
                    borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'
                  }}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            </Link>
          </motion.div>
        )
      })}
    </div>
  )
}

export default CategoryRing 