
'use client'



import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Loader2 } from 'lucide-react'
import BackgroundNodes from '@/components/BackgroundNodes'
import PurchasesHeader from './components/PurchasesHeader'
import PurchasesStats from './components/PurchasesStats'
import PurchasesFilters from './components/PurchasesFilters'
import PurchasesList from './components/PurchasesList'
import PurchaseDialog from './components/PurchaseDialog'
import { Purchase } from '../products/types'
import { mockPurchases } from '../products/mock-data'

export default function AdminPurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [buyerTypeFilter, setBuyerTypeFilter] = useState('all')

  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect if user is not admin
    if (!isLoading && (!isAuthenticated || (user && user.role !== 'ADMIN'))) {
      router.push('/admin')
      return
    }
    
    if (isAuthenticated && user?.role === 'ADMIN') {
      fetchPurchases()
    }
  }, [user, isAuthenticated, isLoading, router])

  const fetchPurchases = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Make an actual API call
      const response = await fetch('/api/admin/purchases')
      if (!response.ok) throw new Error('Failed to fetch purchases')
      const data = await response.json()
      
      if (data.success) {
        setPurchases(data.purchases)
      } else {
        throw new Error(data.error || 'Failed to fetch purchases')
      }
      setLoading(false)
    } catch (err) {
      console.error('Error fetching purchases:', err)
      setError('Failed to load purchases. Please try again.')
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (purchaseId: string, status: string, notes?: string) => {
    try {
      const response = await fetch('/api/admin/purchases', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: purchaseId,
          status,
          adminNotes: notes
        })
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        // Refresh purchases after updating status
        fetchPurchases()
        return true
      } else {
        console.error('Failed to update status:', data.error)
        return false
      }
    } catch (error) {
      console.error('Update purchase status error:', error)
      return false
    }
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
          <p className="mt-4 text-lg">Loading purchases...</p>
        </div>
      </div>
    )
  }

  const filteredPurchases = purchases
    .filter(purchase => statusFilter === 'all' || purchase.status === statusFilter)
    .filter(purchase => buyerTypeFilter === 'all' || purchase.buyerType === buyerTypeFilter)
    .filter(purchase => 
      purchase.product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (purchase.buyer.name && purchase.buyer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (purchase.buyer.info?.fullName && purchase.buyer.info.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
    )

  return (
    <div className="container mx-auto px-4 py-8">
      <PurchasesHeader />
      
      <PurchasesStats purchases={purchases} />
      
      <PurchasesFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        buyerTypeFilter={buyerTypeFilter}
        setBuyerTypeFilter={setBuyerTypeFilter}
        purchases={purchases}
      />
      
      <PurchasesList
        purchases={filteredPurchases}
        onViewPurchase={(purchase: Purchase) => {
          setSelectedPurchase(purchase)
          setShowDialog(true)
        }}
      />
      
      <PurchaseDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        purchase={selectedPurchase}
        onUpdateStatus={async (purchaseId: string, status: string, notes?: string) => {
          const success = await handleUpdateStatus(purchaseId, status, notes)
          if (success) {
            setShowDialog(false)
          }
        }}
      />
    </div>
  )
} 