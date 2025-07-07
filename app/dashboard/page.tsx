'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import BackgroundNodes from '@/components/BackgroundNodes'
import { PORTAL_MODULES } from '@/constants'
import { 
  LayoutDashboard, 
  Activity, 
  TrendingUp, 
  Users, 
  Clock,
  ArrowRight,
  Plus,
  Loader2
} from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirectTo=/dashboard')
      return
    }

    if (isAuthenticated) {
      setTimeout(() => setLoading(false), 500)
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white/60 mx-auto mb-4" />
          <p className="text-white/60">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
      <BackgroundNodes isMobile={false} />
      
      <motion.div 
        className="relative z-10 container mx-auto pt-24 pb-8 px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent flex items-center gap-2">
                <LayoutDashboard className="w-8 h-8 text-white/40" />
                Dashboard
              </h1>
              <p className="text-white/60 mt-2">Welcome back, {user?.fullName || 'User'}! Here&apos;s what&apos;s happening in your portal.</p>
            </div>
            <Button className="bg-white/10 hover:bg-white/20 text-white border-white/20">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Active Projects</CardTitle>
              <Activity className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">12</div>
              <p className="text-xs text-white/60">
                +2 from last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Modules Used</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">7</div>
              <p className="text-xs text-white/60">
                Out of 9 available
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Collaborators</CardTitle>
              <Users className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">24</div>
              <p className="text-xs text-white/60">
                +3 new this week
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Hours This Week</CardTitle>
              <Clock className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">42</div>
              <p className="text-xs text-white/60">
                +8% from last week
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Access */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Quick Access</CardTitle>
                <CardDescription className="text-white/60">Jump into your most used modules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PORTAL_MODULES.filter(module => ['ai', 'robotics', 'projects', 'forum'].includes(module.id)).map((module) => (
                    <div key={module.id} className="flex items-center justify-between p-4 border border-white/20 rounded-lg hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${module.gradient} text-white`}>
                          <div className="w-4 h-4 font-bold text-xs">
                            {module.icon.slice(0, 2)}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{module.title}</h3>
                          <p className="text-sm text-white/60">{module.features[0]}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
                <CardDescription className="text-white/60">Latest updates across your modules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-white">AI Model Deployed</p>
                      <p className="text-xs text-white/60">Sentiment analysis model went live</p>
                      <p className="text-xs text-white/50">2 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-white">New Project Created</p>
                      <p className="text-xs text-white/60">Robotics arm control system</p>
                      <p className="text-xs text-white/50">5 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-white">Forum Discussion</p>
                      <p className="text-xs text-white/60">New reply in ML algorithms thread</p>
                      <p className="text-xs text-white/50">1 day ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-white">Training Completed</p>
                      <p className="text-xs text-white/60">Strength training week 4</p>
                      <p className="text-xs text-white/50">2 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Current Projects */}
        <motion.div variants={itemVariants} className="mt-6">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Current Projects</CardTitle>
              <CardDescription className="text-white/60">Projects you&apos;re actively working on</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-white/20 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                      <div className="w-4 h-4 font-bold text-xs">AI</div>
                    </div>
                    <div>
                      <h3 className="font-medium text-white">Natural Language Processing Pipeline</h3>
                      <p className="text-sm text-white/60">Building a comprehensive NLP system for document analysis</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">In Progress</Badge>
                    <Button size="sm" variant="outline" className="text-white border-white/30 hover:bg-white/10">Continue</Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-white/20 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                      <div className="w-4 h-4 font-bold text-xs">RO</div>
                    </div>
                    <div>
                      <h3 className="font-medium text-white">Autonomous Navigation Robot</h3>
                      <p className="text-sm text-white/60">Developing computer vision and path planning algorithms</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">Planning</Badge>
                    <Button size="sm" variant="outline" className="text-white border-white/30 hover:bg-white/10">View</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
} 