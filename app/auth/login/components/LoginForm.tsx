'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Lock, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useTheme } from '@/contexts/theme-context'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { login } = useAuth()
  const { theme } = useTheme()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams ? searchParams.get('redirectTo') || '/dashboard' : '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log(`[LoginForm] Attempting login for ${email}, will redirect to ${redirectTo}`)
      
      const result = await login(email, password)
      
      if (result.success) {
        console.log(`[LoginForm] Login successful, redirecting to ${redirectTo}`)
        
        // Let the auth context handle the redirect if it has a redirect URL
        if (!result.redirect) {
          router.push(redirectTo)
        }
      } else {
        setError(result.error || 'Login failed')
      }
    } catch (err) {
      console.error('[LoginForm] Login error:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="backdrop-blur-sm transition-colors duration-300" style={{
        backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.05)',
        borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
      }}>
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-light transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
            Welcome Back
          </CardTitle>
          <p className="transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
            Sign in to your account
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-300" style={{ color: 'var(--text-secondary)' }} />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="pl-10"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-300" style={{ color: 'var(--text-secondary)' }} />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="pl-10"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
              Don&apos;t have an account?{' '}
              <a href="/auth/register" className="text-blue-400 hover:text-blue-300 underline">
                Sign up here
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
} 