'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// import { DatePicker } from '@/components/ui/date-picker'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  Users, 
  Calendar,
  ShoppingBag,
  FileText,
  Download,
  Filter,
  RefreshCw,
  Loader2,
  Plus,
  Settings,
  Eye,
  BarChart,
  Activity,
  Target,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface AnalyticsData {
  users: {
    total: number
    active: number
    newThisMonth: number
    verified: number
    byRole: { role: string; count: number }[]
    growth: { date: string; count: number }[]
  }
  events: {
    total: number
    upcoming: number
    completed: number
    registrations: number
    byCategory: { category: string; count: number }[]
    attendance: { date: string; attendees: number }[]
  }
  purchases: {
    total: number
    pending: number
    completed: number
    revenue: number
    byProduct: { product: string; sales: number }[]
    trends: { date: string; revenue: number }[]
  }
  content: {
    total: number
    published: number
    drafts: number
    views: number
    byType: { type: string; count: number }[]
    engagement: { date: string; views: number }[]
  }
}

interface ReportTemplate {
  id: string
  name: string
  description: string
  type: 'users' | 'events' | 'purchases' | 'content' | 'custom'
  filters: any
  chartType: 'bar' | 'line' | 'pie' | 'area'
  createdAt: string
}

interface AdvancedAnalyticsProps {
  className?: string
}

export function AdvancedAnalytics({ className }: AdvancedAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({ from: new Date(), to: new Date() })
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['users', 'events'])
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([])
  const [isCreatingReport, setIsCreatingReport] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/analytics/advanced')
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }
      
      const data = await response.json()
      setAnalyticsData(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const fetchReportTemplates = async () => {
    try {
      const response = await fetch('/api/admin/analytics/reports')
      if (response.ok) {
        const data = await response.json()
        setReportTemplates(data)
      }
    } catch (error) {
      console.error('Error fetching report templates:', error)
    }
  }

  const exportReport = async (format: 'csv' | 'pdf' | 'excel') => {
    try {
      const response = await fetch('/api/admin/analytics/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          format,
          dateRange,
          metrics: selectedMetrics
        })
      })

      if (!response.ok) {
        throw new Error('Failed to export report')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success(`Report exported as ${format.toUpperCase()}`)
    } catch (error) {
      console.error('Error exporting report:', error)
      toast.error('Failed to export report')
    }
  }

  useEffect(() => {
    fetchAnalytics()
    fetchReportTemplates()
  }, [])

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading advanced analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Analytics</h2>
          <p className="text-muted-foreground">Comprehensive insights and reporting</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAnalytics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setIsCreatingReport(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Date Range
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>From Date</Label>
              <Input
                type="date"
                value={dateRange.from.toISOString().split('T')[0]}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: new Date(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>To Date</Label>
              <Input
                type="date"
                value={dateRange.to.toISOString().split('T')[0]}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: new Date(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Metrics</Label>
              <Select value={selectedMetrics[0]} onValueChange={(value) => setSelectedMetrics([value])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="users">Users</SelectItem>
                  <SelectItem value="events">Events</SelectItem>
                  <SelectItem value="purchases">Purchases</SelectItem>
                  <SelectItem value="content">Content</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Export</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => exportReport('csv')}>
                  <Download className="w-4 h-4 mr-1" />
                  CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => exportReport('pdf')}>
                  <Download className="w-4 h-4 mr-1" />
                  PDF
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData?.users.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +{analyticsData?.users.newThisMonth || 0} this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Events</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData?.events.upcoming || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {analyticsData?.events.total || 0} total events
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${analyticsData?.purchases.revenue?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {analyticsData?.purchases.completed || 0} completed orders
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Content Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData?.content.views?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {analyticsData?.content.published || 0} published items
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>Monthly user registration trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Chart visualization</p>
                    <p className="text-xs text-muted-foreground">
                      {analyticsData?.users.growth?.length || 0} data points
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Event Categories</CardTitle>
                <CardDescription>Distribution of events by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-lg">
                  <div className="text-center">
                    <PieChart className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Chart visualization</p>
                    <p className="text-xs text-muted-foreground">
                      {analyticsData?.events.byCategory?.length || 0} categories
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Demographics</CardTitle>
                <CardDescription>User distribution by role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData?.users.byRole?.map((role, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm">{role.role}</span>
                      </div>
                      <span className="text-sm font-medium">{role.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
                <CardDescription>Daily active users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-lg">
                  <div className="text-center">
                    <Activity className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Activity chart</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Performance</CardTitle>
                <CardDescription>Event attendance trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Attendance chart</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Event Statistics</CardTitle>
                <CardDescription>Key event metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Events</span>
                    <span className="text-sm font-medium">{analyticsData?.events.total || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Upcoming Events</span>
                    <span className="text-sm font-medium">{analyticsData?.events.upcoming || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Registrations</span>
                    <span className="text-sm font-medium">{analyticsData?.events.registrations || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Completed Events</span>
                    <span className="text-sm font-medium">{analyticsData?.events.completed || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Report Templates</h3>
            <Button onClick={() => setIsCreatingReport(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTemplates.map((template) => (
              <Card key={template.id} className="hover:bg-muted/50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{template.type}</span>
                    <span>{new Date(template.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {reportTemplates.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No report templates found</p>
              <Button variant="outline" className="mt-4" onClick={() => setIsCreatingReport(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Template
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 