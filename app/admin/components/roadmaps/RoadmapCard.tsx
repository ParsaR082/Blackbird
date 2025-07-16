import React, { useState } from 'react';
import type { Roadmap } from '@/app/roadmaps/types';
import LevelTree from './LevelTree';

function getStatusBadge(status?: string) {
  switch (status) {
    case 'draft':
      return <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full ml-2" title="Draft">Draft</span>;
    case 'archived':
      return <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full ml-2" title="Archived">Archived</span>;
    case 'published':
    default:
      return <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full ml-2" title="Published">Published</span>;
  }
}

// Mock progress for now (replace with real data if available)
function getMockProgress(roadmap: Roadmap) {
  // TODO: Replace with real progress when available
  return (roadmap as any).progress ?? 60;
}

interface RoadmapCardProps {
  roadmap: Roadmap;
  onEdit: (roadmap: Roadmap) => void;
  onRefresh: () => void;
  selected?: boolean;
  onSelect?: (checked: boolean) => void;
  searchTerm?: string;
  onOpenPanel?: () => void;
}

function highlight(text: string, term: string) {
  if (!term) return text;
  const idx = text.toLowerCase().indexOf(term.toLowerCase());
  if (idx === -1) return text;
  return <>{text.slice(0, idx)}<mark className="bg-yellow-200 px-0.5 rounded">{text.slice(idx, idx + term.length)}</mark>{text.slice(idx + term.length)}</>;
}

const RoadmapCard: React.FC<RoadmapCardProps> = ({ roadmap, onEdit, onRefresh, selected = false, onSelect, searchTerm = '', onOpenPanel }) => {
  // Remove expanded state
  // const [expanded, setExpanded] = useState(false);
  const progress = getMockProgress(roadmap);
  // TODO: Replace with real status when available
  const status = (roadmap as any).status || 'published';

  return (
    <div
      className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 flex flex-col gap-2 border border-gray-200 dark:border-gray-700 transition hover:shadow-lg hover:border-blue-400 group cursor-pointer"
      onClick={onOpenPanel}
      tabIndex={0}
      role="button"
      aria-label="Open roadmap details"
    >
      <div className="flex items-center gap-3 mb-2">
        {onSelect && (
          <input
            type="checkbox"
            checked={selected}
            onChange={e => onSelect(e.target.checked)}
            className="accent-blue-600"
            title="Select roadmap"
            onClick={e => e.stopPropagation()}
          />
        )}
        {/* Remove expand/collapse button */}
        <span className="text-3xl">🗺️</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg flex items-center gap-2 truncate">
            {highlight(roadmap.title, searchTerm)}
            {getStatusBadge(status)}
          </h3>
          <p className="text-gray-500 text-sm truncate">{highlight(roadmap.description, searchTerm)}</p>
        </div>
      </div>
      {/* Stats placeholder */}
      <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-300 mb-2">
        <span>Levels: {roadmap.levels?.length ?? 0}</span>
        {/* Add more stats as needed */}
      </div>
      <div className="flex gap-2 mt-auto">
        <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={e => { e.stopPropagation(); onEdit(roadmap); }} title="Edit roadmap">Edit</button>
        <button className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded" onClick={e => { e.stopPropagation(); onRefresh(); }} title="Refresh roadmap">Refresh</button>
      </div>
      {/* Remove expanded tree from here */}
    </div>
  );
};

export default RoadmapCard; 