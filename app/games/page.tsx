'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  Clock
} from 'lucide-react'

export default function GamesPage() {
  const [isMobile, setIsMobile] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const gameCategories = [
    { icon: Brain, label: 'Strategy', color: 'from-purple-500/20 to-pink-500/20' },
    { icon: Target, label: 'Arcade', color: 'from-blue-500/20 to-cyan-500/20' },
    { icon: Puzzle, label: 'Puzzle', color: 'from-green-500/20 to-emerald-500/20' },
    { icon: Swords, label: 'Action', color: 'from-red-500/20 to-orange-500/20' }
  ]

  const featuredGames = [
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

  const leaderboardData = [
    { rank: 1, player: 'NeuralMaster', score: 15420, avatar: 'NM' },
    { rank: 2, player: 'QuantumAce', score: 14890, avatar: 'QA' },
    { rank: 3, player: 'CyberWolf', score: 14250, avatar: 'CW' },
    { rank: 4, player: 'VoidRunner', score: 13680, avatar: 'VR' },
    { rank: 5, player: 'StarHacker', score: 13120, avatar: 'SH' }
  ]

  const playerStats = [
    { label: 'Games Played', value: '247', icon: Gamepad2 },
    { label: 'Victories', value: '189', icon: Trophy },
    { label: 'Win Rate', value: '76.5%', icon: TrendingUp },
    { label: 'Best Streak', value: '23', icon: Zap }
  ]

  // Handle category selection
  const handleCategoryClick = (categoryLabel: string) => {
    setSelectedCategory(selectedCategory === categoryLabel ? null : categoryLabel)
  }

  // Calculate count for each category
  const getCategoryCount = (categoryLabel: string) => {
    return featuredGames.filter(game => game.category === categoryLabel).length
  }

  // Filter games based on selected category
  const filteredGames = selectedCategory 
    ? featuredGames.filter(game => game.category === selectedCategory)
    : featuredGames

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
              <Gamepad2 className="w-8 h-8 text-white" />
            </motion.div>
          </div>
          <h1 className="text-3xl font-light text-white tracking-wide mb-2">
            Gaming Portal
          </h1>
          <p className="text-sm text-white/60 max-w-md mx-auto">
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {gameCategories.map((category, index) => (
              <motion.div
                key={category.label}
                className="group relative cursor-pointer"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCategoryClick(category.label)}
              >
                {/* Glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-lg bg-white opacity-0 blur-lg group-hover:opacity-10"
                  initial={{ scale: 0.8 }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Category Card */}
                <div className={`relative p-6 bg-black/90 border rounded-lg backdrop-blur-sm h-32 flex flex-col items-center justify-center text-center transition-all duration-300 bg-gradient-to-br ${category.color} ${
                  selectedCategory === category.label 
                    ? 'border-white/80 bg-black/95 shadow-[0_0_20px_rgba(255,255,255,0.3)]' 
                    : 'border-white/30 group-hover:border-white/60 group-hover:bg-black/95'
                }`}>
                  <category.icon className="w-8 h-8 text-white mb-2" />
                  <h3 className="text-sm font-medium text-white mb-1">{category.label}</h3>
                  <p className="text-xs text-white/60">{getCategoryCount(category.label)} games</p>
                </div>

                {/* Pulse effect */}
                <motion.div
                  className={`absolute inset-0 rounded-lg border opacity-0 ${
                    selectedCategory === category.label 
                      ? 'border-white/40 opacity-60' 
                      : 'border-white/20 group-hover:opacity-40'
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
            <div className="bg-black/90 border border-white/30 rounded-lg backdrop-blur-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <Star className="w-5 h-5 text-white" />
                <h2 className="text-lg font-light text-white tracking-wide">
                  Featured Games
                  {selectedCategory && (
                    <span className="ml-2 text-sm text-white/60">
                      - {selectedCategory}
                    </span>
                  )}
                </h2>
              </div>
              
              <div className="space-y-4">
                {filteredGames.map((game, index) => (
                  <motion.div
                    key={game.title}
                    className="group p-4 bg-black/50 border border-white/20 rounded-lg hover:border-white/40 hover:bg-black/70 transition-all duration-300 cursor-pointer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-base font-medium text-white">{game.title}</h3>
                          {game.status === 'new' && (
                            <span className="px-2 py-1 bg-white/20 border border-white/30 rounded-full text-xs text-white">
                              NEW
                            </span>
                          )}
                          <span className="px-2 py-1 bg-white/10 border border-white/20 rounded-full text-xs text-white/70">
                            {game.category}
                          </span>
                        </div>
                        <p className="text-sm text-white/70 mb-3">{game.description}</p>
                        <div className="flex items-center gap-4 text-xs text-white/60">
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
                      {game.link.startsWith('http') ? (
                        <a
                          href={game.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-4"
                        >
                          <motion.button
                            className="px-6 py-3 bg-white/10 border border-white/30 rounded-lg text-white hover:bg-white/20 hover:border-white/60 transition-all duration-300 flex items-center gap-2"
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
                            className="px-6 py-3 bg-white/10 border border-white/30 rounded-lg text-white hover:bg-white/20 hover:border-white/60 transition-all duration-300 flex items-center gap-2"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Play className="w-4 h-4" />
                            Play
                          </motion.button>
                        </Link>
                      )}
                    </div>
                  </motion.div>
                ))}
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
            <div className="bg-black/90 border border-white/30 rounded-lg backdrop-blur-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-5 h-5 text-white" />
                <h3 className="text-lg font-light text-white tracking-wide">Player Stats</h3>
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
                      <stat.icon className="w-4 h-4 text-white/70" />
                      <span className="text-sm text-white/70">{stat.label}</span>
                    </div>
                    <span className="text-sm font-light text-white">{stat.value}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Global Leaderboard */}
            <div className="bg-black/90 border border-white/30 rounded-lg backdrop-blur-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-5 h-5 text-white" />
                <h3 className="text-lg font-light text-white tracking-wide">Global Leaderboard</h3>
              </div>
              <div className="space-y-3">
                {leaderboardData.map((player, index) => (
                  <motion.div 
                    key={player.player}
                    className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-all duration-300"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20 border border-white/30 text-xs text-white font-bold">
                      {player.rank}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold text-xs">
                      {player.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-light text-white">{player.player}</p>
                      <p className="text-xs text-white/50">{player.score.toLocaleString()} pts</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-black/90 border border-white/30 rounded-lg backdrop-blur-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-5 h-5 text-white" />
                <h3 className="text-lg font-light text-white tracking-wide">Quick Actions</h3>
              </div>
              <div className="space-y-3">
                <motion.button
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white hover:bg-white/20 hover:border-white/60 transition-all duration-300 text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Join Random Match
                </motion.button>
                <motion.button
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white hover:bg-white/20 hover:border-white/60 transition-all duration-300 text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Create Tournament
                </motion.button>
                <motion.button
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white hover:bg-white/20 hover:border-white/60 transition-all duration-300 text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
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
          <div className="flex items-center space-x-2 text-white/40 text-xs">
            <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse" />
            <span>Gaming Network Online</span>
            <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
        </motion.div>
      </div>
    </div>
  )
}