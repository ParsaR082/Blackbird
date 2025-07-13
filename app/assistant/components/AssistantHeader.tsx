import { motion } from 'framer-motion'
import { Bot } from 'lucide-react'

export function AssistantHeader({ theme }: { theme: string }) {
  return (
    <motion.div 
      className="text-center mb-12"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="flex items-center justify-center gap-4 mb-4">
        <motion.div 
          className="p-4 rounded-full border backdrop-blur-sm transition-colors duration-300"
          style={{
            backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
            borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
          }}
          whileHover={{ 
            scale: 1.1, 
            boxShadow: theme === 'light' ? '0 0 25px rgba(0,0,0,0.2)' : '0 0 25px rgba(255,255,255,0.4)'
          }}
          transition={{ duration: 0.3 }}
        >
          <Bot className={`w-8 h-8 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
        </motion.div>
      </div>
      <h1 className={`text-3xl font-light tracking-wide mb-2 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>
        AI Assistant Portal
      </h1>
      <p className={`text-sm max-w-md mx-auto transition-colors duration-300 ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`}>
        Intelligent automation and neural network integration for enhanced productivity
      </p>
    </motion.div>
  )
} 