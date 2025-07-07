'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Plus, ArrowLeft, Target, Loader2 } from 'lucide-react'
import { StudyPlanFilters } from './components/StudyPlanFilters'
import { StudyPlanCard } from './components/StudyPlanCard'

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
  const router = useRouter()
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'personal' | 'semester' | 'yearly'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirectTo=/university/study-plans')
      return
    }

    if (isAuthenticated) {
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
          }
        ])
        setLoading(false)
      }, 1000)
    }
  }, [isAuthenticated, isLoading, router])

  const filteredPlans = studyPlans.filter(plan => {
    const matchesSearch = plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || plan.type === filterType
    return matchesSearch && matchesFilter
  })

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white/60 mx-auto mb-4" />
          <p className="text-white/60">Loading study plans...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
      
      <motion.div className="relative z-10 container mx-auto px-4 py-8" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push('/university')} className="text-white/60 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to University
              </Button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                  Study Plans
                </h1>
                <p className="text-white/60 mt-2">Create and manage your personalized study plans</p>
              </div>
            </div>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              New Plan
            </Button>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-8">
          <StudyPlanFilters searchTerm={searchTerm} filterType={filterType} onSearchChange={setSearchTerm} onFilterChange={setFilterType} />
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-6">
          {filteredPlans.map((plan) => (
            <StudyPlanCard key={plan.id} plan={plan} />
          ))}
        </motion.div>

        {filteredPlans.length === 0 && (
          <motion.div variants={itemVariants} className="text-center py-12">
            <Target className="h-12 w-12 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white/80 mb-2">No study plans found</h3>
            <p className="text-white/60 mb-4">
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