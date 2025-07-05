'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import BackgroundNodes from '@/components/BackgroundNodes'
import { 
  Gamepad2,
  Trophy,
  Users,
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
  Sun,
  Moon
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
  players: number
  rating: number
  status: string
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
  const [isDarkMode, setIsDarkMode] = useState(true)

  // Pagination configuration
  const gamesPerPage = 3

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Theme detection and persistence
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark')
    } else {
      setIsDarkMode(systemPrefersDark)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const gameCategories: GameCategory[] = [
    { icon: Brain, label: 'Strategy', color: 'from-purple-500/20 to-pink-500/20' },
    { icon: Target, label: 'Arcade', color: 'from-blue-500/20 to-cyan-500/20' },
    { icon: Puzzle, label: 'Puzzle', color: 'from-green-500/20 to-emerald-500/20' },
    { icon: Swords, label: 'Action', color: 'from-red-500/20 to-orange-500/20' }
  ]

  const featuredGames: FeaturedGame[] = [
    {
      title: 'Neural Chess',
      description: 'AI-powered chess with quantum mechanics',
      players: 1247,
      rating: 4.8,
      status: 'active',
      category: 'Strategy',
      link: '/games/neural-chess'
    },
    {
      title: 'Shadow Net',
      description: 'You are the hired Agent, you have to protecet the galexy from the enemy, hack the system and help Dr.Tenebris',
      players: 24,
      rating: 4.6,
      status: 'active',
      category: 'Puzzle',
      link: 'https://shadow-net-production.up.railway.app'
    },
    {
      title: 'Code Breaker Matrix',
      description: 'Decrypt alien algorithms and save humanity',
      players: 634,
      rating: 4.9,
      status: 'new',
      category: 'Puzzle',
      link: '/games/code-breaker-matrix'
    },
    {
      title: 'Quantum Battles',
      description: 'Strategic warfare in parallel dimensions',
      players: 445,
      rating: 4.7,
      status: 'active',
      category: 'Strategy',
      link: 'https://quantum-battles.example.com'
    }
  ]

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

  // Handle category selection with pagination reset
  const handleCategoryClick = (categoryLabel: string) => {
    setSelectedCategory(selectedCategory === categoryLabel ? null : categoryLabel)
    setCurrentPage(1) // Reset to first page when category changes
  }

  // Toggle category with keyboard support
  const toggleCategory = (categoryLabel: string) => {
    handleCategoryClick(categoryLabel)
  }

  // Handle theme toggle
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  // Calculate count for each category
  const getCategoryCount = (categoryLabel: string) => {
    return featuredGames.filter(game => game.category === categoryLabel).length
  }

  // Filter games based on selected category
  const filteredGames = selectedCategory 
    ? featuredGames.filter(game => game.category === selectedCategory)
    : featuredGames

  // Pagination logic
  const totalPages = Math.ceil(filteredGames.length / gamesPerPage)
  const currentGames = filteredGames.slice(
    (currentPage - 1) * gamesPerPage,
    currentPage * gamesPerPage
  )

  // Pagination handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  return (
    <div className={`min-h-screen overflow-hidden transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-black text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Interactive Background */}
      <BackgroundNodes isMobile={isMobile} />
      
      {/* Theme Toggle Button */}
      <motion.button
        onClick={toggleTheme}
        className={`fixed top-8 right-8 z-20 p-3 rounded-full border backdrop-blur-sm transition-all duration-300 ${
          isDarkMode 
            ? 'bg-black/90 border-white/30 text-white hover:bg-black/95 hover:border-white/60' 
            : 'bg-white/90 border-gray-300 text-gray-900 hover:bg-white hover:border-gray-400'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      >
        {isDarkMode ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </motion.button>
      
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
              className={`p-4 rounded-full border backdrop-blur-sm ${
                isDarkMode 
                  ? 'bg-black/90 border-white/30' 
                  : 'bg-white/90 border-gray-300'
              }`}
              whileHover={{ 
                scale: 1.1, 
                boxShadow: isDarkMode 
                  ? '0 0 25px rgba(255,255,255,0.4)' 
                  : '0 0 25px rgba(0,0,0,0.2)'
              }}
              transition={{ duration: 0.3 }}
            >
              <Gamepad2 className={`w-8 h-8 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`} />
            </motion.div>
          </div>
          <h1 className={`text-3xl font-light tracking-wide mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Gaming Portal
          </h1>
          <p className={`text-sm max-w-md mx-auto ${
            isDarkMode ? 'text-white/60' : 'text-gray-600'
          }`}>
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
                  className={`absolute inset-0 rounded-lg opacity-0 blur-lg group-hover:opacity-10 ${
                    isDarkMode ? 'bg-white' : 'bg-gray-900'
                  }`}
                  initial={{ scale: 0.8 }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Category Card */}
                <div className={`relative p-6 border rounded-lg backdrop-blur-sm h-32 flex flex-col items-center justify-center text-center transition-all duration-300 bg-gradient-to-br ${category.color} ${
                  isDarkMode ? 'bg-black/90' : 'bg-white/90'
                } ${
                  selectedCategory === category.label 
                    ? isDarkMode 
                      ? 'border-white/80 bg-black/95 shadow-[0_0_20px_rgba(255,255,255,0.3)]' 
                      : 'border-gray-600 bg-white shadow-[0_0_20px_rgba(0,0,0,0.2)]'
                    : isDarkMode 
                      ? 'border-white/30 group-hover:border-white/60 group-hover:bg-black/95' 
                      : 'border-gray-300 group-hover:border-gray-400 group-hover:bg-white'
                }`}>
                  <category.icon className={`w-8 h-8 mb-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`} />
                  <h3 className={`text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{category.label}</h3>
                  <p className={`text-xs ${
                    isDarkMode ? 'text-white/60' : 'text-gray-600'
                  }`}>{getCategoryCount(category.label)} games</p>
                </div>

                {/* Pulse effect */}
                <motion.div
                  className={`absolute inset-0 rounded-lg border opacity-0 ${
                    selectedCategory === category.label 
                      ? isDarkMode 
                        ? 'border-white/40 opacity-60' 
                        : 'border-gray-500/40 opacity-60'
                      : isDarkMode 
                        ? 'border-white/20 group-hover:opacity-40' 
                        : 'border-gray-400/20 group-hover:opacity-40'
                  }`}
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
            <div className={`border rounded-lg backdrop-blur-sm p-6 ${
              isDarkMode 
                ? 'bg-black/90 border-white/30' 
                : 'bg-white/90 border-gray-300'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                <Star className={`w-5 h-5 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`} />
                <h2 className={`text-lg font-light tracking-wide ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Featured Games
                  {selectedCategory && (
                    <span className={`ml-2 text-sm ${
                      isDarkMode ? 'text-white/60' : 'text-gray-600'
                    }`}>
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
                      <div className={`text-4xl mb-4 ${
                        isDarkMode ? 'text-white/30' : 'text-gray-300'
                      }`}>🎮</div>
                      <p className={`text-lg ${
                        isDarkMode ? 'text-white/60' : 'text-gray-600'
                      }`}>
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
                        {currentGames.map((game, index) => (
                          <motion.div
                            key={game.title}
                            className={`group p-4 border rounded-lg transition-all duration-300 cursor-pointer ${
                              isDarkMode 
                                ? 'bg-black/50 border-white/20 hover:border-white/40 hover:bg-black/70' 
                                : 'bg-white/50 border-gray-200 hover:border-gray-300 hover:bg-white/80'
                            }`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className={`text-base font-medium ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                  }`}>{game.title}</h3>
                                  {game.status === 'new' && (
                                    <span className={`px-2 py-1 border rounded-full text-xs ${
                                      isDarkMode 
                                        ? 'bg-white/20 border-white/30 text-white' 
                                        : 'bg-gray-100 border-gray-300 text-gray-900'
                                    }`}>
                                      NEW
                                    </span>
                                  )}
                                  <span className={`px-2 py-1 border rounded-full text-xs ${
                                    isDarkMode 
                                      ? 'bg-white/10 border-white/20 text-white/70' 
                                      : 'bg-gray-50 border-gray-200 text-gray-600'
                                  }`}>
                                    {game.category}
                                  </span>
                                </div>
                                <p className={`text-sm mb-3 ${
                                  isDarkMode ? 'text-white/70' : 'text-gray-700'
                                }`}>{game.description}</p>
                                <div className={`flex items-center gap-4 text-xs ${
                                  isDarkMode ? 'text-white/60' : 'text-gray-600'
                                }`}>
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {game.players} players
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Star className="w-3 h-3" />
                                    {game.rating}
                                  </span>
                                </div>
                              </div>
                              {/* Enhanced Play Button with Lazy Loading */}
                              {game.link.startsWith('http') ? (
                                <a
                                  href={game.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-4"
                                  aria-label={`Play ${game.title} in new tab`}
                                >
                                  <motion.button
                                    className={`px-6 py-3 border rounded-lg transition-all duration-300 flex items-center gap-2 ${
                                      isDarkMode 
                                        ? 'bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/60' 
                                        : 'bg-gray-100 border-gray-300 text-gray-900 hover:bg-gray-200 hover:border-gray-400'
                                    }`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Play className="w-4 h-4" />
                                    Play
                                  </motion.button>
                                </a>
                              ) : (
                                <Link href={game.link} className="ml-4">
                                  <motion.button
                                    className={`px-6 py-3 border rounded-lg transition-all duration-300 flex items-center gap-2 ${
                                      isDarkMode 
                                        ? 'bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/60' 
                                        : 'bg-gray-100 border-gray-300 text-gray-900 hover:bg-gray-200 hover:border-gray-400'
                                    }`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    aria-label={`Play ${game.title}`}
                                  >
                                    <Play className="w-4 h-4" />
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
                    {totalPages > 1 && (
                      <motion.div
                        className={`flex items-center justify-between mt-6 pt-4 border-t ${
                          isDarkMode ? 'border-white/20' : 'border-gray-300'
                        }`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                      >
                        <motion.button
                          onClick={goToPreviousPage}
                          disabled={currentPage === 1}
                          className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all duration-300 ${
                            currentPage === 1 
                              ? isDarkMode 
                                ? 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed' 
                                : 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed'
                              : isDarkMode 
                                ? 'bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/60' 
                                : 'bg-gray-100 border-gray-300 text-gray-900 hover:bg-gray-200 hover:border-gray-400'
                          }`}
                          whileHover={currentPage !== 1 ? { scale: 1.05 } : {}}
                          whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
                          aria-label="Previous page"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </motion.button>

                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${
                            isDarkMode ? 'text-white/60' : 'text-gray-600'
                          }`}>
                            Page {currentPage} of {totalPages}
                          </span>
                        </div>

                        <motion.button
                          onClick={goToNextPage}
                          disabled={currentPage === totalPages}
                          className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all duration-300 ${
                            currentPage === totalPages 
                              ? isDarkMode 
                                ? 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed' 
                                : 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed'
                              : isDarkMode 
                                ? 'bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/60' 
                                : 'bg-gray-100 border-gray-300 text-gray-900 hover:bg-gray-200 hover:border-gray-400'
                          }`}
                          whileHover={currentPage !== totalPages ? { scale: 1.05 } : {}}
                          whileTap={currentPage !== totalPages ? { scale: 0.95 } : {}}
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
            <div className={`border rounded-lg backdrop-blur-sm p-6 ${
              isDarkMode 
                ? 'bg-black/90 border-white/30' 
                : 'bg-white/90 border-gray-300'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <Trophy className={`w-5 h-5 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`} />
                <h3 className={`text-lg font-light tracking-wide ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Player Stats</h3>
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
                      <stat.icon className={`w-4 h-4 ${
                        isDarkMode ? 'text-white/70' : 'text-gray-600'
                      }`} />
                      <span className={`text-sm ${
                        isDarkMode ? 'text-white/70' : 'text-gray-600'
                      }`}>{stat.label}</span>
                    </div>
                    <span className={`text-sm font-light ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{stat.value}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Global Leaderboard */}
            <div className={`border rounded-lg backdrop-blur-sm p-6 ${
              isDarkMode 
                ? 'bg-black/90 border-white/30' 
                : 'bg-white/90 border-gray-300'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <Award className={`w-5 h-5 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`} />
                <h3 className={`text-lg font-light tracking-wide ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Global Leaderboard</h3>
              </div>
              <div className="space-y-3">
                {leaderboardData.map((player, index) => (
                  <motion.div 
                    key={player.player}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-300 ${
                      isDarkMode 
                        ? 'hover:bg-white/5' 
                        : 'hover:bg-gray-100'
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full border text-xs font-bold ${
                      isDarkMode 
                        ? 'bg-white/20 border-white/30 text-white' 
                        : 'bg-gray-100 border-gray-300 text-gray-900'
                    }`}>
                      {player.rank}
                    </div>
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs ${
                      isDarkMode 
                        ? 'bg-white/20 border-white/30 text-white' 
                        : 'bg-gray-100 border-gray-300 text-gray-900'
                    }`}>
                      {player.avatar}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-light ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{player.player}</p>
                      <p className={`text-xs ${
                        isDarkMode ? 'text-white/50' : 'text-gray-500'
                      }`}>{player.score.toLocaleString()} pts</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className={`border rounded-lg backdrop-blur-sm p-6 ${
              isDarkMode 
                ? 'bg-black/90 border-white/30' 
                : 'bg-white/90 border-gray-300'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <Zap className={`w-5 h-5 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`} />
                <h3 className={`text-lg font-light tracking-wide ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>Quick Actions</h3>
              </div>
              <div className="space-y-3">
                <motion.button
                  className={`w-full p-3 border rounded-lg transition-all duration-300 text-sm ${
                    isDarkMode 
                      ? 'bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/60' 
                      : 'bg-gray-100 border-gray-300 text-gray-900 hover:bg-gray-200 hover:border-gray-400'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  aria-label="Join a random multiplayer match"
                >
                  Join Random Match
                </motion.button>
                <motion.button
                  className={`w-full p-3 border rounded-lg transition-all duration-300 text-sm ${
                    isDarkMode 
                      ? 'bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/60' 
                      : 'bg-gray-100 border-gray-300 text-gray-900 hover:bg-gray-200 hover:border-gray-400'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  aria-label="Create a new tournament"
                >
                  Create Tournament
                </motion.button>
                <motion.button
                  className={`w-full p-3 border rounded-lg transition-all duration-300 text-sm ${
                    isDarkMode 
                      ? 'bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/60' 
                      : 'bg-gray-100 border-gray-300 text-gray-900 hover:bg-gray-200 hover:border-gray-400'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  aria-label="Browse available challenges"
                >
                  Browse Challenges
                </motion.button>
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
          <div className={`flex items-center space-x-2 text-xs ${
            isDarkMode ? 'text-white/40' : 'text-gray-500'
          }`}>
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              isDarkMode ? 'bg-white/40' : 'bg-gray-400'
            }`} />
            <span>Gaming Network Online</span>
            <div 
              className={`w-2 h-2 rounded-full animate-pulse ${
                isDarkMode ? 'bg-white/40' : 'bg-gray-400'
              }`} 
              style={{ animationDelay: '0.5s' }} 
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}