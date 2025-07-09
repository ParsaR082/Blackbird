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
  Loader2,
  AlertCircle
} from 'lucide-react'

interface DashboardStats {
  totalCourses: number
  completedCourses: number
  enrolledCourses: number
  activePlans: number
  overallProgress: number
  upcomingDeadlines: number
  currentGPA: number
  cumulativeGPA: number
  totalCreditsEarned: number
  academicStanding: string
}

interface RecentActivity {
  id: string
  type: 'assignment' | 'enrollment' | 'plan' | 'grade'
  description: string
  timestamp: Date
  status: 'completed' | 'started' | 'updated'
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
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirectTo=/university')
      return
    }

    if (isAuthenticated) {
      fetchDashboardData()
    }
  }, [isAuthenticated, isLoading, router])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch academic records and progress
      const [academicRecordResponse, enrollmentsResponse, assignmentsResponse, studyPlansResponse] = await Promise.all([
        fetch('/api/university/academic-record'),
        fetch('/api/university/enrollments'),
        fetch('/api/university/assignments?upcoming=true'),
        fetch('/api/university/study-plans?active=true')
      ])

      if (!academicRecordResponse.ok || !enrollmentsResponse.ok) {
        throw new Error('Failed to fetch academic data')
      }

      const academicRecord = await academicRecordResponse.json()
      const enrollments = await enrollmentsResponse.json()
      const assignments = assignmentsResponse.ok ? await assignmentsResponse.json() : { assignments: [] }
      const studyPlans = studyPlansResponse.ok ? await studyPlansResponse.json() : { studyPlans: [] }

      // Calculate stats from real data
      const currentStatus = academicRecord.currentStatus || {}
      const enrollmentData = enrollments.enrollments || []
      
      // Count courses by status
      let totalCourses = 0
      let completedCourses = 0
      let enrolledCourses = 0

      enrollmentData.forEach((semester: any) => {
        semester.courses.forEach((course: any) => {
          totalCourses++
          if (course.status === 'completed') {
            completedCourses++
          } else if (course.status === 'enrolled') {
            enrolledCourses++
          }
        })
      })

      // Calculate progress percentage
      const progressPercentage = currentStatus.progressTowardsGraduation?.percentage || 0

      // Count upcoming assignments
      const upcomingCount = assignments.assignments?.filter((a: any) => 
        !a.submission || a.submission.status !== 'completed'
      ).length || 0

      const dashboardStats: DashboardStats = {
        totalCourses,
        completedCourses,
        enrolledCourses,
        activePlans: studyPlans.studyPlans?.length || 0,
        overallProgress: Math.round(progressPercentage),
        upcomingDeadlines: upcomingCount,
        currentGPA: currentStatus.currentSemesterGPA || 0,
        cumulativeGPA: currentStatus.cumulativeGPA || 0,
        totalCreditsEarned: currentStatus.totalCreditsEarned || 0,
        academicStanding: currentStatus.academicStanding || 'Good Standing'
      }

      setStats(dashboardStats)

      // Generate recent activity from real data
      const activities: RecentActivity[] = []

      // Add recent assignments
      assignments.assignments?.slice(0, 2).forEach((assignment: any) => {
        if (assignment.submission) {
          activities.push({
            id: `assignment-${assignment._id}`,
            type: 'assignment',
            description: `${assignment.submission.status === 'completed' ? 'Completed' : 'Updated'} assignment for ${assignment.courseId.courseCode}`,
            timestamp: new Date(assignment.submission.lastModified || assignment.submission.submissionDate),
            status: assignment.submission.status === 'completed' ? 'completed' : 'updated'
          })
        }
      })

      // Add recent enrollments
      enrollmentData.slice(0, 1).forEach((semester: any) => {
        semester.courses.slice(0, 2).forEach((course: any) => {
          if (course.enrollmentDate) {
            activities.push({
              id: `enrollment-${course._id}`,
              type: 'enrollment',
              description: `Enrolled in ${course.courseId.courseCode} - ${course.courseId.title}`,
              timestamp: new Date(course.enrollmentDate),
              status: 'started'
            })
          }
        })
      })

      // Add recent study plans
      studyPlans.studyPlans?.slice(0, 1).forEach((plan: any) => {
        activities.push({
          id: `plan-${plan._id}`,
          type: 'plan',
          description: `${plan.createdAt === plan.lastModified ? 'Created' : 'Updated'} study plan: ${plan.title}`,
          timestamp: new Date(plan.lastModified || plan.createdAt),
          status: plan.createdAt === plan.lastModified ? 'started' : 'updated'
        })
      })

      // Sort by most recent
      activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      setRecentActivity(activities.slice(0, 5))

    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Failed to load university data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors duration-300" style={{ backgroundColor: 'var(--bg-color)' }}>
        <div className="text-center max-w-md mx-auto">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
          <h2 className="text-xl font-bold mb-2 transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
            Unable to Load University Data
          </h2>
          <p className="mb-4 transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
            {error}
          </p>
          <Button onClick={fetchDashboardData} className="transition-colors duration-300">
            Try Again
          </Button>
        </div>
      </div>
    )
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
              {stats && (
                <div className="mt-2 flex items-center space-x-4">
                  <Badge variant="outline" className="transition-colors duration-300">
                    {stats.academicStanding}
                  </Badge>
                  <span className="text-sm transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                    {stats.totalCreditsEarned} credits earned
                  </span>
                </div>
              )}
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
              <div className="text-2xl font-bold transition-colors duration-300" style={{ color: 'var(--text-color)' }}>{stats?.totalCourses || 0}</div>
              <p className="text-xs transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                {stats?.completedCourses || 0} completed, {stats?.enrolledCourses || 0} in progress
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
              <div className="text-2xl font-bold transition-colors duration-300" style={{ color: 'var(--text-color)' }}>{stats?.overallProgress || 0}%</div>
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
              <CardTitle className="text-sm font-medium transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>Cumulative GPA</CardTitle>
              <Award className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold transition-colors duration-300" style={{ color: 'var(--text-color)' }}>{stats?.cumulativeGPA?.toFixed(2) || '0.00'}</div>
              <p className="text-xs transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                Current: {stats?.currentGPA?.toFixed(2) || '0.00'}
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
              <div className="text-2xl font-bold transition-colors duration-300" style={{ color: 'var(--text-color)' }}>{stats?.upcomingDeadlines || 0}</div>
              <p className="text-xs transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                Assignments pending
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
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.status === 'completed' ? 'bg-green-400' : 
                        activity.status === 'started' ? 'bg-blue-400' : 'bg-yellow-400'
                      }`} />
                      <div className="flex-1">
                        <p className="transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
                          {activity.description}
                        </p>
                        <p className="text-xs transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                          {new Date(activity.timestamp).toLocaleDateString()} - {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                      No recent activity yet. Start by enrolling in courses or creating a study plan!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}