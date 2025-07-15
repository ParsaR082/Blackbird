import React, { useEffect, useState } from 'react';
import ChallengeTree from './ChallengeTree';
import EntityModal from './EntityModal';
import type { Milestone } from '@/app/roadmaps/types';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { ChevronDown, ChevronRight, Edit2, Trash2, Plus, GripVertical } from 'lucide-react';

interface MilestoneTreeProps {
  roadmapId: string;
  levelId: string;
  onRefresh: () => void;
  searchTerm?: string;
}

function highlight(text: string, term: string) {
  if (!term) return text;
  const idx = text.toLowerCase().indexOf(term.toLowerCase());
  if (idx === -1) return text;
  return <>{text.slice(0, idx)}<mark className="bg-yellow-200 px-0.5 rounded">{text.slice(idx, idx + term.length)}</mark>{text.slice(idx + term.length)}</>;
}

const MilestoneTree: React.FC<MilestoneTreeProps> = ({ roadmapId, levelId, onRefresh, searchTerm = '' }) => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Milestone | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchMilestones = () => {
    setLoading(true);
    fetch(`/api/roadmaps/${roadmapId}/levels/${levelId}/milestones`)
      .then(res => res.json())
      .then(setMilestones)
      .finally(() => setLoading(false));
  };
  useEffect(fetchMilestones, [roadmapId, levelId]);

  const handleAdd = () => {
    setEditing(null);
    setShowModal(true);
  };
  const handleEdit = (ms: Milestone) => {
    setEditing(ms);
    setShowModal(true);
  };
  const handleDelete = async (id: string) => {
    await fetch(`/api/roadmaps/${roadmapId}/levels/${levelId}/milestones/${id}`, { method: 'DELETE' });
    fetchMilestones();
    onRefresh();
  };
  const handleModalClose = (refresh = false) => {
    setShowModal(false);
    setEditing(null);
    if (refresh) {
      fetchMilestones();
      onRefresh();
    }
  };
  const handleModalSubmit = async (values: { title: string; description?: string }) => {
    if (editing) {
      await fetch(`/api/roadmaps/${roadmapId}/levels/${levelId}/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editing.id, title: values.title, description: values.description ?? '', challenges: [] })
      });
    } else {
      await fetch(`/api/roadmaps/${roadmapId}/levels/${levelId}/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: values.title, description: values.description ?? '', challenges: [] })
      });
    }
  };

  const startEdit = (ms: Milestone) => {
    setEditingId(ms.id);
    setEditTitle(ms.title);
    setEditDescription(ms.description || '');
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditDescription('');
  };
  const saveEdit = async (id: string) => {
    setSaving(true);
    await fetch(`/api/roadmaps/${roadmapId}/levels/${levelId}/milestones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, title: editTitle, description: editDescription })
    });
    setSaving(false);
    setEditingId(null);
    setEditTitle('');
    setEditDescription('');
    fetchMilestones();
    onRefresh();
  };

  // Drag & Drop
  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(milestones);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    // Update order in backend
    await fetch(`/api/roadmaps/${roadmapId}/levels/${levelId}/milestones/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: reordered.map((ms, idx) => ({ id: ms.id, order: idx + 1 })) })
    });
    fetchMilestones();
    onRefresh();
  };

  return (
    <div className="space-y-3">
      <div className="mb-2 flex justify-between items-center">
        <span className="font-semibold text-base flex items-center gap-2">Milestones <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">{milestones.length}</span></span>
        <button className="bg-purple-600 text-white px-3 py-1 rounded flex items-center gap-1 text-xs" onClick={handleAdd}><Plus className="w-4 h-4" /> Add Milestone</button>
      </div>
      {loading ? <div>Loading milestones...</div> : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId={`milestones-droppable-${levelId}`}>
            {(provided) => (
              <ul ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                {milestones.length === 0 && (
                  <li className="text-gray-400 italic text-sm py-2 text-center">No milestones yet.</li>
                )}
                {milestones.map((ms, idx) => (
                  <Draggable key={ms.id} draggableId={ms.id} index={idx}>
                    {(provided, snapshot) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`transition group bg-white/10 border border-white/10 rounded-lg p-3 flex flex-col shadow-sm hover:shadow-lg hover:-translate-y-1 focus-within:ring-2 focus-within:ring-purple-400 active:ring-2 active:ring-purple-500 duration-200 ${snapshot.isDragging ? 'ring-2 ring-purple-400' : ''}`}
                      >
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setExpanded(expanded === ms.id ? null : ms.id)}
                            className="rounded p-1 hover:bg-purple-500/10 focus:outline-none focus:ring-2 focus:ring-purple-400 active:bg-purple-600/20 transition duration-150"
                            title={expanded === ms.id ? 'Collapse milestone' : 'Expand milestone'}
                            aria-label={expanded === ms.id ? 'Collapse milestone' : 'Expand milestone'}
                          >
                            {expanded === ms.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                          {editingId === ms.id ? (
                            <form className="flex-1 flex flex-col md:flex-row gap-2 items-center animate-fade-in" onSubmit={e => { e.preventDefault(); saveEdit(ms.id); }}>
                              <input className="p-1 rounded bg-gray-900 border border-white/10 text-xs w-32 focus:ring-2 focus:ring-purple-400 transition duration-150" value={editTitle} onChange={e => setEditTitle(e.target.value)} required disabled={saving} />
                              <input className="p-1 rounded bg-gray-900 border border-white/10 text-xs w-48 focus:ring-2 focus:ring-purple-400 transition duration-150" value={editDescription} onChange={e => setEditDescription(e.target.value)} placeholder="Description" disabled={saving} />
                              <button type="submit" className="bg-purple-600 text-white px-2 py-1 rounded text-xs hover:bg-purple-700 focus:ring-2 focus:ring-purple-400 transition duration-150" disabled={saving}>Save</button>
                              <button type="button" className="bg-gray-700 text-white px-2 py-1 rounded text-xs hover:bg-gray-800 focus:ring-2 focus:ring-gray-400 transition duration-150" onClick={cancelEdit} disabled={saving}>Cancel</button>
                            </form>
                          ) : (
                            <>
                              <span className="font-semibold text-base flex-1 group-hover:text-purple-300 transition-colors duration-150">{highlight(ms.title, searchTerm)}</span>
                              <span className="bg-pink-600 text-white text-xs px-2 py-0.5 rounded-full group-hover:bg-pink-500 transition-colors duration-150" title="Challenges">{ms.challenges?.length ?? 0} challenges</span>
                              <button className="p-1 rounded hover:bg-purple-500/20 focus:outline-none focus:ring-2 focus:ring-purple-400 active:bg-purple-600/20 transition duration-150" onClick={() => startEdit(ms)} title="Edit milestone" aria-label="Edit milestone"><Edit2 className="w-4 h-4" /></button>
                              <button className="p-1 rounded hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-400 active:bg-red-600/20 transition duration-150" onClick={() => handleDelete(ms.id)} title="Delete milestone" aria-label="Delete milestone"><Trash2 className="w-4 h-4" /></button>
                              <span {...provided.dragHandleProps} className="cursor-grab text-gray-400 hover:text-purple-400 ml-2 focus:outline-none focus:ring-2 focus:ring-purple-400 active:text-purple-600 transition duration-150" title="Drag to reorder" aria-label="Drag to reorder"><GripVertical className="w-4 h-4" /></span>
                            </>
                          )}
                        </div>
                        <div className={`overflow-hidden transition-all duration-300 ${expanded === ms.id ? 'max-h-[1000px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}
                          aria-hidden={expanded !== ms.id}
                        >
                          {expanded === ms.id && (
                            <ChallengeTree roadmapId={roadmapId} levelId={levelId} milestoneId={ms.id} onRefresh={onRefresh} searchTerm={searchTerm} />
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
          type="milestone"
          initial={editing ? { title: editing.title, description: editing.description } : {}}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
        />
      )}
    </div>
  );
};

export default MilestoneTree; 