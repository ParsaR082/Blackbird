'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import CategoryRing from '@/components/CategoryRing'
import LogoBird from '@/components/LogoBird'
import BackgroundNodes from '@/components/BackgroundNodes'
import { AuthModal } from '@/components/auth/AuthModal'

export function HomePageContent() {
  const [isMobile, setIsMobile] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const searchParams = useSearchParams()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const showAuth = searchParams.get('showAuth')
    if (showAuth === 'login') {
      setShowAuthModal(true)
      setAuthMode('login')
    } else if (showAuth === 'register') {
      setShowAuthModal(true)
      setAuthMode('register')
    }
  }, [searchParams])

  return (
    <>
      <BackgroundNodes isMobile={isMobile} />
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <div className="hidden md:block relative w-full max-w-4xl">
          <motion.div 
            className="relative w-full h-[600px] flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <div className="absolute inset-0">
              <CategoryRing />
            </div>
            <div className="relative z-20 flex items-center justify-center">
              <LogoBird />
            </div>
          </motion.div>
          
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

        <div className="md:hidden text-center w-full max-w-sm mx-auto">
          <motion.div 
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <LogoBird />
            <h1 className="text-2xl font-light text-white/80 tracking-wide mt-4">
              Welcome to the Portal
            </h1>
            <p className="text-sm text-white/60 mt-2 max-w-md mx-auto mb-8">
              Explore our interconnected universe of innovation, creativity, and discovery
            </p>
            
            <motion.div 
              className="grid grid-cols-2 gap-3 w-full px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
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
                  className="bg-black/90 border border-white/30 rounded-lg p-3 text-white text-sm font-medium text-center hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.6 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {category.name}
                </motion.a>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
      
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

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        initialMode={authMode}
      />
    </>
  )
} 