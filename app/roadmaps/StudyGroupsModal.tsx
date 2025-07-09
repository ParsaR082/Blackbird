'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/theme-context'
import { 
  X, 
  Users, 
  Calendar, 
  Clock, 
  Plus,
  BookOpen,
  MessageCircle,
  Star,
  UserPlus
} from 'lucide-react'

interface StudyGroup {
  id: string
  name: string
  description: string
  members: number
  maxMembers: number
  schedule: string
  level: string
  technology: string
  isActive: boolean
}

interface StudyGroupsModalProps {
  isOpen: boolean
  onClose: () => void
  onJoinGroup: (groupId: string, groupName: string) => void
}

const StudyGroupsModal: React.FC<StudyGroupsModalProps> = ({ isOpen, onClose, onJoinGroup }) => {
  const { theme } = useTheme()
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [joiningGroup, setJoiningGroup] = useState<string | null>(null)

  // Mock data for study groups
  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      // Simulate API call
      setTimeout(() => {
        const mockGroups: StudyGroup[] = [
          {
            id: '1',
            name: 'React Fundamentals',
            description: 'Learn React basics, hooks, and component patterns together',
            members: 12,
            maxMembers: 20,
            schedule: 'Mon & Wed 7:00 PM',
            level: 'Beginner',
            technology: 'React',
            isActive: true
          },
          {
            id: '2',
            name: 'Full Stack Masters',
            description: 'Advanced full-stack development with MERN stack',
            members: 8,
            maxMembers: 15,
            schedule: 'Tue & Thu 6:30 PM',
            level: 'Advanced',
            technology: 'Full Stack',
            isActive: true
          },
          {
            id: '3',
            name: 'Node.js Deep Dive',
            description: 'Backend development with Node.js and Express',
            members: 15,
            maxMembers: 25,
            schedule: 'Sat 10:00 AM',
            level: 'Intermediate',
            technology: 'Node.js',
            isActive: true
          },
          {
            id: '4',
            name: 'Database Design Workshop',
            description: 'Learn database design principles and SQL optimization',
            members: 6,
            maxMembers: 12,
            schedule: 'Sun 2:00 PM',
            level: 'Intermediate',
            technology: 'Database',
            isActive: true
          }
        ]
        setStudyGroups(mockGroups)
        setLoading(false)
      }, 1000)
    }
  }, [isOpen])

  const handleJoinGroup = async (group: StudyGroup) => {
    setJoiningGroup(group.id)
    // Simulate API call
    setTimeout(() => {
      onJoinGroup(group.id, group.name)
      setJoiningGroup(null)
    }, 1000)
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-500/20 text-green-400 border-green-500/40'
      case 'Intermediate':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40'
      case 'Advanced':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/40'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/40'
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden border rounded-xl backdrop-blur-sm"
          style={{
            backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.95)',
            borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
          }}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b" style={{
            borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
          }}>
            <div className="flex items-center gap-3">
              <Users className={`w-6 h-6 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
              <h2 className={`text-xl font-light tracking-wide ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                Study Groups
              </h2>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors duration-200 hover:bg-black/10 ${theme === 'light' ? 'text-black' : 'text-white'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{
                  borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'
                }} />
              </div>
            ) : studyGroups.length === 0 ? (
              // Empty State
              <div className="text-center py-12">
                <div className="mb-6">
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${theme === 'light' ? 'bg-gray-100' : 'bg-white/10'}`}>
                    <Users className={`w-8 h-8 ${theme === 'light' ? 'text-gray-400' : 'text-white/40'}`} />
                  </div>
                </div>
                <h3 className={`text-lg font-medium mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                  No Study Groups Available
                </h3>
                <p className={`text-sm mb-6 ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`}>
                  Be the first to create a study group and start learning together!
                </p>
                <motion.button
                  className={`px-6 py-3 rounded-lg border transition-all duration-200 ${
                    theme === 'light' 
                      ? 'bg-black text-white hover:bg-gray-800 border-black' 
                      : 'bg-white text-black hover:bg-gray-100 border-white'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Start a New Group
                </motion.button>
              </div>
            ) : (
              // Study Groups List
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studyGroups.map((group) => (
                  <motion.div
                    key={group.id}
                    className="border rounded-lg p-4 backdrop-blur-sm flex flex-col h-full"
                    style={{
                      backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                      borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    {/* Group Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className={`text-base font-medium mb-1 ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                          {group.name}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getLevelColor(group.level)}`}>
                          {group.level}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs" style={{
                        color: theme === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)'
                      }}>
                        <Users className="w-3 h-3" />
                        {group.members}/{group.maxMembers}
                      </div>
                    </div>

                    {/* Description */}
                    <p className={`text-sm mb-4 flex-grow ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`}>
                      {group.description}
                    </p>

                    {/* Schedule and Tech */}
                    <div className="flex items-center gap-4 mb-4 text-xs" style={{
                      color: theme === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)'
                    }}>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {group.schedule}
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {group.technology}
                      </div>
                    </div>

                    {/* Join Button */}
                    <motion.button
                      className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 mt-auto ${
                        joiningGroup === group.id
                          ? 'opacity-50 cursor-not-allowed'
                          : theme === 'light'
                          ? 'bg-black text-white hover:bg-gray-800'
                          : 'bg-white text-black hover:bg-gray-100'
                      }`}
                      onClick={() => handleJoinGroup(group)}
                      disabled={joiningGroup === group.id}
                      whileHover={joiningGroup === group.id ? {} : { scale: 1.02 }}
                      whileTap={joiningGroup === group.id ? {} : { scale: 0.98 }}
                    >
                      {joiningGroup === group.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                          Joining...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <UserPlus className="w-4 h-4" />
                          Join Group
                        </div>
                      )}
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default StudyGroupsModal 