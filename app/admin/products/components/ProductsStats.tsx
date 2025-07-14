import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, DollarSign, ShoppingCart, Layers } from 'lucide-react'
import { Product } from '../types'

interface ProductsStatsProps {
  products: Product[]
}

export default function ProductsStats({ products }: ProductsStatsProps) {
  // Calculate stats
  const totalProducts = products.length
  const activeProducts = products.filter(p => p.isActive).length
  const totalValue = products.reduce((sum, product) => sum + product.price, 0)
  const lowStock = products.filter(p => p.stock !== null && p.stock < 10).length

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Package className="mr-2 h-5 w-5 text-blue-400" />
            Total Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalProducts}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {activeProducts} active products
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <DollarSign className="mr-2 h-5 w-5 text-green-400" />
            Total Value
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            ${totalValue.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Cumulative product value
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5 text-amber-400" />
            Pending Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">5</div>
          <p className="text-xs text-muted-foreground mt-1">
            Awaiting approval
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Layers className="mr-2 h-5 w-5 text-red-400" />
            Low Stock
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{lowStock}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Products with &lt; 10 units
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 