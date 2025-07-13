import { motion } from 'framer-motion'
import { Brain, Code, FileText, Terminal } from 'lucide-react'

const quickActions = [
  { icon: Brain, label: 'Neural Analysis', description: 'Advanced AI-powered code review and optimization' },
  { icon: Code, label: 'Code Generation', description: 'Automated code synthesis and pattern recognition' },
  { icon: FileText, label: 'Documentation', description: 'Intelligent documentation and API reference generation' },
  { icon: Terminal, label: 'System Integration', description: 'Terminal automation and system command execution' }
]

export function QuickActionsGrid({ theme }: { theme: string }) {
  return (
    <motion.div 
      className="max-w-4xl mx-auto mb-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.label}
            className="group relative cursor-pointer"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 rounded-lg bg-white opacity-0 blur-lg group-hover:opacity-10"
              initial={{ scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            />
            {/* Action Card */}
            <div className="relative p-6 border rounded-lg backdrop-blur-sm h-32 flex flex-col items-center justify-center text-center transition-all duration-300" style={{
              backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
              borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
            }}>
              <action.icon className={`w-8 h-8 mb-3 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
              <h3 className={`text-sm font-medium mb-1 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>{action.label}</h3>
              <p className={`text-xs transition-colors duration-300 ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`}>{action.description}</p>
            </div>
            {/* Pulse effect */}
            <motion.div
              className="absolute inset-0 rounded-lg border opacity-0 group-hover:opacity-40 transition-colors duration-300"
              style={{
                borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'
              }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
} 