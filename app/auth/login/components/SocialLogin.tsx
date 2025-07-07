'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Github, Chrome, Loader2 } from 'lucide-react'

export function SocialLogin() {
  const [isGithubLoading, setIsGithubLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const handleGithubLogin = async () => {
    setIsGithubLoading(true)
    // TODO: Implement GitHub OAuth
    setTimeout(() => setIsGithubLoading(false), 2000)
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    // TODO: Implement Google OAuth
    setTimeout(() => setIsGoogleLoading(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full max-w-md mx-auto mt-6"
    >
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-black text-white/60">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6">
        <Button
          variant="outline"
          onClick={handleGithubLogin}
          disabled={isGithubLoading}
          className="bg-white/5 border-white/10 text-white hover:bg-white/10"
        >
          {isGithubLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Github className="h-4 w-4 mr-2" />
              GitHub
            </>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
          className="bg-white/5 border-white/10 text-white hover:bg-white/10"
        >
          {isGoogleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Chrome className="h-4 w-4 mr-2" />
              Google
            </>
          )}
        </Button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-white/60">
          Don&apos;t have an account?{' '}
          <a href="/auth/register" className="text-blue-400 hover:text-blue-300 underline">
            Sign up
          </a>
        </p>
      </div>
    </motion.div>
  )
} 