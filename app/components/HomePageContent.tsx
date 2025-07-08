'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CategoryRing from '@/components/CategoryRing'
import LogoBird from '@/components/LogoBird'
import BackgroundNodes from '@/components/BackgroundNodes'
import { useTheme } from '@/contexts/theme-context'

export function HomePageContent() {
  const [isMobile, setIsMobile] = useState(false)
  const [showCategoryRing, setShowCategoryRing] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleLogoClick = () => {
    setShowCategoryRing(!showCategoryRing)
  }

  return (
    <>
      <BackgroundNodes isMobile={isMobile} />
      
      {/* Desktop Layout - Full Screen Centering */}
      <div className="hidden md:block fixed inset-0 z-10">
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          {/* Category Ring - Shows/hides on logo click */}
          <AnimatePresence>
            {showCategoryRing && (
              <motion.div 
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <CategoryRing />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Central Bird Logo with Click Me Text */}
          <div className="relative z-20 flex flex-col items-center">
            <motion.button
              className="cursor-pointer focus:outline-none focus:ring-4 focus:ring-opacity-50 rounded-full p-4 transition-all duration-300"
              onClick={handleLogoClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={showCategoryRing ? "Hide navigation menu" : "Show navigation menu"}
            >
              <LogoBird />
            </motion.button>
            
            {/* Click Me Text */}
            <motion.p 
              className="mt-4 text-sm font-medium tracking-wide transition-colors duration-300"
              style={{ color: 'var(--text-secondary)' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 2 }}
              whileHover={{ scale: 1.05 }}
            >
              Click Me
            </motion.p>
          </div>
        </motion.div>
        
        {/* Welcome Text - Moved much higher to avoid footer overlap */}
        <motion.div 
          className="absolute bottom-32 left-0 right-0 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
        >
          <div className="text-center px-4">
            <h1 className="text-2xl font-light tracking-wide transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
              Welcome to the Portal
            </h1>
            <p className="text-sm mt-2 max-w-md transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
              Explore our interconnected universe of innovation, creativity, and discovery
            </p>
          </div>
        </motion.div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pb-24">
        <div className="text-center w-full max-w-sm mx-auto">
          <motion.div 
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Mobile Logo with Click Me Text */}
            <div className="flex flex-col items-center">
              <motion.button
                className="cursor-pointer focus:outline-none focus:ring-4 focus:ring-opacity-50 rounded-full p-4 transition-all duration-300"
                onClick={handleLogoClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={showCategoryRing ? "Hide navigation menu" : "Show navigation menu"}
              >
                <LogoBird />
              </motion.button>
              
              {/* Click Me Text - Mobile */}
              <motion.p 
                className="mt-2 text-sm font-medium tracking-wide transition-colors duration-300"
                style={{ color: 'var(--text-secondary)' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.5 }}
                whileHover={{ scale: 1.05 }}
              >
                Tap Me
              </motion.p>
            </div>
            
            <h1 className="text-2xl font-light tracking-wide mt-6 transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
              Welcome to the Portal
            </h1>
            <p className="text-sm mt-2 max-w-md mx-auto mb-8 transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
              Explore our interconnected universe of innovation, creativity, and discovery
            </p>
            
            {/* Mobile Category Grid - Toggle based on logo click */}
            <AnimatePresence>
              {showCategoryRing && (
                <motion.div 
                  className="grid grid-cols-2 gap-3 w-full px-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  {[
                    { name: 'Hall of Fame', path: '/hall-of-fame' },
                    { name: 'Games', path: '/games' },
                    { name: 'Product Playground', path: '/product-playground' },
                    { name: 'Roadmaps', path: '/roadmaps' },
                    { name: 'Events', path: '/events' },
                    { name: 'Assistant', path: '/assistant' },
                    { name: 'University', path: '/university' }
                  ].map((category, index) => (
                    <motion.a
                      key={category.name}
                      href={category.path}
                      className="border rounded-lg p-3 text-sm font-medium text-center transition-all duration-300 backdrop-blur-sm"
                      style={{
                        backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
                        borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.3)',
                        color: theme === 'light' ? '#000000' : '#ffffff'
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileTap={{ scale: 0.95 }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)'
                      }}
                    >
                      {category.name}
                    </motion.a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Bottom Status */}
      <motion.div 
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
      >
        <div className="flex items-center space-x-2 text-xs transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
          <div className="w-2 h-2 rounded-full animate-pulse transition-colors duration-300" style={{ backgroundColor: 'var(--text-secondary)' }} />
          <span>Portal Active</span>
          <div className="w-2 h-2 rounded-full animate-pulse transition-colors duration-300" style={{ backgroundColor: 'var(--text-secondary)', animationDelay: '0.5s' }} />
        </div>
      </motion.div>
    </>
  )
} 