'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Target, Zap, Calendar, TrendingUp, Award, Medal, Crown, CheckCircle } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';
import type { UserProgress, Roadmap } from '../types';

interface ProgressDashboardProps {
  userProgress: UserProgress | null;
  roadmap: Roadmap;
  completedChallenges: number;
  totalChallenges: number;
  completedLevels: number;
  totalLevels: number;
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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};

const achievements = [
  { id: 'first_challenge', title: 'First Steps', description: 'Complete your first challenge', icon: Star, color: '#fbbf24' },
  { id: 'level_complete', title: 'Level Master', description: 'Complete your first level', icon: Trophy, color: '#f59e0b' },
  { id: 'milestone_reached', title: 'Milestone Hunter', description: 'Complete 5 milestones', icon: Target, color: '#10b981' },
  { id: 'speed_demon', title: 'Speed Demon', description: 'Complete 10 challenges in one day', icon: Zap, color: '#8b5cf6' },
  { id: 'consistency', title: 'Consistent Learner', description: 'Study for 7 days straight', icon: Calendar, color: '#06b6d4' },
  { id: 'overachiever', title: 'Overachiever', description: 'Complete 50 challenges', icon: Medal, color: '#ef4444' },
  { id: 'perfectionist', title: 'Perfectionist', description: 'Complete a roadmap with 100% accuracy', icon: Crown, color: '#7c3aed' },
  { id: 'community_helper', title: 'Community Helper', description: 'Help 10 fellow learners', icon: Award, color: '#059669' }
];

export default function ProgressDashboard({ 
  userProgress, 
  roadmap, 
  completedChallenges, 
  totalChallenges, 
  completedLevels, 
  totalLevels 
}: ProgressDashboardProps) {
  const { theme } = useTheme();

  const challengeProgress = totalChallenges > 0 ? (completedChallenges / totalChallenges) * 100 : 0;
  const levelProgress = totalLevels > 0 ? (completedLevels / totalLevels) * 100 : 0;
  const overallProgress = (challengeProgress + levelProgress) / 2;

  // Mock achievement data - in real app, this would come from backend
  const userAchievements = userProgress?.achievements || [];
  const earnedAchievements = achievements.filter(ach => userAchievements.includes(ach.id));
  const availableAchievements = achievements.filter(ach => !userAchievements.includes(ach.id));

  // Calculate stats
  const streak = 7; // Mock data
  const totalTimeSpent = '24h 30m'; // Mock data
  const averageTimePerChallenge = '45m'; // Mock data

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Progress Overview */}
      <motion.div variants={itemVariants}>
        <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-color)' }}>
          Progress Overview
        </h3>
        
        {/* Main Progress Circle */}
        <div className="text-center mb-8">
          <div className="relative w-48 h-48 mx-auto mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              {/* Background circle */}
              <circle
                cx="100"
                cy="100"
                r="85"
                stroke={theme === 'light' ? '#e5e7eb' : '#374151'}
                strokeWidth="10"
                fill="none"
              />
              {/* Progress circle */}
              <motion.circle
                cx="100"
                cy="100"
                r="85"
                stroke="url(#progressGradient)"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={534.07} // 2 * π * 85
                strokeDashoffset={534.07 - (534.07 * overallProgress) / 100}
                initial={{ strokeDashoffset: 534.07 }}
                animate={{ strokeDashoffset: 534.07 - (534.07 * overallProgress) / 100 }}
                transition={{ duration: 2, ease: "easeOut" }}
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>
                  {Math.round(overallProgress)}%
                </div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Complete
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Challenges Progress */}
          <div 
            className="p-6 rounded-xl border"
            style={{
              backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.05)',
              borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}
              >
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold" style={{ color: 'var(--text-color)' }}>Challenges</h4>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {completedChallenges} of {totalChallenges}
                </p>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <motion.div 
                className="h-3 rounded-full"
                style={{ background: 'linear-gradient(90deg, #06b6d4, #0891b2)' }}
                initial={{ width: 0 }}
                animate={{ width: `${challengeProgress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
            <div className="text-right text-sm font-medium mt-2" style={{ color: 'var(--text-color)' }}>
              {Math.round(challengeProgress)}%
            </div>
          </div>

          {/* Levels Progress */}
          <div 
            className="p-6 rounded-xl border"
            style={{
              backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.05)',
              borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
              >
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold" style={{ color: 'var(--text-color)' }}>Levels</h4>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {completedLevels} of {totalLevels}
                </p>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <motion.div 
                className="h-3 rounded-full"
                style={{ background: 'linear-gradient(90deg, #10b981, #059669)' }}
                initial={{ width: 0 }}
                animate={{ width: `${levelProgress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
            <div className="text-right text-sm font-medium mt-2" style={{ color: 'var(--text-color)' }}>
              {Math.round(levelProgress)}%
            </div>
          </div>
        </div>
      </motion.div>

      {/* Statistics */}
      <motion.div variants={itemVariants}>
        <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-color)' }}>
          Learning Statistics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Study Streak */}
          <div 
            className="p-6 rounded-xl border text-center"
            style={{
              backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.05)',
              borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <div 
              className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
            >
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text-color)' }}>
              {streak} days
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Study Streak
            </div>
          </div>

          {/* Total Time */}
          <div 
            className="p-6 rounded-xl border text-center"
            style={{
              backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.05)',
              borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <div 
              className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}
            >
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text-color)' }}>
              {totalTimeSpent}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Total Time
            </div>
          </div>

          {/* Average Time */}
          <div 
            className="p-6 rounded-xl border text-center"
            style={{
              backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.05)',
              borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <div 
              className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
            >
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text-color)' }}>
              {averageTimePerChallenge}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Avg per Challenge
            </div>
          </div>
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div variants={itemVariants}>
        <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-color)' }}>
          Achievements
        </h3>

        {/* Earned Achievements */}
        {earnedAchievements.length > 0 && (
          <div className="mb-8">
            <h4 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-color)' }}>
              Earned ({earnedAchievements.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {earnedAchievements.map((achievement) => {
                const Icon = achievement.icon;
                return (
                  <motion.div
                    key={achievement.id}
                    whileHover={{ scale: 1.05 }}
                    className="p-4 rounded-xl border"
                    style={{
                      backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.05)',
                      borderColor: achievement.color,
                      boxShadow: `0 0 0 1px ${achievement.color}20`
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${achievement.color}20`, color: achievement.color }}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold" style={{ color: 'var(--text-color)' }}>
                          {achievement.title}
                        </h5>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {achievement.description}
                        </p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Achievements */}
        <div>
          <h4 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-color)' }}>
            Available ({availableAchievements.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableAchievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <motion.div
                  key={achievement.id}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-xl border opacity-60"
                  style={{
                    backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.05)',
                    borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ 
                        backgroundColor: theme === 'light' ? 'rgba(156, 163, 175, 0.2)' : 'rgba(75, 85, 99, 0.3)',
                        color: '#9ca3af'
                      }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold" style={{ color: 'var(--text-color)' }}>
                        {achievement.title}
                      </h5>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
} 