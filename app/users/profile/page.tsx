'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import BackgroundNodes from '@/components/BackgroundNodes'
import { 
  User, 
  Mail, 
  Key, 
  Camera,
  Save,
  Loader2,
  Shield,
  Settings,
  Bell,
  Lock
} from 'lucide-react'

interface UserProfile {
  fullName: string
  email: string
  avatarUrl?: string
  role: string
  isVerified: boolean
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
}

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirectTo=/users/profile')
      return
    }

    if (isAuthenticated && user) {
      setProfile({
        fullName: user.fullName || '',
        email: user.email || '',
        avatarUrl: user.avatarUrl || undefined,
        role: user.role || 'user',
        isVerified: user.isVerified || false
      })
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setLoading(false)
    }
  }, [isAuthenticated, isLoading, user, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        }),
      })

      if (response.ok) {
        // Update local state
        setProfile(prev => prev ? {
          ...prev,
          fullName: formData.fullName,
          email: formData.email
        } : null)
        
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }))
        
        alert('Profile updated successfully!')
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.message}`)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('An error occurred while updating your profile')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white/60 mx-auto mb-4" />
          <p className="text-white/60">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
      <BackgroundNodes isMobile={false} />
      
      <motion.div 
        className="relative z-10 container mx-auto px-4 pt-24 pb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Profile Settings
              </h1>
              <p className="text-white/60 mt-2">
                Manage your account information and preferences
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <User className="h-12 w-12 text-white/40" />
            </motion.div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Profile Overview</CardTitle>
                <CardDescription className="text-white/60">
                  Your account information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profile.avatarUrl} />
                      <AvatarFallback className="bg-white/10 text-white text-lg">
                        {profile.fullName?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-white">{profile.fullName}</h3>
                    <p className="text-sm text-white/60">{profile.email}</p>
                    <div className="flex items-center justify-center space-x-2 mt-2">
                      <Shield className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-white/80 capitalize">{profile.role}</span>
                      {profile.isVerified && (
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Account Stats */}
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <div className="flex justify-between">
                    <span className="text-white/60">Member since</span>
                    <span className="text-white/80">2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Status</span>
                    <span className={`text-sm ${profile.isVerified ? 'text-green-400' : 'text-yellow-400'}`}>
                      {profile.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Edit Profile Form */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Personal Information
                </CardTitle>
                <CardDescription className="text-white/60">
                  Update your personal details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-white/80">Full Name</label>
                    <Input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-white/80">Email</label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Lock className="h-5 w-5 mr-2" />
                  Security Settings
                </CardTitle>
                <CardDescription className="text-white/60">
                  Change your password and security preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-white/80">Current Password</label>
                  <Input
                    name="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    placeholder="Enter current password"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-white/80">New Password</label>
                    <Input
                      name="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-white/80">Confirm Password</label>
                    <Input
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSaveProfile}
                disabled={saving}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
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
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
} 