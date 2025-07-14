'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  ShoppingCart, 
  Package, 
  Download,
  RefreshCw,
  BarChart3,
  Activity,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

interface AnalyticsData {
  stats: {
    usersCount: number
    eventsCount: number
    purchasesCount: number
    pendingPurchasesCount: number
    productsCount: number
    revenue: number
    activeUsers: number
  }
  trends: {
    userGrowth: { date: string; count: number }[]
    revenueGrowth: { date: string; amount: number }[]
    eventParticipation: { event: string; participants: number }[]
  }
  recentActivity: {
    purchases: Array<{
      id: string
      productName: string
      totalAmount: number
      currency: string
      buyerType: string
      status: string
      createdAt: string
    }>
    registrations: Array<{
      id: string
      eventName: string
      userEmail: string
      status: string
      createdAt: string
    }>
  }
}

interface AnalyticsDashboardProps {
  className?: string
}

export function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')
  const [refreshing, setRefreshing] = useState(false)

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }
      
      const analyticsData = await response.json()
      setData(analyticsData)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }, [timeRange])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAnalytics()
    setRefreshing(false)
    toast.success('Analytics refreshed')
  }

  const handleExport = async () => {
    try {
      const response = await fetch('/api/admin/analytics/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ timeRange })
      })

      if (!response.ok) {
        throw new Error('Failed to export data')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Analytics exported successfully')
    } catch (error) {
      console.error('Error exporting analytics:', error)
      toast.error('Failed to export analytics')
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <p>No analytics data available</p>
      </div>
    )
  }

  const stats = [
    {
      title: 'Total Users',
      value: data.stats.usersCount.toLocaleString(),
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Active Events',
      value: data.stats.eventsCount.toString(),
      icon: Calendar,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      change: '+5%',
      changeType: 'positive'
    },
    {
      title: 'Total Purchases',
      value: data.stats.purchasesCount.toLocaleString(),
      icon: ShoppingCart,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Products',
      value: data.stats.productsCount.toString(),
      icon: Package,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      change: '+3%',
      changeType: 'positive'
    },
    {
      title: 'Revenue',
      value: `$${data.stats.revenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: 'Active Users',
      value: data.stats.activeUsers.toLocaleString(),
      icon: Activity,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
      change: '+7%',
      changeType: 'positive'
    }
  ]

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Real-time insights into platform performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge 
                    variant={stat.changeType === 'positive' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {stat.change}
                  </Badge>
                  <p className="text-xs text-muted-foreground">from last period</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              User Growth
            </CardTitle>
            <CardDescription>New user registrations over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Chart visualization would go here</p>
                <p className="text-xs text-muted-foreground">Using Chart.js or Recharts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Revenue Trends
            </CardTitle>
            <CardDescription>Revenue generated over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Chart visualization would go here</p>
                <p className="text-xs text-muted-foreground">Using Chart.js or Recharts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Purchases */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Purchases</CardTitle>
            <CardDescription>Latest product purchases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentActivity.purchases.slice(0, 5).map((purchase) => (
                <div key={purchase.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div>
                    <p className="font-medium">{purchase.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      {purchase.buyerType} • {new Date(purchase.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {purchase.currency} {purchase.totalAmount}
                    </p>
                    <Badge variant={purchase.status === 'completed' ? 'default' : 'secondary'}>
                      {purchase.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Registrations */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Event Registrations</CardTitle>
            <CardDescription>Latest event registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentActivity.registrations.slice(0, 5).map((registration) => (
                <div key={registration.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div>
                    <p className="font-medium">{registration.eventName}</p>
                    <p className="text-sm text-muted-foreground">
                      {registration.userEmail} • {new Date(registration.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={registration.status === 'confirmed' ? 'default' : 'secondary'}>
                    {registration.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Actions */}
      {data.stats.pendingPurchasesCount > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
          <CardHeader>
            <CardTitle className="text-orange-800 dark:text-orange-200">
              Pending Actions Required
            </CardTitle>
            <CardDescription className="text-orange-600 dark:text-orange-300">
              Items that need your attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="font-medium">
                  {data.stats.pendingPurchasesCount} pending purchases require review
                </p>
                <p className="text-sm text-orange-600 dark:text-orange-300">
                  These orders are waiting for approval or processing
                </p>
              </div>
              <Button variant="outline" size="sm" className="ml-auto">
                Review Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 