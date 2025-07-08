'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { HeaderLogo } from './HeaderLogo'
import { DesktopNavigation } from './DesktopNavigation'
import { SearchBar } from './SearchBar'
import { UserActions } from './UserActions'
import { MobileMenu } from './MobileMenu'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isHomePage = pathname === '/'

  return (
    <motion.header 
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled || !isHomePage 
          ? 'backdrop-blur-md border-b' 
          : 'bg-transparent'
      }`}
      style={{
        backgroundColor: scrolled || !isHomePage ? 'var(--header-bg)' : 'transparent',
        borderColor: scrolled || !isHomePage ? 'var(--header-border)' : 'transparent'
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <HeaderLogo />
          <DesktopNavigation />
          <SearchBar />
          <UserActions 
            mobileMenuOpen={mobileMenuOpen} 
            setMobileMenuOpen={setMobileMenuOpen} 
          />
        </div>
      </div>

      <MobileMenu 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen} 
      />
    </motion.header>
  )
} 