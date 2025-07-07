'use client'

import { CheckCircle, Clock } from 'lucide-react'

interface StudyTask {
  id: string
  title: string
  description: string
  completed: boolean
  dueDate?: string
  priority: 'low' | 'medium' | 'high'
}

interface StudyTaskItemProps {
  task: StudyTask
}

export function StudyTaskItem({ task }: StudyTaskItemProps) {
  const getPriorityColor = (priority: StudyTask['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-green-400'
      default: return 'text-white/60'
    }
  }

  return (
    <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
      <div className={`w-2 h-2 rounded-full ${task.completed ? 'bg-green-400' : 'bg-gray-400'}`} />
      <div className="flex-1">
        <p className={`text-sm ${task.completed ? 'text-white/60 line-through' : 'text-white/80'}`}>
          {task.title}
        </p>
        {task.dueDate && !task.completed && (
          <p className="text-xs text-orange-400 flex items-center mt-1">
            <Clock className="h-3 w-3 mr-1" />
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </p>
        )}
      </div>
      <div className={`text-xs px-2 py-1 rounded ${getPriorityColor(task.priority)} bg-white/5`}>
        {task.priority}
      </div>
      {task.completed && <CheckCircle className="h-4 w-4 text-green-400" />}
    </div>
  )
} 