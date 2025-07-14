import { motion } from 'framer-motion'

export function StatusIndicator({ theme, isConnected }: { theme: string, isConnected: boolean }) {
  return (
    <motion.div 
      className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 1 }}
    >
      <div className={`flex items-center space-x-2 text-xs transition-colors duration-300 ${theme === 'light' ? 'text-gray-500' : 'text-white/40'}`}>
        <div className={`w-2 h-2 rounded-full animate-pulse transition-colors duration-300 ${isConnected ? (theme === 'light' ? 'bg-green-500' : 'bg-green-400') : (theme === 'light' ? 'bg-gray-500' : 'bg-white/40')}`} />
        <span>{isConnected ? 'Neural Network Active' : 'Disconnected'}</span>
        <div className={`w-2 h-2 rounded-full animate-pulse transition-colors duration-300 ${isConnected ? (theme === 'light' ? 'bg-green-500' : 'bg-green-400') : (theme === 'light' ? 'bg-gray-500' : 'bg-white/40')}`} style={{ animationDelay: '0.5s' }} />
      </div>
    </motion.div>
  )
} 