'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import BackgroundNodes from '@/components/BackgroundNodes'
import { 
  Bot, 
  MessageSquare, 
  Zap, 
  Brain,
  Sparkles,
  Settings,
  History,
  Plus,
  Send,
  Code,
  FileText,
  Cpu,
  Terminal,
  Globe
} from 'lucide-react'

export default function AssistantPage() {
  const [isMobile, setIsMobile] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const quickActions = [
    { icon: Brain, label: 'Neural Analysis', description: 'Advanced AI-powered code review and optimization' },
    { icon: Code, label: 'Code Generation', description: 'Automated code synthesis and pattern recognition' },
    { icon: FileText, label: 'Documentation', description: 'Intelligent documentation and API reference generation' },
    { icon: Terminal, label: 'System Integration', description: 'Terminal automation and system command execution' }
  ]

  const capabilities = [
    'Neural Network Integration',
    'Quantum Processing',
    'Pattern Recognition',
    'System Automation',
    'Data Analysis',
    'Predictive Modeling'
  ]

  const recentSessions = [
    { title: 'Code Architecture Review', time: '2.4 hrs ago', status: 'completed' },
    { title: 'Database Optimization', time: '1 day ago', status: 'in-progress' },
    { title: 'API Documentation', time: '3 days ago', status: 'completed' },
    { title: 'System Integration', time: '5 days ago', status: 'completed' }
  ]

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Interactive Background */}
      <BackgroundNodes isMobile={isMobile} />
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen px-4 py-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <motion.div 
              className="p-4 rounded-full bg-black/90 border border-white/30 backdrop-blur-sm"
              whileHover={{ scale: 1.1, boxShadow: '0 0 25px rgba(255,255,255,0.4)' }}
              transition={{ duration: 0.3 }}
            >
              <Bot className="w-8 h-8 text-white" />
            </motion.div>
          </div>
          <h1 className="text-3xl font-light text-white tracking-wide mb-2">
            AI Assistant Portal
          </h1>
          <p className="text-sm text-white/60 max-w-md mx-auto">
            Intelligent automation and neural network integration for enhanced productivity
          </p>
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div 
          className="max-w-4xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.label}
                className="group relative cursor-pointer"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-lg bg-white opacity-0 blur-lg group-hover:opacity-10"
                  initial={{ scale: 0.8 }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Action Card */}
                <div className="relative p-6 bg-black/90 border border-white/30 rounded-lg backdrop-blur-sm h-32 flex flex-col items-center justify-center text-center group-hover:border-white/60 group-hover:bg-black/95 transition-all duration-300">
                  <action.icon className="w-8 h-8 text-white mb-3" />
                  <h3 className="text-sm font-medium text-white mb-1">{action.label}</h3>
                  <p className="text-xs text-white/60">{action.description}</p>
                </div>

                {/* Pulse effect */}
                <motion.div
                  className="absolute inset-0 rounded-lg border border-white/20 opacity-0 group-hover:opacity-40"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Main Interface */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat Interface */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="bg-black/90 border border-white/30 rounded-lg backdrop-blur-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="w-5 h-5 text-white" />
                <h2 className="text-lg font-light text-white tracking-wide">Neural Interface</h2>
              </div>
              
              {/* Chat Messages */}
              <div className="min-h-[400px] bg-black/50 border border-white/20 rounded-lg p-4 mb-4 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 bg-black/80 border border-white/20 rounded-lg p-3">
                    <p className="text-sm text-white/90">Neural interface initialized. Ready for advanced AI integration.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 justify-end">
                  <div className="flex-1 max-w-[80%] bg-white/10 border border-white/30 rounded-lg p-3">
                    <p className="text-sm text-white">Analyze my codebase architecture and suggest optimizations.</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold text-xs">
                    U
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 bg-black/80 border border-white/20 rounded-lg p-3">
                    <p className="text-sm text-white/90">Initiating deep analysis protocols. Scanning file structure, dependencies, and performance patterns...</p>
                  </div>
                </div>
              </div>

              {/* Input Area */}
              <div className="flex gap-3">
                <input 
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter neural command..."
                  className="flex-1 bg-black/80 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:border-white/60 focus:outline-none transition-all duration-300"
                />
                <motion.button
                  className="px-6 py-3 bg-white/10 border border-white/30 rounded-lg text-white hover:bg-white/20 hover:border-white/60 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {/* System Status */}
            <div className="bg-black/90 border border-white/30 rounded-lg backdrop-blur-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <Cpu className="w-5 h-5 text-white" />
                <h3 className="text-lg font-light text-white tracking-wide">System Status</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">Neural Load</span>
                  <span className="text-sm font-light text-white">47.3%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">Processing Units</span>
                  <span className="text-sm font-light text-white">8/12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">Uptime</span>
                  <span className="text-sm font-light text-white">99.7%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">Quantum State</span>
                  <span className="text-sm font-light text-white">Stable</span>
                </div>
              </div>
            </div>

            {/* Recent Sessions */}
            <div className="bg-black/90 border border-white/30 rounded-lg backdrop-blur-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <History className="w-5 h-5 text-white" />
                <h3 className="text-lg font-light text-white tracking-wide">Recent Sessions</h3>
              </div>
              <div className="space-y-3">
                {recentSessions.map((session, index) => (
                  <motion.div 
                    key={session.title}
                    className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-all duration-300"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <div className={`w-2 h-2 rounded-full ${session.status === 'completed' ? 'bg-white/60' : 'bg-white/30 animate-pulse'}`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-light text-white">{session.title}</p>
                      <p className="text-xs text-white/50">{session.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Capabilities */}
            <div className="bg-black/90 border border-white/30 rounded-lg backdrop-blur-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-5 h-5 text-white" />
                <h3 className="text-lg font-light text-white tracking-wide">Capabilities</h3>
              </div>
              <div className="space-y-2">
                {capabilities.map((capability, index) => (
                  <motion.div 
                    key={capability}
                    className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs text-white/80 text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    {capability}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Status */}
        <motion.div 
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <div className="flex items-center space-x-2 text-white/40 text-xs">
            <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse" />
            <span>Neural Network Active</span>
            <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
        </motion.div>
      </div>
    </div>
  )
} 