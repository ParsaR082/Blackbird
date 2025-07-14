'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Save, 
  X, 
  Loader2,
  Camera,
  Trash2,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'

interface UserProfile {
  id: string
  email: string
  fullName: string
  username?: string
  mobilePhone?: string
  role: 'ADMIN' | 'USER' | 'MODERATOR'
  isVerified: boolean
  isActive: boolean
  avatarUrl?: string
  bio?: string
  studentId?: string
  createdAt: string
  lastLogin?: string
}

interface UserProfileModalProps {
  user: UserProfile | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (updatedUser: UserProfile) => void
}

export function UserProfileModal({ user, isOpen, onClose, onUpdate }: UserProfileModalProps) {
  const [formData, setFormData] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setFormData({ ...user })
      setAvatarPreview(user.avatarUrl || null)
    }
  }, [user])

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    if (formData) {
      setFormData({ ...formData, [field]: value })
    }
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    if (!formData) return

    setIsSaving(true)
    try {
      // Prepare form data for upload
      const updateData = new FormData()
      updateData.append('userId', formData.id)
      updateData.append('email', formData.email)
      updateData.append('fullName', formData.fullName)
      updateData.append('role', formData.role)
      updateData.append('isVerified', formData.isVerified.toString())
      updateData.append('isActive', formData.isActive.toString())
      
      if (formData.mobilePhone) {
        updateData.append('mobilePhone', formData.mobilePhone)
      }
      if (formData.bio) {
        updateData.append('bio', formData.bio)
      }
      if (formData.studentId) {
        updateData.append('studentId', formData.studentId)
      }
      if (avatarFile) {
        updateData.append('avatar', avatarFile)
      }

      const response = await fetch('/api/admin/users/update', {
        method: 'PUT',
        body: updateData
      })

      if (!response.ok) {
        throw new Error('Failed to update user')
      }

      const updatedUser = await response.json()
      onUpdate(updatedUser)
      toast.success('User profile updated successfully')
      onClose()
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Failed to update user profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!formData) return

    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${formData.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete user')
      }

      toast.success('User deleted successfully')
      onClose()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuspendUser = async () => {
    if (!formData) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${formData.id}/suspend`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !formData.isActive })
      })

      if (!response.ok) {
        throw new Error('Failed to update user status')
      }

      const updatedUser = await response.json()
      onUpdate(updatedUser)
      toast.success(`User ${formData.isActive ? 'suspended' : 'activated'} successfully`)
    } catch (error) {
      console.error('Error updating user status:', error)
      toast.error('Failed to update user status')
    } finally {
      setIsLoading(false)
    }
  }

  if (!formData) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Edit User Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage src={avatarPreview || undefined} alt={formData.fullName} />
                <AvatarFallback className="text-lg">
                  {formData.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer hover:bg-primary/90">
                <Camera className="w-3 h-3" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{formData.fullName}</h3>
              <p className="text-sm text-muted-foreground">{formData.email}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant={formData.isVerified ? "default" : "secondary"}>
                  {formData.isVerified ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 mr-1" />
                      Unverified
                    </>
                  )}
                </Badge>
                <Badge variant={formData.isActive ? "default" : "destructive"}>
                  {formData.isActive ? "Active" : "Suspended"}
                </Badge>
                <Badge variant="outline">
                  <Shield className="w-3 h-3 mr-1" />
                  {formData.role}
                </Badge>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobilePhone">Mobile Phone</Label>
              <Input
                id="mobilePhone"
                value={formData.mobilePhone || ''}
                onChange={(e) => handleInputChange('mobilePhone', e.target.value)}
                placeholder="+1234567890"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID</Label>
              <Input
                id="studentId"
                value={formData.studentId || ''}
                onChange={(e) => handleInputChange('studentId', e.target.value)}
                placeholder="12345678"
              />
            </div>
          </div>

          {/* Role and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="MODERATOR">Moderator</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username || ''}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="username"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio || ''}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
            />
          </div>

          {/* Status Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Verified Status</Label>
                <p className="text-sm text-muted-foreground">
                  {formData.isVerified ? 'User account is verified' : 'User account is not verified'}
                </p>
              </div>
              <Switch
                checked={formData.isVerified}
                onCheckedChange={(checked) => handleInputChange('isVerified', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Account Status</Label>
                <p className="text-sm text-muted-foreground">
                  {formData.isActive ? 'User account is active' : 'User account is suspended'}
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange('isActive', checked)}
              />
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium">Account Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Created:</span>
                <p>{new Date(formData.createdAt).toLocaleDateString()}</p>
              </div>
              {formData.lastLogin && (
                <div>
                  <span className="text-muted-foreground">Last Login:</span>
                  <p>{new Date(formData.lastLogin).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSuspendUser}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
                {formData.isActive ? 'Suspend' : 'Activate'}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteUser}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete User
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 