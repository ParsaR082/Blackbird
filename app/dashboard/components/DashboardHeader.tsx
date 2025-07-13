'use client'

import { motion } from 'framer-motion'
import { LayoutDashboard, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/theme-context'

interface DashboardHeaderProps {
  userName?: string
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  const { theme } = useTheme()
  
  return (
    <motion.div variants={itemVariants} className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-8 h-8 transition-colors duration-300" style={{ color: 'var(--text-secondary)' }} />
            <h1 
              className="text-4xl font-bold transition-all duration-300" 
              style={{ 
                color: 'var(--text-color)'
              }}
            >
              Dashboard
            </h1>
          </div>
          <p className="mt-2 transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
            Welcome back, {userName || 'User'}! Here&apos;s what&apos;s happening in your portal.
          </p>
        </div>
        <Button 
          className="transition-colors duration-300"
          style={{
            backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
            borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
            color: 'var(--text-color)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>
    </motion.div>
  )
} 