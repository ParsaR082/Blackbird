'use client'

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Map, Award, Users, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import BackgroundNodes from '@/components/BackgroundNodes';
import { useTheme } from '@/contexts/theme-context';

// --- Types ---
interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'quiz' | 'project' | 'reading';
  resources?: string[];
  completed: boolean;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  challenges: Challenge[];
  dueDate?: string;
  reward?: string;
}

interface Level {
  id: string;
  title: string;
  order: number;
  milestones: Milestone[];
  unlockRequirements?: string;
}

interface Roadmap {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  levels: Level[];
  visibility: 'public' | 'private';
}

interface UserProgress {
  roadmapId: string;
  currentLevelId: string;
  currentMilestoneId: string;
  completedChallenges: string[];
  achievements: string[];
}

// --- Mock Data ---
const mockRoadmaps: Roadmap[] = [
  {
    id: 'fullstack',
    title: 'Full Stack Development',
    description: 'Master web development from frontend to backend.',
    icon: <Map className="w-8 h-8" />,
    visibility: 'public',
    levels: [
      {
        id: 'frontend',
        title: 'Frontend Mastery',
        order: 1,
        milestones: [
          {
            id: 'react-basics',
            title: 'React.js Basics',
            description: 'Learn the fundamentals of React.',
            challenges: [
              {
                id: 'todo-app',
                title: 'Build a ToDo App',
                description: 'Create a simple ToDo app using React.',
                type: 'project',
                completed: false,
              },
              {
                id: 'quiz-hooks',
                title: 'React Hooks Quiz',
                description: 'Test your knowledge of React hooks.',
                type: 'quiz',
                completed: false,
              },
            ],
            reward: 'React Beginner Badge',
          },
        ],
      },
      {
        id: 'backend',
        title: 'Backend Systems',
        order: 2,
        milestones: [
          {
            id: 'node-express',
            title: 'Node.js & Express',
            description: 'Build REST APIs with Node.js.',
            challenges: [
              {
                id: 'api-project',
                title: 'API Project',
                description: 'Develop a RESTful API.',
                type: 'project',
                completed: false,
              },
            ],
            reward: 'API Builder Badge',
          },
        ],
      },
    ],
  },
];

const mockUserProgress: UserProgress = {
  roadmapId: 'fullstack',
  currentLevelId: 'frontend',
  currentMilestoneId: 'react-basics',
  completedChallenges: [],
  achievements: [],
};

export default function RoadmapsPage() {
  const { theme } = useTheme();
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);

  // Step 1: Roadmap selection
  if (!selectedRoadmap) {
    return (
      <div className="min-h-screen pt-24 pb-8 px-4">
        <BackgroundNodes />
        <motion.div className="text-center mb-12">
          <h1 className="text-3xl font-light mb-2">Development Roadmaps</h1>
          <p className="text-sm max-w-md mx-auto text-gray-500">Choose a roadmap to start your journey.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {mockRoadmaps.map((roadmap) => (
            <div key={roadmap.id} className="bg-white/10 rounded-xl p-6 flex flex-col items-center cursor-pointer hover:scale-105 transition" onClick={() => setSelectedRoadmap(roadmap)}>
              {roadmap.icon}
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
    return (
      <div className="min-h-screen pt-24 pb-8 px-4">
        <BackgroundNodes />
        <button className="mb-4 text-blue-400" onClick={() => setSelectedRoadmap(null)}><ArrowLeft className="inline w-4 h-4 mr-1" />Back to Roadmaps</button>
        <h2 className="text-2xl font-semibold mb-6">{selectedRoadmap.title} - Levels</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {selectedRoadmap.levels.map((level) => (
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
    return (
      <div className="min-h-screen pt-24 pb-8 px-4">
        <BackgroundNodes />
        <button className="mb-4 text-blue-400" onClick={() => setSelectedLevel(null)}><ArrowLeft className="inline w-4 h-4 mr-1" />Back to Levels</button>
        <h2 className="text-2xl font-semibold mb-6">{selectedLevel.title} - Milestones</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {selectedLevel.milestones.map((milestone) => (
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
  return (
    <div className="min-h-screen pt-24 pb-8 px-4">
      <BackgroundNodes />
      <button className="mb-4 text-blue-400" onClick={() => setSelectedMilestone(null)}><ArrowLeft className="inline w-4 h-4 mr-1" />Back to Milestones</button>
      <h2 className="text-2xl font-semibold mb-6">{selectedMilestone.title} - Challenges</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {selectedMilestone.challenges.map((challenge) => (
          <div key={challenge.id} className={`rounded-xl p-6 flex flex-col items-start ${challenge.completed ? 'bg-green-100/10 border-green-400' : 'bg-white/10'}`}>
            <CheckCircle className={`w-6 h-6 mb-2 ${challenge.completed ? 'text-green-400' : 'text-gray-400'}`} />
            <h5 className="text-md font-semibold">{challenge.title}</h5>
            <p className="text-xs text-gray-400 mb-2">{challenge.description}</p>
            <span className="text-xs text-blue-400">Type: {challenge.type}</span>
            {/* Add resources, completion actions, etc. here */}
          </div>
        ))}
      </div>
    </div>
  );
} 