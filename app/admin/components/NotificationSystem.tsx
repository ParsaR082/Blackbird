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
  Bell, 
  Mail, 
  Send, 
  Users, 
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  Edit3,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Target,
  Calendar
} from 'lucide-react'
import { toast } from 'sonner'

interface NotificationTemplate {
  id: string
  name: string
  subject: string
  content: string
  type: 'email' | 'push' | 'sms'
  category: 'announcement' | 'reminder' | 'alert' | 'welcome'
  isActive: boolean
  variables: string[]
  createdAt: string
  updatedAt: string
}

interface NotificationCampaign {
  id: string
  name: string
  templateId: string
  subject: string
  content: string
  targetAudience: 'all' | 'students' | 'admins' | 'moderators' | 'custom'
  customRecipients?: string[]
  scheduledFor?: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
  sentCount: number
  totalCount: number
  createdAt: string
  sentAt?: string
}

interface NotificationSystemProps {
  className?: string
}

export function NotificationSystem({ className }: NotificationSystemProps) {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [campaigns, setCampaigns] = useState<NotificationCampaign[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null)
  const [isEditingTemplate, setIsEditingTemplate] = useState(false)
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [activeTab, setActiveTab] = useState('templates')

  // Template form state
  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    content: '',
    type: 'email' as NotificationTemplate['type'],
    category: 'announcement' as NotificationTemplate['category'],
    isActive: true,
    variables: [] as string[]
  })

  // Campaign form state
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    templateId: '',
    subject: '',
    content: '',
    targetAudience: 'all' as NotificationCampaign['targetAudience'],
    customRecipients: [] as string[],
    scheduledFor: '',
    sendImmediately: false
  })

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/notifications/templates')
      if (!response.ok) throw new Error('Failed to fetch templates')
      const data = await response.json()
      setTemplates(data)
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast.error('Failed to load notification templates')
    }
  }

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/admin/notifications/campaigns')
      if (!response.ok) throw new Error('Failed to fetch campaigns')
      const data = await response.json()
      setCampaigns(data)
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      toast.error('Failed to load notification campaigns')
    }
  }

  const handleSaveTemplate = async () => {
    if (!templateForm.name.trim() || !templateForm.subject.trim() || !templateForm.content.trim()) {
      toast.error('Name, subject, and content are required')
      return
    }

    setSending(true)
    try {
      const url = selectedTemplate ? `/api/admin/notifications/templates/${selectedTemplate.id}` : '/api/admin/notifications/templates'
      const method = selectedTemplate ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateForm)
      })

      if (!response.ok) throw new Error('Failed to save template')

      const savedTemplate = await response.json()
      
      if (selectedTemplate) {
        setTemplates(items => items.map(item => item.id === selectedTemplate.id ? savedTemplate : item))
        toast.success('Template updated successfully')
      } else {
        setTemplates(items => [savedTemplate, ...items])
        toast.success('Template created successfully')
      }

      handleCancelTemplate()
    } catch (error) {
      console.error('Error saving template:', error)
      toast.error('Failed to save template')
    } finally {
      setSending(false)
    }
  }

  const handleSendCampaign = async () => {
    if (!campaignForm.name.trim() || !campaignForm.subject.trim() || !campaignForm.content.trim()) {
      toast.error('Name, subject, and content are required')
      return
    }

    setSending(true)
    try {
      const response = await fetch('/api/admin/notifications/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignForm)
      })

      if (!response.ok) throw new Error('Failed to create campaign')

      const newCampaign = await response.json()
      setCampaigns(items => [newCampaign, ...items])
      
      if (campaignForm.sendImmediately) {
        toast.success('Campaign sent successfully')
      } else {
        toast.success('Campaign scheduled successfully')
      }

      handleCancelCampaign()
    } catch (error) {
      console.error('Error sending campaign:', error)
      toast.error('Failed to send campaign')
    } finally {
      setSending(false)
    }
  }

  const handleEditTemplate = (template: NotificationTemplate) => {
    setSelectedTemplate(template)
    setTemplateForm({
      name: template.name,
      subject: template.subject,
      content: template.content,
      type: template.type,
      category: template.category,
      isActive: template.isActive,
      variables: template.variables
    })
    setIsEditingTemplate(true)
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      const response = await fetch(`/api/admin/notifications/templates/${templateId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete template')

      setTemplates(items => items.filter(item => item.id !== templateId))
      toast.success('Template deleted successfully')
    } catch (error) {
      console.error('Error deleting template:', error)
      toast.error('Failed to delete template')
    }
  }

  const handleCancelTemplate = () => {
    setSelectedTemplate(null)
    setIsEditingTemplate(false)
    setTemplateForm({
      name: '',
      subject: '',
      content: '',
      type: 'email',
      category: 'announcement',
      isActive: true,
      variables: []
    })
  }

  const handleCancelCampaign = () => {
    setIsCreatingCampaign(false)
    setCampaignForm({
      name: '',
      templateId: '',
      subject: '',
      content: '',
      targetAudience: 'all',
      customRecipients: [],
      scheduledFor: '',
      sendImmediately: false
    })
  }

  const getStatusColor = (status: NotificationCampaign['status']) => {
    switch (status) {
      case 'sent': return 'bg-green-500/20 text-green-300'
      case 'sending': return 'bg-blue-500/20 text-blue-300'
      case 'scheduled': return 'bg-yellow-500/20 text-yellow-300'
      case 'failed': return 'bg-red-500/20 text-red-300'
      default: return 'bg-gray-500/20 text-gray-300'
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchTemplates(), fetchCampaigns()])
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading notification system...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notification System</h2>
          <p className="text-muted-foreground">Manage notification templates and campaigns</p>
        </div>
        <div className="flex gap-2">
          {!isEditingTemplate && (
            <Button variant="outline" onClick={() => setIsEditingTemplate(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          )}
          {!isCreatingCampaign && (
            <Button onClick={() => setIsCreatingCampaign(true)}>
              <Send className="w-4 h-4 mr-2" />
              Send Notification
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Templates List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Templates</CardTitle>
                  <CardDescription>Manage reusable notification templates</CardDescription>
                </CardHeader>
                <CardContent>
                  {templates.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No templates found</p>
                      <Button variant="outline" className="mt-4" onClick={() => setIsEditingTemplate(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Template
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {templates.map((template) => (
                        <motion.div
                          key={template.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-medium">{template.name}</h3>
                                <Badge variant={template.isActive ? "default" : "secondary"}>
                                  {template.isActive ? "Active" : "Inactive"}
                                </Badge>
                                <Badge variant="outline">{template.type}</Badge>
                                <Badge variant="outline">{template.category}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {template.subject}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {template.variables.length} variables • Updated {new Date(template.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditTemplate(template)}
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTemplate(template.id)}
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

            {/* Template Editor */}
            {isEditingTemplate && (
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {selectedTemplate ? 'Edit Template' : 'Create Template'}
                    </CardTitle>
                    <CardDescription>
                      {selectedTemplate ? 'Update existing template' : 'Create new notification template'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="templateName">Template Name</Label>
                      <Input
                        id="templateName"
                        value={templateForm.name}
                        onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                        placeholder="Welcome Email Template"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="templateSubject">Subject</Label>
                      <Input
                        id="templateSubject"
                        value={templateForm.subject}
                        onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                        placeholder="Welcome to Blackbird Portal!"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="templateContent">Content</Label>
                      <Textarea
                        id="templateContent"
                        value={templateForm.content}
                        onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                        placeholder="Hello {{userName}}, welcome to our platform..."
                        rows={6}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="templateType">Type</Label>
                        <Select value={templateForm.type} onValueChange={(value) => setTemplateForm({ ...templateForm, type: value as NotificationTemplate['type'] })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="push">Push Notification</SelectItem>
                            <SelectItem value="sms">SMS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="templateCategory">Category</Label>
                        <Select value={templateForm.category} onValueChange={(value) => setTemplateForm({ ...templateForm, category: value as NotificationTemplate['category'] })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="announcement">Announcement</SelectItem>
                            <SelectItem value="reminder">Reminder</SelectItem>
                            <SelectItem value="alert">Alert</SelectItem>
                            <SelectItem value="welcome">Welcome</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="templateActive">Active</Label>
                      <Switch
                        id="templateActive"
                        checked={templateForm.isActive}
                        onCheckedChange={(checked) => setTemplateForm({ ...templateForm, isActive: checked })}
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button variant="outline" onClick={handleCancelTemplate} className="flex-1">
                        Cancel
                      </Button>
                      <Button onClick={handleSaveTemplate} disabled={sending} className="flex-1">
                        {sending ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" />
                        )}
                        {selectedTemplate ? 'Update' : 'Create'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Campaigns List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Campaigns</CardTitle>
                  <CardDescription>View and manage notification campaigns</CardDescription>
                </CardHeader>
                <CardContent>
                  {campaigns.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Send className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No campaigns found</p>
                      <Button variant="outline" className="mt-4" onClick={() => setIsCreatingCampaign(true)}>
                        <Send className="w-4 h-4 mr-2" />
                        Send First Campaign
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {campaigns.map((campaign) => (
                        <motion.div
                          key={campaign.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-medium">{campaign.name}</h3>
                                <Badge className={getStatusColor(campaign.status)}>
                                  {campaign.status}
                                </Badge>
                                <Badge variant="outline">{campaign.targetAudience}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {campaign.subject}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>{campaign.sentCount}/{campaign.totalCount} sent</span>
                                <span>•</span>
                                <span>Created {new Date(campaign.createdAt).toLocaleDateString()}</span>
                                {campaign.sentAt && (
                                  <>
                                    <span>•</span>
                                    <span>Sent {new Date(campaign.sentAt).toLocaleDateString()}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Campaign Creator */}
            {isCreatingCampaign && (
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Send Notification</CardTitle>
                    <CardDescription>Create and send a new notification campaign</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="campaignName">Campaign Name</Label>
                      <Input
                        id="campaignName"
                        value={campaignForm.name}
                        onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                        placeholder="Welcome Campaign"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="campaignSubject">Subject</Label>
                      <Input
                        id="campaignSubject"
                        value={campaignForm.subject}
                        onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
                        placeholder="Welcome to Blackbird Portal!"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="campaignContent">Content</Label>
                      <Textarea
                        id="campaignContent"
                        value={campaignForm.content}
                        onChange={(e) => setCampaignForm({ ...campaignForm, content: e.target.value })}
                        placeholder="Enter your notification content..."
                        rows={6}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="campaignAudience">Target Audience</Label>
                      <Select value={campaignForm.targetAudience} onValueChange={(value) => setCampaignForm({ ...campaignForm, targetAudience: value as NotificationCampaign['targetAudience'] })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Users</SelectItem>
                          <SelectItem value="students">Students</SelectItem>
                          <SelectItem value="admins">Admins</SelectItem>
                          <SelectItem value="moderators">Moderators</SelectItem>
                          <SelectItem value="custom">Custom List</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {!campaignForm.sendImmediately && (
                      <div className="space-y-2">
                        <Label htmlFor="campaignSchedule">Schedule For</Label>
                        <Input
                          id="campaignSchedule"
                          type="datetime-local"
                          value={campaignForm.scheduledFor}
                          onChange={(e) => setCampaignForm({ ...campaignForm, scheduledFor: e.target.value })}
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <Label htmlFor="sendImmediately">Send Immediately</Label>
                      <Switch
                        id="sendImmediately"
                        checked={campaignForm.sendImmediately}
                        onCheckedChange={(checked) => setCampaignForm({ ...campaignForm, sendImmediately: checked })}
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button variant="outline" onClick={handleCancelCampaign} className="flex-1">
                        Cancel
                      </Button>
                      <Button onClick={handleSendCampaign} disabled={sending} className="flex-1">
                        {sending ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" />
                        )}
                        {campaignForm.sendImmediately ? 'Send Now' : 'Schedule'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">67.8%</div>
                <p className="text-xs text-muted-foreground">
                  +5% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">23.4%</div>
                <p className="text-xs text-muted-foreground">
                  +8% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Templates</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{templates.filter(t => t.isActive).length}</div>
                <p className="text-xs text-muted-foreground">
                  {templates.length} total templates
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest notification activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.slice(0, 5).map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <p className="font-medium">{campaign.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {campaign.sentCount} sent • {new Date(campaign.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 