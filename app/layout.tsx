import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import { Header } from '@/components/layout/header'
import { AuthProvider } from '@/contexts/auth-context'
import { ThemeProvider } from '@/contexts/theme-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Blackbird Portal',
  description: 'Explore our interconnected universe of innovation, creativity, and discovery',
  keywords: ['portal', 'innovation', 'technology', 'creativity', 'discovery'],
  authors: [{ name: 'Blackbird Portal Team' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen antialiased transition-colors duration-300`} style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
        <ThemeProvider>
          <AuthProvider>
            <div className="relative min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                {children}
              </main>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
} 