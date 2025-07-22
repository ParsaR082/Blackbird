'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Lock, CheckCircle, Target, ArrowRight, Clock } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';
import type { Level, UserProgress } from '../types';

interface LevelListProps {
  levels: Level[];
  userProgress: UserProgress | null;
  loading: boolean;
  error: string | null;
  onSelectLevel: (level: Level) => void;
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

export default function LevelList({ levels, userProgress, loading, error, onSelectLevel }: LevelListProps) {
  const { theme } = useTheme();

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, index) => (
          <div 
            key={index}
            className="rounded-xl p-6 border animate-pulse"
            style={{
              backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.05)',
              borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-300 dark:bg-gray-600" />
              <div className="flex-1">
                <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded mb-2" />
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3" />
              </div>
              <div className="h-8 w-20 bg-gray-300 dark:bg-gray-600 rounded" />
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
          <Trophy className="w-12 h-12 mx-auto mb-4 text-red-600 dark:text-red-400" />
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
            Failed to Load Levels
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (levels.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-8 rounded-xl border max-w-md mx-auto" style={{
          backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.05)',
          borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
        }}>
          <Trophy className="w-16 h-16 mx-auto mb-6" style={{ color: 'var(--text-secondary)' }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
            No Levels Available
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            This roadmap doesn't have any levels yet.
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
      {levels.map((level, index) => {
        const isCompleted = userProgress?.completedLevels?.includes(level.id);
        const isUnlocked = index === 0 || userProgress?.completedLevels?.includes(levels[index - 1]?.id);
        const totalMilestones = level.milestones?.length || 0;
        const totalChallenges = level.milestones?.reduce((acc, milestone) => 
          acc + (milestone.challenges?.length || 0), 0
        ) || 0;

        // Calculate progress for this level
        const completedChallenges = level.milestones?.reduce((acc, milestone) => 
          acc + (milestone.challenges?.filter(challenge => 
            userProgress?.completedChallenges?.includes(challenge.id)
          )?.length || 0), 0
        ) || 0;
        
        const progressPercent = totalChallenges > 0 ? (completedChallenges / totalChallenges) * 100 : 0;

        return (
          <motion.div
            key={level.id}
            variants={itemVariants}
            whileHover={{ scale: isUnlocked ? 1.02 : 1 }}
            whileTap={{ scale: isUnlocked ? 0.98 : 1 }}
            className={`group cursor-pointer transition-all duration-300 ${!isUnlocked ? 'opacity-60' : ''}`}
            onClick={() => isUnlocked && onSelectLevel(level)}
          >
            <div 
              className={`rounded-xl p-6 border transition-all duration-300 ${
                isUnlocked ? 'hover:shadow-lg' : ''
              } ${
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
              <div className="flex items-center gap-4">
                {/* Level Icon */}
                <div 
                  className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold transition-all duration-300 ${
                    isUnlocked ? 'group-hover:scale-110' : ''
                  }`}
                  style={{
                    background: isCompleted
                      ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                      : isUnlocked
                      ? (theme === 'light' 
                        ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))' 
                        : 'linear-gradient(135deg, rgba(120, 119, 198, 0.2), rgba(196, 181, 253, 0.2))')
                      : (theme === 'light' ? 'rgba(156, 163, 175, 0.2)' : 'rgba(75, 85, 99, 0.3)'),
                    color: isCompleted ? '#ffffff' : (isUnlocked ? 'var(--text-color)' : '#9ca3af')
                  }}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : isUnlocked ? (
                    <Trophy className="w-6 h-6" />
                  ) : (
                    <Lock className="w-6 h-6" />
                  )}
                </div>

                {/* Level Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 
                      className={`font-semibold text-lg transition-colors duration-300 ${
                        isUnlocked ? 'group-hover:text-blue-600' : ''
                      }`} 
                      style={{ color: isUnlocked ? 'var(--text-color)' : '#9ca3af' }}
                    >
                      {level.title}
                    </h3>
                    <span 
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: isCompleted 
                          ? 'rgba(34, 197, 94, 0.1)' 
                          : 'rgba(99, 102, 241, 0.1)',
                        color: isCompleted ? '#16a34a' : '#6366f1'
                      }}
                    >
                      Level {index + 1}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  {isUnlocked && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span style={{ color: 'var(--text-secondary)' }}>
                          Progress: {completedChallenges}/{totalChallenges} challenges
                        </span>
                        <span className="font-semibold" style={{ color: 'var(--text-color)' }}>
                          {Math.round(progressPercent)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <motion.div 
                          className="h-2 rounded-full"
                          style={{ 
                            background: isCompleted 
                              ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                              : 'linear-gradient(90deg, #6366f1, #a855f7)',
                            width: `${progressPercent}%`
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercent}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3" style={{ color: 'var(--text-secondary)' }} />
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {totalMilestones} milestones
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" style={{ color: 'var(--text-secondary)' }} />
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {totalChallenges} challenges
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="flex items-center">
                  {isCompleted ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                  ) : isUnlocked ? (
                    <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform duration-300" />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Unlock Requirements */}
              {!isUnlocked && level.unlockRequirements && (
                <div className="mt-4 p-3 rounded-lg" style={{
                  backgroundColor: theme === 'light' ? 'rgba(249, 115, 22, 0.1)' : 'rgba(249, 115, 22, 0.2)'
                }}>
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    <Lock className="w-3 h-3 inline mr-1" />
                    {level.unlockRequirements}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
} 