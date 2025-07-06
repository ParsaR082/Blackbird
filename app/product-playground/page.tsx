'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import BackgroundNodes from '@/components/BackgroundNodes'
import LogoBird from '@/components/LogoBird'

// Mock product data
const PRODUCTS = [
  {
    id: 1,
    title: 'Quantum Helmet X',
    price: 99,
    category: 'Tech',
    image: 'helmet'
  },
  {
    id: 2,
    title: 'Neural Canvas',
    price: 149,
    category: 'Art',
    image: 'canvas'
  },
  {
    id: 3,
    title: 'Void Manipulator',
    price: 199,
    category: 'Tools',
    image: 'manipulator'
  },
  {
    id: 4,
    title: 'Thought Amplifier',
    price: 129,
    category: 'Tech',
    image: 'amplifier'
  },
  {
    id: 5,
    title: 'Dimensional Brush',
    price: 79,
    category: 'Art',
    image: 'brush'
  },
  {
    id: 6,
    title: 'Gravity Shifter',
    price: 249,
    category: 'Tools',
    image: 'shifter'
  },
  {
    id: 7,
    title: 'Echo Lens',
    price: 189,
    category: 'Tech',
    image: 'lens'
  },
  {
    id: 8,
    title: 'Spectrum Weaver',
    price: 159,
    category: 'Art',
    image: 'weaver'
  }
]

// Abstract shape components for product images
const ProductShape = ({ type }: { type: string }) => {
  // Different abstract shapes based on product type
  switch (type) {
    case 'helmet':
      return (
        <div className="w-full h-40 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full border-4 border-white/30 relative">
            <div className="absolute w-28 h-14 bg-black border-2 border-white/30 rounded-t-full top-6 left-1/2 transform -translate-x-1/2" />
          </div>
        </div>
      )
    case 'canvas':
      return (
        <div className="w-full h-40 flex items-center justify-center">
          <div className="w-32 h-24 border-2 border-white/30 relative">
            <div className="absolute w-20 h-1 bg-white/60 top-6 left-2" />
            <div className="absolute w-12 h-1 bg-white/60 top-12 left-6" />
            <div className="absolute w-16 h-1 bg-white/60 top-18 left-4" />
          </div>
        </div>
      )
    case 'manipulator':
      return (
        <div className="w-full h-40 flex items-center justify-center">
          <div className="w-24 h-24 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-white/30 rounded-full relative">
              <div className="absolute w-8 h-1 bg-white/60 top-1/2 left-full transform -translate-y-1/2" />
              <div className="absolute w-1 h-8 bg-white/60 top-full left-1/2 transform -translate-x-1/2" />
              <div className="absolute w-8 h-1 bg-white/60 top-1/2 right-full transform -translate-y-1/2" />
              <div className="absolute w-1 h-8 bg-white/60 bottom-full left-1/2 transform -translate-x-1/2" />
            </div>
          </div>
        </div>
      )
    case 'amplifier':
      return (
        <div className="w-full h-40 flex items-center justify-center">
          <div className="w-24 h-24 relative">
            <div className="absolute w-20 h-20 border-4 border-white/30 transform rotate-45" />
            <div className="absolute w-12 h-12 border-4 border-white/30 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>
      )
    case 'brush':
      return (
        <div className="w-full h-40 flex items-center justify-center">
          <div className="w-8 h-28 border-2 border-white/30 rounded-t-lg relative">
            <div className="absolute w-8 h-6 bg-white/20 top-0 left-0 rounded-t-lg" />
            <div className="absolute w-6 h-1 bg-white/60 top-10 left-1" />
            <div className="absolute w-6 h-1 bg-white/60 top-14 left-1" />
          </div>
        </div>
      )
    case 'shifter':
      return (
        <div className="w-full h-40 flex items-center justify-center">
          <div className="w-28 h-28 relative">
            <div className="absolute w-16 h-16 border-4 border-white/30 rounded-full top-0 left-0" />
            <div className="absolute w-12 h-12 border-4 border-white/30 rounded-full bottom-0 right-0" />
            <div className="absolute w-1 h-16 bg-white/60 transform rotate-45 top-6 left-14" />
          </div>
        </div>
      )
    case 'lens':
      return (
        <div className="w-full h-40 flex items-center justify-center">
          <div className="w-28 h-28 relative">
            <div className="absolute w-20 h-20 border-4 border-white/30 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute w-10 h-10 border-2 border-white/60 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute w-4 h-4 bg-white/20 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>
      )
    case 'weaver':
      return (
        <div className="w-full h-40 flex items-center justify-center">
          <div className="w-28 h-28 relative">
            <div className="absolute w-24 h-1 bg-white/60 top-4 left-2" />
            <div className="absolute w-24 h-1 bg-white/60 top-10 left-2" />
            <div className="absolute w-24 h-1 bg-white/60 top-16 left-2" />
            <div className="absolute w-24 h-1 bg-white/60 top-22 left-2" />
            <div className="absolute w-1 h-24 bg-white/60 top-2 left-4" />
            <div className="absolute w-1 h-24 bg-white/60 top-2 left-10" />
            <div className="absolute w-1 h-24 bg-white/60 top-2 left-16" />
            <div className="absolute w-1 h-24 bg-white/60 top-2 left-22" />
          </div>
        </div>
      )
    default:
      return (
        <div className="w-full h-40 flex items-center justify-center">
          <div className="w-24 h-24 border-4 border-white/30 rounded-full" />
        </div>
      )
  }
}

export default function ProductPlaygroundPage() {
  const [isMobile, setIsMobile] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [filteredProducts, setFilteredProducts] = useState(PRODUCTS)

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Filter products when category changes
  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredProducts(PRODUCTS)
    } else {
      setFilteredProducts(PRODUCTS.filter(product => product.category === selectedCategory))
    }
  }, [selectedCategory])

  // Categories
  const categories = ['All', 'Tech', 'Art', 'Tools']

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Interactive Background */}
      <BackgroundNodes isMobile={isMobile} />
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center px-4 pt-16 pb-24">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-light mb-4"
          >
            Product Playground
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 max-w-md mx-auto"
          >
            Explore our conceptual products in this interactive showcase
          </motion.p>
        </motion.div>
        
        {/* Category Filters */}
        <motion.div 
          className="mb-12 flex flex-wrap justify-center gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {categories.map((category) => (
            <motion.button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full border border-white/20 relative ${
                selectedCategory === category ? 'text-white' : 'text-white/60'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {selectedCategory === category && (
                <motion.div
                  layoutId="categoryIndicator"
                  className="absolute inset-0 bg-white/10 rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{category}</span>
            </motion.button>
          ))}
        </motion.div>
        
        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="w-full max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  className="bg-white/5 backdrop-blur-sm rounded-lg overflow-hidden"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ scale: 1.02, boxShadow: '0 10px 30px -10px rgba(255,255,255,0.1)' }}
                >
                  {/* Product Image */}
                  <div className="bg-white/5">
                    <ProductShape type={product.image} />
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-medium">{product.title}</h3>
                      <motion.div 
                        className="bg-white/10 px-2 py-1 rounded text-sm font-medium"
                        initial={{ y: 0 }}
                        animate={{ y: [0, -2, 0, -2, 0] }}
                        transition={{ 
                          repeat: Infinity, 
                          repeatType: "loop", 
                          duration: 5,
                          repeatDelay: 1
                        }}
                      >
                        <span className="text-white">${product.price}</span>
                      </motion.div>
                    </div>
                    <p className="text-white/60 text-sm mb-4">
                      {product.category}
                    </p>
                    <motion.button
                      className="w-full py-2 border border-white/30 rounded-md text-sm font-medium relative overflow-hidden group"
                      whileHover="hover"
                      whileTap={{ scale: 0.98 }}
                    >
                      <motion.span 
                        className="absolute inset-0 bg-white z-0"
                        initial={{ scaleX: 0 }}
                        variants={{
                          hover: { 
                            scaleX: 1,
                            transition: { duration: 0.3 }
                          }
                        }}
                        style={{ transformOrigin: 'left' }}
                      />
                      <span className="relative z-10 group-hover:text-black transition-colors duration-300">
                        Add to Portal
                      </span>
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          // Empty State
          <motion.div 
            className="flex flex-col items-center justify-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6 opacity-60">
              <LogoBird />
            </div>
            <p className="text-white/60 text-lg">No products found</p>
          </motion.div>
        )}
      </div>
      
      {/* Bottom decoration */}
      <motion.div 
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
      >
        <div className="flex items-center space-x-2 text-white/40 text-xs">
          <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse" />
          <span>Playground Active</span>
          <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
      </motion.div>
    </div>
  )
}