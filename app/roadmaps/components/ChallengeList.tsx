'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, BookOpen, Code, FileText, ExternalLink, Play, Trophy } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';
import type { Challenge, UserProgress } from '../types';

interface ChallengeListProps {
  challenges: Challenge[];
  userProgress: UserProgress | null;
  loading: boolean;
  error: string | null;
  onCompleteChallenge: (challengeId: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5 }
  }
};

const getChallengeIcon = (type: string) => {
  switch (type) {
    case 'quiz':
      return FileText;
    case 'project':
      return Code;
    case 'reading':
      return BookOpen;
    default:
      return Play;
  }
};

const getChallengeColor = (type: string) => {
  switch (type) {
    case 'quiz':
      return { bg: 'rgba(168, 85, 247, 0.1)', text: '#a855f7', border: 'rgba(168, 85, 247, 0.3)' };
    case 'project':
      return { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e', border: 'rgba(34, 197, 94, 0.3)' };
    case 'reading':
      return { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' };
    default:
      return { bg: 'rgba(99, 102, 241, 0.1)', text: '#6366f1', border: 'rgba(99, 102, 241, 0.3)' };
  }
};

export default function ChallengeList({ challenges, userProgress, loading, error, onCompleteChallenge }: ChallengeListProps) {
  const { theme } = useTheme();

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div 
            key={index}
            className="rounded-xl p-6 border animate-pulse"
            style={{
              backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.05)',
              borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-gray-300 dark:bg-gray-600" />
              <div className="flex-1">
                <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded mb-2" />
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded mb-3" />
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3" />
              </div>
              <div className="h-8 w-24 bg-gray-300 dark:bg-gray-600 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="p-6 rounded-xl border max-w-md mx-auto" style={{
          backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.05)',
          borderColor: theme === 'light' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.3)'
        }}>
          <Play className="w-12 h-12 mx-auto mb-4 text-red-600 dark:text-red-400" />
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
            Failed to Load Challenges
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (challenges.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-8 rounded-xl border max-w-md mx-auto" style={{
          backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.05)',
          borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
        }}>
          <Play className="w-16 h-16 mx-auto mb-6" style={{ color: 'var(--text-secondary)' }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
            No Challenges Available
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            This milestone doesn&apos;t have any challenges yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {challenges.map((challenge, index) => {
        const isCompleted = userProgress?.completedChallenges?.includes(challenge.id);
        const Icon = getChallengeIcon(challenge.type);
        const colors = getChallengeColor(challenge.type);

        return (
          <motion.div
            key={challenge.id}
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            className="group"
          >
            <div 
              className={`rounded-xl p-6 border transition-all duration-300 hover:shadow-lg ${
                isCompleted ? 'ring-2 ring-green-500/20' : ''
              }`}
              style={{
                backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.05)',
                borderColor: isCompleted 
                  ? '#22c55e' 
                  : theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                boxShadow: isCompleted
                  ? (theme === 'light' ? '0 0 0 1px rgba(34, 197, 94, 0.1)' : '0 0 0 1px rgba(34, 197, 94, 0.2)')
                  : undefined
              }}
            >
              <div className="flex items-start gap-4">
                {/* Challenge Icon & Number */}
                <div className="flex flex-col items-center gap-2">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{
                      backgroundColor: isCompleted ? '#22c55e' : colors.bg,
                      color: isCompleted ? '#ffffff' : colors.text
                    }}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full" style={{
                    backgroundColor: colors.bg,
                    color: colors.text
                  }}>
                    #{index + 1}
                  </span>
                </div>

                {/* Challenge Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 
                        className={`font-semibold text-lg mb-1 transition-colors duration-300 ${
                          isCompleted ? 'line-through opacity-70' : ''
                        }`}
                        style={{ color: 'var(--text-color)' }}
                      >
                        {challenge.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span 
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize"
                          style={{
                            backgroundColor: colors.bg,
                            color: colors.text,
                            border: `1px solid ${colors.border}`
                          }}
                        >
                          <Icon className="w-3 h-3 mr-1" />
                          {challenge.type}
                        </span>
                        {isCompleted && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            <Trophy className="w-3 h-3 mr-1" />
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {challenge.description}
                  </p>

                  {/* Resources */}
                  {challenge.resources && challenge.resources.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold mb-2 text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                        Resources
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {challenge.resources.map((resource, idx) => (
                          <a
                            key={idx}
                            href={resource}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-lg transition-all duration-300 hover:scale-105"
                            style={{
                              backgroundColor: theme === 'light' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.2)',
                              color: '#3b82f6',
                              border: '1px solid rgba(59, 130, 246, 0.3)'
                            }}
                          >
                            <ExternalLink className="w-3 h-3" />
                            Resource {idx + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isCompleted ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Challenge completed!</span>
                        </div>
                      ) : (
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          Click to mark as complete
                        </span>
                      )}
                    </div>
                    
                    {!isCompleted && (
                      <motion.button
                        onClick={() => onCompleteChallenge(challenge.id)}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
                        style={{
                          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                          color: '#ffffff',
                          boxShadow: theme === 'light' ? '0 2px 8px rgba(99, 102, 241, 0.3)' : '0 2px 8px rgba(120, 119, 198, 0.4)'
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        Complete
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
} 