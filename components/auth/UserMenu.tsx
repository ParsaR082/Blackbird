'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UserAuth } from '@/types'
import { useTheme } from '@/contexts/theme-context'
import { motion } from 'framer-motion'
import { 
  User, 
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
import { AuthButtons } from './AuthButtons'

export function UserMenu() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { theme } = useTheme()

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const handleLogin = () => {
    router.push('/auth/login')
  }

  const handleRegister = () => {
    router.push('/auth/register')
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
      <Button variant="ghost" size="sm" disabled className="transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Loading...
      </Button>
    )
  }

  // Not authenticated - show login/register buttons
  if (!isAuthenticated) {
    return <AuthButtons onLogin={handleLogin} onRegister={handleRegister} />
  }

  // Authenticated - show user dropdown
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatarUrl || undefined} alt={user?.fullName || 'User'} />
            <AvatarFallback>{getUserInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.fullName}</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/users/profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard">
            <Shield className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 