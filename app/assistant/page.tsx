'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import BackgroundNodes from '@/components/BackgroundNodes'
import { useTheme } from '@/contexts/theme-context'
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
  const { theme } = useTheme()

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
    <div className="min-h-screen overflow-hidden transition-colors duration-300" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
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
              className="p-4 rounded-full border backdrop-blur-sm transition-colors duration-300"
              style={{
                backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
                borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
              }}
              whileHover={{ 
                scale: 1.1, 
                boxShadow: theme === 'light' ? '0 0 25px rgba(0,0,0,0.2)' : '0 0 25px rgba(255,255,255,0.4)'
              }}
              transition={{ duration: 0.3 }}
            >
              <Bot className={`w-8 h-8 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
            </motion.div>
          </div>
          <h1 className={`text-3xl font-light tracking-wide mb-2 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>
            AI Assistant Portal
          </h1>
          <p className={`text-sm max-w-md mx-auto transition-colors duration-300 ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`}>
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
                <div className="relative p-6 border rounded-lg backdrop-blur-sm h-32 flex flex-col items-center justify-center text-center transition-all duration-300" style={{
                  backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
                  borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
                }}>
                  <action.icon className={`w-8 h-8 mb-3 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
                  <h3 className={`text-sm font-medium mb-1 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>{action.label}</h3>
                  <p className={`text-xs transition-colors duration-300 ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`}>{action.description}</p>
                </div>

                {/* Pulse effect */}
                <motion.div
                  className="absolute inset-0 rounded-lg border opacity-0 group-hover:opacity-40 transition-colors duration-300"
                  style={{
                    borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'
                  }}
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
            <div className="border rounded-lg backdrop-blur-sm p-6 transition-colors duration-300" style={{
              backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
              borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
            }}>
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare className={`w-5 h-5 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
                <h2 className={`text-lg font-light tracking-wide transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>Neural Interface</h2>
              </div>
              
              {/* Chat Messages */}
              <div className="min-h-[400px] border rounded-lg p-4 mb-4 space-y-4 transition-colors duration-300" style={{
                backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'
              }}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full border flex items-center justify-center transition-colors duration-300" style={{
                    backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                    borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
                  }}>
                    <Bot className={`w-4 h-4 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
                  </div>
                  <div className="flex-1 border rounded-lg p-3 transition-colors duration-300" style={{
                    backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
                    borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'
                  }}>
                    <p className={`text-sm transition-colors duration-300 ${theme === 'light' ? 'text-gray-900' : 'text-white/90'}`}>Neural interface initialized. Ready for advanced AI integration.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 justify-end">
                  <div className="flex-1 max-w-[80%] border rounded-lg p-3 transition-colors duration-300" style={{
                    backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                    borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
                  }}>
                    <p className={`text-sm transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>Analyze my codebase architecture and suggest optimizations.</p>
                  </div>
                  <div className="w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs transition-colors duration-300" style={{
                    backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                    borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                    color: theme === 'light' ? '#000000' : '#ffffff'
                  }}>
                    U
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full border flex items-center justify-center transition-colors duration-300" style={{
                    backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                    borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
                  }}>
                    <Bot className={`w-4 h-4 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
                  </div>
                  <div className="flex-1 border rounded-lg p-3 transition-colors duration-300" style={{
                    backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
                    borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'
                  }}>
                    <p className={`text-sm transition-colors duration-300 ${theme === 'light' ? 'text-gray-900' : 'text-white/90'}`}>Initiating deep analysis protocols. Scanning file structure, dependencies, and performance patterns...</p>
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
                  className="flex-1 border rounded-lg px-4 py-3 focus:outline-none transition-all duration-300"
                  style={{
                    backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
                    borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                    color: theme === 'light' ? '#000000' : '#ffffff'
                  }}
                />
                <motion.button
                  className={`px-6 py-3 border rounded-lg transition-all duration-300 ${
                    theme === 'light' 
                      ? 'bg-black/10 border-black/30 text-black hover:bg-black/20 hover:border-black/60' 
                      : 'bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/60'
                  }`}
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
            <div className="border rounded-lg backdrop-blur-sm p-6 transition-colors duration-300" style={{
              backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
              borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
            }}>
              <div className="flex items-center gap-3 mb-4">
                <Cpu className={`w-5 h-5 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
                <h3 className={`text-lg font-light tracking-wide transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>System Status</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-sm transition-colors duration-300 ${theme === 'light' ? 'text-gray-700' : 'text-white/70'}`}>Neural Load</span>
                  <span className={`text-sm font-light transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>47.3%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm transition-colors duration-300 ${theme === 'light' ? 'text-gray-700' : 'text-white/70'}`}>Processing Units</span>
                  <span className={`text-sm font-light transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>8/12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm transition-colors duration-300 ${theme === 'light' ? 'text-gray-700' : 'text-white/70'}`}>Uptime</span>
                  <span className={`text-sm font-light transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>99.7%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm transition-colors duration-300 ${theme === 'light' ? 'text-gray-700' : 'text-white/70'}`}>Quantum State</span>
                  <span className={`text-sm font-light transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>Stable</span>
                </div>
              </div>
            </div>

            {/* Recent Sessions */}
            <div className="border rounded-lg backdrop-blur-sm p-6 transition-colors duration-300" style={{
              backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
              borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
            }}>
              <div className="flex items-center gap-3 mb-4">
                <History className={`w-5 h-5 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
                <h3 className={`text-lg font-light tracking-wide transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>Recent Sessions</h3>
              </div>
              <div className="space-y-3">
                {recentSessions.map((session, index) => (
                  <motion.div 
                    key={session.title}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-300 ${
                      theme === 'light' ? 'hover:bg-black/5' : 'hover:bg-white/5'
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      session.status === 'completed' 
                        ? (theme === 'light' ? 'bg-gray-600' : 'bg-white/60')
                        : (theme === 'light' ? 'bg-gray-400 animate-pulse' : 'bg-white/30 animate-pulse')
                    }`}></div>
                    <div className="flex-1">
                      <p className={`text-sm font-light transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>{session.title}</p>
                      <p className={`text-xs transition-colors duration-300 ${theme === 'light' ? 'text-gray-500' : 'text-white/50'}`}>{session.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Capabilities */}
            <div className="border rounded-lg backdrop-blur-sm p-6 transition-colors duration-300" style={{
              backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
              borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
            }}>
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className={`w-5 h-5 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
                <h3 className={`text-lg font-light tracking-wide transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>Capabilities</h3>
              </div>
              <div className="space-y-2">
                {capabilities.map((capability, index) => (
                  <motion.div 
                    key={capability}
                    className={`px-3 py-1 border rounded-full text-xs text-center transition-colors duration-300 ${
                      theme === 'light' 
                        ? 'bg-black/10 border-black/20 text-gray-800' 
                        : 'bg-white/10 border-white/20 text-white/80'
                    }`}
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
          <div className={`flex items-center space-x-2 text-xs transition-colors duration-300 ${theme === 'light' ? 'text-gray-500' : 'text-white/40'}`}>
            <div className={`w-2 h-2 rounded-full animate-pulse transition-colors duration-300 ${theme === 'light' ? 'bg-gray-500' : 'bg-white/40'}`} />
            <span>Neural Network Active</span>
            <div className={`w-2 h-2 rounded-full animate-pulse transition-colors duration-300 ${theme === 'light' ? 'bg-gray-500' : 'bg-white/40'}`} style={{ animationDelay: '0.5s' }} />
          </div>
        </motion.div>
      </div>
    </div>
  )
} 