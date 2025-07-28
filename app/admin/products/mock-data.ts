import { Purchase, Product } from './types'

// Mock products for development
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Software License',
    description: 'Advanced software solution for enterprise use',
    price: 299.99,
    currency: 'USD',
    category: 'Software',
    features: ['Advanced Analytics', 'Cloud Integration', '24/7 Support'],
    specifications: { version: '2.0', platform: 'Cross-platform' },
    isActive: true,
    stock: 100,
    createdBy: { id: '1', name: 'Admin User', username: 'admin' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// Mock purchases for development
export const mockPurchases: Purchase[] = [
  {
    id: '1',
    product: mockProducts[0],
    quantity: 1,
    totalAmount: 299.99,
    currency: 'USD',
    buyerType: 'guest',
    buyer: {
      type: 'guest',
      info: {
        fullName: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '+1234567890',
        address: '123 Main St',
        city: 'New York',
        country: 'USA'
      }
    },
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]