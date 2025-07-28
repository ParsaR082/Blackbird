'use client'

import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useTheme } from '@/contexts/theme-context'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation';
import {
  Gamepad2,
  Trophy,
  Zap,
  Star,
  Timer,
  Target,
  Swords,
  Puzzle,
  Brain,
  Play,
  Pause,
  RotateCcw,
  Award,
  TrendingUp,
  Clock,
  ChevronLeft,
  ChevronRight,
  Users,
  Dices
} from 'lucide-react'
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export const GameSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  link: z.string().url('Must be a valid URL'),
  category: z.string().min(3),
  color: z.string().min(3),
  isMultiplayer: z.boolean().optional(),
});

const BackgroundNodes = lazy(() => import('@/components/BackgroundNodes'))

interface GameCategory {
  icon: React.ComponentType<{ className?: string }>
  label: string
  color: string
}

interface FeaturedGame {
  title: string
  description: string
  category: string
  link: string
  imageUrl?: string
  color?: string
  isMultiplayer?: boolean
}

interface LeaderboardEntry {
  rank: number
  player: string
  score: number
  avatar: string
}

interface PlayerStat {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
}

interface ClientGamesPageProps {
  dbGames: FeaturedGame[]
}

export default function ClientGamesPage({ dbGames }: ClientGamesPageProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isRandomMatchLoading, setIsRandomMatchLoading] = useState(false)
  const [showAddGame, setShowAddGame] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const { theme } = useTheme()
  const { user } = useAuth()
  const router = useRouter();

  // Add debugging for user role
  useEffect(() => {
    console.log('🎮 Games Page - User object:', user)
    console.log('🎮 Games Page - User role:', user?.role)
    console.log('🎮 Games Page - Role type:', typeof user?.role)
    console.log('🎮 Games Page - Is SUPER_ADMIN?:', user?.role === 'SUPER_ADMIN')
    console.log('🎮 Games Page - Is ADMIN?:', user?.role === 'ADMIN')
  }, [user])
  useEffect(() => {
    fetch('/api/admin/game-categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(() => setCategories([]));
  }, []);

  // Pagination configuration
  const gamesPerPage = 3

  // Consolidated effects for better performance
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout
    const checkMobile = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        setIsMobile(window.innerWidth < 768)
      }, 100)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile, { passive: true })
    return () => {
      window.removeEventListener('resize', checkMobile)
      clearTimeout(resizeTimeout)
    }
  }, [])

  const gameCategories: GameCategory[] = [
    { icon: Brain, label: 'strategy', color: 'from-purple-500/20 to-pink-500/20' },
    { icon: Target, label: 'arcade', color: 'from-blue-500/20 to-cyan-500/20' },
    { icon: Puzzle, label: 'puzzle', color: 'from-green-500/20 to-emerald-500/20' },
    { icon: Swords, label: 'action', color: 'from-red-500/20 to-orange-500/20' }
  ]

  const featuredGames: FeaturedGame[] = useMemo(() => dbGames, [dbGames])

  // Memoized category counts for performance
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    featuredGames.forEach(game => {
      counts[game.category] = (counts[game.category] || 0) + 1
    })
    return counts
  }, [featuredGames])

  // Memoized filtered games
  const filteredGames = useMemo(() => {
    return selectedCategory
      ? featuredGames.filter(game => game.category === selectedCategory)
      : featuredGames
  }, [featuredGames, selectedCategory])

  // Memoized pagination logic
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filteredGames.length / gamesPerPage)
    const currentGames = filteredGames.slice(
      (currentPage - 1) * gamesPerPage,
      currentPage * gamesPerPage
    )
    return { totalPages, currentGames }
  }, [filteredGames, currentPage, gamesPerPage])

  // Optimized handlers with useCallback
  const handleCategoryClick = useCallback((categoryLabel: string) => {
    setSelectedCategory(prev => prev === categoryLabel ? null : categoryLabel)
    setCurrentPage(1) // Reset to first page when category changes
  }, [])

  const toggleCategory = useCallback((categoryLabel: string) => {
    handleCategoryClick(categoryLabel)
  }, [handleCategoryClick])

  const getCategoryCount = useCallback((categoryLabel: string) => {
    return categoryCounts[categoryLabel] || 0
  }, [categoryCounts])

  const goToNextPage = useCallback(() => {
    setCurrentPage(prev => prev < paginationData.totalPages ? prev + 1 : prev)
  }, [paginationData.totalPages])

  const goToPreviousPage = useCallback(() => {
    setCurrentPage(prev => prev > 1 ? prev - 1 : prev)
  }, [])

  // Quick Actions handlers with error handling
  const handleRandomMatch = useCallback(async () => {
    if (featuredGames.length === 0) return
    setIsRandomMatchLoading(true)
    try {
      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * featuredGames.length)
        const game = featuredGames[randomIndex]
        const opened = window.open(game.link, '_blank')
        if (!opened) {
          window.location.href = game.link
        }
        setIsRandomMatchLoading(false)
      }, 300)
    } catch (error) {
      console.error('Failed to open game:', error)
      setIsRandomMatchLoading(false)
      alert('Failed to open game. Please try again.')
    }
  }, [featuredGames])

  const handlePlayWithFriends = useCallback(() => {
    alert('Multiplayer features coming soon!')
  }, [])

  return (
    <div className="min-h-screen overflow-hidden transition-colors duration-300" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      {/* Interactive Background */}
      <Suspense fallback={<div className="fixed inset-0 transition-colors duration-300" style={{ backgroundColor: 'var(--bg-color)' }} />}>
        <BackgroundNodes isMobile={isMobile} />
      </Suspense>
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen px-4 pt-24 pb-8" role="main">
        {/* Accessibility: Live region for dynamic content updates */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {selectedCategory ? `Filtered by ${selectedCategory}` : 'Showing all games'}
          {filteredGames.length === 0 ? '. No games found.' : `, ${filteredGames.length} games found.`}
        </div>
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <div
              className="p-4 rounded-full border backdrop-blur-sm transition-colors duration-300"
              style={{
                backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
                borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
              }}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <Gamepad2 className="w-8 h-8 transition-colors duration-300" style={{ color: 'var(--text-color)' }} />
              </motion.div>
            </div>
          </div>
          <h1 className="text-3xl font-light tracking-wide mb-2 transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
            Gaming Portal
          </h1>
          <p className="text-sm max-w-md mx-auto transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
            Immersive neural gaming experiences and competitive digital arenas
          </p>
        </motion.div>

        {/* Game Categories */}
        <motion.div
          className="max-w-4xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6" role="group" aria-label="Game categories">
            {gameCategories.map((category, index) => (
              <motion.div
                key={category.label}
                role="button"
                tabIndex={0}
                aria-pressed={selectedCategory === category.label}
                aria-label={`Filter games by ${category.label} category`}
                className="group relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent rounded-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleCategory(category.label)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    toggleCategory(category.label)
                  }
                }}
              >
                {/* Glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-lg opacity-0 blur-lg group-hover:opacity-10 bg-white"
                  initial={{ scale: 0.8 }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                />
                {/* Category Card */}
                <div className={`relative p-6 border rounded-lg backdrop-blur-sm h-32 flex flex-col items-center justify-center text-center transition-all duration-300 bg-gradient-to-br ${category.color} ${selectedCategory === category.label
                    ? 'shadow-lg'
                    : ''
                  }`}
                  style={{
                    backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
                    borderColor: selectedCategory === category.label
                      ? (theme === 'light' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)')
                      : (theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'),
                    boxShadow: selectedCategory === category.label
                      ? (theme === 'light' ? '0 0 20px rgba(0,0,0,0.2)' : '0 0 20px rgba(255,255,255,0.3)')
                      : undefined
                  }}>
                  <category.icon className={`w-8 h-8 mb-2 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
                  <h3 className={`text-sm font-medium mb-1 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>{category.label}</h3>
                  <p className={`text-xs transition-colors duration-300 ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`}>{getCategoryCount(category.label)} games</p>
                </div>
                {/* Pulse effect */}
                <div
                  className="absolute inset-0 rounded-lg border opacity-0 group-hover:opacity-40 transition-colors duration-300"
                  style={{ borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)', opacity: selectedCategory === category.label ? 0.6 : undefined }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Main Gaming Interface */}
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          {/* Featured Games */}
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
                <Star className={`w-5 h-5 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
                <h2 className={`text-lg font-light tracking-wide transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                  Featured Games
                  {selectedCategory && (
                    <span className={`ml-2 text-sm transition-colors duration-300 ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`}>
                      - {selectedCategory}
                    </span>
                  )}
                </h2>
              </div>
              {/* Games List Container with AnimatePresence */}
              <div className="min-h-[400px] flex flex-col">
                {filteredGames.length === 0 ? (
                  // No Games Found Message
                  <motion.div
                    className="flex-1 flex items-center justify-center text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div>
                      <div className={`text-4xl mb-4 transition-colors duration-300 ${theme === 'light' ? 'text-gray-400' : 'text-white/30'}`}>🎮</div>
                      <p className={`text-lg transition-colors duration-300 ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`}>
                        No games available in this category.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    {/* Games List with AnimatePresence */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${selectedCategory}-${currentPage}`}
                        className="space-y-4 flex-1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        {paginationData.currentGames.map((game: FeaturedGame, index: number) => (
                          <div
                            key={game.title}
                            className="group p-4 border rounded-lg transition-all duration-300 cursor-pointer"
                            style={{
                              backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                              borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'
                            }}
                          >
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.4, delay: index * 0.1 }}
                              whileHover={{ scale: 1.02 }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className={`text-base font-medium transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>{game.title}</h3>
                                    <span className={`px-2 py-1 border rounded-full text-xs transition-colors duration-300 ${theme === 'light'
                                        ? 'bg-black/10 border-black/20 text-gray-700'
                                        : 'bg-white/10 border-white/20 text-white/70'
                                      }`}>
                                      {game.category}
                                    </span>
                                  </div>
                                  <p className={`text-sm mb-3 transition-colors duration-300 ${theme === 'light' ? 'text-gray-700' : 'text-white/70'}`}>{game.description}</p>
                                </div>
                                {/* Enhanced Play Button with Prefetching */}
                                {game.link.startsWith('http') ? (
                                  <a
                                    href={game.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-4"
                                    aria-label={`Play ${game.title} in new tab`}
                                    onMouseEnter={() => {
                                      // Prefetch external link on hover
                                      const link = document.createElement('link')
                                      link.rel = 'prefetch'
                                      link.href = game.link
                                      document.head.appendChild(link)
                                    }}
                                  >
                                    <motion.button
                                      className={`px-6 py-3 border rounded-lg transition-all duration-300 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme === 'light'
                                          ? 'bg-black/10 border-black/30 text-black hover:bg-black/20 hover:border-black/60 focus:ring-black/50 focus:ring-offset-white'
                                          : 'bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/60 focus:ring-white/50 focus:ring-offset-black'
                                        }`}
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      tabIndex={-1}
                                    >
                                      <Play className="w-4 h-4" aria-hidden="true" />
                                      Play
                                    </motion.button>
                                  </a>
                                ) : (
                                  <Link href={game.link} className="ml-4" prefetch={true}>
                                    <motion.button
                                      className={`px-6 py-3 border rounded-lg transition-all duration-300 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme === 'light'
                                          ? 'bg-black/10 border-black/30 text-black hover:bg-black/20 hover:border-black/60 focus:ring-black/50 focus:ring-offset-white'
                                          : 'bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/60 focus:ring-white/50 focus:ring-offset-black'
                                        }`}
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      aria-label={`Play ${game.title}`}
                                      tabIndex={-1}
                                    >
                                      <Play className="w-4 h-4" aria-hidden="true" />
                                      Play
                                    </motion.button>
                                  </Link>
                                )}
                              </div>
                            </motion.div>
                          </div>
                        ))}
                      </motion.div>
                    </AnimatePresence>
                    {/* Pagination Controls */}
                    {paginationData.totalPages > 1 && (
                      <div
                        className={`flex items-center justify-between mt-6 pt-4 border-t transition-colors duration-300`}
                        style={{ borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)' }}
                      >
                        <motion.button
                          onClick={goToPreviousPage}
                          disabled={currentPage === 1}
                          className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all duration-300 ${currentPage === 1
                            ? (theme === 'light'
                              ? 'bg-black/5 border-black/10 text-gray-400 cursor-not-allowed'
                              : 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed')
                            : (theme === 'light'
                              ? 'bg-black/10 border-black/30 text-black hover:bg-black/20 hover:border-black/60'
                              : 'bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/60')
                            }`}
                          whileHover={currentPage !== 1 ? { scale: 1.05 } : {}}
                          whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
                          aria-label="Previous page"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </motion.button>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm transition-colors duration-300 ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`}>
                            Page {currentPage} of {paginationData.totalPages}
                          </span>
                        </div>
                        <motion.button
                          onClick={goToNextPage}
                          disabled={currentPage === paginationData.totalPages}
                          className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all duration-300 ${currentPage === paginationData.totalPages
                            ? (theme === 'light'
                              ? 'bg-black/5 border-black/10 text-gray-400 cursor-not-allowed'
                              : 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed')
                            : (theme === 'light'
                              ? 'bg-black/10 border-black/30 text-black hover:bg-black/20 hover:border-black/60'
                              : 'bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/60')
                            }`}
                          whileHover={currentPage !== paginationData.totalPages ? { scale: 1.05 } : {}}
                          whileTap={currentPage !== paginationData.totalPages ? { scale: 0.95 } : {}}
                          aria-label="Next page"
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </motion.button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
          {/* Quick Actions (moved below Featured Games) */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {/* Quick Actions */}
            <div className="border rounded-lg backdrop-blur-sm p-6 transition-colors duration-300" style={{
              backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
              borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
            }}>
              <div className="flex items-center gap-3 mb-4">
                <Zap className={`w-5 h-5 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
                <h3 className={`text-lg font-light tracking-wide transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>Quick Actions</h3>
              </div>
              <div className="space-y-3">
                {/* Join Random Match Button */}
                <motion.button
                  className={`w-full p-3 border rounded-lg transition-all duration-300 text-sm flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-offset-2 ${featuredGames.length === 0
                      ? (theme === 'light'
                        ? 'bg-black/5 border-black/10 text-gray-400 cursor-not-allowed focus:ring-black/30 focus:ring-offset-white'
                        : 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed focus:ring-white/50 focus:ring-offset-black')
                      : (theme === 'light'
                        ? 'bg-black/10 border-black/30 text-black hover:bg-black/20 hover:border-black/60 focus:ring-black/50 focus:ring-offset-white'
                        : 'bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/60 focus:ring-white/50 focus:ring-offset-black')
                    }`}
                  whileHover={featuredGames.length > 0 && !isRandomMatchLoading ? { scale: 1.05 } : {}}
                  whileTap={featuredGames.length > 0 && !isRandomMatchLoading ? { scale: 0.95 } : {}}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  onClick={handleRandomMatch}
                  disabled={featuredGames.length === 0 || isRandomMatchLoading}
                  aria-label="Join a random game from our collection"
                  aria-describedby={featuredGames.length === 0 ? "no-games-warning" : undefined}
                  title={featuredGames.length === 0 ? "No games available" : "Join a random game"}
                >
                  <motion.div
                    animate={isRandomMatchLoading ? {
                      rotate: [0, 90, 180, 270, 360],
                      scale: [1, 1.1, 1]
                    } : {}}
                    transition={{
                      duration: 0.3,
                      ease: "easeInOut",
                      times: [0, 0.25, 0.5, 0.75, 1]
                    }}
                  >
                    <Dices className={`w-5 h-5 transition-colors duration-300 ${featuredGames.length === 0
                        ? (theme === 'light' ? 'text-gray-400' : 'text-white/30')
                        : (theme === 'light' ? 'text-black' : 'text-white')
                      }`} />
                  </motion.div>
                  <span className="flex-1 text-left">
                    {isRandomMatchLoading ? 'Selecting Game...' : 'Join Random Match'}
                  </span>
                </motion.button>
                {/* Play with Friends Button */}
                <motion.button
                  className={`w-full p-3 border rounded-lg transition-all duration-300 text-sm flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme === 'light'
                      ? 'bg-black/10 border-black/30 text-black hover:bg-black/15 hover:border-black/40 focus:ring-black/50 focus:ring-offset-white'
                      : 'bg-white/10 border-white/30 text-white hover:bg-white/15 hover:border-white/40 focus:ring-white/50 focus:ring-offset-black'
                    }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePlayWithFriends}
                  aria-label="Play with friends (coming soon)"
                  aria-describedby="friends-feature-info"
                >
                  <Users className={`w-5 h-5 transition-colors duration-300 ${theme === 'light' ? 'text-gray-700' : 'text-white/70'}`} aria-hidden="true" />
                  <span className="flex-1 text-left">Play with Friends</span>
                  <div className={`text-xs px-2 py-1 rounded-full transition-colors duration-300 ${theme === 'light' ? 'bg-black/20 text-gray-700' : 'bg-white/20 text-white/70'
                    }`}>
                    SOON
                  </div>
                </motion.button>
                {/* Admin-only Add a Game Button */}
                {(() => {
                  const isAdmin = user?.role === 'ADMIN'
                  const isSuperAdmin = user?.role === 'SUPER_ADMIN'
                  const canAddGame = user && (isAdmin || isSuperAdmin)
                  
                  return canAddGame
                })() && (
                  <motion.button
                    className={`w-full p-3 border rounded-lg transition-all duration-300 text-sm flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme === 'light'
                        ? 'bg-black/10 border-black/30 text-black hover:bg-black/20 hover:border-black/60 focus:ring-black/50 focus:ring-offset-white'
                        : 'bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/60 focus:ring-white/50 focus:ring-offset-black'
                      }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAddGame(true)}
                    aria-label="Add a Game"
                  >
                    <Star className={`w-5 h-5 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`} aria-hidden="true" />
                    <span className="flex-1 text-left">Add a Game</span>
                  </motion.button>
                )}
                {/* Hidden accessibility helpers */}
                {featuredGames.length === 0 && (
                  <div id="no-games-warning" className="sr-only">
                    No games are currently available. Please try again later.
                  </div>
                )}
                <div id="friends-feature-info" className="sr-only">
                  Multiplayer functionality is coming soon. Check back for updates.
                </div>
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
            <span>Gaming Network Online</span>
            <div
              className={`w-2 h-2 rounded-full animate-pulse transition-colors duration-300 ${theme === 'light' ? 'bg-gray-500' : 'bg-white/40'}`}
              style={{ animationDelay: '0.5s' }}
            />
          </div>
        </motion.div>
      </div>
      
      {/* Modal rendered at top level - MOVED HERE */}
      {showAddGame && (
        <AddGameModal onClose={() => setShowAddGame(false)} />
      )}
    </div>
  )
}

function AddGameModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  
  useEffect(() => {
    fetch('/api/admin/game-categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(() => {
        // Fallback to hardcoded categories if API fails
        setCategories(['strategy', 'arcade', 'puzzle', 'action']);
      });
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(GameSchema),
    defaultValues: {
      title: '',
      description: '',
      link: '',
      category: '',
      color: '#000000',
      isMultiplayer: false,
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await res.json();
      
      if (res.ok) {
        toast.success('Game added successfully!');
        reset();
        onClose();
        // Optionally refresh the page to show the new game
        window.location.reload();
      } else {
        toast.error(result.error || 'Failed to add game');
      }
    } catch (e) {
      console.error('Error submitting form:', e);
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-md mx-auto my-8 rounded-xl border border-white/20 bg-white dark:bg-neutral-900 p-6 shadow-2xl animate-modal-pop"
        style={{
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
          maxHeight: 'calc(100vh - 4rem)',
          overflowY: 'auto'
        }}
      >
        <button
          onClick={onClose}
          className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition hover:bg-red-600 z-10"
          aria-label="Close"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <h2 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">Add New Game</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title Field */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Title *</label>
            <input 
              type="text" 
              {...register('title')} 
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-600 dark:bg-neutral-800 dark:text-white" 
              disabled={loading} 
              placeholder="Enter game title"
            />
            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
          </div>

          {/* Description Field */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Description *</label>
            <textarea 
              {...register('description')} 
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-600 dark:bg-neutral-800 dark:text-white" 
              rows={3} 
              disabled={loading} 
              placeholder="Enter game description"
            />
            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>}
          </div>

          {/* Link Field */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Link *</label>
            <input 
              type="url" 
              {...register('link')} 
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-600 dark:bg-neutral-800 dark:text-white" 
              disabled={loading} 
              placeholder="https://example.com/game"
            />
            {errors.link && <p className="mt-1 text-sm text-red-500">{errors.link.message}</p>}
          </div>

          {/* Category Field */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Category *</label>
            <select 
              {...register('category')} 
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-600 dark:bg-neutral-800 dark:text-white" 
              disabled={loading}
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>}
          </div>

          {/* Color Field */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Color *</label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                {...register('color')} 
                className="h-10 w-10 cursor-pointer rounded border border-gray-300 bg-white dark:border-gray-600 dark:bg-neutral-800" 
                disabled={loading} 
              />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {watch('color') || '#000000'}
              </span>
            </div>
            {errors.color && <p className="mt-1 text-sm text-red-500">{errors.color.message}</p>}
          </div>

          {/* Multiplayer Checkbox */}
          <div className="flex items-center">
            <input 
              type="checkbox" 
              {...register('isMultiplayer')} 
              id="isMultiplayer" 
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700" 
              disabled={loading} 
            />
            <label htmlFor="isMultiplayer" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Is Multiplayer?
            </label>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white shadow-md transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50" 
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </span>
            ) : (
              'Add Game'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}