import { motion } from 'framer-motion'
import { GraduationCap, History, BookOpen, TrendingUp, Users, Calendar } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

const recentSessions = [
  { title: 'Daily Study Routine', time: '2 hrs ago', status: 'completed', type: 'routine' },
  { title: 'Course Selection Advice', time: '1 day ago', status: 'in-progress', type: 'planning' },
  { title: 'Feedback Review', time: '2 days ago', status: 'completed', type: 'feedback' },
  { title: 'Performance Analysis', time: '3 days ago', status: 'completed', type: 'analysis' }
]

const academicFeatures = [
  'Study Schedule Planning',
  'Course Recommendation',
  'Performance Analysis',
  'Feedback Enhancement',
  'Academic Goal Setting',
  'Time Management'
]

export function AssistantSidebar({ theme, systemStatus, isConnected }: {
  theme: string,
  systemStatus: { neuralLoad: number, processingUnits: number, totalUnits: number, uptime: number, quantumState: string },
  isConnected: boolean
}) {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      {/* User Academic Status */}
      <div className="border rounded-lg backdrop-blur-sm p-6 transition-colors duration-300" style={{
        backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
        borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
      }}>
        <div className="flex items-center gap-3 mb-4">
          <GraduationCap className={`w-5 h-5 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
          <h3 className={`text-lg font-light tracking-wide transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>Academic Profile</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={`text-sm transition-colors duration-300 ${theme === 'light' ? 'text-gray-700' : 'text-white/70'}`}>Student</span>
            <span className={`text-sm font-light transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>{user?.fullName || 'Loading...'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-sm transition-colors duration-300 ${theme === 'light' ? 'text-gray-700' : 'text-white/70'}`}>Assistant Status</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? (theme === 'light' ? 'bg-green-600' : 'bg-green-400') : (theme === 'light' ? 'bg-red-600' : 'bg-red-400')}`}></div>
              <span className={`text-sm font-light transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                {isConnected ? 'Active' : 'Offline'}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-sm transition-colors duration-300 ${theme === 'light' ? 'text-gray-700' : 'text-white/70'}`}>Sessions Today</span>
            <span className={`text-sm font-light transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>{Math.floor(systemStatus.neuralLoad / 10)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-sm transition-colors duration-300 ${theme === 'light' ? 'text-gray-700' : 'text-white/70'}`}>Assistance Level</span>
            <span className={`text-sm font-light transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>Advanced</span>
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
              <div className="flex items-center justify-center w-6 h-6">
                {session.type === 'routine' && <Calendar className={`w-3 h-3 ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} />}
                {session.type === 'planning' && <BookOpen className={`w-3 h-3 ${theme === 'light' ? 'text-green-600' : 'text-green-400'}`} />}
                {session.type === 'feedback' && <Users className={`w-3 h-3 ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'}`} />}
                {session.type === 'analysis' && <TrendingUp className={`w-3 h-3 ${theme === 'light' ? 'text-orange-600' : 'text-orange-400'}`} />}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-light transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>{session.title}</p>
                <p className={`text-xs transition-colors duration-300 ${theme === 'light' ? 'text-gray-500' : 'text-white/50'}`}>{session.time}</p>
              </div>
              <div className={`w-2 h-2 rounded-full ${session.status === 'completed' ? (theme === 'light' ? 'bg-green-600' : 'bg-green-400') : (theme === 'light' ? 'bg-yellow-500 animate-pulse' : 'bg-yellow-400 animate-pulse')}`}></div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Academic Features */}
      <div className="border rounded-lg backdrop-blur-sm p-6 transition-colors duration-300" style={{
        backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
        borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
      }}>
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className={`w-5 h-5 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
          <h3 className={`text-lg font-light tracking-wide transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>Academic Features</h3>
        </div>
        <div className="space-y-2">
          {academicFeatures.map((feature, index) => (
            <motion.button 
              key={feature}
              className={`px-3 py-1 border rounded-full text-xs text-center transition-colors duration-300 cursor-pointer hover:scale-105 ${theme === 'light' ? 'bg-black/10 border-black/20 text-gray-800 hover:bg-black/20' : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20'}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const actionType = feature.toLowerCase().replace(/\s+/g, '-');
                const event = new CustomEvent('quickAction', { 
                  detail: { type: actionType, label: feature }
                });
                window.dispatchEvent(event);
              }}
            >
              {feature}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="border rounded-lg backdrop-blur-sm p-6 transition-colors duration-300" style={{
        backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
        borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
      }}>
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className={`w-5 h-5 transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
          <h3 className={`text-lg font-light tracking-wide transition-colors duration-300 ${theme === 'light' ? 'text-black' : 'text-white'}`}>Quick Tip</h3>
        </div>
        <div className={`p-3 border rounded-lg transition-colors duration-300 ${theme === 'light' ? 'bg-blue-50 border-blue-200' : 'bg-blue-900/20 border-blue-500/30'}`}>
          <p className={`text-xs transition-colors duration-300 ${theme === 'light' ? 'text-blue-800' : 'text-blue-300'}`}>
            💡 Use the quick action buttons above to get started with specific tasks. Each button provides specialized assistance for different academic needs.
          </p>
        </div>
      </div>
    </div>
  )
} 