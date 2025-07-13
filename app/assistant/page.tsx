'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import BackgroundNodes from '@/components/BackgroundNodes'
import { useTheme } from '@/contexts/theme-context'
import { AssistantHeader } from './components/AssistantHeader'
import { QuickActionsGrid } from './components/QuickActionsGrid'
import { ChatInterface } from './components/ChatInterface'
import { AssistantSidebar } from './components/AssistantSidebar'
import { StatusIndicator } from './components/StatusIndicator'

export default function AssistantPage() {
  const [isMobile, setIsMobile] = useState(false)
  const [isConnected, setIsConnected] = useState(true)
  const [systemStatus, setSystemStatus] = useState({
    neuralLoad: 47.3,
    processingUnits: 8,
    totalUnits: 12,
    uptime: 99.7,
    quantumState: 'Stable'
  })
  const { theme } = useTheme()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Simulate real-time system status updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStatus(prev => ({
        ...prev,
        neuralLoad: Math.random() * 30 + 30, // 30-60%
        processingUnits: Math.floor(Math.random() * 4) + 6, // 6-10
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen overflow-hidden transition-colors duration-300" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      {/* Interactive Background */}
      <BackgroundNodes isMobile={isMobile} />
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen px-4 pt-24 pb-8">
        {/* Header */}
        <AssistantHeader theme={theme} />
        
        {/* Quick Actions Grid */}
        <QuickActionsGrid theme={theme} />
        
        {/* Main Interface */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat Interface */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <ChatInterface theme={theme} />
          </motion.div>

          {/* Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <AssistantSidebar 
              theme={theme} 
              systemStatus={systemStatus}
              isConnected={isConnected}
            />
          </motion.div>
        </div>

        {/* Bottom Status */}
        <StatusIndicator theme={theme} isConnected={isConnected} />
      </div>
    </div>
  )
} 