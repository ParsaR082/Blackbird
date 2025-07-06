import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blackbird Portal',
  description: 'Explore our interconnected universe of innovation, creativity, and discovery',
  keywords: ['portal', 'innovation', 'technology', 'creativity', 'discovery'],
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>{children}</>
  )
} 