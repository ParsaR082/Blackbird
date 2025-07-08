'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Set initial theme immediately
    const root = document.documentElement
    
    // Check if theme is saved in localStorage
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme) {
      setTheme(savedTheme)
      root.classList.remove('light', 'dark')
      root.classList.add(savedTheme)
    } else {
      // Default to dark theme
      setTheme('dark')
      root.classList.remove('light', 'dark')
      root.classList.add('dark')
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('theme', theme)
      
      // Apply theme to html element
      const root = document.documentElement
      root.classList.remove('light', 'dark')
      root.classList.add(theme)
      
      // Update CSS custom properties for theme
      if (theme === 'light') {
        root.style.setProperty('--bg-color', '#ffffff')
        root.style.setProperty('--text-color', '#000000')
        root.style.setProperty('--text-secondary', '#666666')
        root.style.setProperty('--border-color', '#e5e7eb')
        root.style.setProperty('--node-color', '#6b7280')
        root.style.setProperty('--node-line-color', '#9ca3af')
        root.style.setProperty('--header-bg', 'rgba(255, 255, 255, 0.95)')
        root.style.setProperty('--header-border', 'rgba(0, 0, 0, 0.1)')
        root.style.setProperty('--category-bg', 'rgba(255, 255, 255, 0.9)')
        root.style.setProperty('--category-border', 'rgba(0, 0, 0, 0.2)')
        root.style.setProperty('--category-text', '#000000')
        root.style.setProperty('--category-hover-bg', 'rgba(0, 0, 0, 0.05)')
        root.style.setProperty('--category-hover-border', '#000000')
        root.style.setProperty('--category-hover-shadow', 'rgba(0, 0, 0, 0.2)')
        root.style.setProperty('--glow-color', '#ffffff')
        root.style.setProperty('--logo-color', '#000000')
      } else {
        root.style.setProperty('--bg-color', '#000000')
        root.style.setProperty('--text-color', '#ffffff')
        root.style.setProperty('--text-secondary', 'rgba(255, 255, 255, 0.7)')
        root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.2)')
        root.style.setProperty('--node-color', '#ffffff')
        root.style.setProperty('--node-line-color', '#ffffff')
        root.style.setProperty('--header-bg', 'rgba(0, 0, 0, 0.95)')
        root.style.setProperty('--header-border', 'rgba(255, 255, 255, 0.1)')
        root.style.setProperty('--category-bg', 'rgba(0, 0, 0, 0.9)')
        root.style.setProperty('--category-border', 'rgba(255, 255, 255, 0.3)')
        root.style.setProperty('--category-text', '#ffffff')
        root.style.setProperty('--category-hover-bg', 'rgba(17, 17, 17, 0.95)')
        root.style.setProperty('--category-hover-border', '#ffffff')
        root.style.setProperty('--category-hover-shadow', 'rgba(255, 255, 255, 0.4)')
        root.style.setProperty('--glow-color', '#ffffff')
        root.style.setProperty('--logo-color', '#ffffff')
      }
    }
  }, [theme, mounted])

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  if (!mounted) {
    return null
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
} 