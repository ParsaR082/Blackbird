'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileText, 
  Save, 
  Eye, 
  EyeOff, 
  Calendar,
  User,
  Globe,
  Target,
  Loader2,
  Plus,
  Edit3,
  Trash2,
  Copy,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface ContentItem {
  id: string
  title: string
  content: string
  type: 'announcement' | 'homepage' | 'faq' | 'terms' | 'privacy'
  status: 'draft' | 'published' | 'archived'
  priority: 'low' | 'medium' | 'high'
  targetAudience: 'all' | 'students' | 'admins' | 'moderators'
  startDate?: string
  endDate?: string
  createdBy: string
  createdAt: string
  updatedAt: string
  isActive: boolean
  tags: string[]
}

interface ContentEditorProps {
  className?: string
}

export function ContentEditor({ className }: ContentEditorProps) {
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('announcements')

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'announcement' as ContentItem['type'],
    status: 'draft' as ContentItem['status'],
    priority: 'medium' as ContentItem['priority'],
    targetAudience: 'all' as ContentItem['targetAudience'],
    startDate: '',
    endDate: '',
    isActive: true,
    tags: [] as string[]
  })

  const fetchContent = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/content')
      
      if (!response.ok) {
        throw new Error('Failed to fetch content')
      }
      
      const data = await response.json()
      setContentItems(data)
    } catch (error) {
      console.error('Error fetching content:', error)
      toast.error('Failed to load content')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content are required')
      return
    }

    setSaving(true)
    try {
      const url = selectedItem ? `/api/admin/content/${selectedItem.id}` : '/api/admin/content'
      const method = selectedItem ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to save content')
      }

      const savedItem = await response.json()
      
      if (selectedItem) {
        setContentItems(items => 
          items.map(item => item.id === selectedItem.id ? savedItem : item)
        )
        toast.success('Content updated successfully')
      } else {
        setContentItems(items => [savedItem, ...items])
        toast.success('Content created successfully')
      }

      handleCancel()
    } catch (error) {
      console.error('Error saving content:', error)
      toast.error('Failed to save content')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (item: ContentItem) => {
    setSelectedItem(item)
    setFormData({
      title: item.title,
      content: item.content,
      type: item.type,
      status: item.status,
      priority: item.priority,
      targetAudience: item.targetAudience,
      startDate: item.startDate || '',
      endDate: item.endDate || '',
      isActive: item.isActive,
      tags: item.tags
    })
    setIsEditing(true)
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/content/${itemId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete content')
      }

      setContentItems(items => items.filter(item => item.id !== itemId))
      toast.success('Content deleted successfully')
    } catch (error) {
      console.error('Error deleting content:', error)
      toast.error('Failed to delete content')
    }
  }

  const handleCancel = () => {
    setSelectedItem(null)
    setIsEditing(false)
    setFormData({
      title: '',
      content: '',
      type: 'announcement',
      status: 'draft',
      priority: 'medium',
      targetAudience: 'all',
      startDate: '',
      endDate: '',
      isActive: true,
      tags: []
    })
  }

  const handleDuplicate = async (item: ContentItem) => {
    const duplicatedItem = {
      ...formData,
      title: `${item.title} (Copy)`,
      content: item.content,
      status: 'draft' as const
    }

    setFormData(duplicatedItem)
    setSelectedItem(null)
    setIsEditing(true)
  }

  const getStatusColor = (status: ContentItem['status']) => {
    switch (status) {
      case 'published': return 'bg-green-500/20 text-green-300'
      case 'draft': return 'bg-yellow-500/20 text-yellow-300'
      case 'archived': return 'bg-gray-500/20 text-gray-300'
      default: return 'bg-gray-500/20 text-gray-300'
    }
  }

  const getPriorityColor = (priority: ContentItem['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-300'
      case 'medium': return 'bg-yellow-500/20 text-yellow-300'
      case 'low': return 'bg-green-500/20 text-green-300'
      default: return 'bg-gray-500/20 text-gray-300'
    }
  }

  useEffect(() => {
    fetchContent()
  }, [])

  const filteredItems = contentItems.filter(item => {
    if (activeTab === 'announcements') return item.type === 'announcement'
    if (activeTab === 'homepage') return item.type === 'homepage'
    if (activeTab === 'faq') return item.type === 'faq'
    if (activeTab === 'legal') return ['terms', 'privacy'].includes(item.type)
    return true
  })

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Content Management</h2>
          <p className="text-muted-foreground">Manage announcements, homepage content, and legal pages</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Content
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="announcements">Announcements</TabsTrigger>
                  <TabsTrigger value="homepage">Homepage</TabsTrigger>
                  <TabsTrigger value="faq">FAQ</TabsTrigger>
                  <TabsTrigger value="legal">Legal</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Loading content...
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No content found for this category</p>
                  <Button variant="outline" className="mt-4" onClick={() => setIsEditing(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Item
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{item.title}</h3>
                            <Badge className={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                            <Badge className={getPriorityColor(item.priority)}>
                              {item.priority}
                            </Badge>
                            {item.isActive ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.content}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>By {item.createdBy}</span>
                            <span>•</span>
                            <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                            {item.targetAudience !== 'all' && (
                              <>
                                <span>•</span>
                                <span>Target: {item.targetAudience}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDuplicate(item)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Editor Panel */}
        {isEditing && (
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedItem ? 'Edit Content' : 'Create Content'}
                </CardTitle>
                <CardDescription>
                  {selectedItem ? 'Update existing content' : 'Create new content item'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter content title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Content Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as ContentItem['type'] })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="homepage">Homepage Content</SelectItem>
                      <SelectItem value="faq">FAQ</SelectItem>
                      <SelectItem value="terms">Terms of Service</SelectItem>
                      <SelectItem value="privacy">Privacy Policy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Enter content..."
                    rows={8}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as ContentItem['status'] })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value as ContentItem['priority'] })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Select value={formData.targetAudience} onValueChange={(value) => setFormData({ ...formData, targetAudience: value as ContentItem['targetAudience'] })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="students">Students</SelectItem>
                      <SelectItem value="admins">Admins</SelectItem>
                      <SelectItem value="moderators">Moderators</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive">Active</Label>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={handleCancel} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving} className="flex-1">
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {selectedItem ? 'Update' : 'Create'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
} 