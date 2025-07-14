import { X, AlertCircle } from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ErrorMessageProps {
  message: string
  onDismiss?: () => void
}

export function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  const { theme } = useTheme()
  
  return (
    <Card className="border-red-200 mb-6 transition-colors duration-300" style={{
      backgroundColor: theme === 'light' ? 'rgba(254, 226, 226, 0.7)' : 'rgba(220, 38, 38, 0.1)',
      borderColor: theme === 'light' ? 'rgba(220, 38, 38, 0.3)' : 'rgba(220, 38, 38, 0.3)'
    }}>
      <CardContent className="pt-6">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
          <p className="text-red-600 dark:text-red-400">{message}</p>
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="ml-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 