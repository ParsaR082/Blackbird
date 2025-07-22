'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Award, Users, ArrowLeft, CheckCircle, Star, Trophy, Clock, BookOpen, Target, Play, User, BarChart3, Users2 } from 'lucide-react';
import BackgroundNodes from '@/components/BackgroundNodes';
import { useTheme } from '@/contexts/theme-context';
import { useAuth } from '@/contexts/auth-context';
import type { Roadmap, Level, Milestone, Challenge, UserProgress } from './types';
import RoadmapList from './components/RoadmapList';
import LevelList from './components/LevelList';
import MilestoneList from './components/MilestoneList';
import ChallengeList from './components/ChallengeList';
import ProgressDashboard from './components/ProgressDashboard';
import StudyGroupsModal from './components/StudyGroupsModal';
import Toast from './Toast';

export default function RoadmapsPage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const mockUserId = user?.id || '663b1e1f1f1f1f1f1f1f1f1f';
  
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
  const [levels, setLevels] = useState<Level[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type?: 'success' | 'error' | 'info' }>({ visible: false, message: '' });
  const [signedUpRoadmaps, setSignedUpRoadmaps] = useState<{ [roadmapId: string]: boolean }>({});
  const [studyGroups, setStudyGroups] = useState<any[]>([]);
  const [showProgressDashboard, setShowProgressDashboard] = useState(false);
  const [showStudyGroupsModal, setShowStudyGroupsModal] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ visible: true, message, type });
  };
  const closeToast = () => setToast({ ...toast, visible: false });

  const handleSignUp = (roadmapId: string) => {
    setSignedUpRoadmaps((prev) => ({ ...prev, [roadmapId]: true }));
    showToast('Successfully enrolled in roadmap!', 'success');
  };

  const handleCompleteLevel = async (levelId: string) => {
    if (!userProgress || !selectedRoadmap) return;
    if (userProgress.completedLevels?.includes(levelId)) return;
    const updated = {
      ...userProgress,
      roadmapId: selectedRoadmap.id,
      completedLevels: [...(userProgress.completedLevels || []), levelId],
    };
    setUserProgress(updated);
    await fetch(`/api/roadmaps/progress/${mockUserId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    showToast('Level completed! 🎉', 'success');
  };

  // Fetch all roadmaps on mount
  useEffect(() => {
    setLoading(true);
    fetch('/api/roadmaps')
      .then(res => res.json())
      .then(data => setRoadmaps(data.map((rm: any) => ({ ...rm, id: rm.id || rm._id }))))
      .catch(() => setError('Failed to load roadmaps'))
      .finally(() => setLoading(false));
  }, []);

  // Fetch levels when a roadmap is selected
  useEffect(() => {
    if (!selectedRoadmap) return;
    setLoading(true);
    fetch(`/api/roadmaps/${selectedRoadmap.id}/levels`)
      .then(res => res.json())
      .then(data => setLevels(data.map((lvl: any) => ({ ...lvl, id: lvl.id || lvl._id }))))
      .catch(() => setError('Failed to load levels'))
      .finally(() => setLoading(false));
  }, [selectedRoadmap]);

  // Fetch milestones when a level is selected
  useEffect(() => {
    if (!selectedRoadmap || !selectedLevel) return;
    setLoading(true);
    fetch(`/api/roadmaps/${selectedRoadmap.id}/levels/${selectedLevel.id}/milestones`)
      .then(res => res.json())
      .then(data => setMilestones(data.map((ms: any) => ({ ...ms, id: ms.id || ms._id }))))
      .catch(() => setError('Failed to load milestones'))
      .finally(() => setLoading(false));
  }, [selectedRoadmap, selectedLevel]);

  // Fetch challenges when a milestone is selected
  useEffect(() => {
    if (!selectedRoadmap || !selectedLevel || !selectedMilestone) return;
    setLoading(true);
    fetch(`/api/roadmaps/${selectedRoadmap.id}/levels/${selectedLevel.id}/milestones/${selectedMilestone.id}/challenges`)
      .then(res => res.json())
      .then(data => setChallenges(data.map((ch: any) => ({ ...ch, id: ch.id || ch._id }))))
      .catch(() => setError('Failed to load challenges'))
      .finally(() => setLoading(false));
  }, [selectedRoadmap, selectedLevel, selectedMilestone]);

  // Fetch user progress when roadmap is selected
  useEffect(() => {
    if (!selectedRoadmap) return;
    fetch(`/api/roadmaps/progress/${mockUserId}?roadmapId=${selectedRoadmap.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          console.error('Error fetching progress:', data.error);
          setUserProgress(null);
        } else {
          setUserProgress(data);
        }
      })
      .catch(() => setUserProgress(null));
  }, [selectedRoadmap, mockUserId]);

  // Mark challenge as complete
  const handleCompleteChallenge = async (challengeId: string) => {
    if (!userProgress || !selectedRoadmap) return;
    const updated = {
      ...userProgress,
      roadmapId: selectedRoadmap.id,
      completedChallenges: [...(userProgress.completedChallenges || []), challengeId],
    };
    setUserProgress(updated);
    await fetch(`/api/roadmaps/progress/${mockUserId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    showToast('Challenge completed! ⚡', 'success');
  };

  // Reset navigation
  const resetToRoadmaps = () => {
    setSelectedRoadmap(null);
    setSelectedLevel(null);
    setSelectedMilestone(null);
    setLevels([]);
    setMilestones([]);
    setChallenges([]);
    setUserProgress(null);
    setError(null);
    setShowProgressDashboard(false);
  };

  // Container variants for animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
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

  // Animated container
  const AnimatedContainer = ({ children }: { children: React.ReactNode }) => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="relative z-10"
    >
      {children}
    </motion.div>
  );

  // Calculate progress statistics
  const getProgressStats = () => {
    if (!selectedRoadmap || !userProgress) return { completedChallenges: 0, totalChallenges: 0, completedLevels: 0, totalLevels: 0 };
    
    const totalLevels = selectedRoadmap.levels?.length || 0;
    const completedLevels = userProgress.completedLevels?.length || 0;
    
    const totalChallenges = selectedRoadmap.levels?.reduce((acc: number, level: any) => 
      acc + (level.milestones?.reduce((msAcc: number, milestone: any) => 
        msAcc + (milestone.challenges?.length || 0), 0) || 0), 0
    ) || 0;
    
    const completedChallenges = userProgress.completedChallenges?.length || 0;
    
    return { completedChallenges, totalChallenges, completedLevels, totalLevels };
  };

  // Step 1: Roadmap selection
  if (!selectedRoadmap) {
    return (
      <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
        <div className="fixed inset-0 transition-colors duration-300" style={{ 
          background: theme === 'light' 
            ? 'linear-gradient(to bottom right, #ffffff, #f8fafc, #ffffff)' 
            : 'linear-gradient(to bottom right, #000000, #1f2937, #000000)'
        }} />
        <div className="fixed inset-0" style={{
          background: theme === 'light'
            ? 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1), transparent 50%)'
            : 'radial-gradient(circle at 50% 50%, rgba(120, 119, 198, 0.1), transparent 50%)'
        }} />
        <BackgroundNodes isMobile={false} />
        
        <AnimatedContainer>
          <div className="container mx-auto pt-24 pb-12 px-4">
            {/* Header */}
            <motion.div variants={itemVariants} className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="p-4 rounded-2xl transition-colors duration-300" style={{
                  background: theme === 'light' 
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))' 
                    : 'linear-gradient(135deg, rgba(120, 119, 198, 0.2), rgba(196, 181, 253, 0.2))'
                }}>
                  <Map className="w-8 h-8 transition-colors duration-300" style={{ color: 'var(--text-color)' }} />
                </div>
                <h1 className="text-4xl font-bold transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
                  Learning Roadmaps
                </h1>
              </div>
              <p className="text-lg max-w-2xl mx-auto transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                Choose your path to mastery. Track progress, complete challenges, and unlock achievements in your learning journey.
              </p>
            </motion.div>

            {/* Stats Cards */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="rounded-xl p-6 transition-all duration-300 border" style={{
                backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.05)',
                borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
              }}>
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Available Roadmaps</span>
                </div>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>{roadmaps.length}</p>
              </div>
              
              <div className="rounded-xl p-6 transition-all duration-300 border" style={{
                backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.05)',
                borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
              }}>
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Achievements</span>
                </div>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>
                  {userProgress?.achievements?.length || 0}
                </p>
              </div>
              
              <div className="rounded-xl p-6 transition-all duration-300 border" style={{
                backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.05)',
                borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
              }}>
                <div className="flex items-center gap-3 mb-2">
                  <User className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Study Groups</span>
                </div>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>{studyGroups.length}</p>
              </div>
            </motion.div>

            {/* Roadmaps Grid */}
            <motion.div variants={itemVariants}>
              <RoadmapList
                roadmaps={roadmaps}
                loading={loading}
                error={error}
                onSelectRoadmap={(roadmap) => setSelectedRoadmap({
                  ...roadmap,
                  levels: roadmap.levels || [],
                  visibility: roadmap.visibility || 'public',
                })}
              />
            </motion.div>
          </div>
        </AnimatedContainer>
      </div>
    );
  }

  // Step 2: Level selection with progress dashboard
  if (!selectedLevel) {
    // If user is not signed up for this roadmap, show signup prompt
    if (!signedUpRoadmaps[selectedRoadmap.id]) {
      return (
        <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
          <div className="fixed inset-0 transition-colors duration-300" style={{ 
            background: theme === 'light' 
              ? 'linear-gradient(to bottom right, #ffffff, #f8fafc, #ffffff)' 
              : 'linear-gradient(to bottom right, #000000, #1f2937, #000000)'
          }} />
          <div className="fixed inset-0" style={{
            background: theme === 'light'
              ? 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1), transparent 50%)'
              : 'radial-gradient(circle at 50% 50%, rgba(120, 119, 198, 0.1), transparent 50%)'
          }} />
          <BackgroundNodes isMobile={false} />
          
          <AnimatedContainer>
            <div className="container mx-auto pt-24 pb-12 px-4">
              <motion.button 
                variants={itemVariants}
                onClick={resetToRoadmaps}
                className="mb-8 flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-secondary)'
                }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Roadmaps
              </motion.button>

              <div className="max-w-2xl mx-auto text-center">
                <motion.div variants={itemVariants} className="mb-8">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center text-4xl transition-colors duration-300" style={{
                    background: theme === 'light' 
                      ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))' 
                      : 'linear-gradient(135deg, rgba(120, 119, 198, 0.3), rgba(196, 181, 253, 0.3))'
                  }}>
                    {selectedRoadmap.icon || '🗺️'}
                  </div>
                  <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-color)' }}>
                    {selectedRoadmap.title}
                  </h2>
                  <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
                    {selectedRoadmap.description}
                  </p>
                </motion.div>

                <motion.div variants={itemVariants} className="p-8 rounded-2xl border mb-8" style={{
                  backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.05)',
                  borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
                }}>
                  <Play className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-color)' }} />
                  <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-color)' }}>Ready to Start?</h3>
                  <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                    Join this roadmap to unlock structured learning paths, track your progress, and earn achievements.
                  </p>
                  <motion.button 
                    onClick={() => handleSignUp(selectedRoadmap.id)}
                    className="px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{
                      background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                      color: '#ffffff',
                      boxShadow: theme === 'light' ? '0 4px 12px rgba(99, 102, 241, 0.3)' : '0 4px 12px rgba(120, 119, 198, 0.4)'
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Join Roadmap
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </AnimatedContainer>
        </div>
      );
    }

    // Calculate progress based on completedLevels from userProgress
    const roadmapLevels = levels;
    const completed = userProgress?.completedLevels?.length || 0;
    const percent = roadmapLevels.length > 0 ? Math.round((completed / roadmapLevels.length) * 100) : 0;
    const { completedChallenges, totalChallenges, completedLevels, totalLevels } = getProgressStats();
    
    return (
      <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
        <div className="fixed inset-0 transition-colors duration-300" style={{ 
          background: theme === 'light' 
            ? 'linear-gradient(to bottom right, #ffffff, #f8fafc, #ffffff)' 
            : 'linear-gradient(to bottom right, #000000, #1f2937, #000000)'
        }} />
        <div className="fixed inset-0" style={{
          background: theme === 'light'
            ? 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1), transparent 50%)'
            : 'radial-gradient(circle at 50% 50%, rgba(120, 119, 198, 0.1), transparent 50%)'
        }} />
        <BackgroundNodes isMobile={false} />
        
        <AnimatedContainer>
          <div className="container mx-auto pt-24 pb-12 px-4">
            <motion.button 
              variants={itemVariants}
              onClick={resetToRoadmaps}
              className="mb-8 flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-secondary)'
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Roadmaps
            </motion.button>

            {/* Header with Actions */}
            <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-color)' }}>
                  {selectedRoadmap.title} - Levels
                </h2>
                <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span>{percent}% Complete</span>
                  <span>•</span>
                  <span>{completed} of {roadmapLevels.length} levels</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={() => setShowProgressDashboard(!showProgressDashboard)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105"
                  style={{
                    backgroundColor: showProgressDashboard 
                      ? 'linear-gradient(135deg, #6366f1, #a855f7)'
                      : (theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)'),
                    color: showProgressDashboard ? '#ffffff' : 'var(--text-color)'
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <BarChart3 className="w-4 h-4 inline mr-2" />
                  {showProgressDashboard ? 'Hide Progress' : 'Show Progress'}
                </motion.button>
                <motion.button
                  onClick={() => setShowStudyGroupsModal(true)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105"
                  style={{
                    backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--text-color)'
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Users2 className="w-4 h-4 inline mr-2" />
                  Study Groups
                </motion.button>
              </div>
            </motion.div>

            {/* Progress Dashboard */}
            <AnimatePresence>
              {showProgressDashboard && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-8"
                >
                  <motion.div 
                    variants={itemVariants}
                    className="p-6 rounded-2xl border"
                    style={{
                      backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.05)',
                      borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <ProgressDashboard
                      userProgress={userProgress}
                      roadmap={selectedRoadmap}
                      completedChallenges={completedChallenges}
                      totalChallenges={totalChallenges}
                      completedLevels={completedLevels}
                      totalLevels={totalLevels}
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress Header */}
            <motion.div variants={itemVariants} className="text-center mb-12">
              <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Progress</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--text-color)' }}>{percent}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700 overflow-hidden">
                  <motion.div 
                    className="h-3 rounded-full"
                    style={{ 
                      background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                      width: `${percent}%`
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <LevelList
                levels={levels}
                userProgress={userProgress}
                loading={loading}
                error={error}
                onSelectLevel={(level) => setSelectedLevel(level)}
              />
            </motion.div>
          </div>
        </AnimatedContainer>

        {/* Study Groups Modal */}
        <StudyGroupsModal
          isOpen={showStudyGroupsModal}
          onClose={() => setShowStudyGroupsModal(false)}
          roadmapId={selectedRoadmap.id}
          roadmapTitle={selectedRoadmap.title}
        />
      </div>
    );
  }

  // Step 3: Milestone selection
  if (!selectedMilestone) {
    return (
      <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
        <div className="fixed inset-0 transition-colors duration-300" style={{ 
          background: theme === 'light' 
            ? 'linear-gradient(to bottom right, #ffffff, #f8fafc, #ffffff)' 
            : 'linear-gradient(to bottom right, #000000, #1f2937, #000000)'
        }} />
        <div className="fixed inset-0" style={{
          background: theme === 'light'
            ? 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1), transparent 50%)'
            : 'radial-gradient(circle at 50% 50%, rgba(120, 119, 198, 0.1), transparent 50%)'
        }} />
        <BackgroundNodes isMobile={false} />
        
        <AnimatedContainer>
          <div className="container mx-auto pt-24 pb-12 px-4">
            <motion.button 
              variants={itemVariants}
              onClick={() => setSelectedLevel(null)}
              className="mb-8 flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-secondary)'
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Levels
            </motion.button>
            
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-color)' }}>
                {selectedLevel.title} - Milestones
              </h2>
            </motion.div>

            <motion.div variants={itemVariants}>
              <MilestoneList
                milestones={milestones}
                loading={loading}
                error={error}
                onSelectMilestone={(milestone) => setSelectedMilestone(milestone)}
              />
            </motion.div>
          </div>
        </AnimatedContainer>
      </div>
    );
  }

  // Step 4: Challenge view
  const allChallengesComplete = selectedLevel && selectedLevel.milestones.every(m => 
    m.challenges.every(c => userProgress?.completedChallenges?.includes(c.id))
  );
  const levelIsCompleted = userProgress?.completedLevels?.includes(selectedLevel?.id || '');
  
  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      <div className="fixed inset-0 transition-colors duration-300" style={{ 
        background: theme === 'light' 
          ? 'linear-gradient(to bottom right, #ffffff, #f8fafc, #ffffff)' 
          : 'linear-gradient(to bottom right, #000000, #1f2937, #000000)'
      }} />
      <div className="fixed inset-0" style={{
        background: theme === 'light'
          ? 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1), transparent 50%)'
          : 'radial-gradient(circle at 50% 50%, rgba(120, 119, 198, 0.1), transparent 50%)'
      }} />
      <BackgroundNodes isMobile={false} />
      
      <AnimatedContainer>
        <div className="container mx-auto pt-24 pb-12 px-4">
          <motion.button 
            variants={itemVariants}
            onClick={() => setSelectedMilestone(null)}
            className="mb-8 flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-secondary)'
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Milestones
          </motion.button>
          
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-color)' }}>
              {selectedMilestone.title} - Challenges
            </h2>
            {selectedMilestone.description && (
              <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                {selectedMilestone.description}
              </p>
            )}
          </motion.div>

          <motion.div variants={itemVariants}>
            <ChallengeList
              challenges={challenges}
              userProgress={userProgress}
              loading={loading}
              error={error}
              onCompleteChallenge={handleCompleteChallenge}
            />
          </motion.div>

          {allChallengesComplete && selectedLevel && !levelIsCompleted && (
            <motion.div variants={itemVariants} className="text-center mt-12">
              <motion.button 
                onClick={() => handleCompleteLevel(selectedLevel.id)}
                className="px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#ffffff',
                  boxShadow: theme === 'light' ? '0 4px 12px rgba(16, 185, 129, 0.3)' : '0 4px 12px rgba(16, 185, 129, 0.4)'
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Trophy className="w-5 h-5 inline mr-2" />
                Complete Level
              </motion.button>
            </motion.div>
          )}
        </div>
      </AnimatedContainer>

      <Toast
        isVisible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={closeToast}
      />
    </div>
  );
} 