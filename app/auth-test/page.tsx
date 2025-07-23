export const dynamic = 'force-dynamic';
export const revalidate = 0;

'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'

export default function AuthTestPage() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkDebug = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/debug', {
        credentials: 'include'
      })
      const data = await response.json()
      setDebugInfo(data)
    } catch (error) {
      console.error('Debug error:', error)
      setDebugInfo({ error: 'Failed to fetch debug info' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkDebug()
  }, [])

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
      
      <div className="space-y-6">
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Auth Context State</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm">
            {JSON.stringify({
              isLoading,
              isAuthenticated,
              user: user ? { ...user, id: user.id?.substring(0, 8) + '...' } : null
            }, null, 2)}
          </pre>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Debug Info</h2>
          <button 
            onClick={checkDebug}
            disabled={loading}
            className="mb-2 px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh Debug Info'}
          </button>
          <pre className="bg-gray-100 p-2 rounded text-sm">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Quick Actions</h2>
          <div className="space-x-2">
            <a 
              href="/auth/login" 
              className="inline-block px-4 py-2 bg-green-500 text-white rounded"
            >
              Go to Login
            </a>
            <a 
              href="/dashboard" 
              className="inline-block px-4 py-2 bg-blue-500 text-white rounded"
            >
              Go to Dashboard
            </a>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 