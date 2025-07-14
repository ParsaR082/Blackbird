'use client'

import { Check, X } from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

interface PasswordStrengthIndicatorProps {
  password: string
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const { theme } = useTheme()

  const requirements = [
    {
      label: 'At least 8 characters',
      test: (pwd: string) => pwd.length >= 8
    },
    {
      label: 'Contains uppercase letter',
      test: (pwd: string) => /[A-Z]/.test(pwd)
    },
    {
      label: 'Contains lowercase letter',
      test: (pwd: string) => /[a-z]/.test(pwd)
    },
    {
      label: 'Contains number',
      test: (pwd: string) => /\d/.test(pwd)
    },
    {
      label: 'Contains special character',
      test: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    }
  ]

  const getStrengthLevel = (pwd: string) => {
    const passedRequirements = requirements.filter(req => req.test(pwd)).length
    const totalRequirements = requirements.length
    
    if (pwd.length === 0) return { level: 'none', percentage: 0, color: 'transparent' }
    if (passedRequirements <= 2) return { level: 'weak', percentage: 20, color: '#ef4444' }
    if (passedRequirements <= 3) return { level: 'fair', percentage: 40, color: '#f97316' }
    if (passedRequirements <= 4) return { level: 'good', percentage: 60, color: '#eab308' }
    return { level: 'strong', percentage: 100, color: '#22c55e' }
  }

  const strength = getStrengthLevel(password)

  return (
    <div className="space-y-3">
      {/* Strength bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
            Password Strength
          </span>
          <span 
            className="font-medium capitalize"
            style={{ color: strength.color }}
          >
            {strength.level}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 transition-colors duration-300" style={{
          backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
        }}>
          <div 
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: `${strength.percentage}%`,
              backgroundColor: strength.color
            }}
          />
        </div>
      </div>

      {/* Requirements list */}
      <div className="space-y-2">
        <span className="text-sm transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
          Requirements:
        </span>
        <div className="space-y-1">
          {requirements.map((requirement, index) => {
            const isMet = requirement.test(password)
            return (
              <div key={index} className="flex items-center space-x-2">
                {isMet ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                <span 
                  className={`text-sm transition-colors duration-300 ${
                    isMet ? 'text-green-600' : 'text-red-600'
                  }`}
                  style={{
                    color: isMet 
                      ? theme === 'light' ? '#16a34a' : '#4ade80'
                      : theme === 'light' ? '#dc2626' : '#f87171'
                  }}
                >
                  {requirement.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
} 