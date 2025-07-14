import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, ExternalLink } from 'lucide-react'
import { Purchase } from '../../products/types'
import { format } from 'date-fns'

interface PurchasesListProps {
  purchases: Purchase[]
  onViewPurchase: (purchase: Purchase) => void
}

export default function PurchasesList({ purchases, onViewPurchase }: PurchasesListProps) {
  if (purchases.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No purchases found matching your criteria.</p>
      </div>
    )
  }

  // Function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'border-amber-500/30 text-amber-400'
      case 'approved': return 'border-green-500/30 text-green-400'
      case 'rejected': return 'border-red-500/30 text-red-400'
      case 'completed': return 'border-blue-500/30 text-blue-400'
      case 'cancelled': return 'border-gray-500/30 text-gray-400'
      default: return 'border-white/30'
    }
  }

  return (
    <div className="space-y-4">
      {purchases.map(purchase => (
        <Card key={purchase.id} className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row justify-between">
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{purchase.product.name}</h3>
                  <Badge variant="outline" className={getStatusColor(purchase.status)}>
                    {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                  </Badge>
                </div>
                
                <div className="flex items-center mt-1 space-x-2">
                  <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                    {purchase.product.category}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/5">
                    {purchase.buyerType === 'guest' ? 'Guest' : 'Registered User'}
                  </Badge>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium">Buyer Information</h4>
                    {purchase.buyerType === 'guest' ? (
                      <div className="mt-1 text-sm text-muted-foreground">
                        <p>{purchase.buyer.info?.fullName}</p>
                        <p>{purchase.buyer.info?.email}</p>
                        <p>{purchase.buyer.info?.phoneNumber}</p>
                        {purchase.buyer.info?.company && <p>Company: {purchase.buyer.info.company}</p>}
                      </div>
                    ) : (
                      <div className="mt-1 text-sm text-muted-foreground">
                        <p>{purchase.buyer.name}</p>
                        <p>@{purchase.buyer.username}</p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium">Order Details</h4>
                    <div className="mt-1 text-sm text-muted-foreground">
                      <p>Quantity: {purchase.quantity}</p>
                      <p>Total: ${purchase.totalAmount.toFixed(2)} {purchase.currency}</p>
                      <p>Date: {format(new Date(purchase.createdAt), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                </div>
                
                {purchase.adminNotes && (
                  <div className="mt-3 bg-white/5 p-2 rounded text-sm">
                    <span className="font-medium">Admin Notes:</span> {purchase.adminNotes}
                  </div>
                )}
              </div>
              
              <div className="mt-4 md:mt-0 md:ml-4 flex md:flex-col justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-white/10 hover:bg-white/10"
                  onClick={() => onViewPurchase(purchase)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-white/10 hover:bg-white/10"
                  asChild
                >
                  <a href={`/product-playground/${purchase.product.id}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View Product
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 