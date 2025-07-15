import React, { useEffect, useState } from 'react';
import EntityModal from './EntityModal';
import type { Challenge } from '@/app/roadmaps/types';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Edit2, Trash2, Plus, GripVertical } from 'lucide-react';

interface ChallengeTreeProps {
  roadmapId: string;
  levelId: string;
  milestoneId: string;
  onRefresh: () => void;
  searchTerm?: string;
}

function highlight(text: string, term: string) {
  if (!term) return text;
  const idx = text.toLowerCase().indexOf(term.toLowerCase());
  if (idx === -1) return text;
  return <>{text.slice(0, idx)}<mark className="bg-yellow-200 px-0.5 rounded">{text.slice(idx, idx + term.length)}</mark>{text.slice(idx + term.length)}</>;
}

const ChallengeTree: React.FC<ChallengeTreeProps> = ({ roadmapId, levelId, milestoneId, onRefresh, searchTerm = '' }) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Challenge | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editType, setEditType] = useState<'quiz' | 'project' | 'reading'>('project');
  const [saving, setSaving] = useState(false);

  const fetchChallenges = () => {
    setLoading(true);
    fetch(`/api/roadmaps/${roadmapId}/levels/${levelId}/milestones/${milestoneId}/challenges`)
      .then(res => res.json())
      .then(setChallenges)
      .finally(() => setLoading(false));
  };
  useEffect(fetchChallenges, [roadmapId, levelId, milestoneId]);

  const handleAdd = () => {
    setEditing(null);
    setShowModal(true);
  };
  const handleEdit = (ch: Challenge) => {
    setEditing(ch);
    setShowModal(true);
  };
  const handleDelete = async (id: string) => {
    await fetch(`/api/roadmaps/${roadmapId}/levels/${levelId}/milestones/${milestoneId}/challenges/${id}`, { method: 'DELETE' });
    fetchChallenges();
    onRefresh();
  };
  const handleModalClose = (refresh = false) => {
    setShowModal(false);
    setEditing(null);
    if (refresh) {
      fetchChallenges();
      onRefresh();
    }
  };
  const handleModalSubmit = async (values: { title: string; description?: string; type?: string }) => {
    if (editing) {
      await fetch(`/api/roadmaps/${roadmapId}/levels/${levelId}/milestones/${milestoneId}/challenges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editing.id, title: values.title, description: values.description ?? '', type: values.type ?? 'project' })
      });
    } else {
      await fetch(`/api/roadmaps/${roadmapId}/levels/${levelId}/milestones/${milestoneId}/challenges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: values.title, description: values.description ?? '', type: values.type ?? 'project' })
      });
    }
  };

  const startEdit = (ch: Challenge) => {
    setEditingId(ch.id);
    setEditTitle(ch.title);
    setEditDescription(ch.description || '');
    setEditType(ch.type || 'project');
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditDescription('');
    setEditType('project');
  };
  const saveEdit = async (id: string) => {
    setSaving(true);
    await fetch(`/api/roadmaps/${roadmapId}/levels/${levelId}/milestones/${milestoneId}/challenges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, title: editTitle, description: editDescription, type: editType })
    });
    setSaving(false);
    setEditingId(null);
    setEditTitle('');
    setEditDescription('');
    setEditType('project');
    fetchChallenges();
    onRefresh();
  };

  // Drag & Drop
  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(challenges);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    // Update order in backend
    await fetch(`/api/roadmaps/${roadmapId}/levels/${levelId}/milestones/${milestoneId}/challenges/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: reordered.map((ch, idx) => ({ id: ch.id, order: idx + 1 })) })
    });
    fetchChallenges();
    onRefresh();
  };

  return (
    <div className="space-y-3">
      <div className="mb-2 flex justify-between items-center">
        <span className="font-semibold text-base flex items-center gap-2">Challenges <span className="bg-pink-600 text-white text-xs px-2 py-0.5 rounded-full">{challenges.length}</span></span>
        <button className="bg-pink-600 text-white px-3 py-1 rounded flex items-center gap-1 text-xs" onClick={handleAdd}><Plus className="w-4 h-4" /> Add Challenge</button>
      </div>
      {loading ? <div>Loading challenges...</div> : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId={`challenges-droppable-${milestoneId}`}>
            {(provided) => (
              <ul ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                {challenges.length === 0 && (
                  <li className="text-gray-400 italic text-sm py-2 text-center">No challenges yet.</li>
                )}
                {challenges.map((ch, idx) => (
                  <Draggable key={ch.id} draggableId={ch.id} index={idx}>
                    {(provided, snapshot) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`transition group bg-white/10 border border-white/10 rounded-lg p-3 flex items-center gap-2 shadow-sm hover:shadow-lg hover:-translate-y-1 focus-within:ring-2 focus-within:ring-pink-400 active:ring-2 active:ring-pink-500 duration-200 ${snapshot.isDragging ? 'ring-2 ring-pink-400' : ''}`}
                      >
                        {editingId === ch.id ? (
                          <form className="flex-1 flex flex-col md:flex-row gap-2 items-center animate-fade-in" onSubmit={e => { e.preventDefault(); saveEdit(ch.id); }}>
                            <input className="p-1 rounded bg-gray-900 border border-white/10 text-xs w-32 focus:ring-2 focus:ring-pink-400 transition duration-150" value={editTitle} onChange={e => setEditTitle(e.target.value)} required disabled={saving} />
                            <input className="p-1 rounded bg-gray-900 border border-white/10 text-xs w-48 focus:ring-2 focus:ring-pink-400 transition duration-150" value={editDescription} onChange={e => setEditDescription(e.target.value)} placeholder="Description" disabled={saving} />
                            <select className="p-1 rounded bg-gray-900 border border-white/10 text-xs w-24 focus:ring-2 focus:ring-pink-400 transition duration-150" value={editType} onChange={e => setEditType(e.target.value as any)} disabled={saving}>
                              <option value="project">Project</option>
                              <option value="quiz">Quiz</option>
                              <option value="reading">Reading</option>
                            </select>
                            <button type="submit" className="bg-pink-600 text-white px-2 py-1 rounded text-xs hover:bg-pink-700 focus:ring-2 focus:ring-pink-400 transition duration-150" disabled={saving}>Save</button>
                            <button type="button" className="bg-gray-700 text-white px-2 py-1 rounded text-xs hover:bg-gray-800 focus:ring-2 focus:ring-gray-400 transition duration-150" onClick={cancelEdit} disabled={saving}>Cancel</button>
                          </form>
                        ) : (
                          <>
                            <span className="font-semibold flex-1 group-hover:text-pink-300 transition-colors duration-150">{highlight(ch.title, searchTerm)}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white group-hover:from-pink-400 group-hover:to-purple-400 transition-colors duration-150`} title={ch.type}>{ch.type}</span>
                            <button className="p-1 rounded hover:bg-pink-500/20 focus:outline-none focus:ring-2 focus:ring-pink-400 active:bg-pink-600/20 transition duration-150" onClick={() => startEdit(ch)} title="Edit challenge" aria-label="Edit challenge"><Edit2 className="w-4 h-4" /></button>
                            <button className="p-1 rounded hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-400 active:bg-red-600/20 transition duration-150" onClick={() => handleDelete(ch.id)} title="Delete challenge" aria-label="Delete challenge"><Trash2 className="w-4 h-4" /></button>
                            <span {...provided.dragHandleProps} className="cursor-grab text-gray-400 hover:text-pink-400 ml-2 focus:outline-none focus:ring-2 focus:ring-pink-400 active:text-pink-600 transition duration-150" title="Drag to reorder" aria-label="Drag to reorder"><GripVertical className="w-4 h-4" /></span>
                          </>
                        )}
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
          type="challenge"
          initial={editing ? { title: editing.title, description: editing.description, type: editing.type } : {}}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
        />
      )}
    </div>
  );
};

export default ChallengeTree; 