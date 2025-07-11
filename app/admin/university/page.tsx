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
  BarChart4
} from 'lucide-react'
import BackgroundNodes from '@/components/BackgroundNodes'

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

  const fetchStats = async () => {
    try {
      // Simulate fetching stats
      // In a real application, you would fetch this data from your API
      setTimeout(() => {
        setStats({
          totalCourses: 12,
          totalStudents: 86,
          totalAssignments: 24,
          activeSemesters: 2
        })
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error('Error fetching university stats:', error)
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">University Administration</h1>
          <p className="text-muted-foreground mt-1">Manage courses, assignments, and academic records</p>
        </div>
        
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button 
            onClick={() => router.push('/admin/university/courses?action=create')}
            className="bg-green-600 hover:bg-green-700"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            New Course
          </Button>
          <Button 
            onClick={() => router.push('/admin/university/assignments?action=create')}
            variant="outline"
            className="border-white/10 hover:bg-white/10"
          >
            <ClipboardList className="mr-2 h-4 w-4" />
            New Assignment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <BookOpen className="mr-2 h-5 w-5 text-blue-400" />
              Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active courses across all departments
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Users className="mr-2 h-5 w-5 text-indigo-400" />
              Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Enrolled students this semester
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <ClipboardList className="mr-2 h-5 w-5 text-amber-400" />
              Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalAssignments}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active assignments across all courses
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-green-400" />
              Semesters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeSemesters}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently active academic semesters
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content with Tabs */}
      <Tabs 
        defaultValue={activeTab} 
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="semesters">Semesters</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5 text-blue-400" />
                  Course Management
                </CardTitle>
                <CardDescription>Manage university courses and enrollment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>Create, edit, and manage courses across all departments. Control course availability, prerequisites, and enrollment limits.</p>
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
                <CardDescription>Create and manage course assignments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>Create assignments, quizzes, and projects for courses. Set due dates, points, and track student submissions.</p>
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
                <CardDescription>Manage academic calendar and semesters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>Create and manage academic semesters, set registration deadlines, and control enrollment periods.</p>
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
                <CardDescription>View enrollment and performance data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>Access analytics on student enrollment, course performance, and assignment completion rates.</p>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full border-white/10 hover:bg-white/10"
                  onClick={() => router.push('/admin/analytics?section=university')}
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
              <CardDescription>
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
              <CardDescription>
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
              <CardDescription>
                Manage academic semesters and enrollment periods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="mb-4">Semester management functionality will be implemented soon.</p>
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
      </Tabs>
    </div>
  )
} 