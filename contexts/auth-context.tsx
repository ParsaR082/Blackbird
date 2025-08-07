'use client'

import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode 
} from 'react'
import { UserAuth } from '@/types'
import { useRouter } from 'next/navigation'

type AuthContextType = {
  user: UserAuth | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (identifier: string, password: string) => Promise<{ success: boolean, error?: string, user?: UserAuth, redirect?: string }>
  register: (userData: RegisterData) => Promise<{ success: boolean, error?: string }>
  logout: () => Promise<void>
  checkAuth: () => Promise<boolean>
}

type RegisterData = {
  email: string
  fullName: string
  password: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserAuth | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  // Set client flag on mount
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Check if user is authenticated on mount (client-side only)
  useEffect(() => {
    // Only run on client side after hydration
    if (!isClient) return
    
    let isMounted = true
    
    const runAuthCheck = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/auth/validate', {
          cache: 'no-store',
          credentials: 'include' // Ensure cookies are sent
        })
        
        if (!isMounted) return
        
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
          console.log('[Auth] User authenticated:', userData.email)
        } else {
          setUser(null)
          console.log('[Auth] Authentication failed:', response.status)
        }
      } catch (error) {
        console.error('Auth check error:', error)
        if (isMounted) setUser(null)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    
    runAuthCheck()
    
    return () => {
      isMounted = false
    }
  }, [isClient])

  // Function to check authentication status
  const checkAuth = async (): Promise<boolean> => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/auth/validate', {
        cache: 'no-store',
        credentials: 'include' // Ensure cookies are sent
      })
      
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        setIsLoading(false)
        return true
      } else {
        setUser(null)
        setIsLoading(false)
        return false
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setUser(null)
      setIsLoading(false)
      return false
    }
  }

  // Login function
  const login = async (identifier: string, password: string): Promise<{ success: boolean, error?: string, user?: UserAuth, redirect?: string }> => {
    try {
      setIsLoading(true)
      
      console.log('[Auth] Starting login process for:', identifier)
      
      // Get CSRF token from response body (not headers)
      const csrfResponse = await fetch('/api/auth/csrf', {
        credentials: 'include', // Ensure cookies are sent and received
        cache: 'no-store'
      })
      
      if (!csrfResponse.ok) {
        console.error('[Auth] Failed to get CSRF token:', csrfResponse.status)
        setIsLoading(false)
        return { success: false, error: 'Failed to get security token' }
      }
      
      const { token: csrfToken } = await csrfResponse.json()
      console.log('[Auth] CSRF token received, length:', csrfToken?.length)
      
      if (!csrfToken) {
        console.error('[Auth] No CSRF token in response')
        setIsLoading(false)
        return { success: false, error: 'Security token not received' }
      }
      
      console.log('[Auth] Logging in user:', identifier)
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken
        },
        body: JSON.stringify({ identifier, password }),
        cache: 'no-store',
        credentials: 'include' // Ensure cookies are sent
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('[Auth] Login failed:', data.error)
        setIsLoading(false)
        return { success: false, error: data.error || 'Login failed' }
      }

      console.log('[Auth] Login successful, redirect to:', data.redirect)
      
      // Update user state after successful login
      setUser(data.user)
      setIsLoading(false)
      
      // Manually navigate to the redirect URL
      if (data.redirect) {
        router.push(data.redirect)
      }
      
      return { success: true, user: data.user, redirect: data.redirect }
    } catch (error) {
      console.error('[Auth] Login error:', error)
      setIsLoading(false)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  // Register function
  const register = async (userData: RegisterData): Promise<{ success: boolean, error?: string }> => {
    try {
      setIsLoading(true)
      
      console.log('[Auth] Starting registration process for:', userData.email)
      
      // Get CSRF token from response body
      const csrfResponse = await fetch('/api/auth/csrf', {
        credentials: 'include', // Ensure cookies are sent and received
        cache: 'no-store'
      })
      
      if (!csrfResponse.ok) {
        console.error('[Auth] Failed to get CSRF token for registration:', csrfResponse.status)
        setIsLoading(false)
        return { success: false, error: 'Failed to get security token' }
      }
      
      const { token: csrfToken } = await csrfResponse.json()
      console.log('[Auth] CSRF token received for registration, length:', csrfToken?.length)
      
      if (!csrfToken) {
        console.error('[Auth] No CSRF token in registration response')
        setIsLoading(false)
        return { success: false, error: 'Security token not received' }
      }
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken
        },
        body: JSON.stringify(userData),
        cache: 'no-store',
        credentials: 'include' // Ensure cookies are sent
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('[Auth] Registration failed:', data.error)
        setIsLoading(false)
        return { success: false, error: data.error || 'Registration failed' }
      }

      console.log('[Auth] Registration successful')
      setIsLoading(false)
      return { success: true }
    } catch (error) {
      console.error('[Auth] Registration error:', error)
      setIsLoading(false)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true)
      
      console.log('[Auth] Starting logout process')
      
      // Get CSRF token from response body
      const csrfResponse = await fetch('/api/auth/csrf', {
        credentials: 'include', // Ensure cookies are sent and received
        cache: 'no-store'
      })
      
      if (!csrfResponse.ok) {
        console.error('[Auth] Failed to get CSRF token for logout:', csrfResponse.status)
        // Continue with logout even if CSRF fails
      } else {
        const { token: csrfToken } = await csrfResponse.json()
        console.log('[Auth] CSRF token received for logout, length:', csrfToken?.length)
        
        if (csrfToken) {
          await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
              'x-csrf-token': csrfToken
            },
            cache: 'no-store',
            credentials: 'include' // Ensure cookies are sent
          })
        }
      }
      
      console.log('[Auth] Logout completed')
      setUser(null)
    } catch (error) {
      console.error('[Auth] Logout error:', error)
      // Still clear user state even if logout request fails
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        isAuthenticated: !!user,
        login,
        register,
        logout,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}