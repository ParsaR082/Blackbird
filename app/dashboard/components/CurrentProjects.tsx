'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTheme } from '@/contexts/theme-context'

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
}

const projects = [
  {
    title: "Natural Language Processing Pipeline",
    description: "Building a comprehensive NLP system for document analysis",
    icon: "AI",
    gradient: "bg-gradient-to-br from-purple-500 to-pink-500",
    status: "In Progress",
    statusColor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
  },
  {
    title: "Autonomous Navigation Robot",
    description: "Developing computer vision and path planning algorithms",
    icon: "RO",
    gradient: "bg-gradient-to-br from-blue-500 to-cyan-500",
    status: "Planning",
    statusColor: "bg-blue-500/20 text-blue-400 border-blue-500/50"
  }
]

export function CurrentProjects() {
  const { theme } = useTheme()
  
  return (
    <motion.div variants={itemVariants} className="mt-6">
      <Card className="backdrop-blur-sm border transition-colors duration-300" style={{
        backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
        borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
      }}>
        <CardHeader>
          <CardTitle className="transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
            Current Projects
          </CardTitle>
          <CardDescription className="transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
            Projects you&apos;re actively working on
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projects.map((project, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-4 border rounded-lg transition-all duration-300"
                style={{
                  borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${project.gradient} text-white`}>
                    <div className="w-4 h-4 font-bold text-xs flex items-center justify-center">
                      {project.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
                      {project.title}
                    </h3>
                    <p className="text-sm transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                      {project.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={project.statusColor}>
                    {project.status}
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="transition-colors duration-300"
                    style={{
                      color: 'var(--text-color)',
                      borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    {project.status === 'In Progress' ? 'Continue' : 'View'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
} 