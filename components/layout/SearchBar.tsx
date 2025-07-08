'use client'

import { Search } from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

export function SearchBar() {
  const { theme } = useTheme()

  return (
    <div className="hidden md:flex flex-1 max-w-md mx-8">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-300" style={{ color: 'var(--text-secondary)' }} />
        <input
          type="search"
          placeholder="Search modules..."
          className="w-full rounded-full backdrop-blur-sm border pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 transition-all duration-300"
          style={{
            backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.1)',
            borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
            color: theme === 'light' ? '#000000' : '#ffffff'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = theme === 'light' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'
          }}
        />
      </div>
    </div>
  )
} 