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
  Loader2
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
  const { user } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    // Redirect if user is not admin
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard')
    }
    
    fetchUsers()
  }, [user, router])
  
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
                  <tr className="border-b">
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
                    <tr key={user.id} className="border-b hover:bg-accent/50 transition-colors">
                      <td className="py-3 px-2">{user.student_id}</td>
                      <td className="py-3 px-2">{user.full_name}</td>
                      <td className="py-3 px-2">@{user.username}</td>
                      <td className="py-3 px-2">{user.mobile_phone}</td>
                      <td className="py-3 px-2 text-center">
                        {user.is_verified ? (
                          <Badge variant="success" className="bg-green-500/20 text-green-500 border-green-500">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="bg-yellow-500/20 text-yellow-500 border-yellow-500">
                            <XCircle className="w-3 h-3 mr-1" />
                            Unverified
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <Badge variant={user.role === 'admin' ? "secondary" : "default"}>
                          {user.role === 'admin' ? (
                            <Shield className="w-3 h-3 mr-1" />
                          ) : (
                            <Users className="w-3 h-3 mr-1" />
                          )}
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex justify-center gap-2">
                          {!user.is_verified && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => verifyUser(user.id)}
                              disabled={processingUser === user.id}
                              className="flex items-center gap-1"
                            >
                              {processingUser === user.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <UserCheck className="w-3 h-3" />
                              )}
                              Verify
                            </Button>
                          )}
                          
                          {user.role !== 'admin' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => promoteToAdmin(user.id)}
                              disabled={processingUser === user.id}
                              className="flex items-center gap-1"
                            >
                              {processingUser === user.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Shield className="w-3 h-3" />
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