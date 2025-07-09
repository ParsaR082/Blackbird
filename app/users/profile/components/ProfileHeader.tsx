'use client'

import { motion } from 'framer-motion'
import { User } from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
}

export function ProfileHeader() {
  const { theme } = useTheme()
  
  return (
    <motion.div variants={itemVariants} className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 
            className="text-4xl font-bold transition-all duration-300" 
            style={{ 
              background: theme === 'light' 
                ? 'linear-gradient(to right, #000000, #374151, #6b7280)' 
                : 'linear-gradient(to right, #ffffff, #e5e7eb, #9ca3af)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Profile Settings
          </h1>
          <p className="mt-2 transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
            Manage your account information and preferences
          </p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <User className="h-12 w-12 transition-colors duration-300" style={{ color: 'var(--text-secondary)' }} />
        </motion.div>
      </div>
    </motion.div>
  )
} 