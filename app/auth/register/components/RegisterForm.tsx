'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/theme-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { RegisterFormFields } from './RegisterFormFields'

interface FormData {
  studentId: string
  phoneNumber: string
  fullName: string
  username: string
  email: string
  password: string
  confirmPassword: string
}

export function RegisterForm() {
  const { theme } = useTheme()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<FormData>({
    studentId: '',
    phoneNumber: '',
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    // Format phone number to ensure +98 prefix
    if (name === 'phoneNumber') {
      let formatted = value.replace(/\D/g, '') // Remove non-digits
      if (formatted.startsWith('0')) {
        formatted = formatted.substring(1) // Remove leading 0
      }
      if (formatted && !formatted.startsWith('98')) {
        formatted = '98' + formatted
      }
      setFormData(prev => ({ ...prev, [name]: formatted }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const validateForm = () => {
    if (!formData.studentId || !formData.phoneNumber || !formData.fullName || 
        !formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required')
      return false
    }

    if (!formData.email.endsWith('@gmail.com')) {
      setError('Please use a Gmail address')
      return false
    }

    if (formData.phoneNumber.length !== 12 || !formData.phoneNumber.startsWith('98')) {
      setError('Phone number must be in format +98XXXXXXXXXX (10 digits after 98)')
      return false
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setError('')

    try {
      // Get CSRF token
      const csrfResponse = await fetch('/api/auth/csrf')
      const { token } = await csrfResponse.json()

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': token
        },
        body: JSON.stringify({
          studentId: formData.studentId,
          phoneNumber: `+${formData.phoneNumber}`,
          fullName: formData.fullName,
          username: formData.username,
          email: formData.email,
          password: formData.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Registration failed')
        return
      }

      router.push('/auth/login?message=Registration successful! Please sign in.')
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="backdrop-blur-sm transition-colors duration-300" style={{
      backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.05)',
      borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
    }}>
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-light transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
          Student Registration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <RegisterFormFields
            formData={formData}
            handleInputChange={handleInputChange}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
          />

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 underline">
              Sign in here
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 