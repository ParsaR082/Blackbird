'use client'

import { Settings } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useTheme } from '@/contexts/theme-context'

interface PersonalInformationFormProps {
  formData: {
    fullName: string
    email: string
  }
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function PersonalInformationForm({ formData, onInputChange }: PersonalInformationFormProps) {
  const { theme } = useTheme()
  
  return (
    <Card className="backdrop-blur-sm border transition-colors duration-300" style={{
      backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
      borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
    }}>
      <CardHeader>
        <CardTitle className="flex items-center transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
          <Settings className="h-5 w-5 mr-2" />
          Personal Information
        </CardTitle>
        <CardDescription className="transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
          Update your personal details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
              Full Name
            </label>
            <Input
              name="fullName"
              value={formData.fullName}
              onChange={onInputChange}
              className="transition-colors duration-300"
              style={{
                backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                color: 'var(--text-color)'
              }}
              placeholder="Enter your full name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
              Email
            </label>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={onInputChange}
              className="transition-colors duration-300"
              style={{
                backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                color: 'var(--text-color)'
              }}
              placeholder="Enter your email"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 