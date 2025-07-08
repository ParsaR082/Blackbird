'use client'

import { Button } from '@/components/ui/button'
import { UserMenu } from '@/components/auth/UserMenu'
import { useTheme } from '@/contexts/theme-context'
import { Moon, Sun, Bell, Menu, X } from 'lucide-react'

interface UserActionsProps {
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
}

export function UserActions({ mobileMenuOpen, setMobileMenuOpen }: UserActionsProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="flex items-center space-x-2">
      {/* Theme Toggle */}
      <Button 
        variant="ghost" 
        size="icon"
        className="hidden md:flex transition-colors duration-300"
        style={{ 
          color: 'var(--text-secondary)',
          backgroundColor: 'transparent'
        }}
        onClick={toggleTheme}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text-color)'
          e.currentTarget.style.backgroundColor = theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-secondary)'
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        {theme === 'light' ? (
          <Moon className="h-4 w-4 transition-all duration-300" />
        ) : (
          <Sun className="h-4 w-4 transition-all duration-300" />
        )}
        <span className="sr-only">Toggle theme</span>
      </Button>

      {/* Notifications */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="hidden md:flex relative transition-colors duration-300"
        style={{ 
          color: 'var(--text-secondary)',
          backgroundColor: 'transparent'
        }}
        onClick={() => {
          alert('Notifications feature coming soon!')
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text-color)'
          e.currentTarget.style.backgroundColor = theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-secondary)'
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        <Bell className="h-4 w-4" />
        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
      </Button>

      {/* User Menu */}
      <UserMenu />

      {/* Mobile Menu Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden transition-colors duration-300"
        style={{ 
          color: 'var(--text-secondary)',
          backgroundColor: 'transparent'
        }}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text-color)'
          e.currentTarget.style.backgroundColor = theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-secondary)'
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        {mobileMenuOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </Button>
    </div>
  )
} 