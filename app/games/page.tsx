'use client'

import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useTheme } from '@/contexts/theme-context'

// Lazy load BackgroundNodes for better performance
const BackgroundNodes = lazy(() => import('@/components/BackgroundNodes'))
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

// TypeScript interfaces for better type safety
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
}

interface PlayerStat {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
}

interface LeaderboardEntry {
  rank: number
  player: string
  score: number
  avatar: string
}

export default function GamesPage() {
  const [isMobile, setIsMobile] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isRandomMatchLoading, setIsRandomMatchLoading] = useState(false)
  const { theme } = useTheme()

  // Pagination configuration
  const gamesPerPage = 3

  // Consolidated effects for better performance
  useEffect(() => {
    // Mobile detection with debounced resize handler
    let resizeTimeout: NodeJS.Timeout
    const checkMobile = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        setIsMobile(window.innerWidth < 768)
      }, 100)
    }
    
    // Initialize
    checkMobile()
    
    // Add resize listener
    window.addEventListener('resize', checkMobile, { passive: true })
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', checkMobile)
      clearTimeout(resizeTimeout)
    }
  }, [])

  const gameCategories: GameCategory[] = [
    { icon: Brain, label: 'Strategy', color: 'from-purple-500/20 to-pink-500/20' },
    { icon: Target, label: 'Arcade', color: 'from-blue-500/20 to-cyan-500/20' },
    { icon: Puzzle, label: 'Puzzle', color: 'from-green-500/20 to-emerald-500/20' },
    { icon: Swords, label: 'Action', color: 'from-red-500/20 to-orange-500/20' }
  ]

  const featuredGames: FeaturedGame[] = useMemo(() => [
    {
      title: 'Shadow Net',
      description: 'You are the hired Agent, you have to protect the galaxy from the enemy, hack the system and help Dr.Tenebris',
      category: 'Puzzle',
      link: 'https://shadow-net-production.up.railway.app'
    },
    {
      title: 'Chess Masters',
      description: 'The ultimate online chess experience with players worldwide',
      category: 'Strategy',
      link: 'https://www.chess.com/'
    },
    {
      title: 'ZType - Typing Game',
      description: 'Space shooter where you type words to destroy incoming enemies',
      category: 'Arcade',
      link: 'https://zty.pe/'
    },
    {
      title: 'Coding Game',
      description: 'Learn programming through fun coding challenges and games',
      category: 'Puzzle',
      link: 'https://www.codingame.com/start/'
    },
    {
      title: 'Blackbird Game',
      description: 'A unique puzzle adventure with mysterious mechanics',
      category: 'Puzzle',
      link: 'https://blackbird-production.up.railway.app/'
    },
    {
      title: '2048 Puzzle',
      description: 'Combine tiles to reach the 2048 tile in this addictive numbers game',
      category: 'Puzzle',
      link: 'https://play2048.co/'
    },
    {
      title: 'Slither.io',
      description: 'Massive multiplayer online snake game with competitive gameplay',
      category: 'Arcade',
      link: 'https://slither.io/'
    },
    {
      title: 'Wordle',
      description: 'The popular daily word guessing game that took the world by storm',
      category: 'Puzzle',
      link: 'https://www.nytimes.com/games/wordle/index.html'
    }
  ], [])

  const leaderboardData: LeaderboardEntry[] = [
    { rank: 1, player: 'NeuralMaster', score: 15420, avatar: 'NM' },
    { rank: 2, player: 'QuantumAce', score: 14890, avatar: 'QA' },
    { rank: 3, player: 'CyberWolf', score: 14250, avatar: 'CW' },
    { rank: 4, player: 'VoidRunner', score: 13680, avatar: 'VR' },
    { rank: 5, player: 'StarHacker', score: 13120, avatar: 'SH' }
  ]

  const playerStats: PlayerStat[] = [
    { label: 'Games Played', value: '247', icon: Gamepad2 },
    { label: 'Victories', value: '189', icon: Trophy },
    { label: 'Win Rate', value: '76.5%', icon: TrendingUp },
    { label: 'Best Streak', value: '23', icon: Zap }
  ]

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
      // Brief loading animation for 300ms
      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * featuredGames.length)
        const game = featuredGames[randomIndex]
        const opened = window.open(game.link, '_blank')
        
        // Fallback if popup was blocked
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
      <div className="relative z-10 min-h-screen px-4 py-8" role="main">
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
              <Gamepad2 className="w-8 h-8 transition-colors duration-300" style={{ color: 'var(--text-color)' }} />
            </motion.div>
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
                <div className={`relative p-6 border rounded-lg backdrop-blur-sm h-32 flex flex-col items-center justify-center text-center transition-all duration-300 bg-gradient-to-br ${category.color} ${
                  selectedCategory === category.label 
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
                <motion.div
                  className="absolute inset-0 rounded-lg border opacity-0 group-hover:opacity-40 transition-colors duration-300"
                  style={{
                    borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                    opacity: selectedCategory === category.label ? 0.6 : undefined
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

        {/* Main Gaming Interface */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                          <motion.div
                            key={game.title}
                            className="group p-4 border rounded-lg transition-all duration-300 cursor-pointer"
                            style={{
                              backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                              borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'
                            }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            whileHover={{ 
                              scale: 1.02,
                              backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                              borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)'
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className={`text-base font-medium transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>{game.title}</h3>
                                  <span className={`px-2 py-1 border rounded-full text-xs transition-colors duration-300 ${
                                    theme === 'light' 
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
                                    className={`px-6 py-3 border rounded-lg transition-all duration-300 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                      theme === 'light' 
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
                                    className={`px-6 py-3 border rounded-lg transition-all duration-300 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                      theme === 'light' 
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
                        ))}
                      </motion.div>
                    </AnimatePresence>

                    {/* Pagination Controls */}
                    {paginationData.totalPages > 1 && (
                      <motion.div
                        className={`flex items-center justify-between mt-6 pt-4 border-t transition-colors duration-300`}
                        style={{
                          borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'
                        }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                      >
                        <motion.button
                          onClick={goToPreviousPage}
                          disabled={currentPage === 1}
                          className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all duration-300 ${
                            currentPage === 1 
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
                          className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all duration-300 ${
                            currentPage === paginationData.totalPages 
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
                      </motion.div>
                    )}
                  </>
                )}
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
            {/* Player Stats */}
            <div className="border rounded-lg backdrop-blur-sm p-6 transition-colors duration-300" style={{
              backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
              borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
            }}>
              <div className="flex items-center gap-3 mb-4">
                <Trophy className={`w-5 h-5 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
                <h3 className={`text-lg font-light tracking-wide transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>Player Stats</h3>
              </div>
              <div className="space-y-3">
                {playerStats.map((stat, index) => (
                  <motion.div 
                    key={stat.label}
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <div className="flex items-center gap-2">
                      <stat.icon className={`w-4 h-4 transition-colors duration-300 ${theme === 'light' ? 'text-gray-700' : 'text-white/70'}`} />
                      <span className={`text-sm transition-colors duration-300 ${theme === 'light' ? 'text-gray-700' : 'text-white/70'}`}>{stat.label}</span>
                    </div>
                    <span className={`text-sm font-light transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>{stat.value}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Global Leaderboard */}
            <div className="border rounded-lg backdrop-blur-sm p-6 transition-colors duration-300" style={{
              backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
              borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
            }}>
              <div className="flex items-center gap-3 mb-4">
                <Award className={`w-5 h-5 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
                <h3 className={`text-lg font-light tracking-wide transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>Global Leaderboard</h3>
              </div>
              <div className="space-y-3">
                {leaderboardData.map((player, index) => (
                  <motion.div 
                    key={player.player}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-300 ${
                      theme === 'light' ? 'hover:bg-black/5' : 'hover:bg-white/5'
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full border text-xs font-bold transition-colors duration-300 ${
                      theme === 'light' 
                        ? 'bg-black/20 border-black/30 text-black' 
                        : 'bg-white/20 border-white/30 text-white'
                    }`}>
                      {player.rank}
                    </div>
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs transition-colors duration-300 ${
                      theme === 'light' 
                        ? 'bg-black/20 border-black/30 text-black' 
                        : 'bg-white/20 border-white/30 text-white'
                    }`}>
                      {player.avatar}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-light transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>{player.player}</p>
                      <p className={`text-xs transition-colors duration-300 ${theme === 'light' ? 'text-gray-500' : 'text-white/50'}`}>{player.score.toLocaleString()} pts</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

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
                  className={`w-full p-3 border rounded-lg transition-all duration-300 text-sm flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    featuredGames.length === 0 
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
                    <Dices className={`w-5 h-5 transition-colors duration-300 ${
                      featuredGames.length === 0 
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
                  className={`w-full p-3 border rounded-lg transition-all duration-300 text-sm flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    theme === 'light' 
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
                  <div className={`text-xs px-2 py-1 rounded-full transition-colors duration-300 ${
                    theme === 'light' ? 'bg-black/20 text-gray-700' : 'bg-white/20 text-white/70'
                  }`}>
                    SOON
                  </div>
                </motion.button>
                
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
    </div>
  )
}