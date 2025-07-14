import { ShoppingBag, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProductsHeaderProps {
  onCreateProduct: () => void
}

export default function ProductsHeader({ onCreateProduct }: ProductsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center">
          <ShoppingBag className="mr-2 h-8 w-8 text-blue-400" />
          Product Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Create and manage products in the Product Playground
        </p>
      </div>
      
      <div className="mt-4 md:mt-0">
        <Button 
          onClick={onCreateProduct}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Product
        </Button>
      </div>
    </div>
  )
} 