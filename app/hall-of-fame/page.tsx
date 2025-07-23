export const dynamic = 'force-dynamic';
export const revalidate = 0;

'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import BackgroundNodes from '@/components/BackgroundNodes'
import { useTheme } from '@/contexts/theme-context'
import { Trophy, Calendar, User, ExternalLink } from 'lucide-react'
import { getTierById } from '@/lib/tier-system'
import Link from 'next/link'

interface HallOfFameEntry {
  id: string
  user: {
    id: string
    name: string
    username: string
    avatarUrl?: string
  }
  title: string
  achievement: string
  category: string
  yearAchieved: string
  dateInducted: string
  rank: number
}

interface CategoryCounts {
  Innovation: number
  Leadership: number
  Research: number
  Community: number
}

export default function HallOfFamePage() {
  const [isMobile, setIsMobile] = useState(false)
  const [hallOfFameEntries, setHallOfFameEntries] = useState<HallOfFameEntry[]>([])
  const [categoryCounts, setCategoryCounts] = useState<CategoryCounts>({
    Innovation: 0,
    Leadership: 0,
    Research: 0,
    Community: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    fetchHallOfFameData()
  }, [])

  const fetchHallOfFameData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/hall-of-fame')
      const data = await response.json()

      if (data.success) {
        setHallOfFameEntries(data.entries)
        setCategoryCounts(data.categoryCounts)
      } else {
        setError(data.error || 'Failed to fetch Hall of Fame data')
      }
    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Hall of Fame fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      Innovation: '💡',
      Leadership: '👑',
      Research: '🔬',
      Community: '🤝'
    }
    return icons[category as keyof typeof icons] || '⭐'
  }

  const categories = [
    { name: "Innovation", count: categoryCounts.Innovation, icon: '💡' },
    { name: "Leadership", count: categoryCounts.Leadership, icon: '👑' },
    { name: "Research", count: categoryCounts.Research, icon: '🔬' },
    { name: "Community", count: categoryCounts.Community, icon: '🤝' }
  ]

  return (
    <div className="min-h-screen overflow-hidden transition-colors duration-300" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      {/* Interactive Background */}
      <BackgroundNodes isMobile={isMobile} />
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen px-4 pt-24 pb-12">
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
                  <div className="text-3xl mb-3">{category.icon}</div>
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
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className={`text-center ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`}>
                <div className="animate-spin w-8 h-8 border-2 border-transparent border-t-current rounded-full mx-auto mb-4"></div>
                <p>Loading Hall of Fame...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16">
              <div className={`text-center ${theme === 'light' ? 'text-red-600' : 'text-red-400'}`}>
                <p className="mb-4">Failed to load Hall of Fame entries</p>
                <button 
                  onClick={fetchHallOfFameData}
                  className={`px-4 py-2 border rounded-lg transition-all duration-300 ${
                    theme === 'light' 
                      ? 'border-red-300 hover:bg-red-50' 
                      : 'border-red-600 hover:bg-red-900/20'
                  }`}
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : hallOfFameEntries.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className={`text-center ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`}>
                <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-xl font-light mb-2">Hall of Fame is Empty</p>
                <p className="text-sm">Be the first to make an extraordinary contribution!</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {hallOfFameEntries.map((entry, index) => {
                const userTier = getTierById('halloffame')
                const TierIcon = userTier?.icon || Trophy
                
                return (
                  <motion.div
                    key={entry.id}
                    className="group relative"
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
                          #{entry.rank}
                        </div>
                      </div>

                      {/* Icons and User Info */}
                      <div className="flex items-center gap-4 mb-6">
                        {/* Tier Icon */}
                        <div 
                          className="p-3 rounded-full border transition-colors duration-300" 
                          style={{
                            backgroundColor: userTier?.color ? `${userTier.color}20` : 'rgba(255, 215, 0, 0.2)',
                            borderColor: userTier?.color || '#FFD700'
                          }}
                        >
                                                     <TierIcon 
                             size={24}
                             style={{ color: userTier?.color || '#FFD700' }}
                           />
                        </div>
                        
                        {/* Profile Link */}
                        <Link 
                          href={`/users/profile/${entry.user.username}`}
                          className="block"
                        >
                          <div className="w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer" style={{
                            background: theme === 'light' 
                              ? 'linear-gradient(to bottom right, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.05))' 
                              : 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05))',
                            borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
                          }}>
                            {entry.user.avatarUrl ? (
                              <Image
                                src={entry.user.avatarUrl}
                                alt={entry.user.name}
                                width={48}
                                height={48}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <User className={`w-6 h-6 transition-colors duration-300 ${theme === 'light' ? 'text-gray-800' : 'text-white/80'}`} />
                            )}
                          </div>
                        </Link>

                        {/* Category Badge */}
                        <div className="ml-auto">
                          <div className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${
                            theme === 'light' 
                              ? 'bg-black/10 text-black border border-black/20' 
                              : 'bg-white/10 text-white border border-white/20'
                          }`}>
                            {getCategoryIcon(entry.category)} {entry.category}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <Link 
                        href={`/users/profile/${entry.user.username}`}
                        className="block hover:opacity-80 transition-opacity duration-300"
                      >
                        <h3 className={`text-2xl font-light mb-2 tracking-wide transition-colors duration-300 flex items-center gap-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                          {entry.user.name}
                          <ExternalLink className="w-4 h-4 opacity-60" />
                        </h3>
                      </Link>
                      <p className={`font-medium mb-3 transition-colors duration-300 ${theme === 'light' ? 'text-gray-800' : 'text-white/80'}`}>{entry.title}</p>
                      <p className={`text-sm mb-4 leading-relaxed transition-colors duration-300 ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`}>{entry.achievement}</p>
                      
                      {/* Date */}
                      <div className={`flex items-center gap-2 text-xs transition-colors duration-300 ${theme === 'light' ? 'text-gray-500' : 'text-white/50'}`}>
                        <Calendar className="w-3 h-3" />
                        <span>Achievement: {entry.yearAchieved}</span>
                      </div>
                    </div>

                    {/* Glow effect on hover */}
                    <motion.div
                      className="absolute inset-0 rounded-xl opacity-0 blur-xl group-hover:opacity-5 transition-colors duration-300"
                      style={{
                        backgroundColor: userTier?.color || '#FFD700'
                      }}
                      initial={{ scale: 0.8 }}
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    />
                    
                    {/* Pulse effect */}
                    <motion.div
                      className="absolute inset-0 rounded-xl border opacity-0 group-hover:opacity-40 transition-colors duration-300"
                      style={{
                        borderColor: userTier?.color || '#FFD700'
                      }}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </motion.div>
                )
              })}
            </div>
          )}
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