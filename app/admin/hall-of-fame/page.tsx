'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Award,
  ChevronLeft, 
  Edit, 
  Lightbulb,
  Loader2, 
  Plus, 
  Search,
  Crown,
  Microscope,
  Users,
  Trash2, 
  X 
} from 'lucide-react'
import BackgroundNodes from '@/components/BackgroundNodes'

// Define Hall of Fame entry types based on documentation
interface HallOfFameEntry {
  id: string
  user: {
    id: string
    name: string
    username: string
    avatarUrl?: string
    tier: string
  }
  title: string
  achievement: string
  category: 'Innovation' | 'Leadership' | 'Research' | 'Community'
  yearAchieved: string
  dateInducted: string
  order: number
  isActive: boolean
  addedBy: {
    id: string
    name: string
  }
}

export default function AdminHallOfFamePage() {
  const [entries, setEntries] = useState<HallOfFameEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState<HallOfFameEntry | null>(null)
  
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Check if we should show the create modal based on URL
  useEffect(() => {
    if (searchParams) {
      const action = searchParams.get('action')
      if (action === 'create') {
        setShowCreateModal(true)
      }
    }
  }, [searchParams])
  
  // Fetch Hall of Fame entries
  const fetchEntries = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // In a real implementation, this would call the API
      // const response = await fetch('/api/admin/hall-of-fame')
      
      // Mock data based on documentation
      const mockEntries: HallOfFameEntry[] = [
        {
          id: '1',
          user: {
            id: 'user1',
            name: 'Dr. Alan Turing',
            username: 'aturing',
            avatarUrl: 'https://example.com/turing.jpg',
            tier: 'halloffame'
          },
          title: 'AI Pioneer',
          achievement: 'Breakthrough in neural architecture optimization that revolutionized the field of artificial intelligence',
          category: 'Innovation',
          yearAchieved: '2023',
          dateInducted: '2024-01-15T10:30:00Z',
          order: 1,
          isActive: true,
          addedBy: {
            id: 'admin1',
            name: 'Admin User'
          }
        },
        {
          id: '2',
          user: {
            id: 'user2',
            name: 'Dr. Grace Hopper',
            username: 'ghopper',
            avatarUrl: 'https://example.com/hopper.jpg',
            tier: 'halloffame'
          },
          title: 'Compiler Visionary',
          achievement: 'Development of revolutionary compiler technology that transformed programming language design',
          category: 'Research',
          yearAchieved: '2023',
          dateInducted: '2024-02-10T14:20:00Z',
          order: 2,
          isActive: true,
          addedBy: {
            id: 'admin1',
            name: 'Admin User'
          }
        },
        {
          id: '3',
          user: {
            id: 'user3',
            name: 'Ada Lovelace',
            username: 'alovelace',
            avatarUrl: 'https://example.com/lovelace.jpg',
            tier: 'halloffame'
          },
          title: 'Algorithm Innovator',
          achievement: 'Pioneering work in computational algorithms that laid the foundation for modern computer science',
          category: 'Innovation',
          yearAchieved: '2022',
          dateInducted: '2023-11-05T09:15:00Z',
          order: 3,
          isActive: true,
          addedBy: {
            id: 'admin2',
            name: 'Secondary Admin'
          }
        },
        {
          id: '4',
          user: {
            id: 'user4',
            name: 'Linus Torvalds',
            username: 'ltorvalds',
            avatarUrl: 'https://example.com/torvalds.jpg',
            tier: 'halloffame'
          },
          title: 'Open Source Champion',
          achievement: 'Creation and leadership of the Linux kernel project, revolutionizing open source development',
          category: 'Leadership',
          yearAchieved: '2022',
          dateInducted: '2023-10-20T16:45:00Z',
          order: 4,
          isActive: true,
          addedBy: {
            id: 'admin1',
            name: 'Admin User'
          }
        },
        {
          id: '5',
          user: {
            id: 'user5',
            name: 'Katherine Johnson',
            username: 'kjohnson',
            avatarUrl: 'https://example.com/johnson.jpg',
            tier: 'halloffame'
          },
          title: 'Computational Excellence',
          achievement: 'Groundbreaking mathematical contributions to space exploration and orbital mechanics',
          category: 'Research',
          yearAchieved: '2021',
          dateInducted: '2022-09-15T11:30:00Z',
          order: 5,
          isActive: true,
          addedBy: {
            id: 'admin2',
            name: 'Secondary Admin'
          }
        }
      ]
      
      setEntries(mockEntries)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching Hall of Fame entries:', err)
      setError('Failed to load Hall of Fame entries')
      setLoading(false)
    }
  }
  
  // Initial data fetch
  useEffect(() => {
    // Check if user is logged in but not admin, redirect to dashboard
    if (!isLoading && isAuthenticated && user && user.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
    
    // Only fetch entries if the user is authenticated and is an admin
    if (!isLoading && isAuthenticated && user?.role === 'ADMIN') {
      fetchEntries()
    } else if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirectTo=/admin/hall-of-fame')
    }
  }, [user, isAuthenticated, isLoading, router])
  
  // Filter entries based on search term and active tab
  const filteredEntries = entries.filter(entry => {
    // Filter by search term
    const matchesSearch = searchTerm === '' || 
      entry.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.achievement.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Filter by category/tab
    const matchesTab = activeTab === 'all' || entry.category === activeTab
    
    return matchesSearch && matchesTab
  })
  
  // Handle create entry
  const handleCreateEntry = () => {
    setShowCreateModal(true)
  }
  
  // Handle edit entry
  const handleEditEntry = (entry: HallOfFameEntry) => {
    setEditingEntry(entry)
    // In a real implementation, you would show an edit modal or navigate to an edit page
    console.log('Editing entry:', entry)
  }
  
  // Handle delete entry
  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to remove this entry from the Hall of Fame?')) {
      return
    }
    
    try {
      // In a real implementation, this would call the API
      // await fetch(`/api/admin/hall-of-fame?id=${entryId}`, { method: 'DELETE' })
      
      // Update local state
      setEntries(entries.filter(e => e.id !== entryId))
      
      console.log('Entry deleted:', entryId)
    } catch (err) {
      console.error('Error deleting entry:', err)
      setError('Failed to delete Hall of Fame entry')
    }
  }
  
  // Get category counts for tabs
  const getCategoryCounts = () => {
    const counts = {
      all: entries.length,
      Innovation: entries.filter(e => e.category === 'Innovation').length,
      Leadership: entries.filter(e => e.category === 'Leadership').length,
      Research: entries.filter(e => e.category === 'Research').length,
      Community: entries.filter(e => e.category === 'Community').length
    }
    
    return counts
  }
  
  const categoryCounts = getCategoryCounts()
  
  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Innovation':
        return <Lightbulb className="w-4 h-4 text-yellow-300" />
      case 'Leadership':
        return <Crown className="w-4 h-4 text-purple-300" />
      case 'Research':
        return <Microscope className="w-4 h-4 text-blue-300" />
      case 'Community':
        return <Users className="w-4 h-4 text-green-300" />
      default:
        return <Award className="w-4 h-4" />
    }
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        <BackgroundNodes isMobile={false} />
        <div className="relative z-10 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-lg">Checking authentication...</p>
        </div>
      </div>
    )
  }
  
  // Redirect if not authenticated or not admin
  if (!isAuthenticated || (user && user.role !== 'ADMIN')) {
    return null // We'll redirect in useEffect
  }
  
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
      <BackgroundNodes isMobile={false} />
      
      <div className="relative z-10 container mx-auto pt-24 pb-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                className="bg-white/10 hover:bg-white/20"
                onClick={() => router.push('/admin')}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                  Hall of Fame Management
                </h1>
                <p className="text-white/60 mt-1">Manage exceptional contributors and their achievements</p>
              </div>
            </div>
            <Button 
              onClick={handleCreateEntry}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Inductee
            </Button>
          </div>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-md text-red-200">
            <p className="flex items-center gap-2">
              <X className="w-5 h-5" />
              {error}
            </p>
          </div>
        )}
        
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inductees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Tabs 
              defaultValue="all" 
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
                <TabsTrigger value="all">
                  All ({categoryCounts.all})
                </TabsTrigger>
                <TabsTrigger value="Innovation">
                  Innovation ({categoryCounts.Innovation})
                </TabsTrigger>
                <TabsTrigger value="Leadership">
                  Leadership ({categoryCounts.Leadership})
                </TabsTrigger>
                <TabsTrigger value="Research">
                  Research ({categoryCounts.Research})
                </TabsTrigger>
                <TabsTrigger value="Community">
                  Community ({categoryCounts.Community})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        {/* Hall of Fame Entries List */}
        <div className="grid grid-cols-1 gap-6">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="ml-2 text-lg">Loading Hall of Fame entries...</p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-20 bg-white/5 rounded-lg border border-white/10">
              <Award className="w-12 h-12 mx-auto text-white/40 mb-4" />
              <h3 className="text-xl font-medium">No Hall of Fame entries found</h3>
              <p className="text-white/60 mt-1 mb-6">
                {searchTerm ? 'Try a different search term or filter' : 'Add your first inductee to get started'}
              </p>
              <Button onClick={handleCreateEntry}>
                <Plus className="w-4 h-4 mr-2" />
                Add Inductee
              </Button>
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <Card key={entry.id} className="bg-white/5 border-white/10 overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {/* User Avatar */}
                  <div className="w-full md:w-48 h-48 md:h-auto bg-gray-800 relative flex items-center justify-center">
                    {entry.user.avatarUrl ? (
                      <div 
                        className="absolute inset-0 bg-center bg-cover"
                        style={{ backgroundImage: `url(${entry.user.avatarUrl})` }}
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
                        <span className="text-4xl font-bold text-white">
                          {entry.user.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 py-2 px-3 text-center">
                      <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                        Rank #{entry.order}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Entry Content */}
                  <div className="flex-1 p-6">
                    <div className="flex flex-col md:flex-row justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`
                            ${entry.category === 'Innovation' ? 'bg-yellow-500/20 text-yellow-300' : ''}
                            ${entry.category === 'Leadership' ? 'bg-purple-500/20 text-purple-300' : ''}
                            ${entry.category === 'Research' ? 'bg-blue-500/20 text-blue-300' : ''}
                            ${entry.category === 'Community' ? 'bg-green-500/20 text-green-300' : ''}
                          `}>
                            <div className="flex items-center gap-1">
                              {getCategoryIcon(entry.category)}
                              <span>{entry.category}</span>
                            </div>
                          </Badge>
                          
                          <Badge variant="outline" className="border-amber-500/50 text-amber-300">
                            <Award className="w-3 h-3 mr-1" />
                            {entry.yearAchieved}
                          </Badge>
                        </div>
                        
                        <h3 className="text-xl font-bold mb-1">{entry.user.name}</h3>
                        <h4 className="text-lg text-amber-300 mb-2">{entry.title}</h4>
                        <p className="text-white/70 mb-4">{entry.achievement}</p>
                        
                        <div className="text-sm text-white/60">
                          <div className="flex items-center gap-2">
                            <span>Inducted on {new Date(entry.dateInducted).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>Added by {entry.addedBy.name}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 mt-4 md:mt-0 md:ml-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="bg-white/5 hover:bg-white/10"
                          onClick={() => handleEditEntry(entry)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-300 border-red-500/30"
                          onClick={() => handleDeleteEntry(entry.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 