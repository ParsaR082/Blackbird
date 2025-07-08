'use client'

import { Lock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useTheme } from '@/contexts/theme-context'

interface SecuritySettingsFormProps {
  formData: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function SecuritySettingsForm({ formData, onInputChange }: SecuritySettingsFormProps) {
  const { theme } = useTheme()
  
  return (
    <Card className="backdrop-blur-sm border transition-colors duration-300" style={{
      backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
      borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
    }}>
      <CardHeader>
        <CardTitle className="flex items-center transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
          <Lock className="h-5 w-5 mr-2" />
          Security Settings
        </CardTitle>
        <CardDescription className="transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
          Change your password and security preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
            Current Password
          </label>
          <Input
            name="currentPassword"
            type="password"
            value={formData.currentPassword}
            onChange={onInputChange}
            className="transition-colors duration-300"
            style={{
              backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
              borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
              color: 'var(--text-color)'
            }}
            placeholder="Enter current password"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
              New Password
            </label>
            <Input
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={onInputChange}
              className="transition-colors duration-300"
              style={{
                backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                color: 'var(--text-color)'
              }}
              placeholder="Enter new password"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
              Confirm Password
            </label>
            <Input
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={onInputChange}
              className="transition-colors duration-300"
              style={{
                backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                color: 'var(--text-color)'
              }}
              placeholder="Confirm new password"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 