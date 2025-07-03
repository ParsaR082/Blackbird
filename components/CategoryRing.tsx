'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const categories = [
  { name: 'Hall of Fame', path: '/hall-of-fame' },
  { name: 'Games', path: '/games' },
  { name: 'Product Playground', path: '/product-playground' },
  { name: 'Roadmaps', path: '/roadmaps' },
  { name: 'Events', path: '/events' }
]

const CategoryRing = () => {
  const radius = 250 // Distance from center
  
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {categories.map((category, index) => {
        // Calculate position in circle (starting from top and going clockwise)
        const angle = (index * 72) - 90 // 72 degrees apart (360/5), start from top
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
              left: `calc(50% + ${x}px)`,
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
                  className="absolute inset-0 rounded-full bg-white opacity-0 blur-lg group-hover:opacity-25"
                  initial={{ scale: 0.8 }}
                  whileHover={{ scale: 1.5 }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Category text */}
                <motion.div
                  className="relative px-6 py-3 text-white font-medium text-base text-center whitespace-nowrap bg-black/90 border border-white/30 rounded-full backdrop-blur-sm shadow-lg"
                  whileHover={{ 
                    backgroundColor: 'rgba(17, 17, 17, 0.95)',
                    borderColor: '#fff',
                    boxShadow: '0 0 25px rgba(255,255,255,0.4)',
                    y: -2
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {category.name}
                </motion.div>
                
                {/* Pulse effect */}
                <motion.div
                  className="absolute inset-0 rounded-full border border-white/20 opacity-0 group-hover:opacity-60"
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
      
      {/* Connecting lines from center (subtle effect) */}
      {categories.map((_, index) => {
        const angle = (index * 72) - 90
        
        return (
          <motion.div
            key={`line-${index}`}
            className="absolute left-1/2 top-1/2 origin-left"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 0.08, scaleX: 1 }}
            transition={{ 
              duration: 1.2,
              delay: index * 0.1 + 0.8,
              ease: "easeOut"
            }}
            style={{
              width: `${radius - 60}px`,
              height: '1px',
              backgroundColor: 'white',
              transform: `rotate(${angle}deg)`,
            }}
          />
        )
      })}
    </div>
  )
}

export default CategoryRing 