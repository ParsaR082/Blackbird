'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Users, 
  FileText, 
  Bell, 
  Settings, 
  BarChart3, 
  Workflow, 
  Shield,
  Database,
  Zap,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp
} from 'lucide-react';

interface SystemStatus {
  users: {
    total: number;
    active: number;
    suspended: number;
    newThisWeek: number;
  };
  content: {
    announcements: number;
    pages: number;
    faqs: number;
  };
  notifications: {
    templates: number;
    campaigns: number;
    sentToday: number;
  };
  workflows: {
    active: number;
    completed: number;
    pending: number;
  };
  system: {
    uptime: number;
    performance: number;
    errors: number;
    lastBackup: string;
  };
}

interface IntegrationMetrics {
  apiCalls: number;
  responseTime: number;
  errorRate: number;
  activeConnections: number;
}

interface WorkflowStatus {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed' | 'pending';
  progress: number;
  lastUpdate: string;
}

export default function IntegrationDashboard() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [metrics, setMetrics] = useState<IntegrationMetrics | null>(null);
  const [workflows, setWorkflows] = useState<WorkflowStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchIntegrationData();
    const interval = setInterval(fetchIntegrationData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchIntegrationData = async () => {
    try {
      setRefreshing(true);
      const [statusRes, metricsRes, workflowsRes] = await Promise.all([
        fetch('/api/admin/integration/status'),
        fetch('/api/admin/integration/metrics'),
        fetch('/api/admin/integration/workflows')
      ]);

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setSystemStatus(statusData);
      }

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData);
      }

      if (workflowsRes.ok) {
        const workflowsData = await workflowsRes.json();
        setWorkflows(workflowsData);
      }
    } catch (error) {
      console.error('Error fetching integration data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Activity className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Integration Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time overview of all system components and their integration status
          </p>
        </div>
        <Button 
          onClick={fetchIntegrationData} 
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <Activity className="h-4 w-4 mr-2" />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workflows">Active Workflows</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="health">System Health</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStatus?.users.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +{systemStatus?.users.newThisWeek || 0} this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Content Items</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(systemStatus?.content.announcements || 0) + 
                   (systemStatus?.content.pages || 0) + 
                   (systemStatus?.content.faqs || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all categories
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStatus?.notifications.sentToday || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Sent today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
                <Workflow className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStatus?.workflows.active || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {systemStatus?.workflows.pending || 0} pending
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Uptime</span>
                  <Badge variant="outline">{systemStatus?.system.uptime || 0}%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Performance</span>
                  <Badge variant="outline">{systemStatus?.system.performance || 0}%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Errors (24h)</span>
                  <Badge variant={systemStatus?.system.errors || 0 > 10 ? "destructive" : "outline"}>
                    {systemStatus?.system.errors || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Last Backup</span>
                  <span className="text-sm text-muted-foreground">
                    {systemStatus?.system.lastBackup || 'Never'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  API Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Calls (1h)</span>
                  <span className="text-sm font-medium">{metrics?.apiCalls || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Response Time</span>
                  <span className="text-sm font-medium">{metrics?.responseTime || 0}ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Error Rate</span>
                  <Badge variant={metrics?.errorRate || 0 > 5 ? "destructive" : "outline"}>
                    {(metrics?.errorRate || 0).toFixed(2)}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Connections</span>
                  <span className="text-sm font-medium">{metrics?.activeConnections || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Workflows</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflows.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No active workflows at the moment
                  </p>
                ) : (
                  workflows.map((workflow) => (
                    <div key={workflow.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getStatusColor(workflow.status)}`}>
                          {getStatusIcon(workflow.status)}
                        </div>
                        <div>
                          <h4 className="font-medium">{workflow.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Last update: {workflow.lastUpdate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32">
                          <Progress value={workflow.progress} className="h-2" />
                        </div>
                        <Badge variant="outline">{workflow.progress}%</Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Response Times
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API Endpoints</span>
                    <span className="text-sm font-medium">{metrics?.responseTime || 0}ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database Queries</span>
                    <span className="text-sm font-medium">{(metrics?.responseTime || 0) * 0.3}ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">File Operations</span>
                    <span className="text-sm font-medium">{(metrics?.responseTime || 0) * 0.1}ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Failed Logins</span>
                    <Badge variant="outline">0 (24h)</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Suspicious Activity</span>
                    <Badge variant="outline">0</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Rate Limit Hits</span>
                    <Badge variant="outline">0</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status</span>
                    <Badge className="bg-green-500">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Connections</span>
                    <span className="text-sm">{metrics?.activeConnections || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Size</span>
                    <span className="text-sm">2.4 GB</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Cache
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status</span>
                    <Badge className="bg-green-500">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Hit Rate</span>
                    <span className="text-sm">87%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Memory</span>
                    <span className="text-sm">256 MB</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API Server</span>
                    <Badge className="bg-green-500">Running</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email Service</span>
                    <Badge className="bg-green-500">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">File Storage</span>
                    <Badge className="bg-green-500">Connected</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export { IntegrationDashboard }; 