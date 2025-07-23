export const dynamic = 'force-dynamic';
export const revalidate = 0;

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  Calendar, 
  Award, 
  Target,
  BookOpen,
  Clock,
  BarChart3,
  PieChart,
  Loader2,
  ArrowLeft,
  Star,
  CheckCircle
} from 'lucide-react'

interface ProgressData {
  overallGPA: number
  completedCredits: number
  totalCredits: number
  currentSemester: string
  academicYear: string
  expectedGraduation: string
}

interface CourseProgress {
  id: string
  title: string
  code: string
  credits: number
  grade?: string
  progress: number
  status: 'in-progress' | 'completed' | 'planned'
}

interface SemesterData {
  semester: string
  year: string
  gpa: number
  credits: number
  courses: CourseProgress[]
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

export default function ProgressPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [progressData, setProgressData] = useState<ProgressData | null>(null)
  const [semesterData, setSemesterData] = useState<SemesterData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirectTo=/university/progress')
      return
    }

    if (isAuthenticated) {
      // Simulate loading progress data
      setTimeout(() => {
        setProgressData({
          overallGPA: 3.75,
          completedCredits: 90,
          totalCredits: 120,
          currentSemester: 'Fall 2024',
          academicYear: '2024-2025',
          expectedGraduation: 'May 2025'
        })

        setSemesterData([
          {
            semester: 'Fall',
            year: '2024',
            gpa: 3.8,
            credits: 15,
            courses: [
              { id: '1', title: 'Data Structures', code: 'CS301', credits: 4, progress: 75, status: 'in-progress' },
              { id: '2', title: 'Machine Learning', code: 'CS401', credits: 3, progress: 45, status: 'in-progress' },
              { id: '3', title: 'Computer Networks', code: 'CS403', credits: 3, progress: 20, status: 'in-progress' },
              { id: '4', title: 'Web Development', code: 'CS250', credits: 3, progress: 90, status: 'in-progress' },
              { id: '5', title: 'Ethics in CS', code: 'CS101', credits: 2, progress: 60, status: 'in-progress' }
            ]
          },
          {
            semester: 'Spring',
            year: '2024',
            gpa: 3.9,
            credits: 18,
            courses: [
              { id: '6', title: 'Database Systems', code: 'CS305', credits: 3, grade: 'A', progress: 100, status: 'completed' },
              { id: '7', title: 'Software Engineering', code: 'CS302', credits: 4, grade: 'A-', progress: 100, status: 'completed' },
              { id: '8', title: 'Operating Systems', code: 'CS304', credits: 4, grade: 'B+', progress: 100, status: 'completed' },
              { id: '9', title: 'Statistics', code: 'MATH201', credits: 3, grade: 'A', progress: 100, status: 'completed' },
              { id: '10', title: 'Technical Writing', code: 'ENG205', credits: 2, grade: 'A', progress: 100, status: 'completed' },
              { id: '11', title: 'Linear Algebra', code: 'MATH301', credits: 2, grade: 'B', progress: 100, status: 'completed' }
            ]
          },
          {
            semester: 'Fall',
            year: '2023',
            gpa: 3.6,
            credits: 16,
            courses: [
              { id: '12', title: 'Intro to Programming', code: 'CS101', credits: 4, grade: 'A', progress: 100, status: 'completed' },
              { id: '13', title: 'Calculus I', code: 'MATH101', credits: 4, grade: 'B+', progress: 100, status: 'completed' },
              { id: '14', title: 'Physics I', code: 'PHYS101', credits: 4, grade: 'B', progress: 100, status: 'completed' },
              { id: '15', title: 'English Composition', code: 'ENG101', credits: 3, grade: 'A-', progress: 100, status: 'completed' },
              { id: '16', title: 'History', code: 'HIST101', credits: 1, grade: 'A', progress: 100, status: 'completed' }
            ]
          }
        ])
        setLoading(false)
      }, 1000)
    }
  }, [isAuthenticated, isLoading, router])

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-400'
    if (grade.startsWith('B')) return 'text-blue-400'
    if (grade.startsWith('C')) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getStatusBadge = (status: CourseProgress['status']) => {
    switch (status) {
      case 'in-progress':
        return <Badge variant="default" className="bg-blue-500/20 text-blue-400 border-blue-500/30">In Progress</Badge>
      case 'completed':
        return <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">Completed</Badge>
      case 'planned':
        return <Badge variant="default" className="bg-gray-500/20 text-gray-400 border-gray-500/30">Planned</Badge>
      default:
        return null
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white/60 mx-auto mb-4" />
          <p className="text-white/60">Loading progress data...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !progressData) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
      
      <motion.div 
        className="relative z-10 container mx-auto px-4 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/university')}
                className="text-white/60 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to University
              </Button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                  Academic Progress
                </h1>
                <p className="text-white/60 mt-2">
                  Track your academic journey and achievements
                </p>
              </div>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <TrendingUp className="h-12 w-12 text-white/40" />
            </motion.div>
          </div>
        </motion.div>

        {/* Overview Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Overall GPA</CardTitle>
              <Award className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{progressData.overallGPA}</div>
              <p className="text-xs text-white/60">Out of 4.0</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Credits Progress</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{progressData.completedCredits}/{progressData.totalCredits}</div>
              <Progress value={(progressData.completedCredits / progressData.totalCredits) * 100} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Current Semester</CardTitle>
              <Calendar className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{progressData.currentSemester}</div>
              <p className="text-xs text-white/60">{progressData.academicYear}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Expected Graduation</CardTitle>
              <Target className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{progressData.expectedGraduation}</div>
              <p className="text-xs text-white/60">On track</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Semester Progress */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Semester Progress</CardTitle>
              <CardDescription className="text-white/60">
                Detailed breakdown by semester
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="current" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-white/5">
                  <TabsTrigger value="current">Current</TabsTrigger>
                  <TabsTrigger value="previous">Previous</TabsTrigger>
                  <TabsTrigger value="all">All Semesters</TabsTrigger>
                </TabsList>
                
                <TabsContent value="current" className="space-y-4 mt-6">
                  {semesterData.slice(0, 1).map((semester) => (
                    <div key={`${semester.semester}-${semester.year}`} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">
                          {semester.semester} {semester.year}
                        </h3>
                        <div className="flex items-center space-x-4">
                          <Badge variant="outline" className="text-white/80">
                            GPA: {semester.gpa}
                          </Badge>
                          <Badge variant="outline" className="text-white/80">
                            Credits: {semester.credits}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {semester.courses.map((course) => (
                          <Card key={course.id} className="bg-white/5 border-white/10">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-medium text-white">{course.title}</h4>
                                  <p className="text-sm text-white/60">{course.code} • {course.credits} credits</p>
                                </div>
                                {getStatusBadge(course.status)}
                              </div>
                              {course.status === 'completed' && course.grade && (
                                <div className="flex items-center mb-2">
                                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                                  <span className={`font-medium ${getGradeColor(course.grade)}`}>
                                    Grade: {course.grade}
                                  </span>
                                </div>
                              )}
                              {course.status === 'in-progress' && (
                                <div>
                                  <div className="flex items-center justify-between text-sm text-white/60 mb-1">
                                    <span>Progress</span>
                                    <span>{course.progress}%</span>
                                  </div>
                                  <Progress value={course.progress} className="h-2" />
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="previous" className="space-y-6 mt-6">
                  {semesterData.slice(1, 2).map((semester) => (
                    <div key={`${semester.semester}-${semester.year}`} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">
                          {semester.semester} {semester.year}
                        </h3>
                        <div className="flex items-center space-x-4">
                          <Badge variant="outline" className="text-white/80">
                            GPA: {semester.gpa}
                          </Badge>
                          <Badge variant="outline" className="text-white/80">
                            Credits: {semester.credits}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {semester.courses.map((course) => (
                          <Card key={course.id} className="bg-white/5 border-white/10">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-medium text-white">{course.title}</h4>
                                  <p className="text-sm text-white/60">{course.code} • {course.credits} credits</p>
                                </div>
                                {getStatusBadge(course.status)}
                              </div>
                              {course.grade && (
                                <div className="flex items-center">
                                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                                  <span className={`font-medium ${getGradeColor(course.grade)}`}>
                                    Grade: {course.grade}
                                  </span>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="all" className="space-y-6 mt-6">
                  {semesterData.map((semester) => (
                    <div key={`${semester.semester}-${semester.year}`} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">
                          {semester.semester} {semester.year}
                        </h3>
                        <div className="flex items-center space-x-4">
                          <Badge variant="outline" className="text-white/80">
                            GPA: {semester.gpa}
                          </Badge>
                          <Badge variant="outline" className="text-white/80">
                            Credits: {semester.credits}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {semester.courses.map((course) => (
                          <Card key={course.id} className="bg-white/5 border-white/10">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-medium text-white">{course.title}</h4>
                                  <p className="text-sm text-white/60">{course.code} • {course.credits} credits</p>
                                </div>
                                {getStatusBadge(course.status)}
                              </div>
                              {course.grade && (
                                <div className="flex items-center">
                                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                                  <span className={`font-medium ${getGradeColor(course.grade)}`}>
                                    Grade: {course.grade}
                                  </span>
                                </div>
                              )}
                              {course.status === 'in-progress' && (
                                <div className="mt-2">
                                  <div className="flex items-center justify-between text-sm text-white/60 mb-1">
                                    <span>Progress</span>
                                    <span>{course.progress}%</span>
                                  </div>
                                  <Progress value={course.progress} className="h-2" />
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* GPA Trend Chart Placeholder */}
        <motion.div variants={itemVariants} className="mt-8">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                GPA Trend
              </CardTitle>
              <CardDescription className="text-white/60">
                Your academic performance over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-white/40">
                <div className="text-center">
                  <PieChart className="h-12 w-12 mx-auto mb-4" />
                  <p>Chart visualization coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}