'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  Database,
  Server,
  Globe,
  Cpu,
  HardDrive,
  MemoryStick,
  Network,
  RefreshCw,
  Settings,
  Eye,
  Download,
  Bell,
  Zap,
  Loader2,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { toast } from 'sonner'

interface SystemMetrics {
  cpu: {
    usage: number
    cores: number
    temperature: number
  }
  memory: {
    total: number
    used: number
    available: number
    usage: number
  }
  disk: {
    total: number
    used: number
    available: number
    usage: number
  }
  network: {
    bytesIn: number
    bytesOut: number
    connections: number
  }
  database: {
    connections: number
    queries: number
    responseTime: number
  }
  uptime: number
  loadAverage: number[]
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical'
  checks: {
    name: string
    status: 'pass' | 'fail' | 'warning'
    message: string
    lastCheck: string
  }[]
}

interface ErrorLog {
  id: string
  level: 'error' | 'warning' | 'info' | 'debug'
  message: string
  stack?: string
  timestamp: string
  userId?: string
  ipAddress?: string
  userAgent?: string
}

interface PerformanceMetric {
  endpoint: string
  method: string
  responseTime: number
  statusCode: number
  timestamp: string
  count: number
}

interface SystemMonitoringProps {
  className?: string
}

export function SystemMonitoring({ className }: SystemMonitoringProps) {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [errors, setErrors] = useState<ErrorLog[]>([])
  const [performance, setPerformance] = useState<PerformanceMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/admin/monitoring/metrics')
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      }
    } catch (error) {
      console.error('Error fetching metrics:', error)
    }
  }

  const fetchHealth = async () => {
    try {
      const response = await fetch('/api/admin/monitoring/health')
      if (response.ok) {
        const data = await response.json()
        setHealth(data)
      }
    } catch (error) {
      console.error('Error fetching health:', error)
    }
  }

  const fetchErrors = async () => {
    try {
      const response = await fetch('/api/admin/monitoring/errors')
      if (response.ok) {
        const data = await response.json()
        setErrors(data)
      }
    } catch (error) {
      console.error('Error fetching errors:', error)
    }
  }

  const fetchPerformance = async () => {
    try {
      const response = await fetch('/api/admin/monitoring/performance')
      if (response.ok) {
        const data = await response.json()
        setPerformance(data)
      }
    } catch (error) {
      console.error('Error fetching performance:', error)
    }
  }

  const refreshAll = useCallback(async () => {
    setLoading(true)
    await Promise.all([
      fetchMetrics(),
      fetchHealth(),
      fetchErrors(),
      fetchPerformance()
    ])
    setLoading(false)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'pass':
        return 'bg-green-500/20 text-green-300'
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-300'
      case 'critical':
      case 'fail':
        return 'bg-red-500/20 text-red-300'
      default:
        return 'bg-gray-500/20 text-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'pass':
        return <CheckCircle className="w-4 h-4" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />
      case 'critical':
      case 'fail':
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  useEffect(() => {
    refreshAll()

    if (autoRefresh) {
      const interval = setInterval(refreshAll, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshAll])

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Monitoring</h2>
          <p className="text-muted-foreground">Real-time system performance and health monitoring</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshAll} disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh
          </Button>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Zap className="w-4 h-4 mr-2" />
            Auto Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* System Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                {health && getStatusIcon(health.status)}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{health?.status || 'Unknown'}</div>
                <p className="text-xs text-muted-foreground">
                  {health?.checks?.filter(c => c.status === 'pass').length || 0} of {health?.checks?.length || 0} checks passing
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics ? formatUptime(metrics.uptime) : '--'}
                </div>
                <p className="text-xs text-muted-foreground">
                  System running since {metrics ? new Date(Date.now() - metrics.uptime * 1000).toLocaleDateString() : '--'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Errors</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  {errors.filter(e => e.level === 'error').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {errors.filter(e => e.level === 'warning').length} warnings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Database</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics?.database.connections || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {metrics?.database.responseTime || 0}ms avg response
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Resource Usage */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="w-5 h-5" />
                  CPU Usage
                </CardTitle>
                <CardDescription>Current CPU utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Usage</span>
                    <span className="text-sm font-medium">{metrics?.cpu.usage || 0}%</span>
                  </div>
                  <Progress value={metrics?.cpu.usage || 0} className="w-full" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Cores:</span>
                      <span className="ml-2 font-medium">{metrics?.cpu.cores || 0}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Temperature:</span>
                      <span className="ml-2 font-medium">{metrics?.cpu.temperature || 0}°C</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MemoryStick className="w-5 h-5" />
                  Memory Usage
                </CardTitle>
                <CardDescription>RAM utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Usage</span>
                    <span className="text-sm font-medium">{metrics?.memory.usage || 0}%</span>
                  </div>
                  <Progress value={metrics?.memory.usage || 0} className="w-full" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Used:</span>
                      <span className="ml-2 font-medium">{metrics ? formatBytes(metrics.memory.used) : '--'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total:</span>
                      <span className="ml-2 font-medium">{metrics ? formatBytes(metrics.memory.total) : '--'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Disk Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="w-5 h-5" />
                Disk Usage
              </CardTitle>
              <CardDescription>Storage utilization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Usage</span>
                  <span className="text-sm font-medium">{metrics?.disk.usage || 0}%</span>
                </div>
                <Progress value={metrics?.disk.usage || 0} className="w-full" />
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Used:</span>
                    <span className="ml-2 font-medium">{metrics ? formatBytes(metrics.disk.used) : '--'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Available:</span>
                    <span className="ml-2 font-medium">{metrics ? formatBytes(metrics.disk.available) : '--'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total:</span>
                    <span className="ml-2 font-medium">{metrics ? formatBytes(metrics.disk.total) : '--'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Performance</CardTitle>
              <CardDescription>Endpoint response times and status codes</CardDescription>
            </CardHeader>
            <CardContent>
              {performance.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No performance data available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {performance.map((metric) => (
                    <motion.div
                      key={`${metric.endpoint}-${metric.method}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{metric.method}</Badge>
                            <span className="font-medium">{metric.endpoint}</span>
                            <Badge className={metric.statusCode < 400 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}>
                              {metric.statusCode}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Response: {metric.responseTime}ms</span>
                            <span>•</span>
                            <span>Requests: {metric.count}</span>
                            <span>•</span>
                            <span>{new Date(metric.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {metric.responseTime > 1000 ? (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          ) : (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Error Logs</CardTitle>
              <CardDescription>Recent system errors and warnings</CardDescription>
            </CardHeader>
            <CardContent>
              {errors.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No errors found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {errors.slice(0, 20).map((error) => (
                    <motion.div
                      key={error.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={
                              error.level === 'error' ? 'bg-red-500/20 text-red-300' :
                              error.level === 'warning' ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-blue-500/20 text-blue-300'
                            }>
                              {error.level.toUpperCase()}
                            </Badge>
                            {error.userId && (
                              <Badge variant="outline">User: {error.userId}</Badge>
                            )}
                          </div>
                          <p className="text-sm mb-2">{error.message}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{new Date(error.timestamp).toLocaleString()}</span>
                            {error.ipAddress && (
                              <>
                                <span>•</span>
                                <span>IP: {error.ipAddress}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Health Checks</CardTitle>
              <CardDescription>System component health status</CardDescription>
            </CardHeader>
            <CardContent>
              {health?.checks?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No health checks configured</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {health?.checks?.map((check, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{check.name}</h3>
                            <Badge className={getStatusColor(check.status)}>
                              {getStatusIcon(check.status)}
                              <span className="ml-1">{check.status}</span>
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{check.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Last check: {new Date(check.lastCheck).toLocaleString()}
                          </p>
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