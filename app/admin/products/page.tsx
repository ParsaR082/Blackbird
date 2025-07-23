
'use client'



import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Loader2 } from 'lucide-react'
import BackgroundNodes from '@/components/BackgroundNodes'
import ProductsHeader from './components/ProductsHeader'
import ProductsStats from './components/ProductsStats'
import ProductsFilters from './components/ProductsFilters'
import ProductsList from './components/ProductsList'
import ProductDialog from './components/ProductDialog'
import { Product } from './types'
import { mockProducts } from './mock-data'
import { toast } from 'sonner'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect if user is not admin
    if (!isLoading && (!isAuthenticated || (user && user.role !== 'ADMIN'))) {
      router.push('/admin')
      return
    }
    
    if (isAuthenticated && user?.role === 'ADMIN') {
      fetchProducts()
    }
  }, [user, isAuthenticated, isLoading, router])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Make an actual API call
      const response = await fetch('/api/admin/products')
      if (!response.ok) throw new Error('Failed to fetch products')
      const data = await response.json()
      
      if (data.success) {
        setProducts(data.products)
      } else {
        throw new Error(data.error || 'Failed to fetch products')
      }
      setLoading(false)
    } catch (err) {
      console.error('Error fetching products:', err)
      // Fallback to mock data for development
      console.log('Using mock data as fallback')
      setProducts(mockProducts)
      setLoading(false)
    }
  }

  const handleCreateProduct = async (productData: Partial<Product>) => {
    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        setProducts([...products, data.product])
        toast.success('Product created successfully')
      } else {
        toast.error(data.error || 'Failed to create product')
      }
    } catch (error) {
      console.error('Create product error:', error)
      toast.error('Failed to create product')
    }
  }

  const handleUpdateProduct = async (productData: Partial<Product>) => {
    if (!productData.id) return
    
    try {
      const response = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        setProducts(products.map(p => 
          p.id === productData.id ? data.product : p
        ))
        toast.success('Product updated successfully')
      } else {
        toast.error(data.error || 'Failed to update product')
      }
    } catch (error) {
      console.error('Update product error:', error)
      toast.error('Failed to update product')
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/admin/products?id=${productId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        setProducts(products.filter(p => p.id !== productId))
        toast.success('Product deleted successfully')
      } else {
        toast.error(data.error || 'Failed to delete product')
      }
    } catch (error) {
      console.error('Delete product error:', error)
      toast.error('Failed to delete product')
    }
  }

  const handleToggleActive = (product: Product, isActive: boolean) => {
    // In a real app, this would be an API call
    // const response = await fetch('/api/admin/products', {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ id: product.id, isActive })
    // })
    // if (!response.ok) throw new Error('Failed to update product')
    
    // Using mock implementation
    setProducts(products.map(p => 
      p.id === product.id ? { ...p, isActive, updatedAt: new Date().toISOString() } : p
    ))
    toast.success(`Product ${isActive ? 'activated' : 'deactivated'} successfully`)
  }

  const handleSaveProduct = (productData: Partial<Product>) => {
    if (dialogMode === 'create') {
      handleCreateProduct(productData)
    } else {
      handleUpdateProduct(productData)
    }
    setShowDialog(false)
  }

  // If loading, show loading state
  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        <BackgroundNodes isMobile={false} />
        <div className="relative z-10 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-lg">Loading products...</p>
        </div>
      </div>
    )
  }

  const filteredProducts = products
    .filter(product => categoryFilter === 'all' || product.category === categoryFilter)
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    )

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
      <BackgroundNodes isMobile={false} />
      
      <div className="relative z-10 container mx-auto pt-24 pb-8 px-4">
        <ProductsHeader 
          onCreateProduct={() => {
            setSelectedProduct(null)
            setDialogMode('create')
            setShowDialog(true)
          }}
        />
        
        <ProductsStats products={products} />
        
        <ProductsFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          products={products}
        />
        
        <ProductsList
          products={filteredProducts}
          onEditProduct={(product) => {
            setSelectedProduct(product)
            setDialogMode('edit')
            setShowDialog(true)
          }}
          onViewProduct={(product) => {
            // In a real app, navigate to product detail page
            toast.info(`Viewing ${product.name}`)
          }}
          onDeleteProduct={handleDeleteProduct}
          onToggleActive={handleToggleActive}
        />
        
        <ProductDialog
          isOpen={showDialog}
          onClose={() => setShowDialog(false)}
          mode={dialogMode}
          product={selectedProduct}
          onSave={handleSaveProduct}
          onDelete={handleDeleteProduct}
        />
      </div>
    </div>
  )
} 