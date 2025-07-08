'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { MAIN_NAV } from '@/constants'
import { MobileSearch } from './MobileSearch'
import { MobileMenuActions } from './MobileMenuActions'

interface MobileMenuProps {
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
}

export function MobileMenu({ mobileMenuOpen, setMobileMenuOpen }: MobileMenuProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence>
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden backdrop-blur-md border-t transition-colors duration-300"
          style={{
            backgroundColor: 'var(--header-bg)',
            borderColor: 'var(--header-border)'
          }}
        >
          <div className="container mx-auto px-4 py-4">
            <MobileSearch />

            {/* Mobile Navigation */}
            <nav className="flex flex-col space-y-3">
              {MAIN_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
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
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.title}
                </Link>
              ))}
            </nav>

            <MobileMenuActions />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 