'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { AuthModal } from './AuthModal'
import { UserAuth } from '@/types'

type AuthMode = 'login' | 'register'

interface AuthModalWrapperProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: AuthMode
  onAuthComplete?: (user: UserAuth) => void
}

function AuthModalWithParams(props: AuthModalWrapperProps) {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'
  
  return <AuthModal {...props} redirectTo={redirectTo} />
}

export function AuthModalWrapper(props: AuthModalWrapperProps) {
  return (
    <Suspense fallback={null}>
      <AuthModalWithParams {...props} />
    </Suspense>
  )
} 