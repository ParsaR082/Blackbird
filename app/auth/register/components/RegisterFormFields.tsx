'use client'

import { Input } from '@/components/ui/input'
import { Eye, EyeOff } from 'lucide-react'
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator'

interface FormData {
  studentId: string
  phoneNumber: string
  fullName: string
  username: string
  email: string
  password: string
  confirmPassword: string
}

interface RegisterFormFieldsProps {
  formData: FormData
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  showPassword: boolean
  setShowPassword: (show: boolean) => void
  showConfirmPassword: boolean
  setShowConfirmPassword: (show: boolean) => void
}

export function RegisterFormFields({
  formData,
  handleInputChange,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword
}: RegisterFormFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      <Input
        name="studentId"
        type="text"
        placeholder="Student ID"
        value={formData.studentId}
        onChange={handleInputChange}
        required
      />
      
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          +
        </span>
        <Input
          name="phoneNumber"
          type="tel"
          placeholder="98XXXXXXXXXX"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          className="pl-8"
          required
        />
      </div>
      
      <Input
        name="fullName"
        type="text"
        placeholder="Full Name"
        value={formData.fullName}
        onChange={handleInputChange}
        required
      />
      
      <Input
        name="username"
        type="text"
        placeholder="Username"
        value={formData.username}
        onChange={handleInputChange}
        required
      />
      
      <Input
        name="email"
        type="email"
        placeholder="your.email@gmail.com"
        value={formData.email}
        onChange={handleInputChange}
        required
      />
      
      <div className="relative">
        <Input
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder="Password (min 8 characters)"
          value={formData.password}
          onChange={handleInputChange}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
        <PasswordStrengthIndicator password={formData.password} />
      </div>
      
      <div className="relative">
        <Input
          name="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          required
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2"
        >
          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
} 