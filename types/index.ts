import { Database } from '@/lib/supabase'

// User types
export type User = Database['public']['Tables']['users']['Row']
export type UserRole = 'admin' | 'user' | 'guest' | 'member'

// Navigation types
export interface NavItem {
  title: string
  href: string
  icon: string
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[]
}

export interface MainNavItem extends NavItem {}

export interface SidebarNavItem extends NavItemWithChildren {}

// Portal module types
export interface PortalModule {
  id: string
  title: string
  description: string
  href: string
  icon: string
  color: string
  gradient: string
  features: string[]
  status: 'active' | 'beta' | 'coming-soon'
  requiredRole?: UserRole
}

// Common component types
export interface PageProps {
  params: { [key: string]: string | string[] | undefined }
  searchParams: { [key: string]: string | string[] | undefined }
}

// Form types
export interface FormFieldProps {
  label: string
  name: string
  type?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// File upload types
export interface FileUpload {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploadedAt: Date
  uploadedBy: string
}

// Search and filtering
export interface SearchFilters {
  query?: string
  category?: string
  tags?: string[]
  dateRange?: {
    from: Date
    to: Date
  }
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Pagination
export interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
}

// Notification types
export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: Date
}

export interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void
  markNotificationRead: (id: string) => void
}

// Theme types
export type Theme = 'light' | 'dark' | 'system'

// Store types (for Zustand)
export interface AuthStore {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
}

export interface UIStore {
  theme: Theme
  sidebarOpen: boolean
  notifications: Notification[]
  setTheme: (theme: Theme) => void
  toggleSidebar: () => void
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void
  markNotificationRead: (id: string) => void
}

// User authentication types
export interface UserAuth {
  id: string
  student_id: string
  username: string
  full_name: string
  role: UserRole
  is_verified: boolean
  avatar_url?: string | null
}

// Session type
export interface Session {
  user: UserAuth
  expires: string
} 