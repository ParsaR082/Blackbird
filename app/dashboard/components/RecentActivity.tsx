'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTheme } from '@/contexts/theme-context'
import { useRouter } from 'next/navigation'

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
    title: "Registered for Workshop",
    description: "Neural Network Workshop",
    time: "2 hours ago",
    color: "bg-purple-500",
    system: "Events",
    path: "/events"
  },
  {
    title: "New Hall of Fame Inductee",
    description: "Dr. Jane Smith recognized for AI research",
    time: "1 day ago",
    color: "bg-amber-500",
    system: "Hall of Fame",
    path: "/hall-of-fame"
  },
  {
    title: "Product Purchase",
    description: "AI Development Kit - Order #A12345",
    time: "3 days ago",
    color: "bg-blue-500",
    system: "Product Playground",
    path: "/product-playground"
  },
  {
    title: "Course Enrollment",
    description: "Machine Learning Fundamentals",
    time: "1 week ago",
    color: "bg-green-500",
    system: "University",
    path: "/university/courses"
  }
]

export function RecentActivity() {
  const { theme } = useTheme()
  const router = useRouter()
  
  const handleNavigate = (path: string) => {
    router.push(path)
  }
  
  return (
    <motion.div variants={itemVariants}>
      <Card className="backdrop-blur-sm border transition-colors duration-300" style={{
        backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
        borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
      }}>
        <CardHeader>
          <CardTitle className="transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
            Your Activity
          </CardTitle>
          <CardDescription className="transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
            Your recent interactions across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activityData.map((activity, index) => (
              <div 
                key={index} 
                className="flex items-start gap-3 p-2 rounded-md cursor-pointer transition-all duration-200"
                style={{
                  backgroundColor: 'transparent'
                }}
                onClick={() => handleNavigate(activity.path)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <div className={`w-2 h-2 rounded-full ${activity.color} mt-2`}></div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
                      {activity.title}
                    </p>
                    <span className="text-xs opacity-70">• {activity.system}</span>
                  </div>
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