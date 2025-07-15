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
  Workflow, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Users,
  Mail,
  Bell,
  Settings,
  Plus,
  Edit3,
  Trash2,
  Play,
  Pause,
  Loader2,
  ArrowRight,
  UserCheck,
  FileText,
  Calendar,
  Target,
  Zap,
  BookOpen
} from 'lucide-react'
import { toast } from 'sonner'

interface Workflow {
  id: string
  name: string
  description: string
  type: 'approval' | 'notification' | 'task' | 'custom'
  status: 'active' | 'inactive' | 'draft'
  triggers: string[]
  conditions: any[]
  actions: any[]
  approvers: string[]
  timeout: number
  createdAt: string
  updatedAt: string
}

interface Task {
  id: string
  title: string
  description: string
  assignee: string
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate: string
  workflowId: string
  createdAt: string
}

interface WorkflowAutomationProps {
  className?: string
}

export function WorkflowAutomation({ className }: WorkflowAutomationProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreatingWorkflow, setIsCreatingWorkflow] = useState(false)
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)
  const [journals, setJournals] = useState<any[]>([])
  const [journalContent, setJournalContent] = useState('')
  const [journalTags, setJournalTags] = useState<string[]>([])
  const [journalVisibility, setJournalVisibility] = useState<'private' | 'admins' | 'custom'>('private')
  const [allowedAdmins, setAllowedAdmins] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('workflows')

  // Form state
  const [workflowForm, setWorkflowForm] = useState({
    name: '',
    description: '',
    type: 'approval' as Workflow['type'],
    triggers: [] as string[],
    conditions: [] as any[],
    actions: [] as any[],
    approvers: [] as string[],
    timeout: 24
  })

  const fetchWorkflows = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/workflows')
      
      if (!response.ok) {
        throw new Error('Failed to fetch workflows')
      }
      
      const data = await response.json()
      setWorkflows(data)
    } catch (error) {
      console.error('Error fetching workflows:', error)
      toast.error('Failed to load workflows')
    } finally {
      setLoading(false)
    }
  }

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/admin/workflows/tasks')
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const handleSaveWorkflow = async () => {
    if (!workflowForm.name.trim()) {
      toast.error('Workflow name is required')
      return
    }

    try {
      const url = selectedWorkflow ? `/api/admin/workflows/${selectedWorkflow.id}` : '/api/admin/workflows'
      const method = selectedWorkflow ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(workflowForm)
      })

      if (!response.ok) {
        throw new Error('Failed to save workflow')
      }

      const savedWorkflow = await response.json()
      
      if (selectedWorkflow) {
        setWorkflows(items => 
          items.map(item => item.id === selectedWorkflow.id ? savedWorkflow : item)
        )
        toast.success('Workflow updated successfully')
      } else {
        setWorkflows(items => [savedWorkflow, ...items])
        toast.success('Workflow created successfully')
      }

      handleCancelWorkflow()
    } catch (error) {
      console.error('Error saving workflow:', error)
      toast.error('Failed to save workflow')
    }
  }

  const handleToggleWorkflow = async (workflowId: string, status: 'active' | 'inactive') => {
    try {
      const response = await fetch(`/api/admin/workflows/${workflowId}/toggle`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })

      if (!response.ok) {
        throw new Error('Failed to toggle workflow')
      }

      setWorkflows(items => 
        items.map(item => 
          item.id === workflowId ? { ...item, status } : item
        )
      )

      toast.success(`Workflow ${status === 'active' ? 'activated' : 'deactivated'}`)
    } catch (error) {
      console.error('Error toggling workflow:', error)
      toast.error('Failed to toggle workflow')
    }
  }

  const handleDeleteWorkflow = async (workflowId: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/workflows/${workflowId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete workflow')
      }

      setWorkflows(items => items.filter(item => item.id !== workflowId))
      toast.success('Workflow deleted successfully')
    } catch (error) {
      console.error('Error deleting workflow:', error)
      toast.error('Failed to delete workflow')
    }
  }

  const handleCancelWorkflow = () => {
    setSelectedWorkflow(null)
    setIsCreatingWorkflow(false)
    setWorkflowForm({
      name: '',
      description: '',
      type: 'approval',
      triggers: [],
      conditions: [],
      actions: [],
      approvers: [],
      timeout: 24
    })
  }

  const getStatusColor = (status: Workflow['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-300'
      case 'inactive': return 'bg-gray-500/20 text-gray-300'
      case 'draft': return 'bg-yellow-500/20 text-yellow-300'
      default: return 'bg-gray-500/20 text-gray-300'
    }
  }

  const getTaskStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-300'
      case 'in_progress': return 'bg-blue-500/20 text-blue-300'
      case 'pending': return 'bg-yellow-500/20 text-yellow-300'
      case 'overdue': return 'bg-red-500/20 text-red-300'
      default: return 'bg-gray-500/20 text-gray-300'
    }
  }

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-300'
      case 'high': return 'bg-orange-500/20 text-orange-300'
      case 'medium': return 'bg-yellow-500/20 text-yellow-300'
      case 'low': return 'bg-green-500/20 text-green-300'
      default: return 'bg-gray-500/20 text-gray-300'
    }
  }

  useEffect(() => {
    fetchWorkflows()
    fetchTasks()
  }, [])

  useEffect(() => {
    if (activeTab === 'journaling') {
      fetchJournals()
    }
    // eslint-disable-next-line
  }, [activeTab])

  async function fetchJournals() {
    try {
      const res = await fetch('/api/admin/journals')
      if (res.ok) {
        setJournals(await res.json())
      }
    } catch (e) {
      toast.error('Failed to load journals')
    }
  }

  async function saveJournal() {
    try {
      const res = await fetch('/api/admin/journals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: journalContent,
          tags: journalTags,
          visibility: journalVisibility,
          allowedAdmins: journalVisibility === 'custom' ? allowedAdmins : []
        })
      })
      if (res.ok) {
        setJournalContent('')
        setJournalTags([])
        setJournalVisibility('private')
        setAllowedAdmins([])
        fetchJournals()
        toast.success('Journal saved')
      } else {
        toast.error('Failed to save journal')
      }
    } catch (e) {
      toast.error('Failed to save journal')
    }
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading workflow automation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workflow Automation</h2>
          <p className="text-muted-foreground">Manage approval workflows and automated tasks</p>
        </div>
        {!isCreatingWorkflow && (
          <Button onClick={() => setIsCreatingWorkflow(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Workflow
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="journaling">
            <BookOpen className="w-4 h-4 mr-1" /> Journaling
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Workflows List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Active Workflows</CardTitle>
                  <CardDescription>Manage your automated workflows</CardDescription>
                </CardHeader>
                <CardContent>
                  {workflows.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Workflow className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No workflows found</p>
                      <Button variant="outline" className="mt-4" onClick={() => setIsCreatingWorkflow(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Workflow
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {workflows.map((workflow) => (
                        <motion.div
                          key={workflow.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-medium">{workflow.name}</h3>
                                <Badge className={getStatusColor(workflow.status)}>
                                  {workflow.status}
                                </Badge>
                                <Badge variant="outline">{workflow.type}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {workflow.description}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>{workflow.triggers.length} triggers</span>
                                <span>•</span>
                                <span>{workflow.actions.length} actions</span>
                                <span>•</span>
                                <span>Updated {new Date(workflow.updatedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedWorkflow(workflow)
                                  setWorkflowForm({
                                    name: workflow.name,
                                    description: workflow.description,
                                    type: workflow.type,
                                    triggers: workflow.triggers,
                                    conditions: workflow.conditions,
                                    actions: workflow.actions,
                                    approvers: workflow.approvers,
                                    timeout: workflow.timeout
                                  })
                                  setIsCreatingWorkflow(true)
                                }}
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleWorkflow(
                                  workflow.id, 
                                  workflow.status === 'active' ? 'inactive' : 'active'
                                )}
                              >
                                {workflow.status === 'active' ? (
                                  <Pause className="w-4 h-4" />
                                ) : (
                                  <Play className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteWorkflow(workflow.id)}
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

            {/* Workflow Creator/Editor */}
            {isCreatingWorkflow && (
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {selectedWorkflow ? 'Edit Workflow' : 'Create Workflow'}
                    </CardTitle>
                    <CardDescription>
                      {selectedWorkflow ? 'Update existing workflow' : 'Create new automated workflow'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="workflowName">Workflow Name</Label>
                      <Input
                        id="workflowName"
                        value={workflowForm.name}
                        onChange={(e) => setWorkflowForm({ ...workflowForm, name: e.target.value })}
                        placeholder="User Registration Approval"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="workflowDescription">Description</Label>
                      <Textarea
                        id="workflowDescription"
                        value={workflowForm.description}
                        onChange={(e) => setWorkflowForm({ ...workflowForm, description: e.target.value })}
                        placeholder="Automated approval workflow for new user registrations"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="workflowType">Workflow Type</Label>
                      <Select value={workflowForm.type} onValueChange={(value) => setWorkflowForm({ ...workflowForm, type: value as Workflow['type'] })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="approval">Approval Workflow</SelectItem>
                          <SelectItem value="notification">Notification Workflow</SelectItem>
                          <SelectItem value="task">Task Assignment</SelectItem>
                          <SelectItem value="custom">Custom Workflow</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="workflowTimeout">Timeout (hours)</Label>
                      <Input
                        id="workflowTimeout"
                        type="number"
                        value={workflowForm.timeout}
                        onChange={(e) => setWorkflowForm({ ...workflowForm, timeout: parseInt(e.target.value) })}
                        min="1"
                        max="168"
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button variant="outline" onClick={handleCancelWorkflow} className="flex-1">
                        Cancel
                      </Button>
                      <Button onClick={handleSaveWorkflow} className="flex-1">
                        {selectedWorkflow ? 'Update' : 'Create'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Management</CardTitle>
              <CardDescription>Monitor and manage automated tasks</CardDescription>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No tasks found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{task.title}</h3>
                            <Badge className={getTaskStatusColor(task.status)}>
                              {task.status.replace('_', ' ')}
                            </Badge>
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {task.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Assigned to: {task.assignee}</span>
                            <span>•</span>
                            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button variant="ghost" size="sm">
                            <UserCheck className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  User Approval
                </CardTitle>
                <CardDescription>Automated approval workflow for new user registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span>Trigger: New user registration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-blue-500" />
                    <span>Action: Send approval request to admin</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>Timeout: 24 hours</span>
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Use Template
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Content Review
                </CardTitle>
                <CardDescription>Automated content review and approval process</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span>Trigger: New content submission</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-blue-500" />
                    <span>Action: Assign to content moderator</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>Timeout: 48 hours</span>
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Use Template
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Event Reminder
                </CardTitle>
                <CardDescription>Automated event reminders and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span>Trigger: Event approaching</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-blue-500" />
                    <span>Action: Send reminder emails</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>Schedule: 1 day before</span>
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Use Template
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="journaling" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Admin Journaling</CardTitle>
              <CardDescription>Write your daily journal, add tags, and set visibility.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={journalContent}
                onChange={e => setJournalContent(e.target.value)}
                placeholder="Write your journal entry..."
                rows={5}
              />
              <div className="flex gap-2 items-center">
                <Label>Tags:</Label>
                <Input
                  value={journalTags.join(', ')}
                  onChange={e => setJournalTags(e.target.value.split(',').map(t => t.trim()))}
                  placeholder="tag1, tag2, ..."
                  className="w-64"
                />
              </div>
              <div className="flex gap-4 items-center">
                <Label>Visibility:</Label>
                <Select value={journalVisibility} onValueChange={v => setJournalVisibility(v as any)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Only Me</SelectItem>
                    <SelectItem value="admins">All Admins</SelectItem>
                    <SelectItem value="custom">Specific Admins</SelectItem>
                  </SelectContent>
                </Select>
                {journalVisibility === 'custom' && (
                  <Input
                    value={allowedAdmins.join(', ')}
                    onChange={e => setAllowedAdmins(e.target.value.split(',').map(t => t.trim()))}
                    placeholder="admin1, admin2, ..."
                    className="w-64"
                  />
                )}
              </div>
              <Button variant="outline" onClick={saveJournal}>
                Save Journal
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Journal Entries</CardTitle>
              <CardDescription>Entries visible to you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {journals.length === 0 ? (
                <div className="text-muted-foreground">No journal entries found.</div>
              ) : (
                journals.map(journal => (
                  <div key={journal._id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{journal.author}</span>
                      <span className="text-xs text-muted-foreground">{new Date(journal.createdAt).toLocaleString()}</span>
                      <Badge className="ml-2">{journal.visibility}</Badge>
                    </div>
                    <div className="mb-2">{journal.content}</div>
                    <div className="flex gap-2 flex-wrap">
                      {journal.tags && journal.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 