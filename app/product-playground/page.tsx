'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import BackgroundNodes from '@/components/BackgroundNodes'
import { useTheme } from '@/contexts/theme-context'
import { useAuth } from '@/contexts/auth-context'
import { ShoppingCart, Package, User, AlertCircle, CheckCircle, Clock, X } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  currency: string
  category: string
  imageUrl?: string
  features: string[]
  specifications: Record<string, any>
  stock?: number
  createdBy: {
    name: string
    username: string
  }
  createdAt: string
}

interface Purchase {
  id: string
  product: {
    id: string
    name: string
    description: string
    price: number
    currency: string
    category: string
    imageUrl?: string
  }
  quantity: number
  totalAmount: number
  currency: string
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled'
  adminNotes?: string
  approvedBy?: {
    name: string
    username: string
  }
  approvedAt?: string
  createdAt: string
}

interface CategoryCounts {
  Software: number
  Hardware: number
  Service: number
  Consultation: number
  Training: number
  License: number
  Other: number
}

// Purchase modal component
const PurchaseModal = ({ 
  product, 
  isOpen, 
  onClose, 
  onPurchase, 
  isAuthenticated 
}: {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onPurchase: (purchaseData: any) => void
  isAuthenticated: boolean
}) => {
  const [quantity, setQuantity] = useState(1)
  const [guestInfo, setGuestInfo] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    company: '',
    address: '',
    city: '',
    country: '',
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { theme } = useTheme()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return

    setIsSubmitting(true)
    
    const purchaseData = {
      productId: product.id,
      quantity,
      ...(isAuthenticated ? {} : { guestInfo })
    }

    await onPurchase(purchaseData)
    setIsSubmitting(false)
    onClose()
  }

  if (!isOpen || !product) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative bg-opacity-95 backdrop-blur-sm border rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.95)',
          borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full transition-colors duration-300 hover:bg-black/10"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-xl font-bold mb-4 transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
          Purchase {product.name}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
              Quantity
            </label>
            <input
              type="number"
              min="1"
              max={product.stock || 999}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="w-full p-2 border rounded-lg transition-colors duration-300"
              style={{
                backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
                borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                color: 'var(--text-color)'
              }}
              required
            />
          </div>

          {!isAuthenticated && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={guestInfo.fullName}
                    onChange={(e) => setGuestInfo({...guestInfo, fullName: e.target.value})}
                    className="w-full p-2 border rounded-lg transition-colors duration-300"
                    style={{
                      backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
                      borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                      color: 'var(--text-color)'
                    }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={guestInfo.email}
                    onChange={(e) => setGuestInfo({...guestInfo, email: e.target.value})}
                    className="w-full p-2 border rounded-lg transition-colors duration-300"
                    style={{
                      backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
                      borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                      color: 'var(--text-color)'
                    }}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={guestInfo.phoneNumber}
                    onChange={(e) => setGuestInfo({...guestInfo, phoneNumber: e.target.value})}
                    className="w-full p-2 border rounded-lg transition-colors duration-300"
                    style={{
                      backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
                      borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                      color: 'var(--text-color)'
                    }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
                    Company
                  </label>
                  <input
                    type="text"
                    value={guestInfo.company}
                    onChange={(e) => setGuestInfo({...guestInfo, company: e.target.value})}
                    className="w-full p-2 border rounded-lg transition-colors duration-300"
                    style={{
                      backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
                      borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                      color: 'var(--text-color)'
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
                  Address *
                </label>
                <input
                  type="text"
                  value={guestInfo.address}
                  onChange={(e) => setGuestInfo({...guestInfo, address: e.target.value})}
                  className="w-full p-2 border rounded-lg transition-colors duration-300"
                  style={{
                    backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
                    borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                    color: 'var(--text-color)'
                  }}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
                    City *
                  </label>
                  <input
                    type="text"
                    value={guestInfo.city}
                    onChange={(e) => setGuestInfo({...guestInfo, city: e.target.value})}
                    className="w-full p-2 border rounded-lg transition-colors duration-300"
                    style={{
                      backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
                      borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                      color: 'var(--text-color)'
                    }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
                    Country *
                  </label>
                  <input
                    type="text"
                    value={guestInfo.country}
                    onChange={(e) => setGuestInfo({...guestInfo, country: e.target.value})}
                    className="w-full p-2 border rounded-lg transition-colors duration-300"
                    style={{
                      backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
                      borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                      color: 'var(--text-color)'
                    }}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
                  Notes
                </label>
                <textarea
                  value={guestInfo.notes}
                  onChange={(e) => setGuestInfo({...guestInfo, notes: e.target.value})}
                  className="w-full p-2 border rounded-lg transition-colors duration-300"
                  style={{
                    backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
                    borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                    color: 'var(--text-color)'
                  }}
                  rows={3}
                />
              </div>
            </>
          )}

          <div className="border-t pt-4 mt-4" style={{ borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)' }}>
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-medium transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
                Total: {product.currency} {(product.price * quantity).toFixed(2)}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 border rounded-lg transition-colors duration-300"
                style={{
                  borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                  color: 'var(--text-color)'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-300"
              >
                {isSubmitting ? 'Processing...' : 'Purchase'}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function ProductPlaygroundPage() {
  const [isMobile, setIsMobile] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [categoryCounts, setCategoryCounts] = useState<CategoryCounts>({
    Software: 0,
    Hardware: 0,
    Service: 0,
    Consultation: 0,
    Training: 0,
    License: 0,
    Other: 0
  })
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'products' | 'purchases'>('products')
  
  const { theme } = useTheme()
  const { user } = useAuth()

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products')
        const data = await response.json()
        
        if (data.success) {
          setProducts(data.products)
          setCategoryCounts(data.categoryCounts)
        } else {
          setError('Failed to load products')
        }
      } catch (err) {
        setError('Failed to load products')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Fetch user purchases
  useEffect(() => {
    if (user) {
      const fetchPurchases = async () => {
        try {
          const response = await fetch('/api/purchases')
          const data = await response.json()
          
          if (data.success) {
            setPurchases(data.purchases)
          }
        } catch (err) {
          console.error('Failed to load purchases:', err)
        }
      }

      fetchPurchases()
    }
  }, [user])

  // Filter products when category changes
  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredProducts(products)
    } else {
      setFilteredProducts(products.filter(product => product.category === selectedCategory))
    }
  }, [selectedCategory, products])

  // Categories
  const categories = ['All', 'Software', 'Hardware', 'Service', 'Consultation', 'Training', 'License', 'Other']

  const handlePurchase = async (purchaseData: any) => {
    try {
      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(purchaseData),
      })

      const data = await response.json()
      
      if (data.success) {
        alert(data.message)
        if (data.purchase.redirectToAdmin && user) {
          // Refresh purchases for authenticated users
          const purchasesResponse = await fetch('/api/purchases')
          const purchasesData = await purchasesResponse.json()
          if (purchasesData.success) {
            setPurchases(purchasesData.purchases)
          }
        }
      } else {
        alert(data.error || 'Purchase failed')
      }
    } catch (error) {
      alert('Purchase failed. Please try again.')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'approved':
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'rejected':
      case 'cancelled':
        return <X className="w-4 h-4 text-red-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'approved':
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'rejected':
      case 'cancelled':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors duration-300" style={{ backgroundColor: 'var(--bg-color)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="transition-colors duration-300" style={{ color: 'var(--text-color)' }}>Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen transition-colors duration-300 pt-24" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      {/* Interactive Background */}
      <BackgroundNodes isMobile={isMobile} />
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center px-4 pb-24">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-light mb-4"
          >
            Product Playground
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-md mx-auto transition-colors duration-300"
            style={{ color: 'var(--text-secondary)' }}
          >
            Discover and purchase our innovative products
          </motion.p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div 
          className="mb-8 flex rounded-lg border transition-colors duration-300"
          style={{ borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-2 rounded-l-lg flex items-center gap-2 transition-colors duration-300 ${
              activeTab === 'products' 
                ? theme === 'light' ? 'bg-black text-white' : 'bg-white text-black'
                : ''
            }`}
            style={{
              color: activeTab === 'products' ? undefined : 'var(--text-color)'
            }}
          >
            <Package className="w-4 h-4" />
            Products
          </button>
          {user && (
            <button
              onClick={() => setActiveTab('purchases')}
              className={`px-6 py-2 rounded-r-lg flex items-center gap-2 transition-colors duration-300 ${
                activeTab === 'purchases' 
                  ? theme === 'light' ? 'bg-black text-white' : 'bg-white text-black'
                  : ''
              }`}
              style={{
                color: activeTab === 'purchases' ? undefined : 'var(--text-color)'
              }}
            >
              <ShoppingCart className="w-4 h-4" />
              My Purchases ({purchases.length})
            </button>
          )}
        </motion.div>

        {activeTab === 'products' ? (
          <>
            {/* Category Filters */}
            <motion.div 
              className="mb-8 flex flex-wrap justify-center gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {categories.map((category) => (
                <motion.button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full border relative transition-colors duration-300 text-sm`}
                  style={{
                    borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                    color: selectedCategory === category ? 'var(--text-color)' : 'var(--text-secondary)'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {selectedCategory === category && (
                    <motion.div
                      layoutId="categoryIndicator"
                      className="absolute inset-0 rounded-full transition-colors duration-300"
                      style={{
                        backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
                      }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">
                    {category} {category !== 'All' && categoryCounts[category as keyof CategoryCounts] > 0 && `(${categoryCounts[category as keyof CategoryCounts]})`}
                  </span>
                </motion.button>
              ))}
            </motion.div>
            
            {/* Product Grid */}
            {error ? (
              <motion.div 
                className="flex flex-col items-center justify-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <p className="text-lg transition-colors duration-300" style={{ color: 'var(--text-color)' }}>{error}</p>
              </motion.div>
            ) : filteredProducts.length > 0 ? (
              <div className="w-full max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      className="backdrop-blur-sm rounded-lg overflow-hidden border transition-colors duration-300"
                      style={{
                        backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.05)',
                        borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
                      }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      whileHover={{ 
                        scale: 1.02, 
                        boxShadow: theme === 'light' 
                          ? '0 10px 30px -10px rgba(0,0,0,0.1)' 
                          : '0 10px 30px -10px rgba(255,255,255,0.1)' 
                      }}
                    >
                      {/* Product Image */}
                      <div className="h-48 transition-colors duration-300 flex items-center justify-center" style={{
                        backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)'
                      }}>
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="max-h-full max-w-full object-contain" />
                        ) : (
                          <Package className="w-16 h-16 opacity-50" />
                        )}
                      </div>
                      
                      {/* Product Info */}
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-medium transition-colors duration-300 flex-1" style={{ color: 'var(--text-color)' }}>
                            {product.name}
                          </h3>
                          <div className="ml-2 text-right">
                            <div className="text-lg font-bold transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
                              {product.currency} {product.price}
                            </div>
                            {product.stock !== null && (
                              <div className="text-xs transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                                Stock: {product.stock}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm mb-2 transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                          {product.description}
                        </p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-2 py-1 rounded text-xs font-medium transition-colors duration-300"
                            style={{
                              backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                              color: 'var(--text-color)'
                            }}>
                            {product.category}
                          </span>
                          <span className="text-xs transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                            by {product.createdBy.name}
                          </span>
                        </div>

                        {product.features.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs font-medium mb-1 transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
                              Features:
                            </p>
                            <ul className="text-xs space-y-1">
                              {product.features.slice(0, 3).map((feature, index) => (
                                <li key={index} className="transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                                  • {feature}
                                </li>
                              ))}
                              {product.features.length > 3 && (
                                <li className="transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                                  • +{product.features.length - 3} more...
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                        
                        <motion.button
                          onClick={() => {
                            setSelectedProduct(product)
                            setShowPurchaseModal(true)
                          }}
                          className="w-full py-2 border rounded-md text-sm font-medium relative overflow-hidden group transition-colors duration-300 flex items-center justify-center gap-2"
                          style={{
                            borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
                          }}
                          whileHover="hover"
                          whileTap={{ scale: 0.98 }}
                          disabled={product.stock === 0}
                        >
                          <motion.span 
                            className="absolute inset-0 z-0"
                            style={{
                              backgroundColor: product.stock === 0 ? '#dc2626' : theme === 'light' ? '#000000' : '#ffffff',
                              transformOrigin: 'left'
                            }}
                            initial={{ scaleX: 0 }}
                            variants={{
                              hover: { 
                                scaleX: 1,
                                transition: { duration: 0.3 }
                              }
                            }}
                          />
                          <ShoppingCart className="w-4 h-4 relative z-10" />
                          <span className="relative z-10 transition-colors duration-300" 
                            style={{
                              color: product.stock === 0 ? '#ffffff' : 'var(--text-color)'
                            }}>
                            {product.stock === 0 ? 'Out of Stock' : 'Purchase'}
                          </span>
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <motion.div 
                className="flex flex-col items-center justify-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Package className="w-16 h-16 opacity-50 mb-4" />
                <p className="text-lg transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                  {selectedCategory === 'All' ? 'No products available' : `No products in ${selectedCategory} category`}
                </p>
              </motion.div>
            )}
          </>
        ) : (
          /* Purchases Tab */
          <div className="w-full max-w-4xl">
            {purchases.length > 0 ? (
              <div className="space-y-4">
                {purchases.map((purchase) => (
                  <motion.div
                    key={purchase.id}
                    className="backdrop-blur-sm rounded-lg p-6 border transition-colors duration-300"
                    style={{
                      backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.05)',
                      borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-medium transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
                            {purchase.product.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(purchase.status)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(purchase.status)}`}>
                              {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm transition-colors duration-300 mb-2" style={{ color: 'var(--text-secondary)' }}>
                          {purchase.product.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
                            Quantity: {purchase.quantity}
                          </span>
                          <span className="transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
                            Total: {purchase.currency} {purchase.totalAmount}
                          </span>
                          <span className="transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                            {new Date(purchase.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {purchase.adminNotes && (
                          <div className="mt-2 p-2 rounded bg-yellow-50 border border-yellow-200">
                            <p className="text-sm text-yellow-800">
                              <strong>Admin Notes:</strong> {purchase.adminNotes}
                            </p>
                          </div>
                        )}
                        {purchase.approvedBy && (
                          <p className="text-xs mt-2 transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                            Approved by {purchase.approvedBy.name} on {new Date(purchase.approvedAt!).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div 
                className="flex flex-col items-center justify-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <ShoppingCart className="w-16 h-16 opacity-50 mb-4" />
                <p className="text-lg transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                  No purchases yet
                </p>
                <button
                  onClick={() => setActiveTab('products')}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                >
                  Browse Products
                </button>
              </motion.div>
            )}
          </div>
        )}

        {/* Purchase Modal */}
        <PurchaseModal
          product={selectedProduct}
          isOpen={showPurchaseModal}
          onClose={() => {
            setShowPurchaseModal(false)
            setSelectedProduct(null)
          }}
          onPurchase={handlePurchase}
          isAuthenticated={!!user}
        />
      </div>
    </div>
  )
}