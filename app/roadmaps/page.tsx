'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Map, Award, Users, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import BackgroundNodes from '@/components/BackgroundNodes';
import { useTheme } from '@/contexts/theme-context';
import type { Roadmap, Level, Milestone, Challenge, UserProgress } from './types';

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

  // Fetch all roadmaps on mount
  useEffect(() => {
    setLoading(true);
    fetch('/api/roadmaps')
      .then(res => res.json())
      .then(data => setRoadmaps(data))
      .catch(() => setError('Failed to load roadmaps'))
      .finally(() => setLoading(false));
  }, []);

  // Fetch levels when a roadmap is selected
  useEffect(() => {
    if (!selectedRoadmap) return;
    setLoading(true);
    fetch(`/api/roadmaps/${selectedRoadmap.id}/levels`)
      .then(res => res.json())
      .then(data => setLevels(data))
      .catch(() => setError('Failed to load levels'))
      .finally(() => setLoading(false));
  }, [selectedRoadmap]);

  // Fetch milestones when a level is selected
  useEffect(() => {
    if (!selectedRoadmap || !selectedLevel) return;
    setLoading(true);
    fetch(`/api/roadmaps/${selectedRoadmap.id}/levels/${selectedLevel.id}/milestones`)
      .then(res => res.json())
      .then(data => setMilestones(data))
      .catch(() => setError('Failed to load milestones'))
      .finally(() => setLoading(false));
  }, [selectedRoadmap, selectedLevel]);

  // Fetch challenges when a milestone is selected
  useEffect(() => {
    if (!selectedRoadmap || !selectedLevel || !selectedMilestone) return;
    setLoading(true);
    fetch(`/api/roadmaps/${selectedRoadmap.id}/levels/${selectedLevel.id}/milestones/${selectedMilestone.id}/challenges`)
      .then(res => res.json())
      .then(data => setChallenges(data))
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
  };

  // Step 1: Roadmap selection
  if (!selectedRoadmap) {
    if (loading) return <div className="pt-24 text-center">Loading roadmaps...</div>;
    if (error) return <div className="pt-24 text-center text-red-500">{error}</div>;
    return (
      <div className="min-h-screen pt-24 pb-8 px-4">
        <BackgroundNodes />
        <motion.div className="text-center mb-12">
          <h1 className="text-3xl font-light mb-2">Development Roadmaps</h1>
          <p className="text-sm max-w-md mx-auto text-gray-500">Choose a roadmap to start your journey.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {roadmaps.map((roadmap) => (
            <div key={roadmap.id} className="bg-white/10 rounded-xl p-6 flex flex-col items-center cursor-pointer hover:scale-105 transition" onClick={() => setSelectedRoadmap(roadmap)}>
              <Map className="w-8 h-8" />
              <h2 className="text-xl font-semibold mt-2">{roadmap.title}</h2>
              <p className="text-gray-400 text-sm mt-1">{roadmap.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Step 2: Level selection
  if (!selectedLevel) {
    if (loading) return <div className="pt-24 text-center">Loading levels...</div>;
    if (error) return <div className="pt-24 text-center text-red-500">{error}</div>;
    return (
      <div className="min-h-screen pt-24 pb-8 px-4">
        <BackgroundNodes />
        <button className="mb-4 text-blue-400" onClick={() => setSelectedRoadmap(null)}><ArrowLeft className="inline w-4 h-4 mr-1" />Back to Roadmaps</button>
        <h2 className="text-2xl font-semibold mb-6">{selectedRoadmap.title} - Levels</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {levels.map((level) => (
            <div key={level.id} className="bg-white/10 rounded-xl p-6 flex flex-col items-center cursor-pointer hover:scale-105 transition" onClick={() => setSelectedLevel(level)}>
              <Award className="w-8 h-8 mb-2" />
              <h3 className="text-lg font-semibold">{level.title}</h3>
              <span className="text-xs text-gray-400">Level {level.order}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Step 3: Milestone selection
  if (!selectedMilestone) {
    if (loading) return <div className="pt-24 text-center">Loading milestones...</div>;
    if (error) return <div className="pt-24 text-center text-red-500">{error}</div>;
    return (
      <div className="min-h-screen pt-24 pb-8 px-4">
        <BackgroundNodes />
        <button className="mb-4 text-blue-400" onClick={() => setSelectedLevel(null)}><ArrowLeft className="inline w-4 h-4 mr-1" />Back to Levels</button>
        <h2 className="text-2xl font-semibold mb-6">{selectedLevel.title} - Milestones</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {milestones.map((milestone) => (
            <div key={milestone.id} className="bg-white/10 rounded-xl p-6 flex flex-col items-center cursor-pointer hover:scale-105 transition" onClick={() => setSelectedMilestone(milestone)}>
              <Users className="w-8 h-8 mb-2" />
              <h4 className="text-md font-semibold">{milestone.title}</h4>
              <span className="text-xs text-gray-400">{milestone.description}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Step 4: Challenge view
  if (loading) return <div className="pt-24 text-center">Loading challenges...</div>;
  if (error) return <div className="pt-24 text-center text-red-500">{error}</div>;
  return (
    <div className="min-h-screen pt-24 pb-8 px-4">
      <BackgroundNodes />
      <button className="mb-4 text-blue-400" onClick={() => setSelectedMilestone(null)}><ArrowLeft className="inline w-4 h-4 mr-1" />Back to Milestones</button>
      <h2 className="text-2xl font-semibold mb-6">{selectedMilestone.title} - Challenges</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {challenges.map((challenge) => {
          const completed = userProgress?.completedChallenges?.includes(challenge.id);
          return (
            <div key={challenge.id} className={`rounded-xl p-6 flex flex-col items-start ${completed ? 'bg-green-100/10 border-green-400' : 'bg-white/10'}`}>
              <CheckCircle className={`w-6 h-6 mb-2 ${completed ? 'text-green-400' : 'text-gray-400'}`} />
              <h5 className="text-md font-semibold">{challenge.title}</h5>
              <p className="text-xs text-gray-400 mb-2">{challenge.description}</p>
              <span className="text-xs text-blue-400">Type: {challenge.type}</span>
              {!completed && (
                <button className="mt-2 bg-green-500 text-white px-3 py-1 rounded" onClick={() => handleCompleteChallenge(challenge.id)}>
                  Mark as Complete
                </button>
              )}
            </div>
          );
        })}
      </div>
      {/* Achievements */}
      {userProgress?.achievements?.length ? (
        <div className="mt-12">
          <h3 className="text-lg font-bold mb-2">Achievements</h3>
          <ul className="flex flex-wrap gap-4">
            {userProgress.achievements.map((ach, i) => (
              <li key={i} className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded shadow">{ach}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
} 