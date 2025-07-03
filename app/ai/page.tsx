import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Brain, Bot, Cpu, Database, Zap, Code } from 'lucide-react'

export default function AIPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AI Tools & Experiments</h1>
            <p className="text-muted-foreground">Machine learning models, AI experiments, and intelligent automation tools</p>
          </div>
        </div>
        <Badge variant="success">Active Module</Badge>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Bot className="w-5 h-5 text-purple-500" />
              <Badge variant="info">GPT</Badge>
            </div>
            <CardTitle className="text-lg">Chat Assistant</CardTitle>
            <CardDescription>AI-powered conversational interface</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">Launch Chat</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Cpu className="w-5 h-5 text-blue-500" />
              <Badge variant="warning">Beta</Badge>
            </div>
            <CardTitle className="text-lg">Model Training</CardTitle>
            <CardDescription>Train custom machine learning models</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">Start Training</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Database className="w-5 h-5 text-green-500" />
              <Badge variant="success">Active</Badge>
            </div>
            <CardTitle className="text-lg">Data Analysis</CardTitle>
            <CardDescription>Analyze datasets with AI insights</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">Analyze Data</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Zap className="w-5 h-5 text-yellow-500" />
              <Badge variant="info">Tools</Badge>
            </div>
            <CardTitle className="text-lg">Automation</CardTitle>
            <CardDescription>AI-powered workflow automation</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">Create Workflow</Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Recent AI Projects
          </CardTitle>
          <CardDescription>Your latest machine learning experiments and models</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Sentiment Analysis Model</h3>
                <p className="text-sm text-muted-foreground">Natural language processing for social media</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success">Deployed</Badge>
                <Button size="sm" variant="outline">View</Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Computer Vision Pipeline</h3>
                <p className="text-sm text-muted-foreground">Object detection and classification</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="warning">Training</Badge>
                <Button size="sm" variant="outline">View</Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Recommendation Engine</h3>
                <p className="text-sm text-muted-foreground">Collaborative filtering system</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Draft</Badge>
                <Button size="sm" variant="outline">View</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 