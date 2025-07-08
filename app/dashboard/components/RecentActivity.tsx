'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTheme } from '@/contexts/theme-context'

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
}

const activityData = [
  {
    title: "AI Model Deployed",
    description: "Sentiment analysis model went live",
    time: "2 hours ago",
    color: "bg-green-500"
  },
  {
    title: "New Project Created",
    description: "Robotics arm control system",
    time: "5 hours ago",
    color: "bg-blue-500"
  },
  {
    title: "Forum Discussion",
    description: "New reply in ML algorithms thread",
    time: "1 day ago",
    color: "bg-purple-500"
  },
  {
    title: "Training Completed",
    description: "Strength training week 4",
    time: "2 days ago",
    color: "bg-yellow-500"
  }
]

export function RecentActivity() {
  const { theme } = useTheme()
  
  return (
    <motion.div variants={itemVariants}>
      <Card className="backdrop-blur-sm border transition-colors duration-300" style={{
        backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
        borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
      }}>
        <CardHeader>
          <CardTitle className="transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
            Recent Activity
          </CardTitle>
          <CardDescription className="transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
            Latest updates across your modules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activityData.map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full ${activity.color} mt-2`}></div>
                <div>
                  <p className="text-sm font-medium transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
                    {activity.title}
                  </p>
                  <p className="text-xs transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                    {activity.description}
                  </p>
                  <p className="text-xs transition-colors duration-300" style={{ color: 'var(--text-secondary)', opacity: 0.8 }}>
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
} 