'use client'

import { Settings } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useTheme } from '@/contexts/theme-context'

interface PersonalInformationFormProps {
  formData: {
    fullName: string
    email: string
    username: string
  }
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  errors: {
    fullName?: string
    email?: string
    username?: string
  }
}

export function PersonalInformationForm({ formData, onInputChange, errors }: PersonalInformationFormProps) {
  const { theme } = useTheme()
  
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateUsername = (username: string) => {
    if (username.length === 0) return true // Allow empty
    if (username.length < 3) return false
    return /^[a-zA-Z0-9_]+$/.test(username)
  }
  
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
              Full Name *
            </label>
            <Input
              name="fullName"
              value={formData.fullName}
              onChange={onInputChange}
              className={`transition-colors duration-300 ${
                errors.fullName ? 'border-red-500' : ''
              }`}
              style={{
                backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                borderColor: errors.fullName 
                  ? '#ef4444' 
                  : theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                color: 'var(--text-color)'
              }}
              placeholder="Enter your full name"
            />
            {errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
              Username
            </label>
            <Input
              name="username"
              value={formData.username}
              onChange={onInputChange}
              className={`transition-colors duration-300 ${
                errors.username ? 'border-red-500' : ''
              }`}
              style={{
                backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                borderColor: errors.username 
                  ? '#ef4444' 
                  : theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                color: 'var(--text-color)'
              }}
              placeholder="Enter username (optional)"
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username}</p>
            )}
            <p className="text-xs transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
              Username must be at least 3 characters and contain only letters, numbers, and underscores
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
            Email *
          </label>
          <Input
            name="email"
            type="email"
            value={formData.email}
            onChange={onInputChange}
            className={`transition-colors duration-300 ${
              errors.email ? 'border-red-500' : ''
            }`}
            style={{
              backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
              borderColor: errors.email 
                ? '#ef4444' 
                : theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
              color: 'var(--text-color)'
            }}
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}
          {formData.email && !validateEmail(formData.email) && !errors.email && (
            <p className="text-sm text-yellow-600">Please enter a valid email address</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 