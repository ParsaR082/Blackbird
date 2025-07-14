'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { useTheme } from '@/contexts/theme-context'
import { Loader2 } from 'lucide-react'
import BackgroundNodes from '@/components/BackgroundNodes'
import { ProfileHeader } from './components/ProfileHeader'
import { ProfileOverview } from './components/ProfileOverview'
import { PersonalInformationForm } from './components/PersonalInformationForm'
import { SecuritySettingsForm } from './components/SecuritySettingsForm'
import { SaveButton } from './components/SaveButton'

interface UserProfile {
  fullName: string
  email: string
  username?: string
  avatarUrl?: string
  role: string
  isVerified: boolean
}

interface FormErrors {
  fullName?: string
  email?: string
  username?: string
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
}

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { theme } = useTheme()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirectTo=/users/profile')
      return
    }

    if (isAuthenticated && user) {
      setProfile({
        fullName: user.fullName || '',
        email: user.email || '',
        username: user.username || '',
        avatarUrl: user.avatarUrl || undefined,
        role: user.role || 'user',
        isVerified: user.isVerified || false
      })
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        username: user.username || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setLoading(false)
    }
  }, [isAuthenticated, isLoading, user, router])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Validate full name
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address'
      }
    }

    // Validate username (optional)
    if (formData.username.trim()) {
      if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters long'
      } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        newErrors.username = 'Username can only contain letters, numbers, and underscores'
      }
    }

    // Validate password change
    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required to change password'
      }
      
      if (!formData.newPassword) {
        newErrors.newPassword = 'New password is required'
      } else if (formData.newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters long'
      } else {
        // Password strength validation
        const hasUpperCase = /[A-Z]/.test(formData.newPassword)
        const hasLowerCase = /[a-z]/.test(formData.newPassword)
        const hasNumbers = /\d/.test(formData.newPassword)
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword)

        if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
          newErrors.newPassword = 'Password must contain uppercase, lowercase, number, and special character'
        }
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your new password'
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  const handleSaveProfile = async () => {
    if (!validateForm()) {
      return
    }

    setSaving(true)
    try {
      // Get CSRF token
      const csrfResponse = await fetch('/api/auth/csrf')
      const { token: csrfToken } = await csrfResponse.json()

      const response = await fetch('/api/users/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken
        },
        credentials: 'include',
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          username: formData.username.trim() || undefined,
          currentPassword: formData.currentPassword || undefined,
          newPassword: formData.newPassword || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle specific error types
        if (response.status === 409) {
          if (data.error.includes('email')) {
            setErrors({ email: data.error })
          } else if (data.error.includes('username')) {
            setErrors({ username: data.error })
          }
        } else if (response.status === 400) {
          if (data.error.includes('password')) {
            setErrors({ currentPassword: data.error })
          } else {
            // Try to map general errors to specific fields
            const errorMessage = data.error
            if (errorMessage.includes('email')) {
              setErrors({ email: errorMessage })
            } else if (errorMessage.includes('password')) {
              setErrors({ newPassword: errorMessage })
            } else {
              setErrors({ fullName: errorMessage })
            }
          }
        } else {
          throw new Error(data.error || 'Failed to update profile')
        }
        return
      }

      // Success - update local state
      if (data.user) {
        setProfile(prev => prev ? {
          ...prev,
          fullName: data.user.fullName,
          email: data.user.email,
          username: data.user.username
        } : null)
        
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }))
        
        // Clear errors
        setErrors({})
        
        // Show success message (you could add a toast notification here)
        alert('Profile updated successfully!')
      }

    } catch (error) {
      console.error('Profile update error:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors duration-300" style={{ backgroundColor: 'var(--bg-color)' }}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 transition-colors duration-300" style={{ color: 'var(--text-secondary)' }} />
          <p className="transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !profile) {
    return null
  }

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      <div className="fixed inset-0 transition-colors duration-300" style={{ 
        background: theme === 'light' 
          ? 'linear-gradient(to bottom right, #ffffff, #f8fafc, #ffffff)' 
          : 'linear-gradient(to bottom right, #000000, #1f2937, #000000)'
      }} />
      <div className="fixed inset-0" style={{
        background: theme === 'light'
          ? 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1), transparent 50%)'
          : 'radial-gradient(circle at 50% 50%, rgba(120, 119, 198, 0.1), transparent 50%)'
      }} />
      <BackgroundNodes isMobile={false} />
      
      <motion.div 
        className="relative z-10 container mx-auto px-4 pt-24 pb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <ProfileHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ProfileOverview profile={profile} />
          
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            <PersonalInformationForm 
              formData={formData} 
              onInputChange={handleInputChange}
              errors={errors}
            />
            <SecuritySettingsForm 
              formData={formData} 
              onInputChange={handleInputChange}
              errors={errors}
            />
            <SaveButton onSave={handleSaveProfile} saving={saving} />
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
} 