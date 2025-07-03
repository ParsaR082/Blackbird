import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PORTAL_MODULES } from '@/constants'
import { 
  LayoutDashboard, 
  Activity, 
  TrendingUp, 
  Users, 
  Clock,
  ArrowRight,
  Plus
} from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <LayoutDashboard className="w-8 h-8" />
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening in your portal.</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modules Used</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">
              Out of 9 available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collaborators</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              +3 new this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">
              +8% from last week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Access */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Access</CardTitle>
              <CardDescription>Jump into your most used modules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PORTAL_MODULES.filter(module => ['ai', 'robotics', 'projects', 'forum'].includes(module.id)).map((module) => (
                  <div key={module.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${module.gradient} text-white`}>
                        <div className="w-4 h-4 font-bold text-xs">
                          {module.icon.slice(0, 2)}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium">{module.title}</h3>
                        <p className="text-sm text-muted-foreground">{module.features[0]}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates across your modules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">AI Model Deployed</p>
                    <p className="text-xs text-muted-foreground">Sentiment analysis model went live</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">New Project Created</p>
                    <p className="text-xs text-muted-foreground">Robotics arm control system</p>
                    <p className="text-xs text-muted-foreground">5 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Forum Discussion</p>
                    <p className="text-xs text-muted-foreground">New reply in ML algorithms thread</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Training Completed</p>
                    <p className="text-xs text-muted-foreground">Strength training week 4</p>
                    <p className="text-xs text-muted-foreground">2 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Current Projects */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Current Projects</CardTitle>
          <CardDescription>Projects you're actively working on</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  <div className="w-4 h-4 font-bold text-xs">AI</div>
                </div>
                <div>
                  <h3 className="font-medium">Natural Language Processing Pipeline</h3>
                  <p className="text-sm text-muted-foreground">Building a comprehensive NLP system for document analysis</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="warning">In Progress</Badge>
                <Button size="sm" variant="outline">Continue</Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                  <div className="w-4 h-4 font-bold text-xs">RO</div>
                </div>
                <div>
                  <h3 className="font-medium">Autonomous Navigation Robot</h3>
                  <p className="text-sm text-muted-foreground">Developing computer vision and path planning algorithms</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="info">Planning</Badge>
                <Button size="sm" variant="outline">View</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 