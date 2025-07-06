'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { X, User, Phone, School, Lock, UserCheck } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'

type AuthMode = 'login' | 'register'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: AuthMode
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'
  const { login, register } = useAuth()

  // Login form state
  const [loginData, setLoginData] = useState({
    identifier: '',
    password: ''
  })

  // Register form state
  const [registerData, setRegisterData] = useState({
    student_id: '',
    username: '',
    mobile_phone: '',
    full_name: '',
    password: '',
    confirm_password: ''
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const { success, error } = await login(loginData.identifier, loginData.password)
      
      if (success) {
        setSuccess('Login successful')
        // Redirect to dashboard or intended page
        window.location.href = redirectTo
      } else {
        setError(error || 'Login failed')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validate passwords match
    if (registerData.password !== registerData.confirm_password) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const { success, error } = await register({
        student_id: registerData.student_id,
        username: registerData.username,
        mobile_phone: registerData.mobile_phone,
        full_name: registerData.full_name,
        password: registerData.password
      })

      if (success) {
        setSuccess('Registration successful! You can now login.')
        // Switch to login mode after successful registration
        setTimeout(() => {
          setMode('login')
          setLoginData({
            identifier: registerData.username, // Pre-fill the username
            password: ''
          })
        }, 1500)
      } else {
        setError(error || 'Registration failed')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  }

  const modalVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-md p-6 bg-black border border-white/20 rounded-lg shadow-xl"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-white/70 hover:text-white hover:bg-white/10"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>

            {/* Modal Header */}
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-white">
                {mode === 'login' ? 'Login to Portal' : 'Create Account'}
              </h2>
              <p className="mt-2 text-white/70">
                {mode === 'login'
                  ? 'Welcome back! Please enter your details.'
                  : 'Join the Blackbird Portal community.'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-md text-red-200 text-sm">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-md text-green-200 text-sm">
                {success}
              </div>
            )}

            {/* Login Form */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/70">
                    Student ID / Username / Mobile
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your student ID, username or mobile"
                    value={loginData.identifier}
                    onChange={(e) => setLoginData({ ...loginData, identifier: e.target.value })}
                    required
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/40 focus:border-white/40"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/70">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/40 focus:border-white/40"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-white text-black hover:bg-white/90"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Log In'}
                </Button>
              </form>
            )}

            {/* Register Form */}
            {mode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-white/70">
                    <School className="w-4 h-4 mr-2" /> 
                    Student ID
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your student ID"
                    value={registerData.student_id}
                    onChange={(e) => setRegisterData({ ...registerData, student_id: e.target.value })}
                    required
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/40 focus:border-white/40"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-white/70">
                    <User className="w-4 h-4 mr-2" /> 
                    Username
                  </label>
                  <Input
                    type="text"
                    placeholder="Choose a username"
                    value={registerData.username}
                    onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                    required
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/40 focus:border-white/40"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-white/70">
                    <Phone className="w-4 h-4 mr-2" />
                    Mobile Phone
                  </label>
                  <Input
                    type="tel"
                    placeholder="Enter your mobile phone"
                    value={registerData.mobile_phone}
                    onChange={(e) => setRegisterData({ ...registerData, mobile_phone: e.target.value })}
                    required
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/40 focus:border-white/40"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-white/70">
                    <UserCheck className="w-4 h-4 mr-2" />
                    Full Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your full English name"
                    value={registerData.full_name}
                    onChange={(e) => setRegisterData({ ...registerData, full_name: e.target.value })}
                    required
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/40 focus:border-white/40"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-white/70">
                    <Lock className="w-4 h-4 mr-2" />
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Create a password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/40 focus:border-white/40"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-white/70">
                    <Lock className="w-4 h-4 mr-2" />
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Confirm your password"
                    value={registerData.confirm_password}
                    onChange={(e) => setRegisterData({ ...registerData, confirm_password: e.target.value })}
                    required
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/40 focus:border-white/40"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-white text-black hover:bg-white/90"
                  disabled={loading}
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            )}

            {/* Form Switch */}
            <div className="mt-6 text-center text-sm">
              {mode === 'login' ? (
                <p>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register')
                      setError(null)
                      setSuccess(null)
                    }}
                    className="text-white font-medium hover:underline focus:outline-none"
                  >
                    Create Account
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login')
                      setError(null)
                      setSuccess(null)
                    }}
                    className="text-white font-medium hover:underline focus:outline-none"
                  >
                    Log In
                  </button>
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 