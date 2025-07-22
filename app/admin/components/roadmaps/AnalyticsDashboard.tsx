'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Target, Clock, Award, Download, RefreshCw, Calendar, AlertCircle } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';

interface AnalyticsData {
  roadmapId: string;
  roadmapTitle: string;
  totalUsers: number;
  totalLevels: number;
  totalChallenges: number;
  completedLevels: number;
  completedChallenges: number;
  levelCompletionRate: number;
  challengeCompletionRate: number;
  levelStats: Array<{
    id: string;
    title: string;
    completions: number;
    completionRate: number;
  }>;
  recentActivity: number;
  generatedAt: string;
}

interface AnalyticsDashboardProps {
  roadmapId: string | null;
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

export default function AnalyticsDashboard({ roadmapId }: AnalyticsDashboardProps) {
  const { theme } = useTheme();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    if (!roadmapId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/roadmaps/${roadmapId}/analytics`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [roadmapId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  const handleExport = () => {
    if (!analyticsData) return;
    
    const exportData = {
      ...analyticsData,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roadmap-analytics-${analyticsData.roadmapId}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchAnalytics();
  }, [roadmapId, fetchAnalytics]);

  if (!roadmapId) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
          Select a Roadmap
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Choose a roadmap to view detailed analytics and insights.
        </p>
      </div>
    );
  }

  if (loading && !analyticsData) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-48 mb-2" />
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20" />
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-24" />
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div 
              key={index}
              className="p-6 rounded-xl border animate-pulse"
              style={{
                backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.05)',
                borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-lg" />
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20" />
              </div>
              <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-16 mb-2" />
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-24" />
            </div>
          ))}
        </div>

        {/* Chart Skeleton */}
        <div 
          className="p-6 rounded-xl border"
          style={{
            backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.05)',
            borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-6" />
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24" />
                <div className="flex-1 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
          Failed to Load Analytics
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          {error}
        </p>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            color: '#ffffff'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!analyticsData) return null;

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>
            Analytics Dashboard
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {analyticsData.roadmapTitle} • Generated {new Date(analyticsData.generatedAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50"
            style={{
              backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-color)'
            }}
          >
            <RefreshCw className={`w-4 h-4 inline mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing' : 'Refresh'}
          </button>
          <button
            onClick={handleExport}
            className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-color)'
            }}
          >
            <Download className="w-4 h-4 inline mr-1" />
            Export
          </button>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div 
          className="p-6 rounded-xl border transition-all duration-300 hover:shadow-lg"
          style={{
            backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.05)',
            borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
            >
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Total Users</span>
          </div>
          <div className="text-3xl font-bold mb-1" style={{ color: 'var(--text-color)' }}>
            {analyticsData.totalUsers.toLocaleString()}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Enrolled in this roadmap
          </div>
        </div>

        {/* Challenge Completion Rate */}
        <div 
          className="p-6 rounded-xl border transition-all duration-300 hover:shadow-lg"
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
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Challenge Rate</span>
          </div>
          <div className="text-3xl font-bold mb-1" style={{ color: 'var(--text-color)' }}>
            {analyticsData.challengeCompletionRate.toFixed(1)}%
          </div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Average completion rate
          </div>
        </div>

        {/* Level Completion Rate */}
        <div 
          className="p-6 rounded-xl border transition-all duration-300 hover:shadow-lg"
          style={{
            backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.05)',
            borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
            >
              <Award className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Level Rate</span>
          </div>
          <div className="text-3xl font-bold mb-1" style={{ color: 'var(--text-color)' }}>
            {analyticsData.levelCompletionRate.toFixed(1)}%
          </div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Level completion rate
          </div>
        </div>

        {/* Recent Activity */}
        <div 
          className="p-6 rounded-xl border transition-all duration-300 hover:shadow-lg"
          style={{
            backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.05)',
            borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}
            >
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Recent Activity</span>
          </div>
          <div className="text-3xl font-bold mb-1" style={{ color: 'var(--text-color)' }}>
            {analyticsData.recentActivity}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Active users (7 days)
          </div>
        </div>
      </motion.div>

      {/* Progress Overview */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overall Progress */}
        <div 
          className="p-6 rounded-xl border"
          style={{
            backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.05)',
            borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--text-color)' }}>
            Overall Progress
          </h3>
          
          <div className="space-y-6">
            {/* Challenges Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>
                  Challenges Completed
                </span>
                <span className="text-sm font-bold" style={{ color: 'var(--text-color)' }}>
                  {analyticsData.completedChallenges} / {analyticsData.totalChallenges}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <motion.div 
                  className="h-3 rounded-full"
                  style={{ 
                    background: 'linear-gradient(90deg, #06b6d4, #0891b2)',
                    width: `${analyticsData.totalChallenges > 0 ? (analyticsData.completedChallenges / analyticsData.totalChallenges) * 100 : 0}%`
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${analyticsData.totalChallenges > 0 ? (analyticsData.completedChallenges / analyticsData.totalChallenges) * 100 : 0}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Levels Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>
                  Levels Completed
                </span>
                <span className="text-sm font-bold" style={{ color: 'var(--text-color)' }}>
                  {analyticsData.completedLevels} / {analyticsData.totalLevels}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <motion.div 
                  className="h-3 rounded-full"
                  style={{ 
                    background: 'linear-gradient(90deg, #10b981, #059669)',
                    width: `${analyticsData.totalLevels > 0 ? (analyticsData.completedLevels / analyticsData.totalLevels) * 100 : 0}%`
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${analyticsData.totalLevels > 0 ? (analyticsData.completedLevels / analyticsData.totalLevels) * 100 : 0}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top Performing Levels */}
        <div 
          className="p-6 rounded-xl border"
          style={{
            backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.05)',
            borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--text-color)' }}>
            Level Performance
          </h3>
          
          <div className="space-y-4">
            {analyticsData.levelStats.slice(0, 5).map((level, index) => (
              <div key={level.id} className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{
                    backgroundColor: index < 3 
                      ? ['#f59e0b', '#d97706', '#92400e'][index]
                      : (theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'),
                    color: index < 3 ? '#ffffff' : 'var(--text-color)'
                  }}
                >
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate" style={{ color: 'var(--text-color)' }}>
                      {level.title}
                    </span>
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-color)' }}>
                      {level.completionRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <motion.div 
                      className="h-2 rounded-full"
                      style={{ 
                        background: `linear-gradient(90deg, ${
                          index < 3 
                            ? ['#f59e0b', '#d97706', '#92400e'][index]
                            : '#6366f1'
                        }, ${
                          index < 3 
                            ? ['#d97706', '#92400e', '#78350f'][index]
                            : '#a855f7'
                        })`,
                        width: `${level.completionRate}%`
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${level.completionRate}%` }}
                      transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                    />
                  </div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {level.completions} completions
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Summary Insights */}
      <motion.div variants={itemVariants}>
        <div 
          className="p-6 rounded-xl border"
          style={{
            backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.05)',
            borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--text-color)' }}>
            Key Insights
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Engagement Level */}
            <div className="text-center">
              <div 
                className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center"
                style={{
                  background: analyticsData.challengeCompletionRate > 70 
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : analyticsData.challengeCompletionRate > 40
                    ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                    : 'linear-gradient(135deg, #ef4444, #dc2626)'
                }}
              >
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold mb-1" style={{ color: 'var(--text-color)' }}>
                Engagement Level
              </h4>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {analyticsData.challengeCompletionRate > 70 ? 'High' : 
                 analyticsData.challengeCompletionRate > 40 ? 'Medium' : 'Low'} engagement
              </p>
            </div>

            {/* Popular Content */}
            <div className="text-center">
              <div 
                className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}
              >
                <Award className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold mb-1" style={{ color: 'var(--text-color)' }}>
                Most Popular
              </h4>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {analyticsData.levelStats[0]?.title || 'No data'}
              </p>
            </div>

            {/* Activity Trend */}
            <div className="text-center">
              <div 
                className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}
              >
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold mb-1" style={{ color: 'var(--text-color)' }}>
                Recent Activity
              </h4>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {analyticsData.recentActivity > analyticsData.totalUsers * 0.3 ? 'High' : 
                 analyticsData.recentActivity > analyticsData.totalUsers * 0.1 ? 'Medium' : 'Low'} activity
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
} 