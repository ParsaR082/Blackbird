export const dynamic = 'force-dynamic';
export const revalidate = 0;

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  GraduationCap,
  BookOpen,
  ClipboardList,
  Calendar,
  Users,
  FileText,
  BarChart4,
  ChevronLeft,
  RefreshCw
} from 'lucide-react'
import BackgroundNodes from '@/components/BackgroundNodes'
import GlobalSearch from './components/GlobalSearch'
import FileManager from './components/FileManager'

export default function AdminUniversityPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalAssignments: 0,
    activeSemesters: 0
  })

  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect if user is not admin
    if (!isLoading && (!isAuthenticated || (user && user.role !== 'ADMIN'))) {
      router.push('/admin')
      return
    }
    
    if (isAuthenticated && user?.role === 'ADMIN') {
      fetchStats()
    }
  }, [user, isAuthenticated, isLoading, router])

  // Auto-refresh stats every 30 seconds
  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      const interval = setInterval(() => {
        fetchStats()
      }, 30000) // 30 seconds

      return () => clearInterval(interval)
    }
  }, [isAuthenticated, user?.role])

  const fetchStats = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/admin/university/stats')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setStats({
          totalCourses: data.stats.totalCourses,
          totalStudents: data.stats.totalStudents,
          totalAssignments: data.stats.totalAssignments,
          activeSemesters: data.stats.activeSemesters
        })
      } else {
        throw new Error(data.error || 'Failed to fetch university statistics')
      }
    } catch (error) {
      console.error('Error fetching university stats:', error)
      // Fallback to default stats if API fails
      setStats({
        totalCourses: 0,
        totalStudents: 0,
        totalAssignments: 0,
        activeSemesters: 0
      })
    } finally {
      setLoading(false)
    }
  }

  // If loading, show loading state
  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        <BackgroundNodes isMobile={false} />
        <div className="relative z-10 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-lg">Loading university dashboard...</p>
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
                onClick={() => router.push('/admin')}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                  University Administration
                </h1>
                <p className="text-white/60 mt-1">Manage courses, assignments, and academic records</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={fetchStats}
                variant="outline"
                className="border-white/10 hover:bg-white/10 gap-2"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                onClick={() => router.push('/admin/university/courses?action=create')}
                className="gap-2"
              >
                <BookOpen className="w-4 h-4" />
                New Course
              </Button>
              <Button 
                onClick={() => router.push('/admin/university/assignments?action=create')}
                variant="outline"
                className="border-white/10 hover:bg-white/10 gap-2"
              >
                <ClipboardList className="w-4 h-4" />
                New Assignment
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card 
            className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
            onClick={() => router.push('/admin/university/courses')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5 text-blue-400" />
                  Courses
                </div>
                <div className="flex items-center text-green-400 text-sm">
                  <span className="text-xs">+2</span>
                  <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalCourses}</div>
              <p className="text-xs text-white/60 mt-1">
                Active courses across all departments
              </p>
            </CardContent>
          </Card>
          
          <Card 
            className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
            onClick={() => router.push('/admin/university/students')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="mr-2 h-5 w-5 text-indigo-400" />
                  Students
                </div>
                <div className="flex items-center text-green-400 text-sm">
                  <span className="text-xs">+12</span>
                  <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-white/60 mt-1">
                Enrolled students this semester
              </p>
            </CardContent>
          </Card>
          
          <Card 
            className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
            onClick={() => router.push('/admin/university/assignments')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center">
                  <ClipboardList className="mr-2 h-5 w-5 text-amber-400" />
                  Assignments
                </div>
                <div className="flex items-center text-green-400 text-sm">
                  <span className="text-xs">+5</span>
                  <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalAssignments}</div>
              <p className="text-xs text-white/60 mt-1">
                Active assignments across all courses
              </p>
            </CardContent>
          </Card>
          
          <Card 
            className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
            onClick={() => router.push('/admin/university/semesters')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-green-400" />
                  Semesters
                </div>
                <div className="flex items-center text-blue-400 text-sm">
                  <span className="text-xs">Active</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full ml-1"></div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.activeSemesters}</div>
              <p className="text-xs text-white/60 mt-1">
                Currently active academic semesters
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Global Search */}
        <div className="mb-6">
          <GlobalSearch />
        </div>

        {/* Main Content with Tabs */}
        <Tabs 
          defaultValue={activeTab} 
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid grid-cols-2 md:grid-cols-6 w-full max-w-4xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="semesters">Semesters</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {/* Quick Actions */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart4 className="mr-2 h-5 w-5 text-purple-400" />
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-white/60">
                  Common administrative tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    variant="outline" 
                    className="border-white/10 hover:bg-white/10 h-20 flex flex-col gap-2"
                    onClick={() => router.push('/admin/university/courses?action=create')}
                  >
                    <BookOpen className="w-6 h-6 text-blue-400" />
                    <span className="text-sm">New Course</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="border-white/10 hover:bg-white/10 h-20 flex flex-col gap-2"
                    onClick={() => router.push('/admin/university/assignments?action=create')}
                  >
                    <ClipboardList className="w-6 h-6 text-amber-400" />
                    <span className="text-sm">New Assignment</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="border-white/10 hover:bg-white/10 h-20 flex flex-col gap-2"
                    onClick={() => router.push('/admin/university/semesters?action=create')}
                  >
                    <Calendar className="w-6 h-6 text-green-400" />
                    <span className="text-sm">New Semester</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="border-white/10 hover:bg-white/10 h-20 flex flex-col gap-2"
                    onClick={() => router.push('/admin/university/students')}
                  >
                    <Users className="w-6 h-6 text-indigo-400" />
                    <span className="text-sm">View Students</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="mr-2 h-5 w-5 text-blue-400" />
                    Course Management
                  </CardTitle>
                  <CardDescription className="text-white/60">Manage university courses and enrollment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-white/70">Create, edit, and manage courses across all departments. Control course availability, prerequisites, and enrollment limits.</p>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full border-white/10 hover:bg-white/10"
                    onClick={() => router.push('/admin/university/courses')}
                  >
                    Manage Courses
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ClipboardList className="mr-2 h-5 w-5 text-amber-400" />
                    Assignment Management
                  </CardTitle>
                  <CardDescription className="text-white/60">Create and manage course assignments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-white/70">Create assignments, quizzes, and projects for courses. Set due dates, points, and track student submissions.</p>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full border-white/10 hover:bg-white/10"
                    onClick={() => router.push('/admin/university/assignments')}
                  >
                    Manage Assignments
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5 text-green-400" />
                    Semester Management
                  </CardTitle>
                  <CardDescription className="text-white/60">Manage academic calendar and semesters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-white/70">Create and manage academic semesters, set registration deadlines, and control enrollment periods.</p>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full border-white/10 hover:bg-white/10"
                    onClick={() => router.push('/admin/university/semesters')}
                  >
                    Manage Semesters
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart4 className="mr-2 h-5 w-5 text-purple-400" />
                    Academic Analytics
                  </CardTitle>
                  <CardDescription className="text-white/60">View enrollment and performance data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-white/70">Access analytics on student enrollment, course performance, and assignment completion rates.</p>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full border-white/10 hover:bg-white/10"
                    onClick={() => router.push('/admin/university/analytics')}
                  >
                    View Analytics
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="courses" className="space-y-4">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle>Course Management</CardTitle>
                <CardDescription className="text-white/60">
                  Manage all university courses from this dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Button 
                    onClick={() => router.push('/admin/university/courses')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Go to Course Management
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="assignments" className="space-y-4">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle>Assignment Management</CardTitle>
                <CardDescription className="text-white/60">
                  Create and manage assignments for all courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Button 
                    onClick={() => router.push('/admin/university/assignments')}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    Go to Assignment Management
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="semesters" className="space-y-4">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle>Semester Management</CardTitle>
                <CardDescription className="text-white/60">
                  Manage academic semesters and enrollment periods
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="mb-4 text-white/70">Semester management functionality will be implemented soon.</p>
                  <Button 
                    variant="outline"
                    className="border-white/10 hover:bg-white/10"
                    disabled
                  >
                    Coming Soon
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="files" className="space-y-4">
            <FileManager />
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle>Academic Analytics</CardTitle>
                <CardDescription className="text-white/60">
                  Comprehensive insights into academic performance and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart4 className="w-16 h-16 mx-auto text-purple-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Advanced Analytics Dashboard</h3>
                  <p className="text-white/70 mb-6">
                    View detailed analytics including enrollment trends, course performance, 
                    department statistics, and recent activity.
                  </p>
                  <Button 
                    onClick={() => router.push('/admin/university/analytics')}
                    className="bg-purple-600 hover:bg-purple-700 gap-2"
                  >
                    <BarChart4 className="w-4 h-4" />
                    Open Analytics Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 