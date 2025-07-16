import React from 'react';
import LevelCard from './LevelCard';
import { motion, AnimatePresence } from 'framer-motion';
import type { Level, UserProgress } from '../types';

interface LevelListProps {
  levels: Level[];
  userProgress: UserProgress | null;
  loading: boolean;
  error: string | null;
  onSelectLevel: (level: Level) => void;
}

const LevelList: React.FC<LevelListProps> = ({ levels, userProgress, loading, error, onSelectLevel }) => {
  let totalChallenges = 0;
  levels.forEach(level => level.milestones.forEach(m => totalChallenges += m.challenges.length));
  const completed = userProgress?.completedChallenges?.length || 0;
  const percent = totalChallenges > 0 ? Math.round((completed / totalChallenges) * 100) : 0;

  if (loading) {
    return <div className="pt-24 text-center text-gray-400">Loading levels...</div>;
  }
  if (error) {
    return <div className="pt-24 text-center text-red-500">{error}</div>;
  }
  if (!levels.length) {
    return <div className="pt-24 text-center text-gray-400">No levels available for this roadmap.</div>;
  }
  return (
    <>
      {totalChallenges > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-400">Your Progress</span>
            <span className="text-xs text-blue-400 font-bold">{percent}%</span>
          </div>
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-800 rounded">
            <div className="h-3 rounded bg-blue-500 transition-all" style={{ width: `${percent}%` }} />
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <AnimatePresence>
          {levels.map((level) => (
            <LevelCard
              key={level.id}
              title={level.title}
              order={level.order}
              onClick={() => onSelectLevel(level)}
            />
          ))}
        </AnimatePresence>
      </div>
    </>
  );
};

export default LevelList; 