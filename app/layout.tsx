import type { Metadata, Viewport } from 'next'
import '../styles/globals.css'
import { Header } from '@/components/layout/header'
import { AuthProvider } from '@/contexts/auth-context'
import { ThemeProvider } from '@/contexts/theme-context'
import { Toaster } from 'sonner'

// Use CSS fallback fonts instead of Google Fonts for build resilience
const fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'

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
      <head>
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" 
          rel="stylesheet"
          // Make font loading optional - won't block build if unavailable
        />
      </head>
      <body 
        className="min-h-screen antialiased transition-colors duration-300" 
        style={{ 
          backgroundColor: 'var(--bg-color)', 
          color: 'var(--text-color)',
          fontFamily: `Inter, ${fontFamily}`
        }}
      >
        <ThemeProvider>
          <AuthProvider>
            <div className="relative min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                {children}
              </main>
            </div>
            <Toaster position="top-right" theme="dark" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
} 