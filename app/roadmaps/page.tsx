'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import BackgroundNodes from '@/components/BackgroundNodes'
import { 
  Map,
  Target,
  CheckCircle,
  Clock,
  Star,
  ArrowRight,
  Calendar,
  Code,
  Cpu,
  Database,
  Globe,
  Rocket,
  Zap,
  BookOpen,
  Users,
  Award
} from 'lucide-react'

export default function RoadmapsPage() {
  const [isMobile, setIsMobile] = useState(false)
  const [selectedTrack, setSelectedTrack] = useState('fullstack')

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const roadmapTracks = [
    { 
      id: 'fullstack', 
      title: 'Full Stack Development', 
      icon: Globe, 
      color: 'from-purple-500/20 to-pink-500/20',
      duration: '12 months',
      students: 1247
    },
    { 
      id: 'ai', 
      title: 'AI & Machine Learning', 
      icon: Cpu, 
      color: 'from-blue-500/20 to-cyan-500/20',
      duration: '18 months',
      students: 892
    },
    { 
      id: 'blockchain', 
      title: 'Blockchain & Web3', 
      icon: Database, 
      color: 'from-green-500/20 to-emerald-500/20',
      duration: '10 months',
      students: 634
    },
    { 
      id: 'mobile', 
      title: 'Mobile Development', 
      icon: Rocket, 
      color: 'from-red-500/20 to-orange-500/20',
      duration: '8 months',
      students: 445
    }
  ]

  const roadmapData = {
    fullstack: [
      {
        phase: 'Foundation',
        duration: '3 months',
        status: 'completed',
        modules: [
          { name: 'HTML/CSS Fundamentals', completed: true },
          { name: 'JavaScript ES6+', completed: true },
          { name: 'Git & Version Control', completed: true },
          { name: 'Responsive Design', completed: true }
        ]
      },
      {
        phase: 'Frontend Mastery',
        duration: '3 months',
        status: 'in-progress',
        modules: [
          { name: 'React.js Ecosystem', completed: true },
          { name: 'State Management', completed: true },
          { name: 'Testing & Debugging', completed: false },
          { name: 'Performance Optimization', completed: false }
        ]
      },
      {
        phase: 'Backend Systems',
        duration: '3 months',
        status: 'upcoming',
        modules: [
          { name: 'Node.js & Express', completed: false },
          { name: 'Database Design', completed: false },
          { name: 'API Development', completed: false },
          { name: 'Authentication & Security', completed: false }
        ]
      },
      {
        phase: 'Deployment & DevOps',
        duration: '3 months',
        status: 'upcoming',
        modules: [
          { name: 'Cloud Platforms', completed: false },
          { name: 'CI/CD Pipelines', completed: false },
          { name: 'Monitoring & Scaling', completed: false },
          { name: 'Production Optimization', completed: false }
        ]
      }
    ]
  }

  const achievements = [
    { title: 'First Deployment', description: 'Successfully deployed first application', unlocked: true },
    { title: 'Code Master', description: 'Completed 100+ coding challenges', unlocked: true },
    { title: 'Team Player', description: 'Collaborated on 5+ group projects', unlocked: false },
    { title: 'Innovation Award', description: 'Created an innovative solution', unlocked: false }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 border-green-500/40 text-green-400'
      case 'in-progress': return 'bg-blue-500/20 border-blue-500/40 text-blue-400'
      case 'upcoming': return 'bg-white/10 border-white/20 text-white/60'
      default: return 'bg-white/10 border-white/20 text-white/60'
    }
  }

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
              <Map className="w-8 h-8 text-white" />
            </motion.div>
          </div>
          <h1 className="text-3xl font-light text-white tracking-wide mb-2">
            Development Roadmaps
          </h1>
          <p className="text-sm text-white/60 max-w-md mx-auto">
            Structured learning paths for mastering cutting-edge technologies
          </p>
        </motion.div>

        {/* Roadmap Tracks */}
        <motion.div 
          className="max-w-4xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roadmapTracks.map((track, index) => (
              <motion.div
                key={track.id}
                className={`group relative cursor-pointer ${selectedTrack === track.id ? 'ring-2 ring-white/60' : ''}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedTrack(track.id)}
              >
                {/* Glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-lg bg-white opacity-0 blur-lg group-hover:opacity-10"
                  initial={{ scale: 0.8 }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Track Card */}
                <div className={`relative p-6 bg-black/90 border border-white/30 rounded-lg backdrop-blur-sm h-40 flex flex-col justify-between group-hover:border-white/60 group-hover:bg-black/95 transition-all duration-300 bg-gradient-to-br ${track.color}`}>
                  <div className="flex flex-col items-center text-center">
                    <track.icon className="w-8 h-8 text-white mb-3" />
                    <h3 className="text-sm font-medium text-white mb-2">{track.title}</h3>
                  </div>
      <div className="text-center">
                    <p className="text-xs text-white/60 mb-1">{track.duration}</p>
                    <p className="text-xs text-white/50">{track.students} students</p>
                  </div>
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

        {/* Main Roadmap Interface */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Roadmap Timeline */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="bg-black/90 border border-white/30 rounded-lg backdrop-blur-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-5 h-5 text-white" />
                <h2 className="text-lg font-light text-white tracking-wide">Learning Timeline</h2>
              </div>
              
              <div className="space-y-6">
                {roadmapData.fullstack.map((phase, phaseIndex) => (
                  <motion.div
                    key={phase.phase}
                    className="relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: phaseIndex * 0.1 }}
                  >
                    {/* Timeline Line */}
                    {phaseIndex !== roadmapData.fullstack.length - 1 && (
                      <div className="absolute left-6 top-16 w-0.5 h-16 bg-white/20"></div>
                    )}
                    
                    <div className="flex items-start gap-4">
                      {/* Phase Status Icon */}
                      <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${getStatusColor(phase.status)}`}>
                        {phase.status === 'completed' ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : phase.status === 'in-progress' ? (
                          <Clock className="w-6 h-6" />
                        ) : (
                          <Target className="w-6 h-6" />
                        )}
                      </div>
                      
                      {/* Phase Content */}
                      <div className="flex-1 bg-black/50 border border-white/20 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-base font-medium text-white">{phase.phase}</h3>
                          <span className="text-xs text-white/60">{phase.duration}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {phase.modules.map((module, moduleIndex) => (
                            <div
                              key={module.name}
                              className={`flex items-center gap-2 p-2 rounded text-xs ${
                                module.completed 
                                  ? 'bg-green-500/10 text-green-400' 
                                  : 'bg-white/5 text-white/60'
                              }`}
                            >
                              {module.completed ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <div className="w-3 h-3 rounded-full border border-white/30"></div>
                              )}
                              <span>{module.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
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
            {/* Progress Stats */}
            <div className="bg-black/90 border border-white/30 rounded-lg backdrop-blur-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <Star className="w-5 h-5 text-white" />
                <h3 className="text-lg font-light text-white tracking-wide">Progress Stats</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">Completion</span>
                  <span className="text-sm font-light text-white">62.5%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">Modules Done</span>
                  <span className="text-sm font-light text-white">10/16</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">Time Spent</span>
                  <span className="text-sm font-light text-white">127h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">Streak</span>
                  <span className="text-sm font-light text-white">15 days</span>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-black/90 border border-white/30 rounded-lg backdrop-blur-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-5 h-5 text-white" />
                <h3 className="text-lg font-light text-white tracking-wide">Achievements</h3>
              </div>
              <div className="space-y-3">
                {achievements.map((achievement, index) => (
                  <motion.div 
                    key={achievement.title}
                    className={`flex items-center gap-3 p-2 rounded-lg ${
                      achievement.unlocked ? 'bg-white/10' : 'bg-white/5'
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      achievement.unlocked ? 'bg-yellow-500/20 border border-yellow-500/40' : 'bg-white/10 border border-white/20'
                    }`}>
                      <Award className={`w-4 h-4 ${achievement.unlocked ? 'text-yellow-400' : 'text-white/40'}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-light ${achievement.unlocked ? 'text-white' : 'text-white/50'}`}>
                        {achievement.title}
                      </p>
                      <p className="text-xs text-white/40">{achievement.description}</p>
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
                  Continue Learning
                </motion.button>
                <motion.button
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white hover:bg-white/20 hover:border-white/60 transition-all duration-300 text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Join Study Group
                </motion.button>
                <motion.button
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white hover:bg-white/20 hover:border-white/60 transition-all duration-300 text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  View Resources
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
            <span>Learning Path Active</span>
            <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
        </motion.div>
      </div>
    </div>
  )
} 