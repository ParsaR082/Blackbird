'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  X, 
  BookOpen, 
  ClipboardList, 
  Users, 
  Calendar,
  Loader2,
  ArrowRight
} from 'lucide-react'

interface SearchResult {
  _id: string
  type: 'course' | 'assignment' | 'student' | 'semester'
  displayName: string
  subtitle: string
  status: string
}

interface SearchResponse {
  success: boolean
  results: SearchResult[]
  total: number
  query: string
}

export default function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!showResults || results.length === 0) return

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setSelectedIndex(prev => 
            prev < results.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          event.preventDefault()
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : results.length - 1
          )
          break
        case 'Enter':
          event.preventDefault()
          if (selectedIndex >= 0 && selectedIndex < results.length) {
            handleResultClick(results[selectedIndex])
          }
          break
        case 'Escape':
          setShowResults(false)
          setSelectedIndex(-1)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showResults, results, selectedIndex])

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setShowResults(false)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/university/search?q=${encodeURIComponent(searchQuery)}&limit=8`)
      const data: SearchResponse = await response.json()

      if (data.success) {
        setResults(data.results)
        setShowResults(true)
        setSelectedIndex(-1)
      } else {
        setResults([])
        setShowResults(false)
      }
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
      setShowResults(false)
    } finally {
      setLoading(false)
    }
  }

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        performSearch(query)
      } else {
        setResults([])
        setShowResults(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  const handleResultClick = (result: SearchResult) => {
    setShowResults(false)
    setSelectedIndex(-1)
    
    switch (result.type) {
      case 'course':
        router.push(`/admin/university/courses?search=${encodeURIComponent(result.displayName)}`)
        break
      case 'assignment':
        router.push(`/admin/university/assignments?search=${encodeURIComponent(result.displayName)}`)
        break
      case 'student':
        router.push(`/admin/university/students?search=${encodeURIComponent(result.displayName)}`)
        break
      case 'semester':
        router.push(`/admin/university/semesters?search=${encodeURIComponent(result.displayName)}`)
        break
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <BookOpen className="w-4 h-4 text-blue-400" />
      case 'assignment':
        return <ClipboardList className="w-4 h-4 text-amber-400" />
      case 'student':
        return <Users className="w-4 h-4 text-indigo-400" />
      case 'semester':
        return <Calendar className="w-4 h-4 text-green-400" />
      default:
        return <Search className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500/20 text-green-400'
      case 'inactive':
        return 'bg-gray-500/20 text-gray-400'
      case 'overdue':
        return 'bg-red-500/20 text-red-400'
      case 'verified':
        return 'bg-blue-500/20 text-blue-400'
      case 'unverified':
        return 'bg-yellow-500/20 text-yellow-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  return (
    <div className="relative w-full max-w-2xl" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
        <Input
          type="text"
          placeholder="Search courses, assignments, students, semesters..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10 bg-white/5 border-white/10 focus:bg-white/10"
          onFocus={() => {
            if (results.length > 0) setShowResults(true)
          }}
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-white/10"
            onClick={() => {
              setQuery('')
              setResults([])
              setShowResults(false)
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        {loading && (
          <Loader2 className="absolute right-8 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-white/40" />
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <Card className="absolute top-full mt-2 w-full bg-black/95 border-white/10 shadow-xl z-50">
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div
                  key={`${result.type}-${result._id}`}
                  className={`flex items-center justify-between p-3 hover:bg-white/10 cursor-pointer transition-colors ${
                    index === selectedIndex ? 'bg-white/10' : ''
                  } ${index < results.length - 1 ? 'border-b border-white/5' : ''}`}
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {getTypeIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {result.displayName}
                      </p>
                      <p className="text-xs text-white/60 truncate">
                        {result.subtitle}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge className={`text-xs ${getStatusColor(result.status)}`}>
                      {result.status}
                    </Badge>
                    <ArrowRight className="w-3 h-3 text-white/40" />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Show more results link */}
            {results.length >= 8 && (
              <div className="p-3 border-t border-white/5 bg-white/5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-white/60 hover:text-white"
                  onClick={() => {
                    setShowResults(false)
                    router.push(`/admin/university/search?q=${encodeURIComponent(query)}`)
                  }}
                >
                  View all results for "{query}"
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No results */}
      {showResults && !loading && results.length === 0 && query.trim() && (
        <Card className="absolute top-full mt-2 w-full bg-black/95 border-white/10 shadow-xl z-50">
          <CardContent className="p-4 text-center">
            <Search className="w-8 h-8 mx-auto text-white/40 mb-2" />
            <p className="text-sm text-white/60">No results found for "{query}"</p>
            <p className="text-xs text-white/40 mt-1">Try different keywords or check spelling</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 