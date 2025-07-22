'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp,
  User,
  Mail,
  Calendar,
  MessageSquare
} from 'lucide-react'

interface AccessRequest {
  id: string
  userId: string
  isApproved: boolean
  approvedBy?: string
  approvedAt?: string
  requestedAt: string
  reason: string
  user: {
    email: string
    fullName: string
    isVerified: boolean
    createdAt: string
  } | null
}

interface AssistantManagerProps {
  theme: string
}

export function AssistantManager({ theme }: AssistantManagerProps) {
  const [requests, setRequests] = useState<AccessRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 })
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchAccessRequests()
  }, [])

  const fetchAccessRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/assistant/access', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setRequests(data.requests)
        setStats({
          total: data.total,
          pending: data.pending,
          approved: data.approved
        })
        setError(null)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch access requests')
      }
    } catch (err) {
      console.error('Fetch error:', err)
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleAccessAction = async (userId: string, action: 'approve' | 'deny') => {
    try {
      setProcessingId(userId)
      const response = await fetch('/api/admin/assistant/access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ userId, action })
      })

      if (response.ok) {
        // Refresh the requests list
        await fetchAccessRequests()
      } else {
        const errorData = await response.json()
        setError(errorData.error || `Failed to ${action} access`)
      }
    } catch (err) {
      console.error('Action error:', err)
      setError(`Failed to ${action} access`)
    } finally {
      setProcessingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className={`w-6 h-6 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
          <h2 className={`text-2xl font-light tracking-wide transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>
            Assistant Access Manager
          </h2>
        </div>
        
        <motion.button
          onClick={fetchAccessRequests}
          disabled={loading}
          className={`px-4 py-2 border rounded-lg transition-all duration-300 disabled:opacity-50 ${
            theme === 'light' 
              ? 'bg-black/10 border-black/30 text-black hover:bg-black/20' 
              : 'bg-white/10 border-white/30 text-white hover:bg-white/20'
          }`}
          whileHover={{ scale: loading ? 1 : 1.05 }}
          whileTap={{ scale: loading ? 1 : 0.95 }}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </motion.button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          className="border rounded-lg backdrop-blur-sm p-6 transition-colors duration-300"
          style={{
            backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
            borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
          }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Users className={`w-5 h-5 transition-colors duration-300 ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} />
            <span className={`text-sm font-medium transition-colors duration-300 ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`}>
              Total Requests
            </span>
          </div>
          <div className={`text-2xl font-light transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>
            {stats.total}
          </div>
        </motion.div>

        <motion.div
          className="border rounded-lg backdrop-blur-sm p-6 transition-colors duration-300"
          style={{
            backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
            borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
          }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Clock className={`w-5 h-5 transition-colors duration-300 ${theme === 'light' ? 'text-orange-600' : 'text-orange-400'}`} />
            <span className={`text-sm font-medium transition-colors duration-300 ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`}>
              Pending
            </span>
          </div>
          <div className={`text-2xl font-light transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>
            {stats.pending}
          </div>
        </motion.div>

        <motion.div
          className="border rounded-lg backdrop-blur-sm p-6 transition-colors duration-300"
          style={{
            backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
            borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
          }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className={`w-5 h-5 transition-colors duration-300 ${theme === 'light' ? 'text-green-600' : 'text-green-400'}`} />
            <span className={`text-sm font-medium transition-colors duration-300 ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`}>
              Approved
            </span>
          </div>
          <div className={`text-2xl font-light transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>
            {stats.approved}
          </div>
        </motion.div>
      </div>

      {/* Error Display */}
      {error && (
        <div className={`p-4 border rounded-lg transition-colors duration-300 ${
          theme === 'light' 
            ? 'bg-red-50 border-red-200 text-red-800' 
            : 'bg-red-900/20 border-red-500/30 text-red-300'
        }`}>
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Access Requests List */}
      <div className="border rounded-lg backdrop-blur-sm transition-colors duration-300" style={{
        backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
        borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
      }}>
        <div className="p-6 border-b" style={{
          borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
        }}>
          <h3 className={`text-lg font-light tracking-wide transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>
            Access Requests
          </h3>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current mx-auto mb-4" />
              <p className={`text-sm transition-colors duration-300 ${theme === 'light' ? 'text-gray-500' : 'text-white/50'}`}>
                Loading access requests...
              </p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className={`w-12 h-12 mx-auto mb-4 transition-colors duration-300 ${theme === 'light' ? 'text-gray-400' : 'text-white/40'}`} />
              <p className={`text-sm transition-colors duration-300 ${theme === 'light' ? 'text-gray-500' : 'text-white/50'}`}>
                No access requests found
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request, index) => (
                <motion.div
                  key={request.id}
                  className={`border rounded-lg p-4 transition-colors duration-300 ${
                    request.isApproved 
                      ? (theme === 'light' ? 'bg-green-50 border-green-200' : 'bg-green-900/20 border-green-500/30')
                      : (theme === 'light' ? 'bg-yellow-50 border-yellow-200' : 'bg-yellow-900/20 border-yellow-500/30')
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <User className={`w-4 h-4 transition-colors duration-300 ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`} />
                        <span className={`font-medium transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                          {request.user?.fullName || 'Unknown User'}
                        </span>
                        <div className={`px-2 py-1 rounded-full text-xs ${
                          request.isApproved
                            ? (theme === 'light' ? 'bg-green-100 text-green-800' : 'bg-green-800 text-green-200')
                            : (theme === 'light' ? 'bg-yellow-100 text-yellow-800' : 'bg-yellow-800 text-yellow-200')
                        }`}>
                          {request.isApproved ? 'Approved' : 'Pending'}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Mail className={`w-4 h-4 transition-colors duration-300 ${theme === 'light' ? 'text-gray-500' : 'text-white/50'}`} />
                          <span className={`text-sm transition-colors duration-300 ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`}>
                            {request.user?.email || 'No email'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className={`w-4 h-4 transition-colors duration-300 ${theme === 'light' ? 'text-gray-500' : 'text-white/50'}`} />
                          <span className={`text-sm transition-colors duration-300 ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`}>
                            Requested: {formatDate(request.requestedAt)}
                          </span>
                        </div>
                      </div>

                      {request.reason && (
                        <div className={`text-sm p-3 border rounded-lg transition-colors duration-300 ${
                          theme === 'light' 
                            ? 'bg-gray-50 border-gray-200 text-gray-700' 
                            : 'bg-white/5 border-white/10 text-white/70'
                        }`}>
                          <strong>Reason:</strong> {request.reason}
                        </div>
                      )}

                      {request.isApproved && request.approvedAt && (
                        <div className={`text-xs mt-2 transition-colors duration-300 ${theme === 'light' ? 'text-green-600' : 'text-green-400'}`}>
                          Approved on {formatDate(request.approvedAt)}
                        </div>
                      )}
                    </div>

                    {!request.isApproved && (
                      <div className="flex gap-2 ml-4">
                        <motion.button
                          onClick={() => handleAccessAction(request.userId, 'approve')}
                          disabled={processingId === request.userId}
                          className={`px-3 py-1 border rounded-lg text-sm transition-all duration-300 disabled:opacity-50 ${
                            theme === 'light'
                              ? 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200'
                              : 'bg-green-900 border-green-600 text-green-200 hover:bg-green-800'
                          }`}
                          whileHover={{ scale: processingId === request.userId ? 1 : 1.05 }}
                          whileTap={{ scale: processingId === request.userId ? 1 : 0.95 }}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </motion.button>

                        <motion.button
                          onClick={() => handleAccessAction(request.userId, 'deny')}
                          disabled={processingId === request.userId}
                          className={`px-3 py-1 border rounded-lg text-sm transition-all duration-300 disabled:opacity-50 ${
                            theme === 'light'
                              ? 'bg-red-100 border-red-300 text-red-800 hover:bg-red-200'
                              : 'bg-red-900 border-red-600 text-red-200 hover:bg-red-800'
                          }`}
                          whileHover={{ scale: processingId === request.userId ? 1 : 1.05 }}
                          whileTap={{ scale: processingId === request.userId ? 1 : 0.95 }}
                        >
                          <XCircle className="w-4 h-4" />
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 