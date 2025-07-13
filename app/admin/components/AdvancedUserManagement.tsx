'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  Shield, 
  UserCheck, 
  UserX,
  Building,
  FolderOpen,
  History,
  Settings,
  Plus,
  Edit3,
  Trash2,
  Search,
  Filter,
  Download,
  Eye,
  Lock,
  Unlock,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

interface User {
  id: string
  email: string
  fullName: string
  username: string
  role: 'ADMIN' | 'USER' | 'MODERATOR' | 'MANAGER'
  department: string
  groups: string[]
  permissions: string[]
  isActive: boolean
  isVerified: boolean
  lastLogin: string
  createdAt: string
  avatarUrl?: string
}

interface UserGroup {
  id: string
  name: string
  description: string
  permissions: string[]
  members: string[]
  createdAt: string
}

interface Department {
  id: string
  name: string
  description: string
  manager: string
  members: string[]
  createdAt: string
}

interface AuditLog {
  id: string
  userId: string
  action: string
  resource: string
  details: string
  ipAddress: string
  userAgent: string
  timestamp: string
}

interface Permission {
  id: string
  name: string
  description: string
  category: string
  isActive: boolean
}

interface AdvancedUserManagementProps {
  className?: string
}

export function AdvancedUserManagement({ className }: AdvancedUserManagementProps) {
  const [users, setUsers] = useState<User[]>([])
  const [groups, setGroups] = useState<UserGroup[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditingUser, setIsEditingUser] = useState(false)
  const [isCreatingGroup, setIsCreatingGroup] = useState(false)
  const [activeTab, setActiveTab] = useState('users')

  // Form states
  const [userForm, setUserForm] = useState({
    email: '',
    fullName: '',
    username: '',
    role: 'USER' as User['role'],
    department: '',
    groups: [] as string[],
    permissions: [] as string[],
    isActive: true
  })

  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const [usersRes, groupsRes, departmentsRes, auditRes, permissionsRes] = await Promise.all([
        fetch('/api/admin/users/advanced'),
        fetch('/api/admin/users/groups'),
        fetch('/api/admin/users/departments'),
        fetch('/api/admin/users/audit-logs'),
        fetch('/api/admin/users/permissions')
      ])

      if (usersRes.ok) setUsers(await usersRes.json())
      if (groupsRes.ok) setGroups(await groupsRes.json())
      if (departmentsRes.ok) setDepartments(await departmentsRes.json())
      if (auditRes.ok) setAuditLogs(await auditRes.json())
      if (permissionsRes.ok) setPermissions(await permissionsRes.json())
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveUser = async () => {
    if (!userForm.email || !userForm.fullName) {
      toast.error('Email and full name are required')
      return
    }

    try {
      const url = selectedUser ? `/api/admin/users/${selectedUser.id}` : '/api/admin/users'
      const method = selectedUser ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userForm)
      })

      if (!response.ok) {
        throw new Error('Failed to save user')
      }

      const savedUser = await response.json()
      
      if (selectedUser) {
        setUsers(items => 
          items.map(item => item.id === selectedUser.id ? savedUser : item)
        )
        toast.success('User updated successfully')
      } else {
        setUsers(items => [savedUser, ...items])
        toast.success('User created successfully')
      }

      handleCancelUser()
    } catch (error) {
      console.error('Error saving user:', error)
      toast.error('Failed to save user')
    }
  }

  const handleSaveGroup = async () => {
    if (!groupForm.name.trim()) {
      toast.error('Group name is required')
      return
    }

    try {
      const response = await fetch('/api/admin/users/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(groupForm)
      })

      if (!response.ok) {
        throw new Error('Failed to save group')
      }

      const savedGroup = await response.json()
      setGroups(items => [savedGroup, ...items])
      toast.success('Group created successfully')
      handleCancelGroup()
    } catch (error) {
      console.error('Error saving group:', error)
      toast.error('Failed to save group')
    }
  }

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive })
      })

      if (!response.ok) {
        throw new Error('Failed to toggle user status')
      }

      setUsers(items => 
        items.map(item => 
          item.id === userId ? { ...item, isActive } : item
        )
      )

      toast.success(`User ${isActive ? 'activated' : 'deactivated'}`)
    } catch (error) {
      console.error('Error toggling user status:', error)
      toast.error('Failed to toggle user status')
    }
  }

  const handleCancelUser = () => {
    setSelectedUser(null)
    setIsEditingUser(false)
    setUserForm({
      email: '',
      fullName: '',
      username: '',
      role: 'USER',
      department: '',
      groups: [],
      permissions: [],
      isActive: true
    })
  }

  const handleCancelGroup = () => {
    setIsCreatingGroup(false)
    setGroupForm({
      name: '',
      description: '',
      permissions: []
    })
  }

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-500/20 text-red-300'
      case 'MANAGER': return 'bg-purple-500/20 text-purple-300'
      case 'MODERATOR': return 'bg-blue-500/20 text-blue-300'
      case 'USER': return 'bg-green-500/20 text-green-300'
      default: return 'bg-gray-500/20 text-gray-300'
    }
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
  }

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading advanced user management...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced User Management</h2>
          <p className="text-muted-foreground">Manage users, roles, permissions, and audit logs</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          {!isEditingUser && (
            <Button onClick={() => setIsEditingUser(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Users List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>User Management</CardTitle>
                      <CardDescription>Manage user accounts and permissions</CardDescription>
                    </div>
                    <div className="relative w-64">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'No matching users found' : 'No users found'}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredUsers.map((user) => (
                        <motion.div
                          key={user.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-medium">{user.fullName}</h3>
                                <Badge className={getRoleColor(user.role)}>
                                  {user.role}
                                </Badge>
                                <Badge className={getStatusColor(user.isActive)}>
                                  {user.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                                {user.isVerified && (
                                  <Badge className="bg-green-500/20 text-green-300">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Verified
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {user.email} • {user.department}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>{user.groups.length} groups</span>
                                <span>•</span>
                                <span>{user.permissions.length} permissions</span>
                                <span>•</span>
                                <span>Last login: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user)
                                  setUserForm({
                                    email: user.email,
                                    fullName: user.fullName,
                                    username: user.username,
                                    role: user.role,
                                    department: user.department,
                                    groups: user.groups,
                                    permissions: user.permissions,
                                    isActive: user.isActive
                                  })
                                  setIsEditingUser(true)
                                }}
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleUserStatus(user.id, !user.isActive)}
                              >
                                {user.isActive ? (
                                  <Lock className="w-4 h-4" />
                                ) : (
                                  <Unlock className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* User Editor */}
            {isEditingUser && (
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {selectedUser ? 'Edit User' : 'Create User'}
                    </CardTitle>
                    <CardDescription>
                      {selectedUser ? 'Update user information' : 'Add new user to the system'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="userEmail">Email</Label>
                      <Input
                        id="userEmail"
                        type="email"
                        value={userForm.email}
                        onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                        placeholder="user@example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="userFullName">Full Name</Label>
                      <Input
                        id="userFullName"
                        value={userForm.fullName}
                        onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="userUsername">Username</Label>
                      <Input
                        id="userUsername"
                        value={userForm.username}
                        onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                        placeholder="johndoe"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="userRole">Role</Label>
                      <Select value={userForm.role} onValueChange={(value) => setUserForm({ ...userForm, role: value as User['role'] })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USER">User</SelectItem>
                          <SelectItem value="MODERATOR">Moderator</SelectItem>
                          <SelectItem value="MANAGER">Manager</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="userDepartment">Department</Label>
                      <Select value={userForm.department} onValueChange={(value) => setUserForm({ ...userForm, department: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.name}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="userActive">Active</Label>
                      <Switch
                        id="userActive"
                        checked={userForm.isActive}
                        onCheckedChange={(checked) => setUserForm({ ...userForm, isActive: checked })}
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button variant="outline" onClick={handleCancelUser} className="flex-1">
                        Cancel
                      </Button>
                      <Button onClick={handleSaveUser} className="flex-1">
                        {selectedUser ? 'Update' : 'Create'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="groups" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Groups List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>User Groups</CardTitle>
                      <CardDescription>Manage user groups and permissions</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                  {groups.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No groups found</p>
                      <Button variant="outline" className="mt-4" onClick={() => setIsCreatingGroup(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Group
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {groups.map((group) => (
                        <motion.div
                          key={group.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-medium">{group.name}</h3>
                                <Badge variant="outline">{group.members.length} members</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {group.description}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>{group.permissions.length} permissions</span>
                                <span>•</span>
                                <span>Created {new Date(group.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Button variant="ghost" size="sm">
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Group Creator */}
            {isCreatingGroup && (
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Create Group</CardTitle>
                    <CardDescription>Create a new user group</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="groupName">Group Name</Label>
                      <Input
                        id="groupName"
                        value={groupForm.name}
                        onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                        placeholder="Content Moderators"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="groupDescription">Description</Label>
                      <Textarea
                        id="groupDescription"
                        value={groupForm.description}
                        onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                        placeholder="Group for content moderation tasks"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button variant="outline" onClick={handleCancelGroup} className="flex-1">
                        Cancel
                      </Button>
                      <Button onClick={handleSaveGroup} className="flex-1">
                        Create
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Departments</CardTitle>
              <CardDescription>Manage organizational departments</CardDescription>
            </CardHeader>
            <CardContent>
              {departments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No departments found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {departments.map((dept) => (
                    <Card key={dept.id} className="hover:bg-muted/50 transition-colors">
                      <CardHeader>
                        <CardTitle className="text-base">{dept.name}</CardTitle>
                        <CardDescription>{dept.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{dept.members.length} members</span>
                          <span>Manager: {dept.manager}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>Track user actions and system changes</CardDescription>
            </CardHeader>
            <CardContent>
              {auditLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No audit logs found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {auditLogs.slice(0, 20).map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{log.action}</h3>
                            <Badge variant="outline">{log.resource}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {log.details}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>User: {log.userId}</span>
                            <span>•</span>
                            <span>IP: {log.ipAddress}</span>
                            <span>•</span>
                            <span>{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 