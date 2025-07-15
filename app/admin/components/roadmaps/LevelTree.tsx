import React, { useEffect, useState } from 'react';
import MilestoneTree from './MilestoneTree';
import EntityModal from './EntityModal';
import type { Level } from '@/app/roadmaps/types';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { ChevronDown, ChevronRight, Edit2, Trash2, Plus, GripVertical } from 'lucide-react';

interface LevelTreeProps {
  roadmapId: string;
  onRefresh: () => void;
  searchTerm?: string;
}

function highlight(text: string, term: string) {
  if (!term) return text;
  const idx = text.toLowerCase().indexOf(term.toLowerCase());
  if (idx === -1) return text;
  return <>{text.slice(0, idx)}<mark className="bg-yellow-200 px-0.5 rounded">{text.slice(idx, idx + term.length)}</mark>{text.slice(idx + term.length)}</>;
}

const LevelTree: React.FC<LevelTreeProps> = ({ roadmapId, onRefresh, searchTerm = '' }) => {
  const [levels, setLevels] = useState<Level[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Level | null>(null);

  const fetchLevels = () => {
    setLoading(true);
    fetch(`/api/roadmaps/${roadmapId}/levels`)
      .then(res => res.json())
      .then(setLevels)
      .finally(() => setLoading(false));
  };
  useEffect(fetchLevels, [roadmapId]);

  const handleAdd = () => {
    setEditing(null);
    setShowModal(true);
  };
  const handleEdit = (level: Level) => {
    setEditing(level);
    setShowModal(true);
  };
  const handleDelete = async (id: string) => {
    await fetch(`/api/roadmaps/${roadmapId}/levels/${id}`, { method: 'DELETE' });
    fetchLevels();
    onRefresh();
  };
  const handleModalClose = (refresh = false) => {
    setShowModal(false);
    setEditing(null);
    if (refresh) {
      fetchLevels();
      onRefresh();
    }
  };
  const handleModalSubmit = async (values: { title: string }) => {
    if (editing) {
      await fetch(`/api/roadmaps/${roadmapId}/levels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editing.id, title: values.title, order: editing.order, milestones: [] })
      });
    } else {
      await fetch(`/api/roadmaps/${roadmapId}/levels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: values.title, order: levels.length + 1, milestones: [] })
      });
    }
  };

  // Drag & Drop
  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(levels);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    // Update order in backend
    await fetch(`/api/roadmaps/${roadmapId}/levels/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: reordered.map((lvl, idx) => ({ id: lvl.id, order: idx + 1 })) })
    });
    fetchLevels();
    onRefresh();
  };

  return (
    <div className="space-y-3">
      <div className="mb-2 flex justify-between items-center">
        <span className="font-semibold text-base flex items-center gap-2">Levels <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">{levels.length}</span></span>
        <button className="bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1 text-xs" onClick={handleAdd}><Plus className="w-4 h-4" /> Add Level</button>
      </div>
      {loading ? <div>Loading levels...</div> : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="levels-droppable">
            {(provided) => (
              <ul ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                {levels.length === 0 && (
                  <li className="text-gray-400 italic text-sm py-2 text-center">No levels yet.</li>
                )}
                {levels.map((level, idx) => (
                  <Draggable key={level.id} draggableId={level.id} index={idx}>
                    {(provided, snapshot) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`transition group bg-white/10 border border-white/10 rounded-lg p-3 flex flex-col shadow-sm hover:shadow-lg hover:-translate-y-1 focus-within:ring-2 focus-within:ring-blue-400 active:ring-2 active:ring-blue-500 duration-200 ${snapshot.isDragging ? 'ring-2 ring-blue-400' : ''}`}
                      >
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setExpanded(expanded === level.id ? null : level.id)}
                            className="rounded p-1 hover:bg-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-400 active:bg-blue-600/20 transition duration-150"
                            title={expanded === level.id ? 'Collapse level' : 'Expand level'}
                            aria-label={expanded === level.id ? 'Collapse level' : 'Expand level'}
                          >
                            {expanded === level.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                          <span className="font-semibold text-base flex-1 group-hover:text-blue-300 transition-colors duration-150">{highlight(level.title, searchTerm)}</span>
                          <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full group-hover:bg-purple-500 transition-colors duration-150" title="Milestones">{level.milestones?.length ?? 0} milestones</span>
                          <button className="p-1 rounded hover:bg-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-400 active:bg-blue-600/20 transition duration-150" onClick={() => handleEdit(level)} title="Edit level" aria-label="Edit level"><Edit2 className="w-4 h-4" /></button>
                          <button className="p-1 rounded hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-400 active:bg-red-600/20 transition duration-150" onClick={() => handleDelete(level.id)} title="Delete level" aria-label="Delete level"><Trash2 className="w-4 h-4" /></button>
                          <span {...provided.dragHandleProps} className="cursor-grab text-gray-400 hover:text-blue-400 ml-2 focus:outline-none focus:ring-2 focus:ring-blue-400 active:text-blue-600 transition duration-150" title="Drag to reorder" aria-label="Drag to reorder"><GripVertical className="w-4 h-4" /></span>
                        </div>
                        <div className={`overflow-hidden transition-all duration-300 ${expanded === level.id ? 'max-h-[1000px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}
                          aria-hidden={expanded !== level.id}
                        >
                          {expanded === level.id && (
                            <MilestoneTree roadmapId={roadmapId} levelId={level.id} onRefresh={onRefresh} searchTerm={searchTerm} />
                          )}
                        </div>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      )}
      {showModal && (
        <EntityModal
          type="level"
          initial={editing ? { title: editing.title } : {}}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
        />
      )}
    </div>
  );
};

export default LevelTree; 