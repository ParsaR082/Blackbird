'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Target, Edit, Play, Pause, Trash2 } from 'lucide-react'
import { StudyTaskItem } from './StudyTaskItem'

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

interface StudyPlanCardProps {
  plan: StudyPlan
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

export function StudyPlanCard({ plan }: StudyPlanCardProps) {
  const getStatusBadge = (status: StudyPlan['status']) => {
    const variants = {
      active: 'bg-green-500/20 text-green-400 border-green-500/30',
      paused: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    }
    return <Badge variant="default" className={variants[status]}>{status}</Badge>
  }

  const getTypeBadge = (type: StudyPlan['type']) => {
    const variants = {
      personal: 'text-purple-400 border-purple-500/30',
      semester: 'text-blue-400 border-blue-500/30',
      yearly: 'text-orange-400 border-orange-500/30'
    }
    return <Badge variant="outline" className={variants[type]}>{type}</Badge>
  }

  return (
    <motion.div variants={itemVariants} whileHover={{ scale: 1.01 }}>
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <CardTitle className="text-white text-xl">{plan.title}</CardTitle>
                {getTypeBadge(plan.type)}
                {getStatusBadge(plan.status)}
              </div>
              <CardDescription className="text-white/60">{plan.description}</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                {plan.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" className="text-white/60 hover:text-red-400">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-white/60">
                  <span>Progress</span>
                  <span>{plan.progress}%</span>
                </div>
                <Progress value={plan.progress} className="h-2" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-white/60">Tasks</p>
                <p className="text-white font-medium">{plan.completedTasks}/{plan.totalTasks} completed</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-white/60">Duration</p>
                <p className="text-white font-medium">
                  {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div>
              <h4 className="text-white font-medium mb-3 flex items-center">
                <Target className="h-4 w-4 mr-2" />
                Recent Tasks
              </h4>
              <div className="space-y-2">
                {plan.tasks.slice(0, 3).map((task) => (
                  <StudyTaskItem key={task.id} task={task} />
                ))}
                {plan.tasks.length > 3 && (
                  <Button variant="ghost" size="sm" className="w-full text-white/60 hover:text-white">
                    View all {plan.tasks.length} tasks
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
} 