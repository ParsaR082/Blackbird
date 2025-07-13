'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  Database, 
  Trash2, 
  RefreshCw, 
  HardDrive, 
  Clock, 
  Zap,
  AlertTriangle,
  CheckCircle,
  Settings,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

interface DatabaseStats {
  totalSize: string;
  collections: number;
  indexes: number;
  fragmentation: number;
  lastOptimization: string;
}

interface CacheStats {
  hitRate: number;
  memoryUsage: string;
  keys: number;
  evictions: number;
}

interface OptimizationTask {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  estimatedTime: string;
}

export default function DataOptimization() {
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [tasks, setTasks] = useState<OptimizationTask[]>([]);
  const [autoOptimization, setAutoOptimization] = useState(false);
  const [loading, setLoading] = useState(true);
  const [runningTask, setRunningTask] = useState<string | null>(null);

  useEffect(() => {
    fetchOptimizationData();
  }, []);

  const fetchOptimizationData = async () => {
    try {
      setLoading(true);
      const [dbRes, cacheRes, tasksRes] = await Promise.all([
        fetch('/api/admin/optimization/database'),
        fetch('/api/admin/optimization/cache'),
        fetch('/api/admin/optimization/tasks')
      ]);

      if (dbRes.ok) {
        const dbData = await dbRes.json();
        setDbStats(dbData);
      }

      if (cacheRes.ok) {
        const cacheData = await cacheRes.json();
        setCacheStats(cacheData);
      }

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData);
      }
    } catch (error) {
      console.error('Error fetching optimization data:', error);
      toast.error('Failed to fetch optimization data');
    } finally {
      setLoading(false);
    }
  };

  const runOptimization = async (taskId: string) => {
    try {
      setRunningTask(taskId);
      const response = await fetch(`/api/admin/optimization/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId })
      });

      if (response.ok) {
        toast.success('Optimization task started successfully');
        // Poll for updates
        const pollInterval = setInterval(async () => {
          const statusRes = await fetch(`/api/admin/optimization/tasks`);
          if (statusRes.ok) {
            const updatedTasks = await statusRes.json();
            setTasks(updatedTasks);
            
            const task = updatedTasks.find((t: OptimizationTask) => t.id === taskId);
            if (task && task.status === 'completed') {
              clearInterval(pollInterval);
              setRunningTask(null);
              toast.success('Optimization completed successfully');
              fetchOptimizationData();
            }
          }
        }, 2000);
      } else {
        toast.error('Failed to start optimization task');
      }
    } catch (error) {
      console.error('Error running optimization:', error);
      toast.error('Failed to run optimization');
      setRunningTask(null);
    }
  };

  const clearCache = async () => {
    try {
      const response = await fetch('/api/admin/optimization/cache/clear', {
        method: 'POST'
      });

      if (response.ok) {
        toast.success('Cache cleared successfully');
        fetchOptimizationData();
      } else {
        toast.error('Failed to clear cache');
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast.error('Failed to clear cache');
    }
  };

  const toggleAutoOptimization = async () => {
    try {
      const response = await fetch('/api/admin/optimization/auto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !autoOptimization })
      });

      if (response.ok) {
        setAutoOptimization(!autoOptimization);
        toast.success(`Auto-optimization ${!autoOptimization ? 'enabled' : 'disabled'}`);
      } else {
        toast.error('Failed to update auto-optimization setting');
      }
    } catch (error) {
      console.error('Error toggling auto-optimization:', error);
      toast.error('Failed to update auto-optimization setting');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
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
          <h2 className="text-2xl font-bold tracking-tight">Data Optimization</h2>
          <p className="text-muted-foreground">
            Manage database performance, caching, and automated optimization
          </p>
        </div>
        <Button onClick={fetchOptimizationData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Database Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Size</span>
              <span className="font-medium">{dbStats?.totalSize || '0 MB'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Collections</span>
              <span className="font-medium">{dbStats?.collections || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Indexes</span>
              <span className="font-medium">{dbStats?.indexes || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Fragmentation</span>
              <Badge variant={dbStats?.fragmentation && dbStats.fragmentation > 20 ? "destructive" : "outline"}>
                {dbStats?.fragmentation || 0}%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Last Optimization</span>
              <span className="text-sm text-muted-foreground">
                {dbStats?.lastOptimization || 'Never'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Cache Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Cache Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Hit Rate</span>
              <Badge variant={cacheStats?.hitRate && cacheStats.hitRate < 80 ? "destructive" : "outline"}>
                {cacheStats?.hitRate || 0}%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Memory Usage</span>
              <span className="font-medium">{cacheStats?.memoryUsage || '0 MB'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Cached Keys</span>
              <span className="font-medium">{cacheStats?.keys || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Evictions</span>
              <span className="font-medium">{cacheStats?.evictions || 0}</span>
            </div>
            <Button onClick={clearCache} variant="outline" size="sm" className="w-full">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Cache
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Auto-Optimization Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Optimization Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Auto-Optimization</h4>
              <p className="text-sm text-muted-foreground">
                Automatically optimize database and cache during low-traffic periods
              </p>
            </div>
            <Switch
              checked={autoOptimization}
              onCheckedChange={toggleAutoOptimization}
            />
          </div>
        </CardContent>
      </Card>

      {/* Optimization Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Optimization Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasks.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No optimization tasks available
              </p>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(task.status)}
                    <div>
                      <h4 className="font-medium">{task.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Estimated time: {task.estimatedTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {task.status === 'running' && (
                      <div className="w-32">
                        <Progress value={task.progress} className="h-2" />
                      </div>
                    )}
                    <Badge variant="outline">{task.progress}%</Badge>
                    {task.status === 'pending' && (
                      <Button
                        onClick={() => runOptimization(task.id)}
                        disabled={!!runningTask}
                        size="sm"
                      >
                        {runningTask === task.id ? 'Running...' : 'Run'}
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Database className="h-6 w-6" />
              <span>Database Cleanup</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <HardDrive className="h-6 w-6" />
              <span>Index Optimization</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <RefreshCw className="h-6 w-6" />
              <span>Cache Warmup</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 