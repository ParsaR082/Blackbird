import React, { useEffect, useState } from 'react';
import type { Roadmap, Level, Milestone, Challenge } from '@/app/roadmaps/types';

export default function RoadmapsManager() {
  // Top-level state for roadmaps
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  // Levels management
  const [managingLevelsId, setManagingLevelsId] = useState<string | null>(null);
  const [levels, setLevels] = useState<Level[]>([]);
  const [levelsLoading, setLevelsLoading] = useState(false);
  const [newLevelTitle, setNewLevelTitle] = useState('');
  const [newLevelOrder, setNewLevelOrder] = useState(1);
  const [editingLevelId, setEditingLevelId] = useState<string | null>(null);
  const [editLevelTitle, setEditLevelTitle] = useState('');
  const [editLevelOrder, setEditLevelOrder] = useState(1);
  const [managingMilestonesLevelId, setManagingMilestonesLevelId] = useState<string | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [milestonesLoading, setMilestonesLoading] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDesc, setNewMilestoneDesc] = useState('');
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [editMilestoneTitle, setEditMilestoneTitle] = useState('');
  const [editMilestoneDesc, setEditMilestoneDesc] = useState('');
  const [managingChallengesMilestoneId, setManagingChallengesMilestoneId] = useState<string | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [challengesLoading, setChallengesLoading] = useState(false);
  const [newChallengeTitle, setNewChallengeTitle] = useState('');
  const [newChallengeDesc, setNewChallengeDesc] = useState('');
  const [newChallengeType, setNewChallengeType] = useState<'quiz' | 'project' | 'reading'>('project');
  const [editingChallengeId, setEditingChallengeId] = useState<string | null>(null);
  const [editChallengeTitle, setEditChallengeTitle] = useState('');
  const [editChallengeDesc, setEditChallengeDesc] = useState('');
  const [editChallengeType, setEditChallengeType] = useState<'quiz' | 'project' | 'reading'>('project');

  // Fetch all roadmaps
  const fetchRoadmaps = () => {
    setLoading(true);
    fetch('/api/roadmaps')
      .then(res => res.json())
      .then(data => setRoadmaps(data))
      .catch(() => setError('Failed to load roadmaps'))
      .finally(() => setLoading(false));
  };
  useEffect(fetchRoadmaps, []);

  // Add a new roadmap
  const handleAddRoadmap = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/roadmaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, description: newDescription, icon: 'map', visibility: 'public', levels: [] })
      });
      if (!res.ok) throw new Error('Failed to add roadmap');
      setNewTitle('');
      setNewDescription('');
      fetchRoadmaps();
    } catch (e) {
      setError('Failed to add roadmap');
    } finally {
      setLoading(false);
    }
  };

  // Edit roadmap
  const startEdit = (rm: Roadmap) => {
    setEditingId(rm.id);
    setEditTitle(rm.title);
    setEditDescription(rm.description);
  };
  const handleEditRoadmap = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      // PATCH endpoint not implemented, so use POST for mock
      await fetch('/api/roadmaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, title: editTitle, description: editDescription, icon: 'map', visibility: 'public', levels: [] })
      });
      setEditingId(null);
      fetchRoadmaps();
    } catch (e) {
      setError('Failed to edit roadmap');
    } finally {
      setLoading(false);
    }
  };

  // Delete roadmap
  const handleDeleteRoadmap = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      // DELETE endpoint not implemented, so just filter for mock
      setRoadmaps(roadmaps.filter(r => r.id !== id));
    } catch (e) {
      setError('Failed to delete roadmap');
    } finally {
      setLoading(false);
    }
  };

  // Manage levels
  const handleManageLevels = async (roadmapId: string) => {
    setManagingLevelsId(roadmapId);
    setLevelsLoading(true);
    try {
      const res = await fetch(`/api/roadmaps/${roadmapId}/levels`);
      const data = await res.json();
      setLevels(data);
    } catch {
      setError('Failed to load levels');
    } finally {
      setLevelsLoading(false);
    }
  };

  if (managingLevelsId) {
    // Add level
    const handleAddLevel = async () => {
      setLevelsLoading(true);
      try {
        await fetch(`/api/roadmaps/${managingLevelsId}/levels`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: newLevelTitle, order: newLevelOrder, milestones: [] })
        });
        setNewLevelTitle('');
        setNewLevelOrder(1);
        // Refresh
        const res = await fetch(`/api/roadmaps/${managingLevelsId}/levels`);
        setLevels(await res.json());
      } finally {
        setLevelsLoading(false);
      }
    };

    // Edit level
    const startEditLevel = (lvl: Level) => {
      setEditingLevelId(lvl.id);
      setEditLevelTitle(lvl.title);
      setEditLevelOrder(lvl.order);
    };
    const handleEditLevel = async (id: string) => {
      setLevelsLoading(true);
      try {
        await fetch(`/api/roadmaps/${managingLevelsId}/levels`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, title: editLevelTitle, order: editLevelOrder, milestones: [] })
        });
        setEditingLevelId(null);
        const res = await fetch(`/api/roadmaps/${managingLevelsId}/levels`);
        setLevels(await res.json());
      } finally {
        setLevelsLoading(false);
      }
    };
    // Delete level
    const handleDeleteLevel = async (id: string) => {
      setLevelsLoading(true);
      try {
        setLevels(levels.filter(l => l.id !== id));
      } finally {
        setLevelsLoading(false);
      }
    };
    // Manage milestones
    const handleManageMilestones = async (levelId: string) => {
      setManagingMilestonesLevelId(levelId);
      setMilestonesLoading(true);
      try {
        const res = await fetch(`/api/roadmaps/${managingLevelsId}/levels/${levelId}/milestones`);
        setMilestones(await res.json());
      } finally {
        setMilestonesLoading(false);
      }
    };
    // Milestones view
    if (managingMilestonesLevelId) {
      // Add milestone
      const handleAddMilestone = async () => {
        setMilestonesLoading(true);
        try {
          await fetch(`/api/roadmaps/${managingLevelsId}/levels/${managingMilestonesLevelId}/milestones`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: newMilestoneTitle, description: newMilestoneDesc, challenges: [] })
          });
          setNewMilestoneTitle('');
          setNewMilestoneDesc('');
          // Refresh
          const res = await fetch(`/api/roadmaps/${managingLevelsId}/levels/${managingMilestonesLevelId}/milestones`);
          setMilestones(await res.json());
        } finally {
          setMilestonesLoading(false);
        }
      };

      // Edit milestone
      const startEditMilestone = (ms: Milestone) => {
        setEditingMilestoneId(ms.id);
        setEditMilestoneTitle(ms.title);
        setEditMilestoneDesc(ms.description);
      };
      const handleEditMilestone = async (id: string) => {
        setMilestonesLoading(true);
        try {
          await fetch(`/api/roadmaps/${managingLevelsId}/levels/${managingMilestonesLevelId}/milestones`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, title: editMilestoneTitle, description: editMilestoneDesc, challenges: [] })
          });
          setEditingMilestoneId(null);
          const res = await fetch(`/api/roadmaps/${managingLevelsId}/levels/${managingMilestonesLevelId}/milestones`);
          setMilestones(await res.json());
        } finally {
          setMilestonesLoading(false);
        }
      };
      // Delete milestone
      const handleDeleteMilestone = async (id: string) => {
        setMilestonesLoading(true);
        try {
          setMilestones(milestones.filter(m => m.id !== id));
        } finally {
          setMilestonesLoading(false);
        }
      };
      // Manage challenges
      const handleManageChallenges = async (milestoneId: string) => {
        setManagingChallengesMilestoneId(milestoneId);
        setChallengesLoading(true);
        try {
          const res = await fetch(`/api/roadmaps/${managingLevelsId}/levels/${managingMilestonesLevelId}/milestones/${milestoneId}/challenges`);
          setChallenges(await res.json());
        } finally {
          setChallengesLoading(false);
        }
      };
      // Challenges view
      if (managingChallengesMilestoneId) {
        // Add challenge
        const handleAddChallenge = async () => {
          setChallengesLoading(true);
          try {
            await fetch(`/api/roadmaps/${managingLevelsId}/levels/${managingMilestonesLevelId}/milestones/${managingChallengesMilestoneId}/challenges`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title: newChallengeTitle, description: newChallengeDesc, type: newChallengeType })
            });
            setNewChallengeTitle('');
            setNewChallengeDesc('');
            setNewChallengeType('project');
            // Refresh
            const res = await fetch(`/api/roadmaps/${managingLevelsId}/levels/${managingMilestonesLevelId}/milestones/${managingChallengesMilestoneId}/challenges`);
            setChallenges(await res.json());
          } finally {
            setChallengesLoading(false);
          }
        };
        // Edit challenge
        const startEditChallenge = (ch: Challenge) => {
          setEditingChallengeId(ch.id);
          setEditChallengeTitle(ch.title);
          setEditChallengeDesc(ch.description);
          setEditChallengeType(ch.type);
        };
        const handleEditChallenge = async (id: string) => {
          setChallengesLoading(true);
          try {
            await fetch(`/api/roadmaps/${managingLevelsId}/levels/${managingMilestonesLevelId}/milestones/${managingChallengesMilestoneId}/challenges`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id, title: editChallengeTitle, description: editChallengeDesc, type: editChallengeType })
            });
            setEditingChallengeId(null);
            const res = await fetch(`/api/roadmaps/${managingLevelsId}/levels/${managingMilestonesLevelId}/milestones/${managingChallengesMilestoneId}/challenges`);
            setChallenges(await res.json());
          } finally {
            setChallengesLoading(false);
          }
        };
        // Delete challenge
        const handleDeleteChallenge = async (id: string) => {
          setChallengesLoading(true);
          try {
            setChallenges(challenges.filter(c => c.id !== id));
          } finally {
            setChallengesLoading(false);
          }
        };
        return (
          <div className="p-6">
            <button className="mb-4 text-blue-500" onClick={() => setManagingChallengesMilestoneId(null)}>← Back to Milestones</button>
            <h5 className="text-lg font-bold mb-4">Manage Challenges for Milestone: {milestones.find(m => m.id === managingChallengesMilestoneId)?.title}</h5>
            <div className="mb-4">
              <input className="border p-1 mr-2" placeholder="Challenge Title" value={newChallengeTitle} onChange={e => setNewChallengeTitle(e.target.value)} />
              <input className="border p-1 mr-2" placeholder="Description" value={newChallengeDesc} onChange={e => setNewChallengeDesc(e.target.value)} />
              <select className="border p-1 mr-2" value={newChallengeType} onChange={e => setNewChallengeType(e.target.value as any)}>
                <option value="project">Project</option>
                <option value="quiz">Quiz</option>
                <option value="reading">Reading</option>
              </select>
              <button className="bg-blue-500 text-white px-2 py-1 rounded" onClick={handleAddChallenge} disabled={challengesLoading || !newChallengeTitle}>Add Challenge</button>
            </div>
            {challengesLoading ? <div>Loading challenges...</div> : (
              <ul>
                {challenges.map(ch => (
                  <li key={ch.id} className="mb-2 border-b pb-2 flex items-center gap-2">
                    {editingChallengeId === ch.id ? (
                      <>
                        <input className="border p-1 mr-2" value={editChallengeTitle} onChange={e => setEditChallengeTitle(e.target.value)} />
                        <input className="border p-1 mr-2" value={editChallengeDesc} onChange={e => setEditChallengeDesc(e.target.value)} />
                        <select className="border p-1 mr-2" value={editChallengeType} onChange={e => setEditChallengeType(e.target.value as any)}>
                          <option value="project">Project</option>
                          <option value="quiz">Quiz</option>
                          <option value="reading">Reading</option>
                        </select>
                        <button className="bg-green-500 text-white px-2 py-1 rounded" onClick={() => handleEditChallenge(ch.id)}>Save</button>
                        <button className="bg-gray-300 px-2 py-1 rounded" onClick={() => setEditingChallengeId(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <span className="font-semibold">{ch.title}</span> - {ch.description} ({ch.type})
                        <button className="ml-2 text-blue-500 underline" onClick={() => startEditChallenge(ch)}>Edit</button>
                        <button className="ml-2 text-red-500 underline" onClick={() => handleDeleteChallenge(ch.id)}>Delete</button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      }
      // Milestones view
      return (
        <div className="p-6">
          <button className="mb-4 text-blue-500" onClick={() => setManagingMilestonesLevelId(null)}>← Back to Levels</button>
          <h4 className="text-lg font-bold mb-4">Manage Milestones for Level: {levels.find(l => l.id === managingMilestonesLevelId)?.title}</h4>
          <div className="mb-4">
            <input className="border p-1 mr-2" placeholder="Milestone Title" value={newMilestoneTitle} onChange={e => setNewMilestoneTitle(e.target.value)} />
            <input className="border p-1 mr-2" placeholder="Description" value={newMilestoneDesc} onChange={e => setNewMilestoneDesc(e.target.value)} />
            <button className="bg-blue-500 text-white px-2 py-1 rounded" onClick={handleAddMilestone} disabled={milestonesLoading || !newMilestoneTitle}>Add Milestone</button>
          </div>
          {milestonesLoading ? <div>Loading milestones...</div> : (
            <ul>
              {milestones.map(ms => (
                <li key={ms.id} className="mb-2 border-b pb-2 flex items-center gap-2">
                  {editingMilestoneId === ms.id ? (
                    <>
                      <input className="border p-1 mr-2" value={editMilestoneTitle} onChange={e => setEditMilestoneTitle(e.target.value)} />
                      <input className="border p-1 mr-2" value={editMilestoneDesc} onChange={e => setEditMilestoneDesc(e.target.value)} />
                      <button className="bg-green-500 text-white px-2 py-1 rounded" onClick={() => handleEditMilestone(ms.id)}>Save</button>
                      <button className="bg-gray-300 px-2 py-1 rounded" onClick={() => setEditingMilestoneId(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <span className="font-semibold">{ms.title}</span> - {ms.description}
                      <button className="ml-2 text-blue-500 underline" onClick={() => startEditMilestone(ms)}>Edit</button>
                      <button className="ml-2 text-red-500 underline" onClick={() => handleDeleteMilestone(ms.id)}>Delete</button>
                      <button className="ml-2 text-purple-500 underline" onClick={() => handleManageChallenges(ms.id)}>Manage Challenges</button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }
    // Levels view
    return (
      <div className="p-6">
        <button className="mb-4 text-blue-500" onClick={() => setManagingLevelsId(null)}>← Back to Roadmaps</button>
        <h3 className="text-xl font-bold mb-4">Manage Levels for Roadmap: {roadmaps.find(r => r.id === managingLevelsId)?.title}</h3>
        <div className="mb-4">
          <input className="border p-1 mr-2" placeholder="Level Title" value={newLevelTitle} onChange={e => setNewLevelTitle(e.target.value)} />
          <input className="border p-1 mr-2" type="number" min={1} placeholder="Order" value={newLevelOrder} onChange={e => setNewLevelOrder(Number(e.target.value))} />
          <button className="bg-blue-500 text-white px-2 py-1 rounded" onClick={handleAddLevel} disabled={levelsLoading || !newLevelTitle}>Add Level</button>
        </div>
        {levelsLoading ? <div>Loading levels...</div> : (
          <ul>
            {levels.map(lvl => (
              <li key={lvl.id} className="mb-2 border-b pb-2 flex items-center gap-2">
                {editingLevelId === lvl.id ? (
                  <>
                    <input className="border p-1 mr-2" value={editLevelTitle} onChange={e => setEditLevelTitle(e.target.value)} />
                    <input className="border p-1 mr-2" type="number" min={1} value={editLevelOrder} onChange={e => setEditLevelOrder(Number(e.target.value))} />
                    <button className="bg-green-500 text-white px-2 py-1 rounded" onClick={() => handleEditLevel(lvl.id)}>Save</button>
                    <button className="bg-gray-300 px-2 py-1 rounded" onClick={() => setEditingLevelId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <span className="font-semibold">{lvl.title}</span> (Level {lvl.order})
                    <button className="ml-2 text-blue-500 underline" onClick={() => startEditLevel(lvl)}>Edit</button>
                    <button className="ml-2 text-red-500 underline" onClick={() => handleDeleteLevel(lvl.id)}>Delete</button>
                    <button className="ml-2 text-purple-500 underline" onClick={() => handleManageMilestones(lvl.id)}>Manage Milestones</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Roadmaps Manager (Admin)</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <div className="mb-6">
        <input
          className="border p-2 mr-2"
          placeholder="Roadmap Title"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
        />
        <input
          className="border p-2 mr-2"
          placeholder="Description"
          value={newDescription}
          onChange={e => setNewDescription(e.target.value)}
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleAddRoadmap} disabled={loading || !newTitle}>Add Roadmap</button>
      </div>
      <ul>
        {roadmaps.map(rm => (
          <li key={rm.id} className="mb-2 border-b pb-2 flex items-center gap-2">
            {editingId === rm.id ? (
              <>
                <input className="border p-1 mr-2" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                <input className="border p-1 mr-2" value={editDescription} onChange={e => setEditDescription(e.target.value)} />
                <button className="bg-green-500 text-white px-2 py-1 rounded" onClick={() => handleEditRoadmap(rm.id)}>Save</button>
                <button className="bg-gray-300 px-2 py-1 rounded" onClick={() => setEditingId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <span className="font-semibold">{rm.title}</span> - {rm.description}
                <button className="ml-2 text-blue-500 underline" onClick={() => startEdit(rm)}>Edit</button>
                <button className="ml-2 text-red-500 underline" onClick={() => handleDeleteRoadmap(rm.id)}>Delete</button>
                <button className="ml-2 text-purple-500 underline" onClick={() => handleManageLevels(rm.id)}>Manage Levels</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
} 