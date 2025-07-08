'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/theme-context'

interface AuthButtonsProps {
  onLogin: () => void
  onRegister: () => void
}

export function AuthButtons({ onLogin, onRegister }: AuthButtonsProps) {
  const { theme } = useTheme()
  
  return (
    <>
      <div className="hidden md:flex items-center gap-2">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button 
            variant="outline" 
            size="sm"
            className="transition-all duration-200"
            style={{
              color: theme === 'light' ? '#000000' : '#ffffff',
              borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)',
              backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'
              e.currentTarget.style.borderColor = theme === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)'
              e.currentTarget.style.color = theme === 'light' ? '#000000' : '#ffffff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)'
              e.currentTarget.style.borderColor = theme === 'light' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)'
              e.currentTarget.style.color = theme === 'light' ? '#000000' : '#ffffff'
            }}
            onClick={onLogin}
          >
            Login
          </Button>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button 
            variant="outline" 
            size="sm"
            className="transition-all duration-200"
            style={{
              color: theme === 'light' ? '#000000' : '#ffffff',
              borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)',
              backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'
              e.currentTarget.style.borderColor = theme === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)'
              e.currentTarget.style.color = theme === 'light' ? '#000000' : '#ffffff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)'
              e.currentTarget.style.borderColor = theme === 'light' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)'
              e.currentTarget.style.color = theme === 'light' ? '#000000' : '#ffffff'
            }}
            onClick={onRegister}
          >
            Sign Up
          </Button>
        </motion.div>
      </div>
      
      {/* Mobile Version */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button 
          variant="outline" 
          size="sm"
          className="md:hidden transition-all duration-200"
          style={{
            color: theme === 'light' ? '#000000' : '#ffffff',
            borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)',
            backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'
            e.currentTarget.style.borderColor = theme === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)'
            e.currentTarget.style.color = theme === 'light' ? '#000000' : '#ffffff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)'
            e.currentTarget.style.borderColor = theme === 'light' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)'
            e.currentTarget.style.color = theme === 'light' ? '#000000' : '#ffffff'
          }}
          onClick={onLogin}
        >
          Login
        </Button>
      </motion.div>
    </>
  )
} 