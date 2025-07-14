import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Eye, Tag, MoreHorizontal, Check, X } from 'lucide-react'
import { Product } from '../types'
import { format } from 'date-fns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ProductsListProps {
  products: Product[]
  onEditProduct: (product: Product) => void
  onViewProduct?: (product: Product) => void
  onDeleteProduct?: (productId: string) => void
  onToggleActive?: (product: Product, isActive: boolean) => void
}

export default function ProductsList({ 
  products, 
  onEditProduct,
  onViewProduct,
  onDeleteProduct,
  onToggleActive
}: ProductsListProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No products found matching your criteria.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {products.map(product => (
        <Card key={product.id} className="bg-white/5 border-white/10 overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              {/* Product Image (if available) */}
              {product.imageUrl && (
                <div className="w-full md:w-48 h-48 bg-gray-800 flex-shrink-0">
                  <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${product.imageUrl})` }} />
                </div>
              )}
              
              {/* Product Details */}
              <div className="p-4 flex-grow">
                <div className="flex flex-col md:flex-row justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{product.name}</h3>
                    <div className="flex items-center mt-1 space-x-2">
                      <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                        {product.category}
                      </Badge>
                      {!product.isActive && (
                        <Badge variant="outline" className="border-red-500/30 text-red-400">
                          Inactive
                        </Badge>
                      )}
                      {product.stock !== null && product.stock < 10 && (
                        <Badge variant="outline" className="border-amber-500/30 text-amber-400">
                          Low Stock: {product.stock}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <div className="text-xl font-bold text-green-400">
                      ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {product.currency}
                    </div>
                  </div>
                </div>
                
                <p className="text-muted-foreground mt-2 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="mt-3">
                  <div className="text-sm font-medium">Features:</div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {product.features.slice(0, 3).map((feature, index) => (
                      <Badge key={index} variant="secondary" className="bg-white/5">
                        {feature}
                      </Badge>
                    ))}
                    {product.features.length > 3 && (
                      <Badge variant="secondary" className="bg-white/5">
                        +{product.features.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {Object.keys(product.specifications).length > 0 && (
                  <div className="mt-3">
                    <div className="text-sm font-medium">Specifications:</div>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {Object.entries(product.specifications).slice(0, 4).map(([key, value]) => (
                        <div key={key} className="text-xs text-white/70">
                          <span className="font-medium">{key}:</span> {value}
                        </div>
                      ))}
                      {Object.keys(product.specifications).length > 4 && (
                        <div className="text-xs text-white/70">
                          +{Object.keys(product.specifications).length - 4} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-end mt-4">
                  <div className="text-xs text-muted-foreground">
                    Created by {product.createdBy.name} on {format(new Date(product.createdAt), 'MMM d, yyyy')}
                  </div>
                  <div className="flex space-x-2">
                    {onViewProduct && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-white/10 hover:bg-white/10"
                        onClick={() => onViewProduct(product)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-white/10 hover:bg-white/10"
                      onClick={() => onEditProduct(product)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-white/10 hover:bg-white/10 px-2"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-black/90 border-white/10 text-white">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/10" />
                        {onToggleActive && (
                          <DropdownMenuItem 
                            onClick={() => onToggleActive(product, !product.isActive)}
                            className="cursor-pointer hover:bg-white/10"
                          >
                            {product.isActive ? (
                              <>
                                <X className="h-4 w-4 mr-2 text-red-400" />
                                <span>Deactivate</span>
                              </>
                            ) : (
                              <>
                                <Check className="h-4 w-4 mr-2 text-green-400" />
                                <span>Activate</span>
                              </>
                            )}
                          </DropdownMenuItem>
                        )}
                        {onDeleteProduct && (
                          <DropdownMenuItem 
                            onClick={() => onDeleteProduct(product.id)}
                            className="cursor-pointer hover:bg-red-900/20 text-red-400"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 