export type ProductCategory = 
  | 'Software' 
  | 'Hardware' 
  | 'Service' 
  | 'Consultation' 
  | 'Training' 
  | 'License' 
  | 'Other'

export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  currency: Currency
  category: ProductCategory
  imageUrl?: string
  features: string[]
  specifications: Record<string, string>
  isActive: boolean
  stock: number | null
  createdBy: {
    id: string
    name: string
    username: string
  }
  createdAt: string
  updatedAt: string
}

export interface PurchaseStatus {
  pending: number
  approved: number
  rejected: number
  completed: number
  cancelled: number
}

export interface CategoryCounts {
  Software: number
  Hardware: number
  Service: number
  Consultation: number
  Training: number
  License: number
  Other: number
  all: number
}

export interface GuestInfo {
  fullName: string
  email: string
  phoneNumber: string
  company?: string
  address: string
  city: string
  country: string
  notes?: string
}

export type BuyerType = 'guest' | 'user' | 'admin'

export interface Purchase {
  id: string
  product: Product
  quantity: number
  totalAmount: number
  currency: Currency
  buyerType: BuyerType
  buyer: {
    type: BuyerType
    id?: string
    name?: string
    username?: string
    info?: GuestInfo
  }
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled'
  adminNotes?: string
  approvedBy?: {
    id: string
    name: string
    username: string
  }
  approvedAt?: string
  createdAt: string
  updatedAt: string
} 