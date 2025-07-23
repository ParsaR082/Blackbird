
'use client'



import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  ChevronLeft,
  BarChart4,
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react'
import BackgroundNodes from '@/components/BackgroundNodes'

interface AnalyticsData {
  enrollmentTrends: {
    month: string
    enrollments: number
  }[]
  coursePerformance: {
    courseName: string
    avgGrade: number
    completionRate: number
  }[]
  departmentStats: {
    department: string
    courses: number
    students: number
    avgGPA: number
  }[]
  recentActivity: {
    type: string
    description: string
    timestamp: string
    count: number
  }[]
}

export default function AdminUniversityAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState('30d')
  const [departmentFilter, setDepartmentFilter] = useState('all')

  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect if user is not admin
    if (!isLoading && (!isAuthenticated || (user && user.role !== 'ADMIN'))) {
      router.push('/admin')
      return
    }
    
    if (isAuthenticated && user?.role === 'ADMIN') {
      fetchAnalytics()
    }
  }, [user, isAuthenticated, isLoading, router, timeRange, departmentFilter])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // For now, we'll use mock data since the analytics API isn't fully implemented
      // In a real implementation, you would fetch from /api/admin/university/analytics
      setTimeout(() => {
        setAnalyticsData({
          enrollmentTrends: [
            { month: 'Jan', enrollments: 120 },
            { month: 'Feb', enrollments: 135 },
            { month: 'Mar', enrollments: 142 },
            { month: 'Apr', enrollments: 158 },
            { month: 'May', enrollments: 165 },
            { month: 'Jun', enrollments: 172 }
          ],
          coursePerformance: [
            { courseName: 'Introduction to Computer Science', avgGrade: 85.2, completionRate: 92 },
            { courseName: 'Advanced Mathematics', avgGrade: 78.5, completionRate: 88 },
            { courseName: 'English Literature', avgGrade: 82.1, completionRate: 95 },
            { courseName: 'Physics Fundamentals', avgGrade: 79.8, completionRate: 87 },
            { courseName: 'Business Management', avgGrade: 86.3, completionRate: 94 }
          ],
          departmentStats: [
            { department: 'Computer Science', courses: 15, students: 245, avgGPA: 3.4 },
            { department: 'Mathematics', courses: 12, students: 180, avgGPA: 3.2 },
            { department: 'English', courses: 10, students: 156, avgGPA: 3.6 },
            { department: 'Physics', courses: 8, students: 98, avgGPA: 3.1 },
            { department: 'Business', courses: 14, students: 203, avgGPA: 3.5 }
          ],
          recentActivity: [
            { type: 'enrollment', description: 'New student enrollments', timestamp: '2 hours ago', count: 12 },
            { type: 'assignment', description: 'Assignment submissions', timestamp: '4 hours ago', count: 45 },
            { type: 'course', description: 'New course created', timestamp: '1 day ago', count: 1 },
            { type: 'grade', description: 'Grades updated', timestamp: '2 days ago', count: 23 }
          ]
        })
        setLoading(false)
      }, 1000)
      
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setError('Failed to load analytics data')
      setLoading(false)
    }
  }

  const exportAnalytics = () => {
    // Implementation for exporting analytics data
    console.log('Exporting analytics data...')
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        <BackgroundNodes isMobile={false} />
        <div className="relative z-10 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-lg">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
      <BackgroundNodes isMobile={false} />
      
      <div className="relative z-10 container mx-auto pt-24 pb-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                className="bg-white/10 hover:bg-white/20"
                onClick={() => router.push('/admin/university')}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                  University Analytics
                </h1>
                <p className="text-white/60 mt-1">Comprehensive insights into academic performance and trends</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={fetchAnalytics}
                variant="outline"
                className="border-white/10 hover:bg-white/10 gap-2"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                onClick={exportAnalytics}
                variant="outline"
                className="border-white/10 hover:bg-white/10 gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex gap-4">
            <div className="w-48">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent className="bg-black/95 border-white/10">
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                  <SelectItem value="1y">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-48">
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent className="bg-black/95 border-white/10">
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="cs">Computer Science</SelectItem>
                  <SelectItem value="math">Mathematics</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="physics">Physics</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-md text-red-200">
            <p>{error}</p>
          </div>
        )}

        {analyticsData && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="mr-2 h-5 w-5 text-blue-400" />
                      Total Enrollments
                    </div>
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">1,247</div>
                  <p className="text-xs text-green-400 mt-1">+12% from last month</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <BookOpen className="mr-2 h-5 w-5 text-green-400" />
                      Active Courses
                    </div>
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">89</div>
                  <p className="text-xs text-green-400 mt-1">+3 new courses</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <BarChart4 className="mr-2 h-5 w-5 text-purple-400" />
                      Average GPA
                    </div>
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">3.42</div>
                  <p className="text-xs text-green-400 mt-1">+0.08 improvement</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-5 w-5 text-amber-400" />
                      Completion Rate
                    </div>
                    <TrendingDown className="h-4 w-4 text-red-400" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">87%</div>
                  <p className="text-xs text-red-400 mt-1">-2% from last month</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts and Data */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Enrollment Trends */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-blue-400" />
                    Enrollment Trends
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Monthly enrollment growth over the last 6 months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {analyticsData.enrollmentTrends.map((trend, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div 
                          className="bg-blue-500/50 rounded-t w-8 transition-all hover:bg-blue-500/70"
                          style={{ height: `${(trend.enrollments / 200) * 200}px` }}
                        />
                        <span className="text-xs text-white/60 mt-2">{trend.month}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Course Performance */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart4 className="mr-2 h-5 w-5 text-green-400" />
                    Course Performance
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Top performing courses by average grade
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.coursePerformance.slice(0, 5).map((course, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{course.courseName}</p>
                          <p className="text-xs text-white/60">{course.completionRate}% completion</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{course.avgGrade}%</p>
                          <Badge className="text-xs" variant="outline">
                            Grade
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Department Statistics */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5 text-purple-400" />
                    Department Overview
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Key metrics by department
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.departmentStats.map((dept, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{dept.department}</p>
                          <p className="text-xs text-white/60">{dept.courses} courses, {dept.students} students</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{dept.avgGPA}</p>
                          <Badge className="text-xs" variant="outline">
                            GPA
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5 text-amber-400" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Latest system activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.description}</p>
                          <p className="text-xs text-white/60">{activity.timestamp}</p>
                        </div>
                        <Badge className="text-xs">
                          {activity.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 