'use client'

import { Suspense, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import BackgroundNodes from '@/components/BackgroundNodes'
import { LoginForm } from './components/LoginForm'
import { useTheme } from '@/contexts/theme-context'

function LoginContent() {
  const { theme } = useTheme()
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams ? searchParams.get('redirectTo') || '/dashboard' : '/dashboard'
  
  useEffect(() => {
    // If user is already authenticated, redirect them
    if (!isLoading && isAuthenticated) {
      console.log(`[LoginPage] User already authenticated, redirecting to ${redirectTo}`)
      router.push(redirectTo)
    }
  }, [isAuthenticated, isLoading, router, redirectTo])
  
  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors duration-300" style={{ backgroundColor: 'var(--bg-color)' }}>
        <div className="transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>Loading...</div>
      </div>
    )
  }
  
  // If already authenticated, don't render the login form
  if (isAuthenticated) {
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
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
                <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <LoginForm />
        </motion.div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center transition-colors duration-300" style={{ backgroundColor: 'var(--bg-color)' }}>
        <div className="transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>Loading...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
} 