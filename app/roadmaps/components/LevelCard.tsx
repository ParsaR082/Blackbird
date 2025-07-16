import React from 'react';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';

interface LevelCardProps {
  title: string;
  order: number;
  onClick?: () => void;
}

const LevelCard: React.FC<LevelCardProps> = ({ title, order, onClick }) => {
  const { theme } = useTheme();
  return (
    <motion.div
      className="bg-white/10 dark:bg-black/20 rounded-xl p-6 flex flex-col items-center cursor-pointer hover:scale-105 transition shadow-lg backdrop-blur-md border border-white/10 dark:border-white/20"
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)',
        borderColor: theme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
      }}
    >
      <Award className="w-8 h-8 mb-2 text-purple-400" />
      <h3 className="text-lg font-semibold text-center text-black dark:text-white">{title}</h3>
      <span className="text-xs text-gray-400">Level {order}</span>
    </motion.div>
  );
};

export default LevelCard; 