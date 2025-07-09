'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/theme-context'
import { CheckCircle, X, Users } from 'lucide-react'

interface ToastProps {
  isVisible: boolean
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
  onClose: () => void
}

const Toast: React.FC<ToastProps> = ({ 
  isVisible, 
  message, 
  type = 'success', 
  duration = 3000, 
  onClose 
}) => {
  const { theme } = useTheme()

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          iconColor: 'text-green-400',
          backgroundColor: theme === 'light' 
            ? 'rgba(34, 197, 94, 0.1)' 
            : 'rgba(34, 197, 94, 0.2)',
          borderColor: theme === 'light' 
            ? 'rgba(34, 197, 94, 0.3)' 
            : 'rgba(34, 197, 94, 0.4)',
          textColor: theme === 'light' ? 'text-green-800' : 'text-green-300'
        }
      case 'error':
        return {
          icon: X,
          iconColor: 'text-red-400',
          backgroundColor: theme === 'light' 
            ? 'rgba(239, 68, 68, 0.1)' 
            : 'rgba(239, 68, 68, 0.2)',
          borderColor: theme === 'light' 
            ? 'rgba(239, 68, 68, 0.3)' 
            : 'rgba(239, 68, 68, 0.4)',
          textColor: theme === 'light' ? 'text-red-800' : 'text-red-300'
        }
      case 'info':
      default:
        return {
          icon: Users,
          iconColor: 'text-blue-400',
          backgroundColor: theme === 'light' 
            ? 'rgba(59, 130, 246, 0.1)' 
            : 'rgba(59, 130, 246, 0.2)',
          borderColor: theme === 'light' 
            ? 'rgba(59, 130, 246, 0.3)' 
            : 'rgba(59, 130, 246, 0.4)',
          textColor: theme === 'light' ? 'text-blue-800' : 'text-blue-300'
        }
    }
  }

  const styles = getToastStyles()
  const Icon = styles.icon

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-4 right-4 z-50 max-w-sm w-full"
          initial={{ opacity: 0, x: 300, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div
            className="rounded-lg border backdrop-blur-sm p-4 shadow-lg"
            style={{
              backgroundColor: styles.backgroundColor,
              borderColor: styles.borderColor
            }}
          >
            <div className="flex items-start gap-3">
              <Icon className={`w-5 h-5 ${styles.iconColor} flex-shrink-0 mt-0.5`} />
              <div className="flex-1">
                <p className={`text-sm font-medium ${styles.textColor}`}>
                  {message}
                </p>
              </div>
              <button
                onClick={onClose}
                className={`p-1 rounded-lg transition-colors duration-200 hover:bg-black/10 ${styles.textColor}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress bar */}
            <motion.div
              className="mt-3 h-1 bg-black/10 rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                className={`h-full ${styles.iconColor.replace('text-', 'bg-')}`}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: duration / 1000, ease: "linear" }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Toast 