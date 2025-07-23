export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Bot, 
  Cpu, 
  Wrench, 
  FileText, 
  Upload, 
  Download,
  Settings,
  Activity,
  Calendar,
  Users
} from 'lucide-react'

export default function RoboticsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Robotics & Engineering</h1>
                <p className="text-muted-foreground">Hardware projects, robotics development, and engineering logs</p>
              </div>
            </div>
            <Badge variant="success">Active Module</Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </Button>
            <Button>
              <FileText className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">+2 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Components</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs text-muted-foreground">In inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CAD Files</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">Total designs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Build Hours</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">324</div>
            <p className="text-xs text-muted-foreground">This quarter</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Projects */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Projects */}
          <Card>
            <CardHeader>
              <CardTitle>Current Projects</CardTitle>
              <CardDescription>Active robotics and engineering projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                      <Bot className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">Autonomous Navigation Robot</h3>
                      <p className="text-sm text-muted-foreground">6-DOF robotic arm with computer vision</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Started 3 weeks ago
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          3 collaborators
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="warning">In Progress</Badge>
                    <Button size="sm" variant="outline">View</Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
                      <Cpu className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">IoT Environmental Monitor</h3>
                      <p className="text-sm text-muted-foreground">Smart sensors for air quality monitoring</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Started 1 week ago
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          2 collaborators
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="info">Planning</Badge>
                    <Button size="sm" variant="outline">View</Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
                      <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">Quadcopter Flight Controller</h3>
                      <p className="text-sm text-muted-foreground">Custom PID controller for stable flight</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Completed 2 days ago
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          1 collaborator
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="success">Completed</Badge>
                    <Button size="sm" variant="outline">View</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates and project logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">CAD Model Updated</p>
                    <p className="text-xs text-muted-foreground">Navigation robot arm assembly v2.1</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Component Added</p>
                    <p className="text-xs text-muted-foreground">Arduino Nano 33 BLE to inventory</p>
                    <p className="text-xs text-muted-foreground">5 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Build Log Entry</p>
                    <p className="text-xs text-muted-foreground">Motor controller calibration completed</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                <Button variant="outline" className="justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Create Build Log
                </Button>
                <Button variant="outline" className="justify-start">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload CAD File
                </Button>
                <Button variant="outline" className="justify-start">
                  <Cpu className="w-4 h-4 mr-2" />
                  Manage Inventory
                </Button>
                <Button variant="outline" className="justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Project Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Files */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">robot_arm_v2.step</span>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-green-500" />
                    <span className="text-sm">motor_specs.pdf</span>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">control_code.ino</span>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Component Inventory */}
          <Card>
            <CardHeader>
              <CardTitle>Component Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Microcontrollers</span>
                  <Badge variant="success">24</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sensors</span>
                  <Badge variant="warning">8</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Motors</span>
                  <Badge variant="success">16</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Batteries</span>
                  <Badge variant="destructive">2</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 