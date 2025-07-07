'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import BackgroundNodes from '@/components/BackgroundNodes'
import { UserPlus, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <BackgroundNodes isMobile={false} />
      
      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 rounded-full bg-black/90 border border-white/30 backdrop-blur-sm">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-light tracking-wide mb-2">Join Blackbird Portal</h1>
          <p className="text-white/60">Create your account</p>
        </motion.div>

        <Link href="/" className="inline-block mb-6">
          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Portal
          </Button>
        </Link>

        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-light text-white">Registration Coming Soon</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-white/60">
              Registration is currently disabled. Please contact an administrator for access.
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={() => router.push('/auth/login')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Sign In Instead
              </Button>
              
              <p className="text-sm text-white/60">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 underline">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 