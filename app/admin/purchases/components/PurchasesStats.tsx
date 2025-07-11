import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'
import { Purchase } from '../../products/types'

interface PurchasesStatsProps {
  purchases: Purchase[]
}

export default function PurchasesStats({ purchases }: PurchasesStatsProps) {
  // Calculate stats
  const statusCounts = purchases.reduce((counts, purchase) => {
    const status = purchase.status
    counts[status] = (counts[status] || 0) + 1
    return counts
  }, {} as Record<string, number>)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5 text-blue-400" />
            Total
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{purchases.length}</div>
          <p className="text-xs text-muted-foreground mt-1">
            All purchases
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Clock className="mr-2 h-5 w-5 text-amber-400" />
            Pending
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{statusCounts.pending || 0}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Awaiting review
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <CheckCircle className="mr-2 h-5 w-5 text-green-400" />
            Approved
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{statusCounts.approved || 0}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Ready for processing
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <XCircle className="mr-2 h-5 w-5 text-red-400" />
            Rejected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{statusCounts.rejected || 0}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Not approved
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-purple-400" />
            Completed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{statusCounts.completed || 0}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Fully processed
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 