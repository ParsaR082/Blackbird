import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';

interface ChallengeCardProps {
  title: string;
  description: string;
  type: string;
  completed: boolean;
  onComplete?: () => void;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ title, description, type, completed, onComplete }) => {
  const { theme } = useTheme();
  return (
    <motion.div
      className={`rounded-xl p-6 flex flex-col items-start shadow-lg transition-all duration-200 border backdrop-blur-md ${completed ? 'bg-green-100/10 border-green-400' : 'bg-white/10 dark:bg-black/20 border-white/10 dark:border-white/20'}`}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      style={{
        backgroundColor: completed
          ? (theme === 'light' ? 'rgba(187,247,208,0.7)' : 'rgba(22,163,74,0.15)')
          : (theme === 'light' ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)'),
        borderColor: completed
          ? (theme === 'light' ? 'rgba(34,197,94,0.4)' : 'rgba(34,197,94,0.6)')
          : (theme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'),
      }}
    >
      <CheckCircle className={`w-6 h-6 mb-2 ${completed ? 'text-green-400' : 'text-gray-400'}`} />
      <h5 className="text-md font-semibold text-black dark:text-white">{title}</h5>
      <p className="text-xs text-gray-400 mb-2">{description}</p>
      <span className="text-xs text-blue-400 mb-2">Type: {type}</span>
      {!completed && onComplete && (
        <button
          className="mt-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
          onClick={onComplete}
        >
          Mark as Complete
        </button>
      )}
    </motion.div>
  );
};

export default ChallengeCard; 