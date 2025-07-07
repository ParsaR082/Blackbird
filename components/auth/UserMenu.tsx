'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AuthModal } from '@/components/auth/AuthModal'
import { UserAuth } from '@/types'
import { 
  User, 
  Settings,
  LogOut,
  ChevronDown,
  Shield,
  UserCheck,
  Loader2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function UserMenu() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const handleLogin = () => {
    setAuthMode('login')
    setShowAuthModal(true)
  }

  const handleRegister = () => {
    setAuthMode('register')
    setShowAuthModal(true)
  }

  const handleAuthComplete = (user: UserAuth) => {
    setShowAuthModal(false)
    
    // Redirect based on user role
    if (user.role === 'ADMIN') {
      router.push('/admin')
    } else {
      router.push('/dashboard')
    }
  }

  // User's initials for avatar fallback
  const getUserInitials = (): string => {
    if (!user?.fullName) return 'U'
    
    const names = user.fullName.split(' ')
    if (names.length === 1) return names[0][0].toUpperCase()
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
  }

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled className="text-white/70">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Loading...
      </Button>
    )
  }

  // Not authenticated - show login/register buttons
  if (!isAuthenticated) {
    return (
      <>
        <div className="hidden md:flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-white/70 hover:text-white hover:bg-white/10"
            onClick={handleLogin}
          >
            Login
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="text-white border-white/30 hover:bg-white/10 hover:text-white"
            onClick={handleRegister}
          >
            Sign Up
          </Button>
        </div>
        
        {/* Mobile Version */}
        <Button 
          variant="outline" 
          size="sm"
          className="md:hidden text-white border-white/30 hover:bg-white/10 hover:text-white"
          onClick={handleLogin}
        >
          Login
        </Button>

        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode={authMode}
          onAuthComplete={handleAuthComplete}
        />
      </>
    )
  }

  // Authenticated - show user menu
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-2 text-white hover:bg-white/10"
          >
            <Avatar className="h-8 w-8 border border-white/20">
              <AvatarImage src={user?.avatarUrl || undefined} alt={user?.email || 'User'} />
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium">{user?.email}</span>
              <span className="text-xs text-white/70">{user?.role}</span>
            </div>
            <ChevronDown className="hidden md:block h-4 w-4 text-white/70" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          align="end" 
          className="w-56 bg-black/95 backdrop-blur-md border border-white/20 text-white shadow-2xl"
          sideOffset={8}
        >
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.fullName}</p>
              <p className="text-xs leading-none text-white/70">{user?.email}</p>
              {!user?.isVerified && (
                <p className="text-xs text-yellow-400">Unverified Account</p>
              )}
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator className="bg-white/10" />
          
          <DropdownMenuItem 
            className="flex items-center cursor-pointer hover:bg-white/10"
            onClick={() => router.push('/dashboard')}
          >
            <User className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="flex items-center cursor-pointer hover:bg-white/10"
            onClick={() => router.push('/users/profile')}
          >
            <UserCheck className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="flex items-center cursor-pointer hover:bg-white/10"
            onClick={() => router.push('/users/settings')}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          
          {user?.role === 'ADMIN' && (
            <DropdownMenuItem 
              className="flex items-center cursor-pointer hover:bg-white/10"
              onClick={() => router.push('/admin')}
            >
              <Shield className="mr-2 h-4 w-4" />
              <span>Admin Panel</span>
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator className="bg-white/10" />
          
          <DropdownMenuItem 
            className="flex items-center text-red-400 cursor-pointer hover:bg-white/10 hover:text-red-400"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
} 