'use client'

import Link from 'next/link'
import { FOOTER_NAV, SITE_CONFIG } from '@/constants'
import { useTheme } from '@/contexts/theme-context'

export function Footer() {
  const { theme } = useTheme()
  
  return (
    <footer className="border-t transition-colors duration-300" style={{
      backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.95)',
      borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
    }}>
      <div className="container px-4 py-8 mx-auto">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-300" style={{
                backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                color: theme === 'light' ? '#000000' : '#ffffff'
              }}>
                <span className="text-sm font-bold">B</span>
              </div>
              <span className="font-bold text-lg transition-colors duration-300" style={{ 
                color: theme === 'light' ? '#000000' : '#ffffff' 
              }}>
                {SITE_CONFIG.name}
              </span>
            </Link>
            <p className="text-sm mb-4 max-w-md transition-colors duration-300" style={{ 
              color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)' 
            }}>
              {SITE_CONFIG.description}
            </p>
            <div className="flex space-x-4">
              {FOOTER_NAV.social.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm transition-colors duration-300 hover:scale-105"
                  style={{ 
                    color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)' 
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = theme === 'light' ? '#000000' : '#ffffff'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)'
                  }}
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="font-semibold mb-4 transition-colors duration-300" style={{ 
              color: theme === 'light' ? '#000000' : '#ffffff' 
            }}>
              Navigation
            </h3>
            <ul className="space-y-2">
              {FOOTER_NAV.main.map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.href}
                    className="text-sm transition-colors duration-300 hover:scale-105"
                    style={{ 
                      color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)' 
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = theme === 'light' ? '#000000' : '#ffffff'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)'
                    }}
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Additional Info */}
          <div>
            <h3 className="font-semibold mb-4 transition-colors duration-300" style={{ 
              color: theme === 'light' ? '#000000' : '#ffffff' 
            }}>
              Connect
            </h3>
            <div className="space-y-2 text-sm" style={{ 
              color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)' 
            }}>
              <p className="transition-colors duration-300">Version {SITE_CONFIG.version}</p>
              <p className="transition-colors duration-300">
                Built with{' '}
                <span className="text-red-500 animate-pulse">❤️</span>{' '}
                by {SITE_CONFIG.author}
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t mt-8 pt-4 text-center transition-colors duration-300" style={{
          borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
        }}>
          <p className="text-sm transition-colors duration-300" style={{ 
            color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)' 
          }}>
            © {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
} 