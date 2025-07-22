import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Bot, MessageSquare, Send, AlertCircle, Lock, CheckCircle } from 'lucide-react'

interface Message {
  from: 'bot' | 'user'
  text: string
  timestamp: Date
  actionType?: string
}

interface ChatInterfaceProps {
  theme: string
  selectedAction?: { type: string; label: string }
  onActionComplete?: () => void
}

export function ChatInterface({ theme, selectedAction, onActionComplete }: ChatInterfaceProps) {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [usage, setUsage] = useState<any>(null)
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Check access and usage on component mount
  useEffect(() => {
    checkAccess()
    checkUsage()
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const checkAccess = async () => {
    try {
      const response = await fetch('/api/assistant/access', {
        credentials: 'include'
      })
      const data = await response.json()
      
      if (response.ok) {
        setHasAccess(data.isApproved)
      } else {
        setHasAccess(false)
        if (response.status === 401) {
          setError('Please log in to access Blackbird Assistant')
        }
      }
    } catch (error) {
      console.error('Access check error:', error)
      setHasAccess(false)
      setError('Unable to check assistant access')
    }
  }

  const checkUsage = async () => {
    try {
      const response = await fetch('/api/assistant/usage', {
        credentials: 'include'
      })
      const data = await response.json()
      
      if (response.ok) {
        setUsage(data)
      }
    } catch (error) {
      console.error('Usage check error:', error)
    }
  }

  const sendMessage = useCallback(async (messageText: string, actionType?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          message: messageText,
          actionType
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Add bot response
        const botMessage: Message = {
          from: 'bot',
          text: data.response,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botMessage])
        
        // Update usage info
        setUsage({
          tokensUsed: data.tokensUsed,
          remainingTokens: data.remainingTokens,
          interactionCount: data.interactionCount,
          isLocked: data.isLocked,
          lockExpiresAt: data.lockExpiresAt
        })

        // Check if user got locked after this interaction
        if (data.isLocked) {
          const lockMessage: Message = {
            from: 'bot',
            text: 'You have reached your daily token limit of 20,000. Your access will be restored tomorrow. Thank you for using Blackbird Assistant responsibly!',
            timestamp: new Date()
          }
          setMessages(prev => [...prev, lockMessage])
        }
      } else {
        // Handle various error cases
        if (response.status === 403) {
          setHasAccess(false)
          setError(data.message || 'Access not approved')
        } else if (response.status === 429) {
          setError(data.message || 'Daily limit exceeded')
        } else if (data.filtered) {
          // Content was filtered
          const botMessage: Message = {
            from: 'bot',
            text: data.message,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, botMessage])
        } else {
          setError(data.message || 'An error occurred')
        }
      }
    } catch (error) {
      console.error('Send message error:', error)
      setError('Unable to send message. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleQuickAction = useCallback(async (actionType: string, label: string) => {
    const actionMessage = `I'd like help with: ${label}`
    setMessage('')
    
    // Add user message
    const userMessage: Message = {
      from: 'user',
      text: actionMessage,
      timestamp: new Date(),
      actionType
    }
    setMessages(prev => [...prev, userMessage])
    
    await sendMessage(actionMessage, actionType)
  }, [sendMessage])

  const handleSend = async () => {
    if (message.trim()) {
      const userMessage: Message = {
        from: 'user',
        text: message,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, userMessage])
      
      const messageToSend = message
      setMessage('')
      await sendMessage(messageToSend)
    }
  }

  // Handle selected action
  useEffect(() => {
    if (selectedAction) {
      handleQuickAction(selectedAction.type, selectedAction.label)
      onActionComplete?.()
    }
  }, [selectedAction, handleQuickAction, onActionComplete])

  // Listen for quick actions from sidebar
  useEffect(() => {
    const handleQuickActionEvent = (event: CustomEvent) => {
      handleQuickAction(event.detail.type, event.detail.label)
    }

    window.addEventListener('quickAction', handleQuickActionEvent as EventListener)
    return () => {
      window.removeEventListener('quickAction', handleQuickActionEvent as EventListener)
    }
  }, [handleQuickAction])

  const requestAccess = async () => {
    try {
      const response = await fetch('/api/assistant/access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          reason: 'Requesting access to Blackbird Assistant for academic support'
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setError('Access request submitted. Please wait for admin approval.')
      } else {
        setError(data.message || 'Failed to request access')
      }
    } catch (error) {
      console.error('Access request error:', error)
      setError('Unable to request access')
    }
  }

  // Show access request screen if user doesn't have access
  if (hasAccess === false) {
    return (
      <div className="border rounded-lg backdrop-blur-sm p-6 transition-colors duration-300" style={{
        backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
        borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
      }}>
        <div className="flex items-center gap-3 mb-6">
          <Lock className={`w-5 h-5 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
          <h2 className={`text-lg font-light tracking-wide transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>Access Required</h2>
        </div>
        
        <div className="text-center py-8">
          <AlertCircle className={`w-16 h-16 mx-auto mb-4 transition-colors duration-300 ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`} />
          <h3 className={`text-xl font-medium mb-4 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>
            Blackbird Assistant Access Required
          </h3>
          <p className={`text-sm mb-6 transition-colors duration-300 ${theme === 'light' ? 'text-gray-600' : 'text-white/70'}`}>
            To use Blackbird Assistant, you need admin approval. This ensures responsible usage and maintains the quality of academic support.
          </p>
          
          <motion.button
            onClick={requestAccess}
            className={`px-6 py-3 border rounded-lg transition-all duration-300 ${
              theme === 'light' 
                ? 'bg-black/10 border-black/30 text-black hover:bg-black/20 hover:border-black/60' 
                : 'bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/60'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Request Access
          </motion.button>
          
          {error && (
            <p className={`text-sm mt-4 transition-colors duration-300 ${theme === 'light' ? 'text-red-600' : 'text-red-400'}`}>
              {error}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="border rounded-lg backdrop-blur-sm p-6 transition-colors duration-300" style={{
      backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
      borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
    }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MessageSquare className={`w-5 h-5 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
          <h2 className={`text-lg font-light tracking-wide transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>Blackbird Assistant</h2>
        </div>
        
        {/* Usage indicator */}
        {usage && (
          <div className="flex items-center gap-2">
            <CheckCircle className={`w-4 h-4 transition-colors duration-300 ${theme === 'light' ? 'text-green-600' : 'text-green-400'}`} />
            <span className={`text-xs transition-colors duration-300 ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`}>
              {usage.remainingTokens.toLocaleString()} tokens remaining
            </span>
          </div>
        )}
      </div>

      {/* Chat Messages */}
      <div className="min-h-[400px] max-h-[400px] overflow-y-auto border rounded-lg p-4 mb-4 space-y-4 transition-colors duration-300" style={{
        backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
        borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'
      }}>
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Bot className={`w-12 h-12 mx-auto mb-4 transition-colors duration-300 ${theme === 'light' ? 'text-gray-400' : 'text-white/40'}`} />
            <p className={`text-sm transition-colors duration-300 ${theme === 'light' ? 'text-gray-500' : 'text-white/50'}`}>
              Welcome to Blackbird Assistant! Choose a quick action above or start a conversation.
            </p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex items-start gap-3 ${msg.from === 'user' ? 'justify-end' : ''}`}>
            {msg.from === 'bot' && (
              <div className="w-8 h-8 rounded-full border flex items-center justify-center transition-colors duration-300" style={{
                backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
              }}>
                <Bot className={`w-4 h-4 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
              </div>
            )}
            <div className={`flex-1 border rounded-lg p-3 transition-colors duration-300 ${msg.from === 'user' ? 'max-w-[80%]' : ''}`} style={{
              backgroundColor: msg.from === 'user'
                ? (theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)')
                : (theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'),
              borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'
            }}>
              <p className={`text-sm whitespace-pre-wrap transition-colors duration-300 ${theme === 'light' ? (msg.from === 'user' ? 'text-black' : 'text-gray-900') : (msg.from === 'user' ? 'text-white' : 'text-white/90')}`}>
                {msg.text}
              </p>
            </div>
            {msg.from === 'user' && (
              <div className="w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs transition-colors duration-300" style={{
                backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                color: theme === 'light' ? '#000000' : '#ffffff'
              }}>
                U
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full border flex items-center justify-center transition-colors duration-300" style={{
              backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
              borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
            }}>
              <Bot className={`w-4 h-4 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
            </div>
            <div className="flex-1 border rounded-lg p-3 transition-colors duration-300" style={{
              backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
              borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'
            }}>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${theme === 'light' ? 'bg-gray-400' : 'bg-white/40'}`}></div>
                  <div className={`w-2 h-2 rounded-full animate-pulse delay-75 ${theme === 'light' ? 'bg-gray-400' : 'bg-white/40'}`}></div>
                  <div className={`w-2 h-2 rounded-full animate-pulse delay-150 ${theme === 'light' ? 'bg-gray-400' : 'bg-white/40'}`}></div>
                </div>
                <span className={`text-sm transition-colors duration-300 ${theme === 'light' ? 'text-gray-500' : 'text-white/50'}`}>
                  Blackbird Assistant is thinking...
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Error display */}
      {error && (
        <div className={`mb-4 p-3 border rounded-lg transition-colors duration-300 ${theme === 'light' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-red-900/20 border-red-500/30 text-red-300'}`}>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex gap-3">
        <input 
          type="text"
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Ask Blackbird Assistant about your studies..."
          disabled={isLoading || usage?.isLocked}
          className="flex-1 border rounded-lg px-4 py-3 focus:outline-none transition-all duration-300 disabled:opacity-50"
          style={{
            backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
            borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)',
            color: theme === 'light' ? '#000000' : '#ffffff'
          }}
          onKeyDown={e => { if (e.key === 'Enter' && !isLoading && !usage?.isLocked) handleSend() }}
        />
        <motion.button
          className={`px-6 py-3 border rounded-lg transition-all duration-300 disabled:opacity-50 ${
            theme === 'light' 
              ? 'bg-black/10 border-black/30 text-black hover:bg-black/20 hover:border-black/60' 
              : 'bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/60'
          }`}
          whileHover={{ scale: isLoading || usage?.isLocked ? 1 : 1.05 }}
          whileTap={{ scale: isLoading || usage?.isLocked ? 1 : 0.95 }}
          onClick={handleSend}
          disabled={isLoading || usage?.isLocked}
        >
          <Send className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  )
} 