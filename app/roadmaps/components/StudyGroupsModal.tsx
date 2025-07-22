'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Plus, Search, Calendar, MessageCircle, User, Crown, Star, Clock, Globe, Lock } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';
import { useAuth } from '@/contexts/auth-context';

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  roadmapId: string;
  roadmapTitle: string;
  memberCount: number;
  maxMembers: number;
  isPrivate: boolean;
  owner: {
    id: string;
    name: string;
    avatar?: string;
  };
  members: Array<{
    id: string;
    name: string;
    avatar?: string;
    joinedAt: string;
  }>;
  createdAt: string;
  lastActivity: string;
  tags: string[];
}

interface StudyGroupsModalProps {
  isOpen: boolean;
  onClose: () => void;
  roadmapId: string;
  roadmapTitle: string;
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Mock data - in real app, this would come from API
const mockStudyGroups: StudyGroup[] = [
  {
    id: '1',
    name: 'React Masters',
    description: 'Advanced React developers helping each other master the framework',
    roadmapId: 'react-roadmap',
    roadmapTitle: 'React Development',
    memberCount: 24,
    maxMembers: 30,
    isPrivate: false,
    owner: { id: 'user1', name: 'Sarah Chen' },
    members: [],
    createdAt: '2024-01-15',
    lastActivity: '2024-01-20',
    tags: ['React', 'JavaScript', 'Frontend']
  },
  {
    id: '2',
    name: 'Evening Study Group',
    description: 'Perfect for working professionals. We study together every evening 7-9 PM',
    roadmapId: 'react-roadmap',
    roadmapTitle: 'React Development',
    memberCount: 12,
    maxMembers: 15,
    isPrivate: false,
    owner: { id: 'user2', name: 'Michael Torres' },
    members: [],
    createdAt: '2024-01-10',
    lastActivity: '2024-01-19',
    tags: ['Evening', 'Professionals', 'Consistent']
  },
  {
    id: '3',
    name: 'Beginner Friendly',
    description: 'New to programming? Join us! We help beginners get started with patience and support',
    roadmapId: 'react-roadmap',
    roadmapTitle: 'React Development',
    memberCount: 45,
    maxMembers: 50,
    isPrivate: false,
    owner: { id: 'user3', name: 'Jennifer Kim' },
    members: [],
    createdAt: '2024-01-05',
    lastActivity: '2024-01-20',
    tags: ['Beginner', 'Supportive', 'Learning']
  }
];

export default function StudyGroupsModal({ isOpen, onClose, roadmapId, roadmapTitle }: StudyGroupsModalProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'browse' | 'create'>('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>(mockStudyGroups);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupPrivate, setNewGroupPrivate] = useState(false);
  const [newGroupMaxMembers, setNewGroupMaxMembers] = useState(25);

  const filteredGroups = studyGroups.filter(group => 
    group.roadmapId === roadmapId &&
    (group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
     group.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const handleJoinGroup = (groupId: string) => {
    // In real app, this would make an API call
    console.log('Joining group:', groupId);
    // Update UI to show joined state
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim() || !newGroupDescription.trim()) return;
    
    const newGroup: StudyGroup = {
      id: Date.now().toString(),
      name: newGroupName,
      description: newGroupDescription,
      roadmapId,
      roadmapTitle,
      memberCount: 1,
      maxMembers: newGroupMaxMembers,
      isPrivate: newGroupPrivate,
      owner: { id: user?.id || 'current-user', name: user?.fullName || 'You' },
      members: [],
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      tags: []
    };

    setStudyGroups([newGroup, ...studyGroups]);
    setNewGroupName('');
    setNewGroupDescription('');
    setNewGroupPrivate(false);
    setNewGroupMaxMembers(25);
    setActiveTab('browse');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border"
          style={{
            backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.95)',
            borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)'
          }}
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="p-6 border-b" style={{
            borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
          }}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>
                  Study Groups
                </h2>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Join or create study groups for {roadmapTitle}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg transition-colors duration-300 hover:scale-110"
                style={{
                  backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-secondary)'
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setActiveTab('browse')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeTab === 'browse' ? 'ring-2 ring-blue-500/20' : ''
                }`}
                style={{
                  backgroundColor: activeTab === 'browse' 
                    ? 'linear-gradient(135deg, #6366f1, #a855f7)'
                    : (theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)'),
                  color: activeTab === 'browse' ? '#ffffff' : 'var(--text-color)'
                }}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Browse Groups
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeTab === 'create' ? 'ring-2 ring-blue-500/20' : ''
                }`}
                style={{
                  backgroundColor: activeTab === 'create' 
                    ? 'linear-gradient(135deg, #6366f1, #a855f7)'
                    : (theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)'),
                  color: activeTab === 'create' ? '#ffffff' : 'var(--text-color)'
                }}
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Create Group
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <AnimatePresence mode="wait">
              {activeTab === 'browse' ? (
                <motion.div
                  key="browse"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={{ duration: 0.3 }}
                >
                  {/* Search */}
                  <div className="mb-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                      <input
                        type="text"
                        placeholder="Search study groups..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        style={{
                          backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.05)',
                          borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                          color: 'var(--text-color)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Groups List */}
                  <div className="space-y-4">
                    {filteredGroups.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
                        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
                          No Study Groups Found
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {searchTerm ? 'Try different search terms' : 'Be the first to create a study group!'}
                        </p>
                        {!searchTerm && (
                          <button
                            onClick={() => setActiveTab('create')}
                            className="mt-4 px-6 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105"
                            style={{
                              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                              color: '#ffffff'
                            }}
                          >
                            Create First Group
                          </button>
                        )}
                      </div>
                    ) : (
                      filteredGroups.map((group) => (
                        <motion.div
                          key={group.id}
                          whileHover={{ scale: 1.01 }}
                          className="p-6 rounded-xl border transition-all duration-300 hover:shadow-lg"
                          style={{
                            backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.05)',
                            borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-color)' }}>
                                  {group.name}
                                </h3>
                                {group.isPrivate ? (
                                  <Lock className="w-4 h-4 text-orange-500" />
                                ) : (
                                  <Globe className="w-4 h-4 text-green-500" />
                                )}
                              </div>
                              
                              <p className="text-sm mb-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                {group.description}
                              </p>

                              <div className="flex items-center gap-4 text-xs mb-3">
                                <div className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  <span>{group.memberCount}/{group.maxMembers} members</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Crown className="w-3 h-3" />
                                  <span>{group.owner.name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{new Date(group.lastActivity).toLocaleDateString()}</span>
                                </div>
                              </div>

                              {group.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {group.tags.map((tag, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 rounded-full text-xs"
                                      style={{
                                        backgroundColor: theme === 'light' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.2)',
                                        color: '#6366f1'
                                      }}
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="ml-4">
                              <button
                                onClick={() => handleJoinGroup(group.id)}
                                disabled={group.memberCount >= group.maxMembers}
                                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                  background: group.memberCount >= group.maxMembers 
                                    ? (theme === 'light' ? 'rgba(156, 163, 175, 0.2)' : 'rgba(75, 85, 99, 0.3)')
                                    : 'linear-gradient(135deg, #10b981, #059669)',
                                  color: group.memberCount >= group.maxMembers ? '#9ca3af' : '#ffffff'
                                }}
                              >
                                {group.memberCount >= group.maxMembers ? 'Full' : 'Join Group'}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="create"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={{ duration: 0.3 }}
                >
                  <div className="max-w-2xl mx-auto">
                    <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-color)' }}>
                      Create New Study Group
                    </h3>

                    <div className="space-y-6">
                      {/* Group Name */}
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
                          Group Name *
                        </label>
                        <input
                          type="text"
                          value={newGroupName}
                          onChange={(e) => setNewGroupName(e.target.value)}
                          placeholder="Enter group name..."
                          className="w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          style={{
                            backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.05)',
                            borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                            color: 'var(--text-color)'
                          }}
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
                          Description *
                        </label>
                        <textarea
                          value={newGroupDescription}
                          onChange={(e) => setNewGroupDescription(e.target.value)}
                          placeholder="Describe your study group..."
                          rows={4}
                          className="w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                          style={{
                            backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.05)',
                            borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                            color: 'var(--text-color)'
                          }}
                        />
                      </div>

                      {/* Settings */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Max Members */}
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
                            Max Members
                          </label>
                          <input
                            type="number"
                            value={newGroupMaxMembers}
                            onChange={(e) => setNewGroupMaxMembers(parseInt(e.target.value) || 25)}
                            min="2"
                            max="100"
                            className="w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            style={{
                              backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.05)',
                              borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                              color: 'var(--text-color)'
                            }}
                          />
                        </div>

                        {/* Privacy */}
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
                            Privacy
                          </label>
                          <div className="flex items-center gap-3 h-12">
                            <button
                              onClick={() => setNewGroupPrivate(false)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                                !newGroupPrivate ? 'ring-2 ring-green-500/20' : ''
                              }`}
                              style={{
                                backgroundColor: !newGroupPrivate 
                                  ? 'linear-gradient(135deg, #10b981, #059669)'
                                  : (theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)'),
                                color: !newGroupPrivate ? '#ffffff' : 'var(--text-color)'
                              }}
                            >
                              <Globe className="w-4 h-4" />
                              Public
                            </button>
                            <button
                              onClick={() => setNewGroupPrivate(true)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                                newGroupPrivate ? 'ring-2 ring-orange-500/20' : ''
                              }`}
                              style={{
                                backgroundColor: newGroupPrivate 
                                  ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                                  : (theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)'),
                                color: newGroupPrivate ? '#ffffff' : 'var(--text-color)'
                              }}
                            >
                              <Lock className="w-4 h-4" />
                              Private
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Create Button */}
                      <div className="flex justify-end pt-4">
                        <button
                          onClick={handleCreateGroup}
                          disabled={!newGroupName.trim() || !newGroupDescription.trim()}
                          className="px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                            color: '#ffffff'
                          }}
                        >
                          <Plus className="w-4 h-4 inline mr-2" />
                          Create Study Group
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
} 