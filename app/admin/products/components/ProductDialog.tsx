import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2, Plus, X } from 'lucide-react'
import { Product, ProductCategory, Currency } from '../types'

interface ProductDialogProps {
  isOpen: boolean
  onClose: () => void
  mode: 'create' | 'edit'
  product: Product | null
  onSave: (product: Partial<Product>) => void
  onDelete?: (productId: string) => void
}

export default function ProductDialog({
  isOpen,
  onClose,
  mode,
  product,
  onSave,
  onDelete
}: ProductDialogProps) {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    currency: 'USD',
    category: 'Software',
    features: [],
    specifications: {},
    isActive: true,
    stock: null
  })
  const [newFeature, setNewFeature] = useState('')
  const [processing, setProcessing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [newSpecKey, setNewSpecKey] = useState('')
  const [newSpecValue, setNewSpecValue] = useState('')

  useEffect(() => {
    if (product && mode === 'edit') {
      setFormData(product)
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        currency: 'USD',
        category: 'Software',
        features: [],
        specifications: {},
        isActive: true,
        stock: null
      })
    }
    setShowDeleteConfirm(false)
  }, [product, mode])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (name === 'price') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      })
    } else if (name === 'stock') {
      setFormData({
        ...formData,
        [name]: value === '' ? null : parseInt(value, 10)
      })
    } else if (name === 'isActive') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  const handleAddFeature = () => {
    if (newFeature.trim() && formData.features) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()]
      })
      setNewFeature('')
    }
  }

  const handleRemoveFeature = (index: number) => {
    if (formData.features) {
      setFormData({
        ...formData,
        features: formData.features.filter((_, i) => i !== index)
      })
    }
  }

  const handleAddSpecification = () => {
    if (newSpecKey.trim() && formData.specifications) {
      setFormData({
        ...formData,
        specifications: {
          ...formData.specifications,
          [newSpecKey.trim()]: newSpecValue.trim()
        }
      })
      setNewSpecKey('')
      setNewSpecValue('')
    }
  }

  const handleRemoveSpecification = (key: string) => {
    if (formData.specifications) {
      const newSpecs = { ...formData.specifications }
      delete newSpecs[key]
      setFormData({
        ...formData,
        specifications: newSpecs
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)
    
    setTimeout(() => {
      onSave(formData)
      setProcessing(false)
    }, 500)
  }

  const handleDelete = () => {
    if (onDelete && product) {
      setProcessing(true)
      setTimeout(() => {
        onDelete(product.id)
        setProcessing(false)
        onClose()
      }, 500)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black/90 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create New Product' : 'Edit Product'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Add a new product to the Product Playground' 
              : 'Update the product information'}
          </DialogDescription>
        </DialogHeader>
        
        {showDeleteConfirm ? (
          <div className="py-6 space-y-4">
            <div className="bg-red-900/20 border border-red-500/30 rounded-md p-4 text-center">
              <Trash2 className="h-12 w-12 text-red-500 mx-auto mb-2" />
              <h3 className="text-lg font-medium mb-2">Delete Product</h3>
              <p className="text-sm text-white/70 mb-4">
                Are you sure you want to delete &quot;{product?.name}&quot;? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="border-white/10 hover:bg-white/10"
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={processing}
                >
                  {processing ? 'Deleting...' : 'Confirm Delete'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  required
                  maxLength={200}
                  className="bg-white/5 border-white/10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full rounded-md bg-white/5 border-white/10 text-white p-2"
                  required
                >
                  <option value="Software">Software</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Service">Service</option>
                  <option value="Consultation">Consultation</option>
                  <option value="Training">Training</option>
                  <option value="License">License</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter product description"
                required
                maxLength={2000}
                rows={4}
                className="w-full rounded-md bg-white/5 border-white/10 text-white p-2"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  min={0}
                  step={0.01}
                  required
                  className="bg-white/5 border-white/10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full rounded-md bg-white/5 border-white/10 text-white p-2"
                  required
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stock">Stock (empty for unlimited)</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  value={formData.stock === null ? '' : formData.stock}
                  onChange={handleInputChange}
                  min={0}
                  className="bg-white/5 border-white/10"
                  placeholder="Unlimited"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Features</Label>
              <div className="flex space-x-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a feature"
                  maxLength={200}
                  className="bg-white/5 border-white/10"
                />
                <Button 
                  type="button" 
                  onClick={handleAddFeature}
                  variant="outline"
                  className="border-white/10 hover:bg-white/10"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="mt-2 space-y-2">
                {formData.features && formData.features.map((feature, index) => (
                  <div key={index} className="flex justify-between items-center bg-white/5 p-2 rounded">
                    <span>{feature}</span>
                    <Button 
                      type="button" 
                      onClick={() => handleRemoveFeature(index)}
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Specifications</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input
                  value={newSpecKey}
                  onChange={(e) => setNewSpecKey(e.target.value)}
                  placeholder="Specification name"
                  className="bg-white/5 border-white/10 col-span-1"
                />
                <Input
                  value={newSpecValue}
                  onChange={(e) => setNewSpecValue(e.target.value)}
                  placeholder="Specification value"
                  className="bg-white/5 border-white/10 md:col-span-1"
                />
                <Button 
                  type="button" 
                  onClick={handleAddSpecification}
                  variant="outline"
                  className="border-white/10 hover:bg-white/10"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="mt-2 space-y-2">
                {formData.specifications && Object.entries(formData.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center bg-white/5 p-2 rounded">
                    <div>
                      <span className="font-medium">{key}:</span> {value}
                    </div>
                    <Button 
                      type="button" 
                      onClick={() => handleRemoveSpecification(key)}
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="rounded bg-white/5 border-white/10"
              />
              <Label htmlFor="isActive">Product is active and available for purchase</Label>
            </div>
            
            <DialogFooter className="flex justify-between items-center pt-4 border-t border-white/10">
              {mode === 'edit' && onDelete && (
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="border-red-500/30 text-red-400 hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
              <div className="flex space-x-2 ml-auto">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  className="border-white/10 hover:bg-white/10"
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={processing}
                >
                  {processing ? 'Saving...' : mode === 'create' ? 'Create Product' : 'Update Product'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
} 