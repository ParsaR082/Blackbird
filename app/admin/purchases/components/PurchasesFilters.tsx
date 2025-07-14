import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Purchase } from '../../products/types'

interface PurchasesFiltersProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  statusFilter: string
  setStatusFilter: (status: string) => void
  buyerTypeFilter: string
  setBuyerTypeFilter: (type: string) => void
  purchases: Purchase[]
}

export default function PurchasesFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  buyerTypeFilter,
  setBuyerTypeFilter,
  purchases
}: PurchasesFiltersProps) {
  // Calculate status counts
  const statusCounts = purchases.reduce((counts, purchase) => {
    const status = purchase.status
    counts[status] = (counts[status] || 0) + 1
    return counts
  }, {} as Record<string, number>)

  // Calculate buyer type counts
  const buyerTypeCounts = purchases.reduce((counts, purchase) => {
    const type = purchase.buyerType
    counts[type] = (counts[type] || 0) + 1
    return counts
  }, {} as Record<string, number>)

  // Add "all" counts
  const allCount = purchases.length

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search purchases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2">Status</h3>
          <Tabs 
            defaultValue="all" 
            value={statusFilter}
            onValueChange={setStatusFilter}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
              <TabsTrigger value="all">
                All ({allCount})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({statusCounts.pending || 0})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({statusCounts.approved || 0})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({statusCounts.rejected || 0})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({statusCounts.completed || 0})
              </TabsTrigger>
              <TabsTrigger value="cancelled">
                Cancelled ({statusCounts.cancelled || 0})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Buyer Type</h3>
          <Tabs 
            defaultValue="all" 
            value={buyerTypeFilter}
            onValueChange={setBuyerTypeFilter}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="all">
                All ({allCount})
              </TabsTrigger>
              <TabsTrigger value="guest">
                Guest ({buyerTypeCounts.guest || 0})
              </TabsTrigger>
              <TabsTrigger value="user">
                Registered ({buyerTypeCounts.user || 0})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </div>
  )
} 