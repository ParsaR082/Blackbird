'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

const quickAccessModules = [
  {
    id: 'events',
    title: 'Events',
    description: 'Browse and register for tech events',
    gradient: 'bg-gradient-to-br from-purple-500 to-pink-500',
    icon: 'EV',
    path: '/events'
  },
  {
    id: 'hall-of-fame',
    title: 'Hall of Fame',
    description: 'Explore exceptional achievements',
    gradient: 'bg-gradient-to-br from-amber-500 to-yellow-500',
    icon: 'HF',
    path: '/hall-of-fame'
  },
  {
    id: 'product-playground',
    title: 'Product Playground',
    description: 'Discover and purchase products',
    gradient: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    icon: 'PP',
    path: '/product-playground'
  },
  {
    id: 'university',
    title: 'University',
    description: 'Courses, study plans, and progress',
    gradient: 'bg-gradient-to-br from-green-500 to-emerald-500',
    icon: 'UN',
    path: '/university'
  }
]

export function QuickAccess() {
  const { theme } = useTheme()
  const router = useRouter()
  
  const handleNavigate = (path: string) => {
    router.push(path)
  }
  
  return (
    <motion.div variants={itemVariants} className="lg:col-span-2">
      <Card className="backdrop-blur-sm border transition-colors duration-300" style={{
        backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
        borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
      }}>
        <CardHeader>
          <CardTitle className="transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
            Quick Access
          </CardTitle>
          <CardDescription className="transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
            Jump into your most used modules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickAccessModules.map((module) => (
              <div 
                key={module.id} 
                className="flex items-center justify-between p-4 border rounded-lg transition-all duration-300 hover:shadow-md cursor-pointer"
                style={{
                  borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                  backgroundColor: 'transparent'
                }}
                onClick={() => handleNavigate(module.path)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${module.gradient} text-white`}>
                    <div className="w-4 h-4 font-bold text-xs flex items-center justify-center">
                      {module.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
                      {module.title}
                    </h3>
                    <p className="text-sm transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                      {module.description}
                    </p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="transition-colors duration-300"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--text-color)'
                    e.currentTarget.style.backgroundColor = theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-secondary)'
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
} 