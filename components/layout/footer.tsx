import Link from 'next/link'
import { FOOTER_NAV, SITE_CONFIG } from '@/constants'

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container px-4 py-8 mx-auto">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-sm font-bold">B</span>
              </div>
              <span className="font-bold text-lg">{SITE_CONFIG.name}</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              {SITE_CONFIG.description}
            </p>
            <div className="flex space-x-4">
              {FOOTER_NAV.social.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              {FOOTER_NAV.main.map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Additional Info */}
          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Version {SITE_CONFIG.version}</p>
              <p>
                Built with{' '}
                <span className="text-red-500">❤️</span>{' '}
                by {SITE_CONFIG.author}
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t mt-8 pt-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
} 