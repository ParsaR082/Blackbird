'use client'

import { Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/theme-context'

interface SaveButtonProps {
  onSave: () => void
  saving: boolean
}

export function SaveButton({ onSave, saving }: SaveButtonProps) {
  const { theme } = useTheme()
  
  return (
    <div className="flex justify-end">
      <Button
        onClick={onSave}
        disabled={saving}
        className="transition-colors duration-300"
        style={{
          backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
          borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
          color: 'var(--text-color)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
        }}
      >
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </>
        )}
      </Button>
    </div>
  )
} 