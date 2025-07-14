import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bot, MessageSquare, Send } from 'lucide-react'

export function ChatInterface({ theme }: { theme: string }) {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Neural interface initialized. Ready for advanced AI integration.' },
    { from: 'user', text: 'Analyze my codebase architecture and suggest optimizations.' },
    { from: 'bot', text: 'Initiating deep analysis protocols. Scanning file structure, dependencies, and performance patterns...' }
  ])

  const handleSend = () => {
    if (message.trim()) {
      setMessages([...messages, { from: 'user', text: message }])
      setMessage('')
    }
  }

  return (
    <div className="border rounded-lg backdrop-blur-sm p-6 transition-colors duration-300" style={{
      backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
      borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
    }}>
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className={`w-5 h-5 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
        <h2 className={`text-lg font-light tracking-wide transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>Neural Interface</h2>
      </div>
      {/* Chat Messages */}
      <div className="min-h-[300px] border rounded-lg p-4 mb-4 space-y-4 transition-colors duration-300" style={{
        backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
        borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'
      }}>
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
              <p className={`text-sm transition-colors duration-300 ${theme === 'light' ? (msg.from === 'user' ? 'text-black' : 'text-gray-900') : (msg.from === 'user' ? 'text-white' : 'text-white/90')}`}>{msg.text}</p>
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
      </div>
      {/* Input Area */}
      <div className="flex gap-3">
        <input 
          type="text"
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Enter neural command..."
          className="flex-1 border rounded-lg px-4 py-3 focus:outline-none transition-all duration-300"
          style={{
            backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
            borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)',
            color: theme === 'light' ? '#000000' : '#ffffff'
          }}
          onKeyDown={e => { if (e.key === 'Enter') handleSend() }}
        />
        <motion.button
          className={`px-6 py-3 border rounded-lg transition-all duration-300 ${
            theme === 'light' 
              ? 'bg-black/10 border-black/30 text-black hover:bg-black/20 hover:border-black/60' 
              : 'bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/60'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
        >
          <Send className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  )
} 