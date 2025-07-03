import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  MessageSquare, 
  Search, 
  Plus, 
  Users, 
  MessageCircle, 
  TrendingUp,
  Pin,
  Calendar
} from 'lucide-react'

export default function ForumPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Scientific Community</h1>
                <p className="text-muted-foreground">Discussion forums for research, collaboration, and knowledge sharing</p>
              </div>
            </div>
            <Badge variant="success">Active Community</Badge>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Discussion
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search discussions..." className="pl-10" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">All Topics</Button>
          <Button variant="outline" size="sm">AI/ML</Button>
          <Button variant="outline" size="sm">Robotics</Button>
          <Button variant="outline" size="sm">Research</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Discussion Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Pinned Discussions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pin className="w-5 h-5" />
                Pinned Discussions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg bg-accent/30">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div>
                      <h3 className="font-medium">Community Guidelines & Code of Conduct</h3>
                      <p className="text-sm text-muted-foreground">Please read before participating</p>
                    </div>
                  </div>
                  <Badge variant="outline">Pinned</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Discussions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Discussions</CardTitle>
              <CardDescription>Latest conversations in the community</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                      JD
                    </div>
                    <div>
                      <h3 className="font-medium">Latest breakthroughs in transformer architectures</h3>
                      <p className="text-sm text-muted-foreground">Discussing recent papers on attention mechanisms and efficiency improvements...</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          24 participants
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          89 replies
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          2 hours ago
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="secondary">AI/ML</Badge>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                      AS
                    </div>
                    <div>
                      <h3 className="font-medium">Open source robotics frameworks comparison</h3>
                      <p className="text-sm text-muted-foreground">ROS vs ROS2 vs MoveIt - sharing experiences and best practices...</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          15 participants
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          42 replies
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          5 hours ago
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="info">Robotics</Badge>
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                      MK
                    </div>
                    <div>
                      <h3 className="font-medium">Research collaboration opportunities</h3>
                      <p className="text-sm text-muted-foreground">Looking for researchers interested in quantum computing applications...</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          8 participants
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          16 replies
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          1 day ago
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="warning">Research</Badge>
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Community Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Community Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Members</span>
                  <span className="font-bold">1,247</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Today</span>
                  <span className="font-bold">89</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Discussions</span>
                  <span className="font-bold">2,341</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Posts</span>
                  <span className="font-bold">15,892</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">AI & Machine Learning</span>
                  <Badge variant="secondary">342</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Robotics</span>
                  <Badge variant="secondary">198</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Research Papers</span>
                  <Badge variant="secondary">156</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Collaborations</span>
                  <Badge variant="secondary">89</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">General Discussion</span>
                  <Badge variant="secondary">267</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Online Members */}
          <Card>
            <CardHeader>
              <CardTitle>Online Now</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold">
                  JD
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                  AS
                </div>
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
                  MK
                </div>
                <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs font-bold">
                  RS
                </div>
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">
                  +12
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 