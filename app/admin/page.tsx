'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
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
  LogIn,
  Calendar,
  Award,
  ShoppingBag,
  GraduationCap,
  PlusCircle,
  Edit3,
  Trash2,
  ShoppingCart,
  Package,
  FileText,
  Bell,
  BarChart3,
  Workflow,
  Activity,
  Eye,
  Lock
} from 'lucide-react'
import { motion } from 'framer-motion'
import BackgroundNodes from '@/components/BackgroundNodes'
import Link from 'next/link'
import { UserProfileModal } from './components/UserProfileModal'
import { ContentEditor } from './components/ContentEditor'
import { NotificationSystem } from './components/NotificationSystem'
import { SystemSettings } from './components/SystemSettings'
import { AdvancedAnalytics } from './components/AdvancedAnalytics'
import { WorkflowAutomation } from './components/WorkflowAutomation'
import { AdvancedUserManagement } from './components/AdvancedUserManagement'
import { SystemMonitoring } from './components/SystemMonitoring'
import { IntegrationDashboard } from './components/IntegrationDashboard'
import { DataOptimization } from './components/DataOptimization'
import { SecurityCenter } from './components/SecurityCenter'
import AuditLogViewer from './components/AuditLogViewer'
import { TwoFactorAuth } from './components/TwoFactorAuth'
import RoadmapsManager from './components/RoadmapsManager';
import { AssistantManager } from './components/AssistantManager';

interface User {
  id: string
  student_id: string
  username: string
  full_name: string
  mobile_phone: string
  role: 'admin' | 'user'
  is_verified: boolean
  is_active?: boolean
  created_at: string
  last_login: string | null
  email?: string
  bio?: string
  avatarUrl?: string
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [processingUser, setProcessingUser] = useState<string | null>(null)
  
  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.mobile_phone.includes(searchTerm)
  )
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [activeSection, setActiveSection] = useState<'dashboard' | 'users' | 'content' | 'notifications' | 'settings' | 'analytics' | 'workflows' | 'advanced-users' | 'monitoring' | 'integration' | 'optimization' | 'security' | 'audit' | 'mfa' | 'roadmaps' | 'assistant'>('dashboard')
  const { user, isAuthenticated, isLoading, login, logout } = useAuth()
  const router = useRouter()
  
  const [stats, setStats] = useState({
    usersCount: 0,
    eventsCount: 0,
    purchasesCount: 0,
    pendingPurchasesCount: 0, // Add pending purchases count
  })

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
    // Check if user is logged in but not admin, redirect to dashboard
    if (!isLoading && isAuthenticated && user && user.role !== 'ADMIN') {
      router.push('/dashboard')
    }
    
    // Only fetch users if the user is authenticated and is an admin
    if (!isLoading && isAuthenticated && user?.role === 'ADMIN') {
      fetchUsers()
    } else if (!isLoading) {
      setLoading(false) // Stop the loading state if we're not authenticated
    }
  }, [user, isAuthenticated, isLoading, router])

  useEffect(() => {
    // Fetch analytics data for admin dashboard
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/admin/analytics')
        if (response.ok) {
          const data = await response.json()
          
          if (data.success) {
            setStats({
              usersCount: data.stats.usersCount || 0,
              eventsCount: data.stats.eventsCount || 0,
              purchasesCount: data.stats.purchasesCount || 0,
              pendingPurchasesCount: data.stats.pendingPurchasesCount || 0, // Add pending purchases count
            })
          }
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      }
    }
    
    fetchAnalytics()
  }, [])
  
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
        // Log out the non-admin user to prevent being stuck in a redirect loop
        await logout()
      } else {
        // Admin login successful, will fetch users via useEffect
        // Force a re-check of authentication status and user role
        window.location.reload()
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

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setShowUserModal(true)
  }

  const handleUserUpdate = (updatedUser: any) => {
    setUsers(users.map(u => 
      u.id === updatedUser.id ? {
        ...u,
        full_name: updatedUser.fullName,
        username: updatedUser.username,
        mobile_phone: updatedUser.mobilePhone,
        role: updatedUser.role.toLowerCase(),
        is_verified: updatedUser.isVerified,
        is_active: updatedUser.isActive,
        email: updatedUser.email,
        bio: updatedUser.bio,
        avatarUrl: updatedUser.avatarUrl
      } : u
    ))
  }

  const handleUserDelete = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId))
  }
  


  // Admin management modules based on documentation
  const adminModules = [
    {
      title: "Events Management",
      description: "Create and manage technology events",
      icon: Calendar,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
      path: "/admin/events",
      actions: [
        { name: "Create Event", icon: PlusCircle, path: "/admin/events?action=create" },
        { name: "Manage Events", icon: Edit3, path: "/admin/events" },
        { name: "View Registrations", icon: Users, path: "/admin/registrations" }
      ],
      stats: [
        { label: "Upcoming", value: "8" },
        { label: "Registrations", value: "42" }
      ]
    },
    {
      title: "Hall of Fame",
      description: "Manage exceptional contributors",
      icon: Award,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      path: "/admin/hall-of-fame",
      actions: [
        { name: "Add Inductee", icon: PlusCircle, path: "/admin/hall-of-fame?action=create" },
        { name: "Manage Entries", icon: Edit3, path: "/admin/hall-of-fame" }
      ],
      stats: [
        { label: "Inductees", value: "24" },
        { label: "Categories", value: "4" }
      ]
    },
    {
      title: "Product Playground",
      description: "Manage products and purchases",
      icon: ShoppingBag,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      path: "/admin/products",
      actions: [
        { name: "Add Product", icon: PlusCircle, path: "/admin/products?action=create" },
        { name: "Manage Products", icon: Edit3, path: "/admin/products" },
        { name: "Review Purchases", icon: Users, path: "/admin/purchases" }
      ],
      stats: [
        { label: "Products", value: "16" },
        { label: "Pending Orders", value: "5" }
      ]
    },
    {
      title: "University System",
      description: "Manage courses and academic records",
      icon: GraduationCap,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
      path: "/admin/university",
      actions: [
        { name: "Manage Courses", icon: PlusCircle, path: "/admin/university/courses" },
        { name: "Manage Assignments", icon: Edit3, path: "/admin/university/assignments" },
        { name: "Manage Semesters", icon: Calendar, path: "/admin/university/semesters" }
      ],
      stats: [
        { label: "Courses", value: "12" },
        { label: "Students", value: "86" }
      ]
    },
    {
      title: "Content Management",
      description: "Manage announcements and dynamic content",
      icon: FileText,
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/20",
      path: "/admin/content",
      actions: [
        { name: "Create Content", icon: PlusCircle, path: "/admin/content?action=create" },
        { name: "Manage Templates", icon: Edit3, path: "/admin/content" },
        { name: "View Analytics", icon: Users, path: "/admin/content/analytics" }
      ],
      stats: [
        { label: "Templates", value: "12" },
        { label: "Published", value: "8" }
      ]
    },
    {
      title: "Notification System",
      description: "Send bulk emails and manage notifications",
      icon: Bell,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
      path: "/admin/notifications",
      actions: [
        { name: "Send Notification", icon: PlusCircle, path: "/admin/notifications?action=send" },
        { name: "Manage Templates", icon: Edit3, path: "/admin/notifications/templates" },
        { name: "View Campaigns", icon: Users, path: "/admin/notifications/campaigns" }
      ],
      stats: [
        { label: "Templates", value: "6" },
        { label: "Sent Today", value: "15" }
      ]
    },
    {
      title: "Roadmaps Management",
      description: "Create and manage learning roadmaps, levels, milestones, and challenges",
      icon: Workflow,
      color: "text-pink-400",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500/20",
      path: "/admin/roadmaps",
      actions: [
        { name: "Manage Roadmaps", icon: Edit3, path: "/admin/roadmaps" },
      ],
      stats: [
        { label: "Roadmaps", value: "-" },
        { label: "Levels", value: "-" }
      ]
    },
  ];

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
                Admin Dashboard
              </h1>
              <p className="text-white/60 mt-2">Manage all aspects of the Blackbird Portal</p>
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
        
        {/* Navigation Tabs */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'users', label: 'User Management', icon: Users },
              { id: 'content', label: 'Content', icon: FileText },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'workflows', label: 'Workflows', icon: Workflow },
              { id: 'advanced-users', label: 'Advanced Users', icon: Shield },
              { id: 'monitoring', label: 'Monitoring', icon: Activity },
              { id: 'integration', label: 'Integration', icon: Activity },
              { id: 'optimization', label: 'Optimization', icon: Settings },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'audit', label: 'Audit Log', icon: Eye },
              { id: 'mfa', label: '2FA', icon: Lock },
              { id: 'assistant', label: 'Assistant', icon: Shield },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeSection === tab.id ? "default" : "outline"}
                className={`gap-2 ${activeSection === tab.id ? 'bg-white/20 text-white' : 'bg-white/5 hover:bg-white/10 text-white/70'}`}
                onClick={() => setActiveSection(tab.id as any)}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </Button>
            ))}
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
        
        {/* Dashboard Section */}
        {activeSection === 'dashboard' && (
          <>
            {/* Admin Modules Grid */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
          {adminModules.map((module, index) => (
            <Card 
              key={index}
              className={`backdrop-blur-sm border transition-colors duration-300 ${module.bgColor} ${module.borderColor}`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${module.bgColor} ${module.color}`}>
                      <module.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold">{module.title}</CardTitle>
                      <CardDescription className="text-white/60">{module.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {module.stats.map((stat, i) => (
                      <div key={i} className="text-center">
                        <div className="text-lg font-bold">{stat.value}</div>
                        <div className="text-xs text-white/60">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {module.actions.map((action, i) => (
                    <Button 
                      key={i}
                      variant="outline"
                      className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-center min-h-[40px]"
                      onClick={() => router.push(action.path)}
                    >
                      <action.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{action.name}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="ghost" 
                  className="w-full justify-center bg-white/5 hover:bg-white/10 text-center"
                  onClick={() => router.push(module.path)}
                >
                  View All
                </Button>
              </CardFooter>
            </Card>
          ))}
        </motion.div>
        
        {/* Product Playground Section */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-xl font-bold">Product Management</CardTitle>
                <CardDescription>Manage products and their details</CardDescription>
              </div>
              <Button 
                variant="outline" 
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 flex items-center justify-center gap-2"
                onClick={() => router.push('/admin/products?action=create')}
              >
                <PlusCircle className="w-4 h-4" />
                Add Product
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-white/60">
                Manage all products available in the system. Add new products, update existing ones, and set their prices.
              </p>
              <div className="mt-4">
                <Link 
                  href="/admin/products"
                  className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-200 flex items-center"
                >
                  <Package className="mr-3 h-5 w-5 text-blue-400" />
                  <span>View All Products</span>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-xl font-bold">Purchase Management</CardTitle>
                <CardDescription>Review and manage pending and completed purchases</CardDescription>
              </div>
              <Button 
                variant="outline" 
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 flex items-center justify-center gap-2"
                onClick={() => router.push('/admin/purchases')}
              >
                <ShoppingCart className="w-4 h-4" />
                View Purchases
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-white/60">
                Monitor all product purchases. View pending orders and completed transactions.
              </p>
              {stats.pendingPurchasesCount > 0 && (
                <div className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded-md text-red-200">
                  <p className="flex items-center gap-2 text-sm">
                    <XCircle className="w-4 h-4" />
                    {stats.pendingPurchasesCount} pending orders
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        


            {/* User Profile Modal */}
            <UserProfileModal
              user={selectedUser ? {
                id: selectedUser.id,
                email: selectedUser.email || '',
                fullName: selectedUser.full_name,
                username: selectedUser.username,
                mobilePhone: selectedUser.mobile_phone,
                role: selectedUser.role.toUpperCase() as 'ADMIN' | 'USER' | 'MODERATOR',
                isVerified: selectedUser.is_verified,
                isActive: selectedUser.is_active ?? true,
                avatarUrl: selectedUser.avatarUrl,
                bio: selectedUser.bio,
                studentId: selectedUser.student_id,
                createdAt: selectedUser.created_at,
                lastLogin: selectedUser.last_login || undefined
              } : null}
              isOpen={showUserModal}
              onClose={() => {
                setShowUserModal(false)
                setSelectedUser(null)
              }}
              onUpdate={handleUserUpdate}
            />
          </>
        )}

        {/* Users Section */}
        {activeSection === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
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
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="h-8 bg-gray-500/10 border-gray-500/30 text-gray-300 hover:bg-gray-500/20"
                                  onClick={() => handleEditUser(user)}
                                >
                                  <Edit3 className="w-3 h-3 mr-1" />
                                  Edit
                                </Button>
                                
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
        )}

        {/* Content Section */}
        {activeSection === 'content' && (
          <ContentEditor />
        )}

        {/* Notifications Section */}
        {activeSection === 'notifications' && (
          <NotificationSystem />
        )}

        {/* Analytics Section */}
        {activeSection === 'analytics' && (
          <AdvancedAnalytics />
        )}

        {/* Workflows Section */}
        {activeSection === 'workflows' && (
          <WorkflowAutomation />
        )}

        {/* Advanced Users Section */}
        {activeSection === 'advanced-users' && (
          <AdvancedUserManagement />
        )}

        {/* Monitoring Section */}
        {activeSection === 'monitoring' && (
          <SystemMonitoring />
        )}

        {/* Integration Section */}
        {activeSection === 'integration' && (
          <IntegrationDashboard />
        )}

        {/* Optimization Section */}
        {activeSection === 'optimization' && (
          <DataOptimization />
        )}

        {/* Security Section */}
        {activeSection === 'security' && (
          <SecurityCenter />
        )}

        {/* Audit Log Section */}
        {activeSection === 'audit' && (
          <AuditLogViewer />
        )}

        {/* Two Factor Auth Section */}
        {activeSection === 'mfa' && (
          <TwoFactorAuth />
        )}

        {/* Roadmaps Section */}
        {activeSection === 'roadmaps' && (
          <RoadmapsManager />
        )}

        {/* Assistant Section */}
        {activeSection === 'assistant' && (
          <AssistantManager theme="dark" />
        )}

        {/* Settings Section */}
        {activeSection === 'settings' && (
          <SystemSettings />
        )}
      </motion.div>
    </div>
  )
} 