import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Product, ProductCategory } from '../types'

interface ProductsFiltersProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  categoryFilter: string
  setCategoryFilter: (category: string) => void
  products: Product[]
}

export default function ProductsFilters({
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  products
}: ProductsFiltersProps) {
  // Calculate category counts
  const categoryCounts = products.reduce((counts, product) => {
    const category = product.category
    counts[category] = (counts[category] || 0) + 1
    return counts
  }, {} as Record<string, number>)

  // Add "all" category count
  const allCount = products.length

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <Tabs 
          defaultValue="all" 
          value={categoryFilter}
          onValueChange={setCategoryFilter}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 w-full">
            <TabsTrigger value="all">
              All ({allCount})
            </TabsTrigger>
            <TabsTrigger value="Software">
              Software ({categoryCounts['Software'] || 0})
            </TabsTrigger>
            <TabsTrigger value="Hardware">
              Hardware ({categoryCounts['Hardware'] || 0})
            </TabsTrigger>
            <TabsTrigger value="Service">
              Service ({categoryCounts['Service'] || 0})
            </TabsTrigger>
            <TabsTrigger value="Consultation">
              Consult ({categoryCounts['Consultation'] || 0})
            </TabsTrigger>
            <TabsTrigger value="Training">
              Training ({categoryCounts['Training'] || 0})
            </TabsTrigger>
            <TabsTrigger value="License">
              License ({categoryCounts['License'] || 0})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  )
} 