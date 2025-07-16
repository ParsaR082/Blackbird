import React from 'react';
import MilestoneCard from './MilestoneCard';
import { motion, AnimatePresence } from 'framer-motion';
import type { Milestone } from '../types';

interface MilestoneListProps {
  milestones: Milestone[];
  loading: boolean;
  error: string | null;
  onSelectMilestone: (milestone: Milestone) => void;
}

const MilestoneList: React.FC<MilestoneListProps> = ({ milestones, loading, error, onSelectMilestone }) => {
  if (loading) {
    return <div className="pt-24 text-center text-gray-400">Loading milestones...</div>;
  }
  if (error) {
    return <div className="pt-24 text-center text-red-500">{error}</div>;
  }
  if (!milestones.length) {
    return <div className="pt-24 text-center text-gray-400">No milestones available for this level.</div>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      <AnimatePresence>
        {milestones.map((milestone) => (
          <MilestoneCard
            key={milestone.id}
            title={milestone.title}
            description={milestone.description}
            onClick={() => onSelectMilestone(milestone)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default MilestoneList; 