import { Product, Purchase } from './types'

export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Advanced AI Development Kit',
    description: 'Complete toolkit for building and deploying AI models with comprehensive documentation and examples.',
    price: 299.99,
    currency: 'USD',
    category: 'Software',
    imageUrl: 'https://example.com/ai-kit.jpg',
    features: [
      'Pre-trained models library',
      'GPU optimization tools',
      'Interactive tutorials',
      'Cloud deployment scripts'
    ],
    specifications: {
      'Version': '2.4.1',
      'License': 'Commercial',
      'Platform': 'Cross-platform',
      'Size': '4.2GB'
    },
    isActive: true,
    stock: 50,
    createdBy: {
      id: 'user-1',
      name: 'Admin User',
      username: 'admin'
    },
    createdAt: '2023-12-01T10:30:00Z',
    updatedAt: '2024-01-15T08:45:00Z'
  },
  {
    id: 'prod-2',
    name: 'Quantum Computing Introduction Course',
    description: 'Comprehensive course on quantum computing fundamentals with practical exercises and certification.',
    price: 149.99,
    currency: 'USD',
    category: 'Training',
    imageUrl: 'https://example.com/quantum-course.jpg',
    features: [
      '20 hours of video content',
      'Hands-on exercises',
      'Certificate of completion',
      'Expert instructor support'
    ],
    specifications: {
      'Duration': '4 weeks',
      'Level': 'Intermediate',
      'Prerequisites': 'Basic programming knowledge',
      'Format': 'Online, self-paced'
    },
    isActive: true,
    stock: null,
    createdBy: {
      id: 'user-1',
      name: 'Admin User',
      username: 'admin'
    },
    createdAt: '2023-11-15T14:20:00Z',
    updatedAt: '2024-01-10T11:30:00Z'
  },
  {
    id: 'prod-3',
    name: 'Enterprise Security Audit',
    description: 'Comprehensive security assessment for enterprise systems with detailed reports and remediation guidance.',
    price: 1499.99,
    currency: 'USD',
    category: 'Service',
    features: [
      'Network vulnerability scanning',
      'Penetration testing',
      'Compliance assessment',
      'Executive summary report',
      'Remediation recommendations'
    ],
    specifications: {
      'Duration': '2-4 weeks',
      'Deliverables': 'Detailed report, Executive summary',
      'Team': 'Senior security engineers',
      'Follow-up': '30-day support included'
    },
    isActive: true,
    stock: 10,
    createdBy: {
      id: 'user-1',
      name: 'Admin User',
      username: 'admin'
    },
    createdAt: '2023-10-05T09:15:00Z',
    updatedAt: '2024-01-20T16:40:00Z'
  },
  {
    id: 'prod-4',
    name: 'Developer Workstation Pro',
    description: 'High-performance workstation optimized for software development with pre-installed development tools.',
    price: 2499.99,
    currency: 'USD',
    category: 'Hardware',
    imageUrl: 'https://example.com/dev-workstation.jpg',
    features: [
      '32GB RAM',
      '1TB NVMe SSD',
      'NVIDIA RTX 4080',
      'Pre-installed development environment',
      '4K monitor included'
    ],
    specifications: {
      'CPU': 'Intel Core i9 13900K',
      'RAM': '32GB DDR5',
      'Storage': '1TB NVMe SSD',
      'GPU': 'NVIDIA RTX 4080',
      'OS': 'Windows 11 Pro / Ubuntu dual boot'
    },
    isActive: true,
    stock: 5,
    createdBy: {
      id: 'user-1',
      name: 'Admin User',
      username: 'admin'
    },
    createdAt: '2023-09-20T11:30:00Z',
    updatedAt: '2024-01-05T13:20:00Z'
  }
]

export const mockPurchases: Purchase[] = [
  {
    id: 'purchase-1',
    product: mockProducts[0],
    quantity: 2,
    totalAmount: 599.98,
    currency: 'USD',
    buyerType: 'user',
    buyer: {
      type: 'user',
      id: 'user-2',
      name: 'Jane Smith',
      username: 'janesmith'
    },
    status: 'pending',
    createdAt: '2024-02-10T14:30:00Z',
    updatedAt: '2024-02-10T14:30:00Z'
  },
  {
    id: 'purchase-2',
    product: mockProducts[1],
    quantity: 1,
    totalAmount: 149.99,
    currency: 'USD',
    buyerType: 'guest',
    buyer: {
      type: 'guest',
      info: {
        fullName: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '+1234567890',
        company: 'Acme Corp',
        address: '123 Main St',
        city: 'New York',
        country: 'USA',
        notes: 'Need access ASAP'
      }
    },
    status: 'approved',
    adminNotes: 'Approved for immediate access',
    approvedBy: {
      id: 'user-1',
      name: 'Admin User',
      username: 'admin'
    },
    approvedAt: '2024-02-09T10:15:00Z',
    createdAt: '2024-02-08T16:45:00Z',
    updatedAt: '2024-02-09T10:15:00Z'
  },
  {
    id: 'purchase-3',
    product: mockProducts[2],
    quantity: 1,
    totalAmount: 1499.99,
    currency: 'USD',
    buyerType: 'user',
    buyer: {
      type: 'user',
      id: 'user-3',
      name: 'Robert Johnson',
      username: 'rjohnson'
    },
    status: 'completed',
    adminNotes: 'Service delivered successfully',
    approvedBy: {
      id: 'user-1',
      name: 'Admin User',
      username: 'admin'
    },
    approvedAt: '2024-01-20T09:30:00Z',
    createdAt: '2024-01-15T11:20:00Z',
    updatedAt: '2024-02-05T14:10:00Z'
  }
] 