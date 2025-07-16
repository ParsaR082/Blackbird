import React from 'react';
import { motion } from 'framer-motion';
import { Map } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';

interface RoadmapCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

const RoadmapCard: React.FC<RoadmapCardProps> = ({ title, description, icon, onClick }) => {
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
      {icon || <Map className="w-8 h-8 mb-2 text-blue-400" />}
      <h2 className="text-xl font-semibold mt-2 text-center text-black dark:text-white">{title}</h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 text-center">{description}</p>
    </motion.div>
  );
};

export default RoadmapCard; 