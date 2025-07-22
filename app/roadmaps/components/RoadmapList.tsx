'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { Map, Users, Trophy, Star, Clock, ArrowRight } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';
import type { Roadmap } from '../types';

interface RoadmapListProps {
  roadmaps: Roadmap[];
  loading: boolean;
  error: string | null;
  onSelectRoadmap: (roadmap: Roadmap) => void;
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

export default function RoadmapList({ roadmaps, loading, error, onSelectRoadmap }: RoadmapListProps) {
  const { theme } = useTheme();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div 
            key={index}
            className="rounded-xl p-6 border animate-pulse"
            style={{
              backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.05)',
              borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gray-300 dark:bg-gray-600" />
              <div className="flex-1">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2" />
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3" />
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded" />
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16" />
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20" />
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
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <Map className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
            Failed to Load
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (roadmaps.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-8 rounded-xl border max-w-md mx-auto" style={{
          backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.05)',
          borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
        }}>
          <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{
            background: theme === 'light' 
              ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))' 
              : 'linear-gradient(135deg, rgba(120, 119, 198, 0.2), rgba(196, 181, 253, 0.2))'
          }}>
            <Map className="w-8 h-8" style={{ color: 'var(--text-color)' }} />
          </div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
            No Roadmaps Available
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Check back later for new learning paths to explore.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {roadmaps.map((roadmap) => {
        const totalLevels = roadmap.levels?.length || 0;
        const totalChallenges = roadmap.levels?.reduce((acc, level) => 
          acc + (level.milestones?.reduce((msAcc, milestone) => 
            msAcc + (milestone.challenges?.length || 0), 0) || 0), 0
        ) || 0;

        return (
          <motion.div
            key={roadmap.id}
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group cursor-pointer"
            onClick={() => onSelectRoadmap(roadmap)}
          >
            <div 
              className="rounded-xl p-6 border transition-all duration-300 hover:shadow-lg"
              style={{
                backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.05)',
                borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                boxShadow: theme === 'light' 
                  ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  : '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
              }}
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: theme === 'light' 
                      ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))' 
                      : 'linear-gradient(135deg, rgba(120, 119, 198, 0.2), rgba(196, 181, 253, 0.2))'
                  }}
                >
                  {roadmap.icon || '🗺️'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-blue-600 transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
                    {roadmap.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span 
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize"
                      style={{
                        backgroundColor: roadmap.visibility === 'public' 
                          ? (theme === 'light' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.2)')
                          : (theme === 'light' ? 'rgba(249, 115, 22, 0.1)' : 'rgba(249, 115, 22, 0.2)'),
                        color: roadmap.visibility === 'public' ? '#16a34a' : '#ea580c'
                      }}
                    >
                      {roadmap.visibility}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                {roadmap.description}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs mb-4">
                <div className="flex items-center gap-1">
                  <Trophy className="w-3 h-3" style={{ color: 'var(--text-secondary)' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{totalLevels} levels</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3" style={{ color: 'var(--text-secondary)' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{totalChallenges} challenges</span>
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <Users className="w-3 h-3" />
                  <span>Join thousands of learners</span>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
} 