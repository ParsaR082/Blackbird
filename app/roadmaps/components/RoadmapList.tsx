import React from 'react';
import RoadmapCard from './RoadmapCard';
import { motion, AnimatePresence } from 'framer-motion';

import type { Roadmap } from '../types';
import { Map } from 'lucide-react';

interface RoadmapListProps {
  roadmaps: Roadmap[];
  loading: boolean;
  error: string | null;
  onSelectRoadmap: (roadmap: Roadmap) => void;
}

const RoadmapList: React.FC<RoadmapListProps> = ({ roadmaps, loading, error, onSelectRoadmap }) => {
  if (loading) {
    return <div className="pt-24 text-center text-gray-400">Loading roadmaps...</div>;
  }
  if (error) {
    return <div className="pt-24 text-center text-red-500">{error}</div>;
  }
  if (!roadmaps.length) {
    return <div className="pt-24 text-center text-gray-400">No roadmaps available.</div>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      <AnimatePresence>
        {roadmaps.map((roadmap) => (
          <RoadmapCard
            key={roadmap.id}
            title={roadmap.title}
            description={roadmap.description}
            icon={roadmap.icon ? <Map className="w-8 h-8 mb-2 text-blue-400" /> : undefined}
            onClick={() => onSelectRoadmap(roadmap)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default RoadmapList; 