'use client'

import { motion } from 'framer-motion'
import { Camera, Shield } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useTheme } from '@/contexts/theme-context'

interface UserProfile {
  fullName: string
  email: string
  avatarUrl?: string
  role: string
  isVerified: boolean
}

interface ProfileOverviewProps {
  profile: UserProfile
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
}

export function ProfileOverview({ profile }: ProfileOverviewProps) {
  const { theme } = useTheme()
  
  return (
    <motion.div variants={itemVariants} className="lg:col-span-1">
      <Card className="backdrop-blur-sm border transition-colors duration-300" style={{
        backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
        borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
      }}>
        <CardHeader>
          <CardTitle className="transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
            Profile Overview
          </CardTitle>
          <CardDescription className="transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
            Your account information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatarUrl} />
                <AvatarFallback className="text-lg transition-colors duration-300" style={{
                  backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                  color: 'var(--text-color)'
                }}>
                  {profile.fullName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="ghost"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full transition-colors duration-300" 
                style={{
                  backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                  color: 'var(--text-color)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
                }}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-semibold transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
                {profile.fullName}
              </h3>
              <p className="text-sm transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                {profile.email}
              </p>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <Shield className="h-4 w-4 text-blue-400" />
                <span className="text-sm capitalize transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
                  {profile.role}
                </span>
                {profile.isVerified && (
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                )}
              </div>
            </div>
          </div>

          {/* Account Stats */}
          <div className="space-y-3 pt-4 border-t transition-colors duration-300" style={{ 
            borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)' 
          }}>
            <div className="flex justify-between">
              <span className="transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                Member since
              </span>
              <span className="transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
                2024
              </span>
            </div>
            <div className="flex justify-between">
              <span className="transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                Status
              </span>
              <span className={`text-sm ${profile.isVerified ? 'text-green-400' : 'text-yellow-400'}`}>
                {profile.isVerified ? 'Verified' : 'Unverified'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
} 