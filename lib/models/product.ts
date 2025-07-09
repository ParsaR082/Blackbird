import mongoose from 'mongoose'

export interface IProduct {
  _id?: string
  name: string
  description: string
  price: number
  currency: string
  category: string
  imageUrl?: string
  features: string[]
  specifications: Record<string, any>
  isActive: boolean
  stock?: number
  createdBy: string // Admin who created it
  createdAt: Date
  updatedAt: Date
}

export interface IPurchase {
  _id?: string
  productId: string
  quantity: number
  totalAmount: number
  currency: string
  
  // Buyer information
  buyerType: 'guest' | 'user' | 'admin'
  userId?: string // For registered users/admins
  guestInfo?: {
    fullName: string
    email: string
    phoneNumber: string
    company?: string
    address: string
    city: string
    country: string
    notes?: string
  }
  
  // Purchase status
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled'
  adminNotes?: string
  approvedBy?: string // Admin who approved/rejected
  approvedAt?: Date
  
  // Metadata
  createdAt: Date
  updatedAt: Date
}

export interface IGuestNotification {
  _id?: string
  purchaseId: string
  email: string
  type: 'purchase_received' | 'status_update'
  message: string
  sentAt: Date
  isRead: boolean
}

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
  },
  category: {
    type: String,
    required: true,
    enum: ['Software', 'Hardware', 'Service', 'Consultation', 'Training', 'License', 'Other']
  },
  imageUrl: {
    type: String,
    trim: true
  },
  features: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  specifications: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isActive: {
    type: Boolean,
    default: true
  },
  stock: {
    type: Number,
    min: 0,
    default: null // null means unlimited
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

const PurchaseSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
  },
  buyerType: {
    type: String,
    required: true,
    enum: ['guest', 'user', 'admin']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function(this: any) { return this.buyerType !== 'guest' }
  },
  guestInfo: {
    fullName: {
      type: String,
      required: function(this: any) { return this.buyerType === 'guest' },
      trim: true,
      maxlength: 100
    },
    email: {
      type: String,
      required: function(this: any) { return this.buyerType === 'guest' },
      trim: true,
      lowercase: true
    },
    phoneNumber: {
      type: String,
      required: function(this: any) { return this.buyerType === 'guest' },
      trim: true
    },
    company: {
      type: String,
      trim: true,
      maxlength: 100
    },
    address: {
      type: String,
      required: function(this: any) { return this.buyerType === 'guest' },
      trim: true,
      maxlength: 200
    },
    city: {
      type: String,
      required: function(this: any) { return this.buyerType === 'guest' },
      trim: true,
      maxlength: 50
    },
    country: {
      type: String,
      required: function(this: any) { return this.buyerType === 'guest' },
      trim: true,
      maxlength: 50
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500
    }
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  }
}, {
  timestamps: true
})

const GuestNotificationSchema = new mongoose.Schema({
  purchaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Purchase',
    required: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  type: {
    type: String,
    required: true,
    enum: ['purchase_received', 'status_update']
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

// Indexes for better performance
ProductSchema.index({ category: 1, isActive: 1 })
ProductSchema.index({ createdBy: 1 })
ProductSchema.index({ name: 'text', description: 'text' })

PurchaseSchema.index({ buyerType: 1, userId: 1 })
PurchaseSchema.index({ status: 1, createdAt: -1 })
PurchaseSchema.index({ productId: 1 })
PurchaseSchema.index({ 'guestInfo.email': 1 })

GuestNotificationSchema.index({ email: 1, isRead: 1 })
GuestNotificationSchema.index({ purchaseId: 1 })

export const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema)
export const Purchase = mongoose.models.Purchase || mongoose.model<IPurchase>('Purchase', PurchaseSchema)
export const GuestNotification = mongoose.models.GuestNotification || mongoose.model<IGuestNotification>('GuestNotification', GuestNotificationSchema) 