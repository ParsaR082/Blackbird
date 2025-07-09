import { Loader2 } from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

interface LoadingStateProps {
  message?: string
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  const { theme } = useTheme()
  
  return (
    <div className="min-h-screen flex items-center justify-center transition-colors duration-300" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 transition-colors duration-300" style={{ color: 'var(--text-secondary)' }} />
        <p className="transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>{message}</p>
      </div>
    </div>
  )
} 