'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Award, Users, ArrowLeft, CheckCircle } from 'lucide-react';
import BackgroundNodes from '@/components/BackgroundNodes';
import { useTheme } from '@/contexts/theme-context';
import type { Roadmap, Level, Milestone, Challenge, UserProgress } from './types';
import RoadmapList from './components/RoadmapList';
import LevelList from './components/LevelList';
import MilestoneList from './components/MilestoneList';
import ChallengeList from './components/ChallengeList';
import Toast from './Toast';

const mockUserId = '663b1e1f1f1f1f1f1f1f1f1f'; // Replace with real user ID from auth

export default function RoadmapsPage() {
  const { theme } = useTheme();
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
  // Add toast state
  const [toast, setToast] = useState<{ visible: boolean; message: string; type?: 'success' | 'error' | 'info' }>({ visible: false, message: '' });
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ visible: true, message, type });
  };
  const closeToast = () => setToast({ ...toast, visible: false });
  // Add signup state
  const [signedUpRoadmaps, setSignedUpRoadmaps] = useState<{ [roadmapId: string]: boolean }>({});
  const handleSignUp = (roadmapId: string) => {
    setSignedUpRoadmaps((prev) => ({ ...prev, [roadmapId]: true }));
    showToast('Signed up for roadmap!', 'success');
  };
  // Use completedLevels from userProgress
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
    showToast('Level marked as complete!', 'success');
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
    fetch(`/api/roadmaps/progress/${mockUserId}`)
      .then(res => res.json())
      .then(data => setUserProgress(data))
      .catch(() => setUserProgress(null));
  }, [selectedRoadmap]);

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
    showToast('Challenge marked as complete!', 'success');
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
  };

  // Animated container
  const AnimatedContainer = ({ children }: { children: React.ReactNode }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );

  // Step 1: Roadmap selection
  if (!selectedRoadmap) {
    return (
      <div className="min-h-screen pt-24 pb-8 px-4">
        <BackgroundNodes />
        <AnimatedContainer>
          <div className="text-center mb-12">
            <h1 className="text-3xl font-light mb-2">Development Roadmaps</h1>
            <p className="text-sm max-w-md mx-auto text-gray-500">Choose a roadmap to start your journey.</p>
          </div>
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
        </AnimatedContainer>
      </div>
    );
  }

  // Step 2: Level selection
  if (!selectedLevel) {
    // If user is not signed up for this roadmap, show signup prompt
    if (!signedUpRoadmaps[selectedRoadmap.id]) {
      return (
        <div className="min-h-screen pt-24 pb-8 px-4">
          <BackgroundNodes />
          <AnimatedContainer>
            <button className="mb-4 text-blue-400" onClick={resetToRoadmaps}><ArrowLeft className="inline w-4 h-4 mr-1" />Back to Roadmaps</button>
            <h2 className="text-2xl font-semibold mb-6">{selectedRoadmap.title}</h2>
            <p className="mb-8 text-gray-500">You must sign up for this roadmap to access its content.</p>
            <button className="px-8 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition" onClick={() => handleSignUp(selectedRoadmap.id)}>
              Sign Up for Roadmap
            </button>
          </AnimatedContainer>
        </div>
      );
    }
    // Calculate progress based on completedLevels from userProgress
    const roadmapLevels = levels;
    const completed = userProgress?.completedLevels?.length || 0;
    const percent = roadmapLevels.length > 0 ? Math.round((completed / roadmapLevels.length) * 100) : 0;
    return (
      <div className="min-h-screen pt-24 pb-8 px-4">
        <BackgroundNodes />
        <AnimatedContainer>
          <button className="mb-4 text-blue-400" onClick={resetToRoadmaps}><ArrowLeft className="inline w-4 h-4 mr-1" />Back to Roadmaps</button>
          <h2 className="text-2xl font-semibold mb-6">{selectedRoadmap.title} - Levels</h2>
          <LevelList
            levels={levels}
            userProgress={userProgress}
            loading={loading}
            error={error}
            onSelectLevel={(level) => setSelectedLevel(level)}
          />
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">Progress: {percent}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percent}%` }}></div>
            </div>
          </div>
        </AnimatedContainer>
      </div>
    );
  }

  // Step 3: Milestone selection
  if (!selectedMilestone) {
    return (
      <div className="min-h-screen pt-24 pb-8 px-4">
        <BackgroundNodes />
        <AnimatedContainer>
          <button className="mb-4 text-blue-400" onClick={() => setSelectedLevel(null)}><ArrowLeft className="inline w-4 h-4 mr-1" />Back to Levels</button>
          <h2 className="text-2xl font-semibold mb-6">{selectedLevel.title} - Milestones</h2>
          <MilestoneList
            milestones={milestones}
            loading={loading}
            error={error}
            onSelectMilestone={(milestone) => setSelectedMilestone(milestone)}
          />
        </AnimatedContainer>
      </div>
    );
  }

  // Step 4: Challenge view
  // If all challenges in the selected level are complete, show 'Mark Level as Complete' button
  const allChallengesComplete = selectedLevel && selectedLevel.milestones.every(m => m.challenges.every(c => userProgress?.completedChallenges?.includes(c.id)));
  const levelIsCompleted = userProgress?.completedLevels?.includes(selectedLevel?.id || '');
  return (
    <div className="min-h-screen pt-24 pb-8 px-4">
      <BackgroundNodes />
      <AnimatedContainer>
        <button className="mb-4 text-blue-400" onClick={() => setSelectedMilestone(null)}><ArrowLeft className="inline w-4 h-4 mr-1" />Back to Milestones</button>
        <h2 className="text-2xl font-semibold mb-6">{selectedMilestone.title} - Challenges</h2>
        <ChallengeList
          challenges={challenges}
          userProgress={userProgress}
          loading={loading}
          error={error}
          onCompleteChallenge={handleCompleteChallenge}
        />
        {allChallengesComplete && selectedLevel && !levelIsCompleted && (
          <button className="mt-8 px-8 py-3 rounded-lg bg-green-500 text-white hover:bg-green-600 transition" onClick={() => handleCompleteLevel(selectedLevel.id)}>
            Mark Level as Complete
          </button>
        )}
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