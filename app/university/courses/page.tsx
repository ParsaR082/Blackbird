'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Users,
  Search,
  Filter,
  Plus,
  Star,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft
} from 'lucide-react'

interface Course {
  id: string
  title: string
  code: string
  instructor: string
  credits: number
  progress: number
  status: 'enrolled' | 'completed' | 'dropped'
  grade?: string
  nextDeadline?: string
  description: string
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

export default function CoursesPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'enrolled' | 'completed'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirectTo=/university/courses')
      return
    }

    if (isAuthenticated) {
      // Simulate loading courses data
      setTimeout(() => {
        setCourses([
          {
            id: '1',
            title: 'Data Structures and Algorithms',
            code: 'CS301',
            instructor: 'Dr. Sarah Johnson',
            credits: 4,
            progress: 75,
            status: 'enrolled',
            nextDeadline: '2024-02-15',
            description: 'Advanced data structures and algorithmic problem solving'
          },
          {
            id: '2',
            title: 'Machine Learning Fundamentals',
            code: 'CS401',
            instructor: 'Prof. Michael Chen',
            credits: 3,
            progress: 45,
            status: 'enrolled',
            nextDeadline: '2024-02-20',
            description: 'Introduction to machine learning concepts and applications'
          },
          {
            id: '3',
            title: 'Database Systems',
            code: 'CS305',
            instructor: 'Dr. Emily Davis',
            credits: 3,
            progress: 100,
            status: 'completed',
            grade: 'A',
            description: 'Relational databases, SQL, and database design principles'
          },
          {
            id: '4',
            title: 'Software Engineering',
            code: 'CS302',
            instructor: 'Prof. Robert Wilson',
            credits: 4,
            progress: 100,
            status: 'completed',
            grade: 'A-',
            description: 'Software development lifecycle and engineering practices'
          },
          {
            id: '5',
            title: 'Computer Networks',
            code: 'CS403',
            instructor: 'Dr. Lisa Anderson',
            credits: 3,
            progress: 20,
            status: 'enrolled',
            nextDeadline: '2024-02-25',
            description: 'Network protocols, architecture, and distributed systems'
          },
          {
            id: '6',
            title: 'Web Development',
            code: 'CS250',
            instructor: 'Prof. James Taylor',
            credits: 3,
            progress: 90,
            status: 'enrolled',
            nextDeadline: '2024-02-18',
            description: 'Full-stack web development with modern frameworks'
          }
        ])
        setLoading(false)
      }, 1000)
    }
  }, [isAuthenticated, isLoading, router])

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || course.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusBadge = (status: Course['status']) => {
    switch (status) {
      case 'enrolled':
        return <Badge variant="default" className="bg-blue-500/20 text-blue-400 border-blue-500/30">Enrolled</Badge>
      case 'completed':
        return <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">Completed</Badge>
      case 'dropped':
        return <Badge variant="default" className="bg-red-500/20 text-red-400 border-red-500/30">Dropped</Badge>
      default:
        return null
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white/60 mx-auto mb-4" />
          <p className="text-white/60">Loading courses...</p>
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
                  My Courses
                </h1>
                <p className="text-white/60 mt-2">
                  Manage your enrolled courses and track progress
                </p>
              </div>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Enroll Course
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div variants={itemVariants} className="mb-8">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                  <Input
                    placeholder="Search courses, codes, or instructors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant={filterStatus === 'all' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setFilterStatus('all')}
                    className="text-white/80"
                  >
                    All
                  </Button>
                  <Button
                    variant={filterStatus === 'enrolled' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setFilterStatus('enrolled')}
                    className="text-white/80"
                  >
                    Enrolled
                  </Button>
                  <Button
                    variant={filterStatus === 'completed' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setFilterStatus('completed')}
                    className="text-white/80"
                  >
                    Completed
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Courses Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="h-full"
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 h-full flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg">{course.title}</CardTitle>
                      <CardDescription className="text-white/60 mt-1">
                        {course.code} • {course.credits} credits
                      </CardDescription>
                    </div>
                    {getStatusBadge(course.status)}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-white/70 text-sm mb-4">{course.description}</p>
                    <div className="flex items-center text-white/60 text-sm mb-4">
                      <Users className="h-4 w-4 mr-2" />
                      {course.instructor}
                    </div>
                    
                    {course.status !== 'completed' && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm text-white/60 mb-2">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                    )}

                    {course.grade && (
                      <div className="flex items-center mb-4">
                        <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                        <span className="text-white/80">Grade: {course.grade}</span>
                      </div>
                    )}

                    {course.nextDeadline && (
                      <div className="flex items-center text-orange-400 text-sm">
                        <Clock className="h-4 w-4 mr-2" />
                        Next deadline: {new Date(course.nextDeadline).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10">
                    <Button variant="ghost" className="w-full text-white/80 hover:text-white hover:bg-white/10">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {filteredCourses.length === 0 && (
          <motion.div variants={itemVariants} className="text-center py-12">
            <BookOpen className="h-12 w-12 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white/80 mb-2">No courses found</h3>
            <p className="text-white/60">
              {searchTerm ? 'Try adjusting your search criteria' : 'Start by enrolling in your first course'}
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}