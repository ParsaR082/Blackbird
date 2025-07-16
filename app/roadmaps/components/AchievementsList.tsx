import React from 'react';
import { useTheme } from '@/contexts/theme-context';

interface AchievementsListProps {
  achievements: string[];
}

const AchievementsList: React.FC<AchievementsListProps> = ({ achievements }) => {
  const { theme } = useTheme();
  if (!achievements || achievements.length === 0) return null;
  return (
    <div className="mt-12">
      <h3 className="text-lg font-bold mb-2 text-black dark:text-white">Achievements</h3>
      <ul className="flex flex-wrap gap-4">
        {achievements.map((ach, i) => (
          <li
            key={i}
            className="px-4 py-2 rounded shadow bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 backdrop-blur-md border border-yellow-200 dark:border-yellow-700"
            style={{
              backgroundColor: theme === 'light' ? 'rgba(254,243,199,0.9)' : 'rgba(113,63,18,0.3)',
              borderColor: theme === 'light' ? 'rgba(253,224,71,0.5)' : 'rgba(202,138,4,0.5)',
            }}
          >
            {ach}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AchievementsList; 