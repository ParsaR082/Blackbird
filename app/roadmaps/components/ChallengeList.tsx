import React from 'react';
import ChallengeCard from './ChallengeCard';
import { motion, AnimatePresence } from 'framer-motion';
import type { Challenge, UserProgress } from '../types';
import AchievementsList from './AchievementsList';

interface ChallengeListProps {
  challenges: Challenge[];
  userProgress: UserProgress | null;
  loading: boolean;
  error: string | null;
  onCompleteChallenge: (challengeId: string) => void;
}

const ChallengeList: React.FC<ChallengeListProps> = ({ challenges, userProgress, loading, error, onCompleteChallenge }) => {
  if (loading) {
    return <div className="pt-24 text-center text-gray-400">Loading challenges...</div>;
  }
  if (error) {
    return <div className="pt-24 text-center text-red-500">{error}</div>;
  }
  if (!challenges.length) {
    return <div className="pt-24 text-center text-gray-400">No challenges available for this milestone.</div>;
  }
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <AnimatePresence>
          {challenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              title={challenge.title}
              description={challenge.description}
              type={challenge.type}
              completed={!!userProgress?.completedChallenges?.includes(challenge.id)}
              onComplete={() => onCompleteChallenge(challenge.id)}
            />
          ))}
        </AnimatePresence>
      </div>
      {/* Achievements */}
      <AchievementsList achievements={userProgress?.achievements || []} />
    </>
  );
};

export default ChallengeList; 