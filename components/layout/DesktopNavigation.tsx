'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { MAIN_NAV } from '@/constants'

export function DesktopNavigation() {
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuth()

  return (
    <nav className="hidden md:flex items-center space-x-8">
      {MAIN_NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`relative text-sm font-medium transition-colors group ${
            pathname === item.href ? '' : ''
          }`}
          style={{
            color: pathname === item.href ? 'var(--text-color)' : 'var(--text-secondary)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-color)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = pathname === item.href ? 'var(--text-color)' : 'var(--text-secondary)'
          }}
        >
          {item.title}
          {pathname === item.href && (
            <motion.div
              className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white"
              layoutId="activeTab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </Link>
      ))}
      
      {/* Admin Dashboard Link for Admin Users */}
      {isAuthenticated && user?.role === 'ADMIN' && (
        <Link
          href="/admin"
          className={`relative text-sm font-medium transition-colors group ${
            pathname === '/admin' ? '' : ''
          }`}
          style={{
            color: pathname === '/admin' ? 'var(--text-color)' : 'var(--text-secondary)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-color)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = pathname === '/admin' ? 'var(--text-color)' : 'var(--text-secondary)'
          }}
        >
          Admin Dashboard
          {pathname === '/admin' && (
            <motion.div
              className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white"
              layoutId="activeTab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </Link>
      )}
    </nav>
  )
} 