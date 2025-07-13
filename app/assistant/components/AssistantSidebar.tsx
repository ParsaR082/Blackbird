import { motion } from 'framer-motion'
import { Cpu, History, Sparkles } from 'lucide-react'

const recentSessions = [
  { title: 'Code Architecture Review', time: '2.4 hrs ago', status: 'completed' },
  { title: 'Database Optimization', time: '1 day ago', status: 'in-progress' },
  { title: 'API Documentation', time: '3 days ago', status: 'completed' },
  { title: 'System Integration', time: '5 days ago', status: 'completed' }
]

const capabilities = [
  'Neural Network Integration',
  'Quantum Processing',
  'Pattern Recognition',
  'System Automation',
  'Data Analysis',
  'Predictive Modeling'
]

export function AssistantSidebar({ theme, systemStatus, isConnected }: {
  theme: string,
  systemStatus: { neuralLoad: number, processingUnits: number, totalUnits: number, uptime: number, quantumState: string },
  isConnected: boolean
}) {
  return (
    <div className="space-y-6">
      {/* System Status */}
      <div className="border rounded-lg backdrop-blur-sm p-6 transition-colors duration-300" style={{
        backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
        borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
      }}>
        <div className="flex items-center gap-3 mb-4">
          <Cpu className={`w-5 h-5 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
          <h3 className={`text-lg font-light tracking-wide transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>System Status</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={`text-sm transition-colors duration-300 ${theme === 'light' ? 'text-gray-700' : 'text-white/70'}`}>Neural Load</span>
            <span className={`text-sm font-light transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>{systemStatus.neuralLoad.toFixed(1)}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-sm transition-colors duration-300 ${theme === 'light' ? 'text-gray-700' : 'text-white/70'}`}>Processing Units</span>
            <span className={`text-sm font-light transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>{systemStatus.processingUnits}/{systemStatus.totalUnits}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-sm transition-colors duration-300 ${theme === 'light' ? 'text-gray-700' : 'text-white/70'}`}>Uptime</span>
            <span className={`text-sm font-light transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>{systemStatus.uptime}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-sm transition-colors duration-300 ${theme === 'light' ? 'text-gray-700' : 'text-white/70'}`}>Quantum State</span>
            <span className={`text-sm font-light transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>{systemStatus.quantumState}</span>
          </div>
        </div>
      </div>
      {/* Recent Sessions */}
      <div className="border rounded-lg backdrop-blur-sm p-6 transition-colors duration-300" style={{
        backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
        borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
      }}>
        <div className="flex items-center gap-3 mb-4">
          <History className={`w-5 h-5 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
          <h3 className={`text-lg font-light tracking-wide transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>Recent Sessions</h3>
        </div>
        <div className="space-y-3">
          {recentSessions.map((session, index) => (
            <motion.div 
              key={session.title}
              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-300 ${theme === 'light' ? 'hover:bg-black/5' : 'hover:bg-white/5'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className={`w-2 h-2 rounded-full ${session.status === 'completed' ? (theme === 'light' ? 'bg-gray-600' : 'bg-white/60') : (theme === 'light' ? 'bg-gray-400 animate-pulse' : 'bg-white/30 animate-pulse')}`}></div>
              <div className="flex-1">
                <p className={`text-sm font-light transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>{session.title}</p>
                <p className={`text-xs transition-colors duration-300 ${theme === 'light' ? 'text-gray-500' : 'text-white/50'}`}>{session.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      {/* Capabilities */}
      <div className="border rounded-lg backdrop-blur-sm p-6 transition-colors duration-300" style={{
        backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
        borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
      }}>
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className={`w-5 h-5 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
          <h3 className={`text-lg font-light tracking-wide transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>Capabilities</h3>
        </div>
        <div className="space-y-2">
          {capabilities.map((capability, index) => (
            <motion.div 
              key={capability}
              className={`px-3 py-1 border rounded-full text-xs text-center transition-colors duration-300 ${theme === 'light' ? 'bg-black/10 border-black/20 text-gray-800' : 'bg-white/10 border-white/20 text-white/80'}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              {capability}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
} 