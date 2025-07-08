'use client'

import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/theme-context'
import { Bell, Moon, Sun } from 'lucide-react'

export function MobileMenuActions() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t transition-colors duration-300" style={{ borderColor: 'var(--header-border)' }}>
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="sm"
          className="transition-colors duration-300"
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
            <Moon className="h-4 w-4 mr-2" />
          ) : (
            <Sun className="h-4 w-4 mr-2" />
          )}
          Theme
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          className="transition-colors duration-300"
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
          <Bell className="h-4 w-4 mr-2" />
          Notifications
        </Button>
      </div>
    </div>
  )
} 