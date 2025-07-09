'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { useTheme } from '@/contexts/theme-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import BackgroundNodes from '@/components/BackgroundNodes'

import { 
  BookOpen, 
  Calendar, 
  Target, 
  TrendingUp,
  Users,
  Award,
  Clock,
  Plus,
  ArrowRight,
  GraduationCap,
  Loader2
} from 'lucide-react'

interface DashboardStats {
  totalCourses: number
  completedCourses: number
  activePlans: number
  overallProgress: number
  upcomingDeadlines: number
  currentGPA: number
}

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

export default function UniversityPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { theme } = useTheme()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirectTo=/university')
      return
    }

    if (isAuthenticated) {
      // Simulate loading dashboard data
      setTimeout(() => {
        setStats({
          totalCourses: 6,
          completedCourses: 2,
          activePlans: 3,
          overallProgress: 67,
          upcomingDeadlines: 4,
          currentGPA: 3.75
        })
        setLoading(false)
      }, 1000)
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors duration-300" style={{ backgroundColor: 'var(--bg-color)' }}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 transition-colors duration-300" style={{ color: 'var(--text-secondary)' }} />
          <p className="transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>Loading university portal...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      {/* Background Effects */}
      <div className="fixed inset-0 transition-colors duration-300" style={{ 
        background: theme === 'light' 
          ? 'linear-gradient(to bottom right, #ffffff, #f8fafc, #ffffff)' 
          : 'linear-gradient(to bottom right, #000000, #1f2937, #000000)'
      }} />
      <div className="fixed inset-0" style={{
        background: theme === 'light'
          ? 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1), transparent 50%)'
          : 'radial-gradient(circle at 50% 50%, rgba(120, 119, 198, 0.1), transparent 50%)'
      }} />
      <BackgroundNodes isMobile={false} />
      
      <motion.div 
        className="relative z-10 container mx-auto px-4 pt-24 pb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 
                className="text-4xl font-bold transition-all duration-300" 
                style={{ 
                  background: theme === 'light' 
                    ? 'linear-gradient(to right, #000000, #374151, #6b7280)' 
                    : 'linear-gradient(to right, #ffffff, #e5e7eb, #9ca3af)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                University Portal
              </h1>
              <p className="mt-2 transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                Welcome back, {user?.fullName || 'Student'}
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <GraduationCap className="h-12 w-12 transition-colors duration-300" style={{ color: 'var(--text-secondary)' }} />
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="backdrop-blur-sm transition-colors duration-300" style={{
            backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.05)',
            borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
          }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold transition-colors duration-300" style={{ color: 'var(--text-color)' }}>{stats?.totalCourses}</div>
              <p className="text-xs transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                {stats?.completedCourses} completed
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm transition-colors duration-300" style={{
            backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.05)',
            borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
          }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>Overall Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold transition-colors duration-300" style={{ color: 'var(--text-color)' }}>{stats?.overallProgress}%</div>
              <div className="w-full rounded-full h-2 mt-2 transition-colors duration-300" style={{ 
                backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)' 
              }}>
                <div 
                  className="bg-green-400 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${stats?.overallProgress || 0}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm transition-colors duration-300" style={{
            backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.05)',
            borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
          }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>Current GPA</CardTitle>
              <Award className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold transition-colors duration-300" style={{ color: 'var(--text-color)' }}>{stats?.currentGPA}</div>
              <p className="text-xs transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                Out of 4.0
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm transition-colors duration-300" style={{
            backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.05)',
            borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
          }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>Upcoming Deadlines</CardTitle>
              <Clock className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold transition-colors duration-300" style={{ color: 'var(--text-color)' }}>{stats?.upcomingDeadlines}</div>
              <p className="text-xs transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                This week
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="backdrop-blur-sm transition-all duration-300 cursor-pointer group" style={{
            backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.05)',
            borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
          }} onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.1)'
          }} onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.05)'
          }}>
            <CardHeader>
              <CardTitle className="flex items-center group-hover:text-blue-400 transition-colors" style={{ color: 'var(--text-color)' }}>
                <BookOpen className="h-5 w-5 mr-2" />
                My Courses
                <ArrowRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardTitle>
              <CardDescription className="transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                View and manage your enrolled courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="ghost" 
                className="w-full transition-colors duration-300"
                style={{ color: 'var(--text-secondary)' }}
                onClick={() => router.push('/university/courses')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-color)'
                  e.currentTarget.style.backgroundColor = theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)'
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                View Courses
              </Button>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm transition-all duration-300 cursor-pointer group" style={{
            backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.05)',
            borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
          }} onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.1)'
          }} onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.05)'
          }}>
            <CardHeader>
              <CardTitle className="flex items-center group-hover:text-green-400 transition-colors" style={{ color: 'var(--text-color)' }}>
                <Target className="h-5 w-5 mr-2" />
                Study Plans
                <ArrowRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardTitle>
              <CardDescription className="transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                Create and track your study plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="ghost" 
                className="w-full transition-colors duration-300"
                style={{ color: 'var(--text-secondary)' }}
                onClick={() => router.push('/university/study-plans')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-color)'
                  e.currentTarget.style.backgroundColor = theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)'
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                Manage Plans
              </Button>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm transition-all duration-300 cursor-pointer group" style={{
            backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.05)',
            borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
          }} onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.1)'
          }} onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.05)'
          }}>
            <CardHeader>
              <CardTitle className="flex items-center group-hover:text-purple-400 transition-colors" style={{ color: 'var(--text-color)' }}>
                <TrendingUp className="h-5 w-5 mr-2" />
                Progress Report
                <ArrowRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardTitle>
              <CardDescription className="transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                Track your academic progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="ghost" 
                className="w-full transition-colors duration-300"
                style={{ color: 'var(--text-secondary)' }}
                onClick={() => router.push('/university/progress')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-color)'
                  e.currentTarget.style.backgroundColor = theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)'
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                View Progress
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <Card className="backdrop-blur-sm transition-colors duration-300" style={{
            backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.05)',
            borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
          }}>
            <CardHeader>
              <CardTitle className="transition-colors duration-300" style={{ color: 'var(--text-color)' }}>Recent Activity</CardTitle>
              <CardDescription className="transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                Your latest academic activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <div className="flex-1">
                    <p className="transition-colors duration-300" style={{ color: 'var(--text-color)' }}>Completed assignment for Data Structures</p>
                    <p className="text-xs transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  <div className="flex-1">
                    <p className="transition-colors duration-300" style={{ color: 'var(--text-color)' }}>Started new study plan for Algorithms</p>
                    <p className="text-xs transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                  <div className="flex-1">
                    <p className="transition-colors duration-300" style={{ color: 'var(--text-color)' }}>Enrolled in Machine Learning course</p>
                    <p className="text-xs transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>3 days ago</p>
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