'use client'

import { motion } from 'framer-motion'
import { Activity, TrendingUp, Users, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTheme } from '@/contexts/theme-context'

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
}

const statsData = [
  {
    title: "Active Projects",
    value: "12",
    change: "+2 from last month",
    icon: Activity,
    color: "text-blue-400"
  },
  {
    title: "Modules Used",
    value: "7",
    change: "Out of 9 available",
    icon: TrendingUp,
    color: "text-green-400"
  },
  {
    title: "Collaborators",
    value: "24",
    change: "+3 new this week",
    icon: Users,
    color: "text-purple-400"
  },
  {
    title: "Hours This Week",
    value: "42",
    change: "+8% from last week",
    icon: Clock,
    color: "text-orange-400"
  }
]

export function StatsCards() {
  const { theme } = useTheme()
  
  return (
    <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => (
        <Card 
          key={index} 
          className="backdrop-blur-sm border transition-colors duration-300"
          style={{
            backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
            borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
              {stat.value}
            </div>
            <p className="text-xs transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
              {stat.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </motion.div>
  )
} 