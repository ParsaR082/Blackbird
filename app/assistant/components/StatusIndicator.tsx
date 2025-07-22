import { motion } from 'framer-motion'
import { Wifi, WifiOff, Shield, Clock } from 'lucide-react'

export function StatusIndicator({ theme, isConnected }: { theme: string, isConnected: boolean }) {
  return (
    <motion.div 
      className="fixed bottom-6 right-6 flex items-center gap-4 px-4 py-2 border rounded-full backdrop-blur-sm transition-colors duration-300"
      style={{
        backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
        borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1 }}
    >
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        {isConnected ? (
          <Wifi className={`w-4 h-4 transition-colors duration-300 ${theme === 'light' ? 'text-green-600' : 'text-green-400'}`} />
        ) : (
          <WifiOff className={`w-4 h-4 transition-colors duration-300 ${theme === 'light' ? 'text-red-600' : 'text-red-400'}`} />
        )}
        <span className={`text-xs transition-colors duration-300 ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`}>
          {isConnected ? 'Connected' : 'Offline'}
        </span>
      </div>

      {/* Security Status */}
      <div className="flex items-center gap-2">
        <Shield className={`w-4 h-4 transition-colors duration-300 ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} />
        <span className={`text-xs transition-colors duration-300 ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`}>
          Secured
        </span>
      </div>

      {/* Academic Mode */}
      <div className="flex items-center gap-2">
        <Clock className={`w-4 h-4 transition-colors duration-300 ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'}`} />
        <span className={`text-xs transition-colors duration-300 ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`}>
          Academic Mode
        </span>
      </div>
    </motion.div>
  )
} 