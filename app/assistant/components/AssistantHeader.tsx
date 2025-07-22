import { motion } from 'framer-motion'
import { GraduationCap, Brain } from 'lucide-react'

export function AssistantHeader({ theme }: { theme: string }) {
  return (
    <motion.div 
      className="text-center mb-16"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="flex items-center justify-center gap-4 mb-6">
        <motion.div
          className="relative"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <GraduationCap className={`w-12 h-12 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
          <Brain className={`w-6 h-6 absolute -top-1 -right-1 transition-colors duration-300 ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} />
        </motion.div>
      </div>
      
      <motion.h1 
        className={`text-4xl md:text-6xl font-light mb-4 tracking-wider transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
      >
        Blackbird Assistant
      </motion.h1>
      
      <motion.p 
        className={`text-lg md:text-xl font-light opacity-80 transition-colors duration-300 ${theme === 'light' ? 'text-gray-700' : 'text-white/80'}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 0.8, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        Your AI-Powered Academic Companion
      </motion.p>
      
      <motion.div 
        className={`mt-4 text-sm opacity-60 transition-colors duration-300 ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        Enhancing your university experience through intelligent academic support
      </motion.div>
    </motion.div>
  )
} 