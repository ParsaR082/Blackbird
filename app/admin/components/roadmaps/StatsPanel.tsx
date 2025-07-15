import React, { useEffect, useState } from 'react';

interface Stats {
  totalRoadmaps: number;
  totalLevels: number;
  totalMilestones: number;
  totalChallenges: number;
}

const StatsPanel: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/roadmaps/stats')
      .then(res => res.json())
      .then(setStats)
      .catch(() => setError('Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="mb-4">Loading stats...</div>;
  if (error) return <div className="mb-4 text-red-500">{error}</div>;
  if (!stats) return null;

  return (
    <div className="mb-4 flex gap-6 flex-wrap">
      <div className="bg-gray-100 dark:bg-gray-800 rounded p-3 text-center min-w-[120px]">
        <div className="text-lg font-bold">{stats.totalRoadmaps}</div>
        <div className="text-xs text-gray-500">Total Roadmaps</div>
      </div>
      <div className="bg-gray-100 dark:bg-gray-800 rounded p-3 text-center min-w-[120px]">
        <div className="text-lg font-bold">{stats.totalLevels}</div>
        <div className="text-xs text-gray-500">Levels</div>
      </div>
      <div className="bg-gray-100 dark:bg-gray-800 rounded p-3 text-center min-w-[120px]">
        <div className="text-lg font-bold">{stats.totalMilestones}</div>
        <div className="text-xs text-gray-500">Milestones</div>
      </div>
      <div className="bg-gray-100 dark:bg-gray-800 rounded p-3 text-center min-w-[120px]">
        <div className="text-lg font-bold">{stats.totalChallenges}</div>
        <div className="text-xs text-gray-500">Challenges</div>
      </div>
    </div>
  );
};

export default StatsPanel; 