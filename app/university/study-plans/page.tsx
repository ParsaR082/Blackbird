export const dynamic = 'force-dynamic';
export const revalidate = 0;

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { useTheme } from '@/contexts/theme-context'
import { Button } from '@/components/ui/button'
import { Plus, ArrowLeft, Target } from 'lucide-react'
import { StudyPlanFilters } from './components/StudyPlanFilters'
import { StudyPlanCard } from './components/StudyPlanCard'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'
import { ErrorMessage } from '../components/ErrorMessage'
import BackgroundNodes from '@/components/BackgroundNodes'

interface StudyTask {
  id: string
  title: string
  description: string
  completed: boolean
  dueDate?: string
  priority: 'low' | 'medium' | 'high'
}

interface StudyPlan {
  id: string
  title: string
  description: string
  type: 'personal' | 'semester' | 'yearly'
  status: 'active' | 'paused' | 'completed'
  progress: number
  startDate: string
  endDate: string
  tasks: StudyTask[]
  totalTasks: number
  completedTasks: number
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

export default function StudyPlansPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { theme } = useTheme()
  const router = useRouter()
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'personal' | 'semester' | 'yearly'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inlineError, setInlineError] = useState<string | null>(null)

  const fetchStudyPlans = async () => {
    try {
      setLoading(true)
      setError(null)
      setInlineError(null)
      
      // In a real implementation, this would fetch from the API
      const response = await fetch('/api/university/study-plans')
      
      if (!response.ok) {
        throw new Error('Failed to fetch study plans')
      }
      
      // For demonstration, using mock data with timeout
      setTimeout(() => {
        setStudyPlans([
          {
            id: '1', title: 'Data Structures Mastery', description: 'Complete understanding of fundamental data structures',
            type: 'personal', status: 'active', progress: 65, startDate: '2024-01-15', endDate: '2024-03-15',
            totalTasks: 12, completedTasks: 8,
            tasks: [
              { id: '1', title: 'Study Arrays and Lists', description: 'Learn basic data structures', completed: true, priority: 'high' },
              { id: '2', title: 'Practice Stack Problems', description: 'Solve 10 stack problems', completed: true, priority: 'medium' }
            ]
          },
          {
            id: '2', title: 'Spring Semester Roadmap', description: 'Plan for all spring semester courses',
            type: 'semester', status: 'active', progress: 40, startDate: '2024-02-01', endDate: '2024-05-30',
            totalTasks: 20, completedTasks: 8,
            tasks: [
              { id: '3', title: 'Complete Math Assignments', description: 'Finish all calculus homework', completed: false, priority: 'high' },
              { id: '4', title: 'Prepare for Physics Lab', description: 'Review lab instructions', completed: true, priority: 'medium' }
            ]
          }
        ])
        setLoading(false)
      }, 1000)
    } catch (err) {
      console.error('Error fetching study plans:', err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to load study plans')
      }
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirectTo=/university/study-plans')
      return
    }

    if (isAuthenticated) {
      fetchStudyPlans()
    }
  }, [isAuthenticated, isLoading, router])

  const filteredPlans = studyPlans.filter(plan => {
    const matchesSearch = plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || plan.type === filterType
    return matchesSearch && matchesFilter
  })

  // Full page loading
  if (isLoading) {
    return <LoadingState message="Checking authentication..." />
  }

  // Full page error
  if (error) {
    return <ErrorState message={error} onRetry={fetchStudyPlans} />
  }

  if (!isAuthenticated) return null

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
      
      <motion.div className="relative z-10 container mx-auto px-4 py-8 pt-24" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.push('/university')} 
                className="transition-colors duration-300" 
                style={{ color: 'var(--text-secondary)' }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to University
              </Button>
              <div>
                <h1 className="text-4xl font-bold transition-all duration-300" style={{ 
                  background: theme === 'light' 
                    ? 'linear-gradient(to right, #000000, #374151, #6b7280)' 
                    : 'linear-gradient(to right, #ffffff, #e5e7eb, #9ca3af)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Study Plans
                </h1>
                <p className="mt-2 transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                  Create and manage your personalized study plans
                </p>
              </div>
            </div>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              New Plan
            </Button>
          </div>
        </motion.div>

        {/* Inline error message */}
        {inlineError && (
          <motion.div variants={itemVariants}>
            <ErrorMessage 
              message={inlineError} 
              onDismiss={() => setInlineError(null)} 
            />
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="mb-8">
          <StudyPlanFilters searchTerm={searchTerm} filterType={filterType} onSearchChange={setSearchTerm} onFilterChange={setFilterType} />
        </motion.div>

        {loading ? (
          <motion.div variants={itemVariants} className="flex justify-center py-12">
            <div className="text-center">
              <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>Loading study plans...</p>
            </div>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="space-y-6">
            {filteredPlans.map((plan) => (
              <StudyPlanCard key={plan.id} plan={plan} />
            ))}
          </motion.div>
        )}

        {!loading && filteredPlans.length === 0 && (
          <motion.div variants={itemVariants} className="text-center py-12">
            <Target className="h-12 w-12 mx-auto mb-4 transition-colors duration-300" style={{ color: 'var(--text-secondary)' }} />
            <h3 className="text-xl font-semibold mb-2 transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
              No study plans found
            </h3>
            <p className="mb-4 transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
              {searchTerm ? 'Try adjusting your search criteria' : 'Create your first study plan to get started'}
            </p>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Study Plan
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
} 