import { AlertCircle } from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const { theme } = useTheme()
  
  return (
    <div className="min-h-screen flex items-center justify-center transition-colors duration-300" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="text-center max-w-md mx-auto px-4">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
        <h2 className="text-xl font-bold mb-2 transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
          Error Occurred
        </h2>
        <p className="mb-4 transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
          {message}
        </p>
        {onRetry && (
          <Button onClick={onRetry} className="transition-colors duration-300">
            Try Again
          </Button>
        )}
      </div>
    </div>
  )
} 