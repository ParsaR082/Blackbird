'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface StudyPlanFiltersProps {
  searchTerm: string
  filterType: 'all' | 'personal' | 'semester' | 'yearly'
  onSearchChange: (value: string) => void
  onFilterChange: (type: 'all' | 'personal' | 'semester' | 'yearly') => void
}

export function StudyPlanFilters({
  searchTerm,
  filterType,
  onSearchChange,
  onFilterChange
}: StudyPlanFiltersProps) {
  const filterOptions = ['all', 'personal', 'semester', 'yearly'] as const

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              placeholder="Search study plans..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>
          <div className="flex space-x-2">
            {filterOptions.map((type) => (
              <Button
                key={type}
                variant={filterType === type ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onFilterChange(type)}
                className="text-white/80 capitalize"
              >
                {type}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 