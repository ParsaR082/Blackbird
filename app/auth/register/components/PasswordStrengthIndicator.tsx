'use client'

interface PasswordStrengthIndicatorProps {
  password: string
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: '', color: '' }
    
    let score = 0
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
    
    score = Object.values(checks).filter(Boolean).length
    
    if (score < 2) return { score, label: 'Weak', color: 'bg-red-500' }
    if (score < 4) return { score, label: 'Fair', color: 'bg-yellow-500' }
    if (score < 5) return { score, label: 'Good', color: 'bg-blue-500' }
    return { score, label: 'Strong', color: 'bg-green-500' }
  }

  const strength = getPasswordStrength(password)
  
  if (!password) return null

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
          Password strength:
        </span>
        <span className={`text-xs font-medium ${
          strength.label === 'Weak' ? 'text-red-500' :
          strength.label === 'Fair' ? 'text-yellow-500' :
          strength.label === 'Good' ? 'text-blue-500' :
          'text-green-500'
        }`}>
          {strength.label}
        </span>
      </div>
      
      <div className="flex space-x-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded ${
              i < strength.score ? strength.color : 'bg-gray-300 dark:bg-gray-600'
            } transition-colors duration-300`}
          />
        ))}
      </div>
      
      <div className="mt-1 text-xs transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
        {password.length < 8 && "• At least 8 characters "}
        {!/[a-z]/.test(password) && "• Lowercase letter "}
        {!/[A-Z]/.test(password) && "• Uppercase letter "}
        {!/\d/.test(password) && "• Number "}
        {!/[!@#$%^&*(),.?":{}|<>]/.test(password) && "• Special character"}
      </div>
    </div>
  )
} 