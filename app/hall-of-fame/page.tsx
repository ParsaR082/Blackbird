'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import BackgroundNodes from '@/components/BackgroundNodes'
import { useTheme } from '@/contexts/theme-context'
import { Trophy, Star, Award, Crown, Medal, Sparkles, Calendar, User } from 'lucide-react'

export default function HallOfFamePage() {
  const [isMobile, setIsMobile] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const legends = [
    {
      name: "Alex Chen",
      title: "AI Pioneer",
      achievement: "Breakthrough in neural architecture optimization",
      date: "2024",
      icon: Crown,
      rank: 1
    },
    {
      name: "Sarah Martinez", 
      title: "Robotics Virtuoso",
      achievement: "Revolutionary autonomous navigation system",
      date: "2024",
      icon: Medal,
      rank: 2
    },
    {
      name: "David Kim",
      title: "Code Architect", 
      achievement: "Open-source framework adopted by 10M+ developers",
      date: "2023",
      icon: Award,
      rank: 3
    },
    {
      name: "Maya Patel",
      title: "Research Lead",
      achievement: "Quantum computing breakthrough publication",
      date: "2023", 
      icon: Star,
      rank: 4
    }
  ]

  const categories = [
    { name: "Innovation", count: 47, icon: Sparkles },
    { name: "Leadership", count: 23, icon: Crown },
    { name: "Research", count: 31, icon: Star },
    { name: "Community", count: 19, icon: Trophy }
  ]

  return (
    <div className="min-h-screen overflow-hidden transition-colors duration-300" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      {/* Interactive Background */}
      <BackgroundNodes isMobile={isMobile} />
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen px-4 py-12">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 rounded-full border backdrop-blur-sm transition-colors duration-300" style={{
              backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
              borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
            }}>
              <Trophy className={`w-8 h-8 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
            </div>
            <h1 className={`text-4xl md:text-6xl font-light tracking-wide transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>Hall of Fame</h1>
          </div>
          <p className={`text-lg max-w-2xl mx-auto tracking-wide transition-colors duration-300 ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`}>
            Celebrating the extraordinary minds who have shaped our digital frontier
          </p>
        </motion.div>

        {/* Categories */}
        <motion.div 
          className="max-w-4xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                className="group relative cursor-pointer"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 + 0.5 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="border rounded-lg p-6 text-center backdrop-blur-sm transition-all duration-300" style={{
                  backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
                  borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                  boxShadow: theme === 'light' ? '0 0 25px rgba(0,0,0,0.1)' : '0 0 25px rgba(255,255,255,0.2)'
                }}>
                  <category.icon className={`w-8 h-8 mx-auto mb-3 transition-colors duration-300 ${theme === 'light' ? 'text-gray-800' : 'text-white/80'}`} />
                  <h3 className={`font-medium mb-1 transition-colors duration-300 ${theme === 'light' ? 'text-gray-900' : 'text-white/90'}`}>{category.name}</h3>
                  <p className={`text-2xl font-light transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>{category.count}</p>
                </div>
                
                {/* Pulse effect */}
                <motion.div
                  className="absolute inset-0 rounded-lg border opacity-0 group-hover:opacity-60 transition-colors duration-300"
                  style={{
                    borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'
                  }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Hall of Fame Grid */}
        <motion.div 
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {legends.map((legend, index) => (
              <motion.div
                key={legend.name}
                className="group relative cursor-pointer"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 + 0.8 }}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="border rounded-xl p-8 backdrop-blur-sm transition-all duration-300" style={{
                  backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
                  borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                  boxShadow: theme === 'light' ? '0 0 30px rgba(0,0,0,0.1)' : '0 0 30px rgba(255,255,255,0.15)'
                }}>
                  {/* Rank Badge */}
                  <div className="absolute -top-3 -right-3">
                    <div className={`rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
                      theme === 'light' ? 'bg-black text-white' : 'bg-white text-black'
                    }`}>
                      #{legend.rank}
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-full border transition-colors duration-300" style={{
                      backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                      borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'
                    }}>
                      <legend.icon className={`w-6 h-6 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
                    </div>
                    <div className="w-12 h-12 rounded-full border flex items-center justify-center transition-colors duration-300" style={{
                      background: theme === 'light' 
                        ? 'linear-gradient(to bottom right, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.05))' 
                        : 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05))',
                      borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
                    }}>
                      <User className={`w-6 h-6 transition-colors duration-300 ${theme === 'light' ? 'text-gray-800' : 'text-white/80'}`} />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className={`text-2xl font-light mb-2 tracking-wide transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>{legend.name}</h3>
                  <p className={`font-medium mb-3 transition-colors duration-300 ${theme === 'light' ? 'text-gray-800' : 'text-white/80'}`}>{legend.title}</p>
                  <p className={`text-sm mb-4 leading-relaxed transition-colors duration-300 ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`}>{legend.achievement}</p>
                  
                  {/* Date */}
                  <div className={`flex items-center gap-2 text-xs transition-colors duration-300 ${theme === 'light' ? 'text-gray-500' : 'text-white/50'}`}>
                    <Calendar className="w-3 h-3" />
                    <span>{legend.date}</span>
                  </div>
                </div>

                {/* Glow effect on hover */}
                <motion.div
                  className="absolute inset-0 rounded-xl opacity-0 blur-xl group-hover:opacity-5 transition-colors duration-300"
                  style={{
                    backgroundColor: theme === 'light' ? '#000000' : '#ffffff'
                  }}
                  initial={{ scale: 0.8 }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Pulse effect */}
                <motion.div
                  className="absolute inset-0 rounded-xl border opacity-0 group-hover:opacity-40 transition-colors duration-300"
                  style={{
                    borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'
                  }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom decoration */}
        <motion.div 
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
        >
          <div className={`flex items-center space-x-2 text-xs transition-colors duration-300 ${theme === 'light' ? 'text-gray-500' : 'text-white/40'}`}>
            <div className={`w-2 h-2 rounded-full animate-pulse transition-colors duration-300 ${theme === 'light' ? 'bg-gray-500' : 'bg-white/40'}`} />
            <span>Hall Active</span>
            <div className={`w-2 h-2 rounded-full animate-pulse transition-colors duration-300 ${theme === 'light' ? 'bg-gray-500' : 'bg-white/40'}`} style={{ animationDelay: '0.5s' }} />
          </div>
        </motion.div>
      </div>
    </div>
  )
} 