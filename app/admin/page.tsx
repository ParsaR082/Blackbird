'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  CheckCircle, 
  XCircle,
  Shield,
  Search,
  RefreshCcw,
  UserCheck,
  UserX,
  Loader2,
  LogIn
} from 'lucide-react'
import { motion } from 'framer-motion'
import BackgroundNodes from '@/components/BackgroundNodes'

interface User {
  id: string
  student_id: string
  username: string
  full_name: string
  mobile_phone: string
  role: 'admin' | 'user'
  is_verified: boolean
  created_at: string
  last_login: string | null
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [processingUser, setProcessingUser] = useState<string | null>(null)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const { user, isAuthenticated, isLoading, login } = useAuth()
  const router = useRouter()
  
  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/users')
      
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      
      const data = await response.json()
      setUsers(data)
    } catch (err) {
      console.error('Error fetching users:', err)
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    // Do not redirect immediately - we'll show a login form instead
    if (!isLoading && isAuthenticated && user && user.role !== 'ADMIN') {
      router.push('/dashboard')
    }
    
    // Only fetch users if the user is authenticated and is an admin
    if (!isLoading && isAuthenticated && user?.role === 'ADMIN') {
      fetchUsers()
    } else {
      setLoading(false) // Stop the loading state if we're not authenticated
    }
  }, [user, isAuthenticated, isLoading, router])
  
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null)
    setIsLoggingIn(true)
    
    try {
      const result = await login(loginEmail, loginPassword)
      if (!result.success) {
        setLoginError(result.error || 'Login failed')
      } else if (result.user?.role !== 'ADMIN') {
        setLoginError('You do not have admin privileges')
        // Additional cleanup for non-admin users would be handled by the useEffect
      } else {
        // Admin login successful, will fetch users via useEffect
      }
    } catch (err) {
      console.error('Login error:', err)
      setLoginError('An unexpected error occurred')
    } finally {
      setIsLoggingIn(false)
    }
  }
  
  const verifyUser = async (userId: string) => {
    try {
      setProcessingUser(userId)
      
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: userId })
      })
      
      if (!response.ok) {
        throw new Error('Failed to verify user')
      }
      
      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, is_verified: true } : u
      ))
      
    } catch (err) {
      console.error('Error verifying user:', err)
      setError('Failed to verify user')
    } finally {
      setProcessingUser(null)
    }
  }
  
  const promoteToAdmin = async (userId: string) => {
    try {
      setProcessingUser(userId)
      
      const response = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: userId })
      })
      
      if (!response.ok) {
        throw new Error('Failed to promote user to admin')
      }
      
      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: 'admin' } : u
      ))
      
    } catch (err) {
      console.error('Error promoting user:', err)
      setError('Failed to promote user to admin')
    } finally {
      setProcessingUser(null)
    }
  }
  
  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true
    
    const term = searchTerm.toLowerCase()
    return (
      user.student_id.toLowerCase().includes(term) ||
      user.username.toLowerCase().includes(term) ||
      user.full_name.toLowerCase().includes(term)
    )
  })

  // If not authenticated or not admin, show login page
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        <BackgroundNodes isMobile={false} />
        <div className="relative z-10 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-lg">Checking authentication...</p>
        </div>
      </div>
    )
  }
  
  if (!isAuthenticated || (user && user.role !== 'ADMIN')) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        <BackgroundNodes isMobile={false} />
        
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-center mb-2">
                <Shield className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
              <CardDescription className="text-center">
                Sign in with your admin credentials
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loginError && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-md text-red-200">
                  <p className="flex items-center gap-2 text-sm">
                    <XCircle className="w-4 h-4" />
                    {loginError}
                  </p>
                </div>
              )}
              
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input 
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="admin@example.com"
                    required
                    className="bg-white/10"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input 
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="bg-white/10"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
      <BackgroundNodes isMobile={false} />
      
      <motion.div 
        className="relative z-10 container mx-auto pt-24 pb-8 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent flex items-center gap-2">
                <Shield className="w-8 h-8 text-white/40" />
                Admin Panel
              </h1>
              <p className="text-white/60 mt-2">Manage users and system settings</p>
            </div>
            <Button 
              onClick={fetchUsers} 
              variant="ghost" 
              className="gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <RefreshCcw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </motion.div>
        
        {/* Error Display */}
        {error && (
          <motion.div 
            className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-md text-red-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              {error}
            </p>
          </motion.div>
        )}
        
        {/* User Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-xl font-bold">User Management</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </div>
              
              {/* Search */}
              <div className="relative w-64">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </CardHeader>
            
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="ml-2 text-lg">Loading users...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No matching users found' : 'No users found'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="py-3 px-2 text-left">Student ID</th>
                        <th className="py-3 px-2 text-left">Name</th>
                        <th className="py-3 px-2 text-left">Username</th>
                        <th className="py-3 px-2 text-left">Mobile</th>
                        <th className="py-3 px-2 text-center">Status</th>
                        <th className="py-3 px-2 text-center">Role</th>
                        <th className="py-3 px-2 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3 px-2">{user.student_id}</td>
                          <td className="py-3 px-2">{user.full_name}</td>
                          <td className="py-3 px-2">{user.username}</td>
                          <td className="py-3 px-2">{user.mobile_phone}</td>
                          <td className="py-3 px-2 text-center">
                            {user.is_verified ? (
                              <Badge className="bg-green-500/20 text-green-300 hover:bg-green-500/30">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-yellow-500/50 text-yellow-300">
                                <XCircle className="w-3 h-3 mr-1" />
                                Unverified
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-2 text-center">
                            {user.role === 'admin' ? (
                              <Badge className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30">
                                <Shield className="w-3 h-3 mr-1" />
                                Admin
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-white/20 text-white/70">
                                User
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <div className="flex justify-center gap-2">
                              {!user.is_verified && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="h-8 bg-green-500/10 border-green-500/30 text-green-300 hover:bg-green-500/20"
                                  onClick={() => verifyUser(user.id)}
                                  disabled={processingUser === user.id}
                                >
                                  {processingUser === user.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <UserCheck className="w-3 h-3 mr-1" />
                                  )}
                                  Verify
                                </Button>
                              )}
                              
                              {user.role !== 'admin' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="h-8 bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
                                  onClick={() => promoteToAdmin(user.id)}
                                  disabled={processingUser === user.id}
                                >
                                  {processingUser === user.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Shield className="w-3 h-3 mr-1" />
                                  )}
                                  Make Admin
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
} 