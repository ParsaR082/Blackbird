import { ShoppingCart } from 'lucide-react'

export default function PurchasesHeader() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center">
          <ShoppingCart className="mr-2 h-8 w-8 text-amber-400" />
          Purchase Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Review and manage product purchases
        </p>
      </div>
    </div>
  )
} 