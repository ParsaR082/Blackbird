'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const categories = [
  { name: 'Hall of Fame', path: '/hall-of-fame' },
  { name: 'Games', path: '/games' },
  { name: 'Product Playground', path: '/product-playground' },
  { name: 'Roadmaps', path: '/roadmaps' },
  { name: 'Events', path: '/events' },
  { name: 'Assistant', path: '/assistant' }
]

const CategoryList = () => {
  return (
    <div className="flex flex-col items-center space-y-4 mt-12">
      {categories.map((category, index) => (
        <motion.div
          key={category.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.6, 
            delay: index * 0.1,
            ease: "easeOut"
          }}
        >
          <Link href={category.path}>
            <motion.div
              className="group relative cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Glow effect on hover */}
              <motion.div
                className="absolute inset-0 rounded-full bg-white opacity-0 blur-md group-hover:opacity-30"
                initial={{ scale: 0.8 }}
                whileHover={{ scale: 1.2 }}
                transition={{ duration: 0.3 }}
              />
              
              {/* Category text */}
              <motion.div
                className="relative px-8 py-4 text-white font-medium text-lg text-center bg-black border border-white/20 rounded-full min-w-[200px]"
                whileHover={{ 
                  backgroundColor: '#111',
                  borderColor: '#fff',
                  boxShadow: '0 0 20px rgba(255,255,255,0.3)'
                }}
                transition={{ duration: 0.3 }}
              >
                {category.name}
              </motion.div>
              
              {/* Pulse effect */}
              <motion.div
                className="absolute inset-0 rounded-full border border-white/30 opacity-0 group-hover:opacity-100"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}

export default CategoryList 