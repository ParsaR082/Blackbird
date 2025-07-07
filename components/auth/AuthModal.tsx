'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { X, User, Phone, School, Lock, UserCheck, Github, Mail } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { signIn } from 'next-auth/react'
import FocusTrap from 'focus-trap-react'
import zxcvbn from 'zxcvbn'
import { UserAuth } from '@/types'

type AuthMode = 'login' | 'register'

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
  onAuthComplete?: (user: UserAuth) => void;
  redirectTo?: string;
}

export function AuthModal({ isOpen, onClose, initialMode = 'login', onAuthComplete, redirectTo = '/dashboard' }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const { login, register } = useAuth()
  
  // Refs for focus management
  const initialFocusRef = useRef<HTMLInputElement>(null)

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

  // OAuth errors can be handled by parent component if needed

  // Password strength check
  const checkPasswordStrength = useCallback((password: string) => {
    const result = zxcvbn(password)
    setPasswordStrength(result.score) // 0-4 score
  }, [])

  // Form validation
  const validateRegisterForm = useCallback(() => {
    const errors: Record<string, string> = {}
    
    if (registerData.student_id.length < 3) {
      errors.student_id = 'Student ID must be at least 3 characters'
    }
    
    if (registerData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters'
    } else if (!/^[a-zA-Z0-9_]+$/.test(registerData.username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores'
    }
    
    if (!/^\+?[0-9]{8,15}$/.test(registerData.mobile_phone)) {
      errors.mobile_phone = 'Please enter a valid mobile number'
    }
    
    if (registerData.full_name.length < 2) {
      errors.full_name = 'Full name must be at least 2 characters'
    }
    
    if (registerData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    } else if (passwordStrength <= 1) {
      errors.password = 'Password is too weak'
    }
    
    if (registerData.password !== registerData.confirm_password) {
      errors.confirm_password = 'Passwords do not match'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }, [registerData, passwordStrength])

  const handleLogin = useCallback(async (e: React.FormEvent) => {
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
  }, [login, loginData, redirectTo])

  const handleRegister = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    
    // Validate form
    if (!validateRegisterForm()) {
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
  }, [register, registerData, validateRegisterForm])

  const handleOAuthSignIn = useCallback((provider: string) => {
    signIn(provider, { callbackUrl: redirectTo })
  }, [redirectTo])

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
          <FocusTrap focusTrapOptions={{ initialFocus: initialFocusRef }}>
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="auth-modal-title"
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
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </Button>

              {/* Modal Header */}
              <div className="mb-6 text-center">
                <h2 id="auth-modal-title" className="text-2xl font-bold text-white">
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
                <div 
                  className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-md text-red-200 text-sm"
                  role="alert"
                >
                  {error}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div 
                  className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-md text-green-200 text-sm"
                  role="status"
                >
                  {success}
                </div>
              )}

              {/* Screen reader announcements */}
              <div aria-live="polite" className="sr-only">
                {error && `Error: ${error}`}
                {success && `Success: ${success}`}
              </div>

              {/* Login Form */}
              {mode === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="login-identifier" className="block text-sm font-medium text-white/70">
                      Student ID / Username / Mobile
                    </label>
                    <Input
                      id="login-identifier"
                      ref={initialFocusRef}
                      type="text"
                      placeholder="Enter your student ID, username or mobile"
                      value={loginData.identifier}
                      onChange={(e) => setLoginData({ ...loginData, identifier: e.target.value })}
                      required
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/40 focus:border-white/40"
                      aria-required="true"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="login-password" className="block text-sm font-medium text-white/70">
                      Password
                    </label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/40 focus:border-white/40"
                      aria-required="true"
                      disabled={loading}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-white text-black hover:bg-white/90 relative"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="opacity-0">Log In</span>
                        <span className="absolute inset-0 flex items-center justify-center">
                          <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </span>
                      </>
                    ) : (
                      'Log In'
                    )}
                  </Button>
                </form>
              )}

              {/* Register Form */}
              {mode === 'register' && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="register-student-id" className="flex items-center text-sm font-medium text-white/70">
                      <School className="w-4 h-4 mr-2" /> 
                      Student ID
                    </label>
                    <Input
                      id="register-student-id"
                      ref={initialFocusRef}
                      type="text"
                      placeholder="Enter your student ID"
                      value={registerData.student_id}
                      onChange={(e) => setRegisterData({ ...registerData, student_id: e.target.value })}
                      required
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/40 focus:border-white/40"
                      aria-required="true"
                      disabled={loading}
                    />
                    {validationErrors.student_id && (
                      <p className="mt-1 text-xs text-red-400" aria-live="polite">{validationErrors.student_id}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="register-username" className="flex items-center text-sm font-medium text-white/70">
                      <User className="w-4 h-4 mr-2" /> 
                      Username
                    </label>
                    <Input
                      id="register-username"
                      type="text"
                      placeholder="Choose a username"
                      value={registerData.username}
                      onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                      required
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/40 focus:border-white/40"
                      aria-required="true"
                      disabled={loading}
                    />
                    {validationErrors.username && (
                      <p className="mt-1 text-xs text-red-400" aria-live="polite">{validationErrors.username}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="register-mobile" className="flex items-center text-sm font-medium text-white/70">
                      <Phone className="w-4 h-4 mr-2" />
                      Mobile Phone
                    </label>
                    <Input
                      id="register-mobile"
                      type="tel"
                      placeholder="Enter your mobile phone"
                      value={registerData.mobile_phone}
                      onChange={(e) => setRegisterData({ ...registerData, mobile_phone: e.target.value })}
                      required
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/40 focus:border-white/40"
                      aria-required="true"
                      disabled={loading}
                    />
                    {validationErrors.mobile_phone && (
                      <p className="mt-1 text-xs text-red-400" aria-live="polite">{validationErrors.mobile_phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="register-fullname" className="flex items-center text-sm font-medium text-white/70">
                      <UserCheck className="w-4 h-4 mr-2" />
                      Full Name
                    </label>
                    <Input
                      id="register-fullname"
                      type="text"
                      placeholder="Enter your full English name"
                      value={registerData.full_name}
                      onChange={(e) => setRegisterData({ ...registerData, full_name: e.target.value })}
                      required
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/40 focus:border-white/40"
                      aria-required="true"
                      disabled={loading}
                    />
                    {validationErrors.full_name && (
                      <p className="mt-1 text-xs text-red-400" aria-live="polite">{validationErrors.full_name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="register-password" className="flex items-center text-sm font-medium text-white/70">
                      <Lock className="w-4 h-4 mr-2" />
                      Password
                    </label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Create a password"
                      value={registerData.password}
                      onChange={(e) => {
                        setRegisterData({ ...registerData, password: e.target.value });
                        checkPasswordStrength(e.target.value);
                      }}
                      required
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/40 focus:border-white/40"
                      aria-required="true"
                      disabled={loading}
                    />
                    {/* Password strength meter */}
                    <div className="mt-1">
                      <div className="h-1 w-full flex">
                        {[...Array(5)].map((_, i) => (
                          <div 
                            key={i}
                            className={`h-full flex-1 ${
                              i < passwordStrength 
                                ? passwordStrength <= 2 
                                  ? 'bg-red-500' 
                                  : passwordStrength === 3 
                                    ? 'bg-yellow-500' 
                                    : 'bg-green-500'
                                : 'bg-white/10'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs mt-1 text-white/60" aria-live="polite">
                        {passwordStrength === 0 && 'Very weak'}
                        {passwordStrength === 1 && 'Weak'}
                        {passwordStrength === 2 && 'Fair'}
                        {passwordStrength === 3 && 'Good'}
                        {passwordStrength === 4 && 'Strong'}
                      </p>
                    </div>
                    {validationErrors.password && (
                      <p className="mt-1 text-xs text-red-400" aria-live="polite">{validationErrors.password}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="register-confirm-password" className="flex items-center text-sm font-medium text-white/70">
                      <Lock className="w-4 h-4 mr-2" />
                      Confirm Password
                    </label>
                    <Input
                      id="register-confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      value={registerData.confirm_password}
                      onChange={(e) => setRegisterData({ ...registerData, confirm_password: e.target.value })}
                      required
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-white/40 focus:border-white/40"
                      aria-required="true"
                      disabled={loading}
                    />
                    {validationErrors.confirm_password && (
                      <p className="mt-1 text-xs text-red-400" aria-live="polite">{validationErrors.confirm_password}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-white text-black hover:bg-white/90 relative"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="opacity-0">Create Account</span>
                        <span className="absolute inset-0 flex items-center justify-center">
                          <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </span>
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              )}

              {/* OAuth Buttons */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-black text-white/60">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOAuthSignIn('github')}
                    className="w-full border-white/20 text-white hover:bg-white/10"
                    disabled={loading}
                  >
                    <Github className="w-4 h-4 mr-2" />
                    GitHub
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOAuthSignIn('google')}
                    className="w-full border-white/20 text-white hover:bg-white/10"
                    disabled={loading}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Google
                  </Button>
                </div>
              </div>

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
                        setValidationErrors({})
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
                        setValidationErrors({})
                      }}
                      className="text-white font-medium hover:underline focus:outline-none"
                    >
                      Log In
                    </button>
                  </p>
                )}
              </div>
            </motion.div>
          </FocusTrap>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 