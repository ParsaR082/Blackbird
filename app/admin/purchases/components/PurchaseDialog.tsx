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
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Purchase } from '../../products/types'
import { format } from 'date-fns'
import { CheckCircle, XCircle, AlertTriangle, Clock, MessageCircle, Mail } from 'lucide-react'

interface PurchaseDialogProps {
  isOpen: boolean
  onClose: () => void
  purchase: Purchase | null
  onUpdateStatus: (purchaseId: string, status: string, notes?: string) => void
}

interface GuestNotification {
  id: string
  type: 'purchase_received' | 'status_update'
  message: string
  sentAt: string
  isRead: boolean
}

export default function PurchaseDialog({
  isOpen,
  onClose,
  purchase,
  onUpdateStatus
}: PurchaseDialogProps) {
  const [status, setStatus] = useState<string>('')
  const [adminNotes, setAdminNotes] = useState<string>('')
  const [processing, setProcessing] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [notifications, setNotifications] = useState<GuestNotification[]>([])
  const [loadingNotifications, setLoadingNotifications] = useState(false)

  const fetchGuestNotifications = async (purchaseId: string) => {
    try {
      setLoadingNotifications(true)
      const response = await fetch(`/api/admin/purchases/notifications?purchaseId=${purchaseId}`)
      const data = await response.json()
      
      if (data.success) {
        setNotifications(data.notifications)
        // Mark unread notifications as read
        data.notifications
          .filter((notification: GuestNotification) => !notification.isRead)
          .forEach((notification: GuestNotification) => {
            markNotificationAsRead(notification.id)
          })
      } else {
        console.error('Failed to load notifications')
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoadingNotifications(false)
    }
  }

  useEffect(() => {
    if (purchase) {
      setStatus(purchase.status)
      setAdminNotes(purchase.adminNotes || '')
      
      // If it's a guest purchase, fetch notifications
      if (purchase.buyerType === 'guest' && purchase.buyer.info?.email) {
        fetchGuestNotifications(purchase.id)
      } else {
        setNotifications([])
      }
    }
  }, [purchase])

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/admin/purchases/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId, isRead: true }),
      })
      
      if (response.ok) {
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => 
            notification.id === notificationId
              ? { ...notification, isRead: true }
              : notification
          )
        )
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  // Function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'border-amber-500/30 text-amber-400'
      case 'approved': return 'border-green-500/30 text-green-400'
      case 'rejected': return 'border-red-500/30 text-red-400'
      case 'completed': return 'border-blue-500/30 text-blue-400'
      case 'cancelled': return 'border-gray-500/30 text-gray-400'
      default: return 'border-white/30'
    }
  }

  // Function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-amber-400" />
      case 'approved': return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'rejected': return <XCircle className="w-5 h-5 text-red-400" />
      case 'completed': return <CheckCircle className="w-5 h-5 text-blue-400" />
      case 'cancelled': return <AlertTriangle className="w-5 h-5 text-gray-400" />
      default: return <Clock className="w-5 h-5" />
    }
  }

  const handleStatusUpdate = (status: string) => {
    setProcessing(true)
    
    setTimeout(() => {
      onUpdateStatus(purchase.id, status, adminNotes)
      setProcessing(false)
      setAdminNotes('')
    }, 500)
  }

  if (!isOpen || !purchase) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black/90 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Purchase Details</DialogTitle>
          <DialogDescription>
            View and manage purchase information
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Product Information */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Product Information</h3>
            <div className="bg-white/5 p-3 rounded">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{purchase.product.name}</h4>
                <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                  {purchase.product.category}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{purchase.product.description}</p>
              <div className="mt-2 text-sm">
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span>${purchase.product.price.toFixed(2)} {purchase.product.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantity:</span>
                  <span>{purchase.quantity}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>${purchase.totalAmount.toFixed(2)} {purchase.currency}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Buyer Information */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Buyer Information</h3>
            <div className="bg-white/5 p-3 rounded">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">
                  {purchase.buyerType === 'guest' 
                    ? purchase.buyer.info?.fullName 
                    : purchase.buyer.name}
                </h4>
                <Badge variant="secondary" className="bg-white/10">
                  {purchase.buyerType === 'guest' ? 'Guest' : 'Registered User'}
                </Badge>
              </div>
              
              {purchase.buyerType === 'guest' ? (
                <div className="mt-2 text-sm grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <p><span className="text-muted-foreground">Email:</span> {purchase.buyer.info?.email}</p>
                    <p><span className="text-muted-foreground">Phone:</span> {purchase.buyer.info?.phoneNumber}</p>
                    {purchase.buyer.info?.company && (
                      <p><span className="text-muted-foreground">Company:</span> {purchase.buyer.info.company}</p>
                    )}
                  </div>
                  <div>
                    <p><span className="text-muted-foreground">Address:</span> {purchase.buyer.info?.address}</p>
                    <p><span className="text-muted-foreground">City:</span> {purchase.buyer.info?.city}</p>
                    <p><span className="text-muted-foreground">Country:</span> {purchase.buyer.info?.country}</p>
                  </div>
                  {purchase.buyer.info?.notes && (
                    <div className="col-span-2 mt-2">
                      <p className="text-muted-foreground">Notes:</p>
                      <p className="bg-white/5 p-2 rounded mt-1">{purchase.buyer.info.notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-2 text-sm">
                  <p><span className="text-muted-foreground">Username:</span> @{purchase.buyer.username}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Purchase Timeline */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Timeline</h3>
            <div className="bg-white/5 p-3 rounded space-y-3">
              <div className="flex items-start">
                <div className="mr-2 mt-0.5">
                  <Clock className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Purchase Created</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(purchase.createdAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
              
              {purchase.approvedAt && (
                <div className="flex items-start">
                  <div className="mr-2 mt-0.5">
                    {purchase.status === 'approved' || purchase.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : purchase.status === 'rejected' ? (
                      <XCircle className="h-4 w-4 text-red-400" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {purchase.status === 'approved' ? 'Approved' : 
                       purchase.status === 'rejected' ? 'Rejected' : 
                       purchase.status === 'completed' ? 'Completed' : 'Cancelled'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(purchase.approvedAt), 'MMM d, yyyy h:mm a')}
                      {purchase.approvedBy && ` by ${purchase.approvedBy.name}`}
                    </p>
                    {purchase.adminNotes && (
                      <p className="text-xs bg-white/10 p-1.5 rounded mt-1">
                        {purchase.adminNotes}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Admin Actions */}
          {purchase.status === 'pending' && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Admin Actions</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="adminNotes">Admin Notes (optional)</Label>
                  <textarea
                    id="adminNotes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about this purchase"
                    className="w-full rounded-md bg-white/5 border-white/10 text-white p-2 h-24"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button 
                    onClick={() => handleStatusUpdate('approved')}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={processing}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button 
                    onClick={() => handleStatusUpdate('rejected')}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={processing}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button 
                    onClick={() => handleStatusUpdate('completed')}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={processing}
                  >
                    Complete
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {purchase.status === 'approved' && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Admin Actions</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="adminNotes">Admin Notes (optional)</Label>
                  <textarea
                    id="adminNotes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about this purchase"
                    className="w-full rounded-md bg-white/5 border-white/10 text-white p-2 h-24"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button 
                    onClick={() => handleStatusUpdate('completed')}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={processing}
                  >
                    Complete
                  </Button>
                  <Button 
                    onClick={() => handleStatusUpdate('cancelled')}
                    className="bg-gray-600 hover:bg-gray-700"
                    disabled={processing}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Guest Notifications Section - Only for guest purchases */}
        {purchase.buyerType === 'guest' && purchase.buyer.info && (
          <div className="mt-6">
            <h3 className="text-lg font-medium flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              Guest Notifications
            </h3>
            <div className="mt-3 border border-white/10 rounded-md overflow-hidden">
              {loadingNotifications ? (
                <div className="p-4 text-center text-sm text-white/60">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-white/60">
                  No notifications sent to this guest yet.
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {notifications.map(notification => (
                    <div key={notification.id} className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center text-xs text-white/70">
                          <Mail className="w-3 h-3 mr-1" />
                          <span>{notification.type === 'purchase_received' ? 'Receipt' : 'Status Update'}</span>
                          <span className="mx-2">•</span>
                          <span>{format(new Date(notification.sentAt), 'MMM d, yyyy h:mm a')}</span>
                        </div>
                        <Badge variant="outline" className={notification.isRead ? 'border-green-500/30 text-green-400' : 'border-amber-500/30 text-amber-400'}>
                          {notification.isRead ? 'Read' : 'Unread'}
                        </Badge>
                      </div>
                      <div className="mt-2 text-sm bg-white/5 p-2 rounded">
                        {notification.message}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="flex justify-between items-center pt-4 border-t border-white/10">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className="border-white/10 hover:bg-white/10"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 