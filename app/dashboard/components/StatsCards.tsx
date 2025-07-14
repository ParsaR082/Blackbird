'use client'

import { motion } from 'framer-motion'
import { Calendar, Award, ShoppingBag, GraduationCap } from 'lucide-react'
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
    title: "Upcoming Events",
    value: "8",
    change: "3 this week",
    icon: Calendar,
    color: "text-purple-400",
    path: "/events"
  },
  {
    title: "Hall of Fame",
    value: "24",
    change: "2 new inductees",
    icon: Award,
    color: "text-amber-400",
    path: "/hall-of-fame"
  },
  {
    title: "Products",
    value: "16",
    change: "4 new releases",
    icon: ShoppingBag,
    color: "text-blue-400",
    path: "/product-playground"
  },
  {
    title: "Courses",
    value: "12",
    change: "Fall semester open",
    icon: GraduationCap,
    color: "text-green-400",
    path: "/university/courses"
  }
]

export function StatsCards() {
  const { theme } = useTheme()
  
  return (
    <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => (
        <Card 
          key={index} 
          className="backdrop-blur-sm border transition-colors duration-300 cursor-pointer hover:shadow-md"
          style={{
            backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
            borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
          }}
          onClick={() => window.location.href = stat.path}
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