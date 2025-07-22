import React, { useEffect, useRef, useState } from 'react';
import type { Roadmap, Level, Milestone, Challenge } from '@/app/roadmaps/types';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  ChevronDown, 
  ChevronRight, 
  GripVertical,
  BookOpen,
  Target,
  Award,
  Calendar,
  FileText,
  Code,
  Video,
  Link,
  Eye,
  EyeOff,
  Settings
} from 'lucide-react';

type RoadmapWithMongoId = Roadmap & { _id?: string };

interface AddEditModalProps {
  roadmap: RoadmapWithMongoId | null;
  onClose: (refresh?: boolean) => void;
}

const AddEditModal: React.FC<AddEditModalProps> = ({ roadmap, onClose }) => {
  const [title, setTitle] = useState(roadmap?.title || '');
  const [description, setDescription] = useState(roadmap?.description || '');
  const [visibility, setVisibility] = useState<'public' | 'private'>(roadmap?.visibility || 'public');
  const [icon, setIcon] = useState(roadmap?.icon || '🗺️');
  const [levels, setLevels] = useState<Level[]>(roadmap?.levels || []);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'levels' | 'preview'>('details');
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set());
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(new Set());
  const [editingLevel, setEditingLevel] = useState<string | null>(null);
  const [editingMilestone, setEditingMilestone] = useState<string | null>(null);
  const [editingChallenge, setEditingChallenge] = useState<string | null>(null);
  
  const isEdit = !!roadmap;
  const modalRef = useRef<HTMLDivElement>(null);

  const icons = ['🗺️', '📚', '💻', '🎯', '🚀', '⭐', '🎓', '🔧', '🎨', '📊', '🌐', '📱', '🎮', '🎵', '📹', '📝'];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const addLevel = () => {
    const newLevel: Level = {
      id: `level_${Date.now()}`,
      title: `Level ${levels.length + 1}`,
      order: levels.length + 1,
      milestones: [],
      unlockRequirements: ''
    };
    setLevels([...levels, newLevel]);
    setExpandedLevels(prev => {
      const arr = Array.from(prev);
      arr.push(newLevel.id);
      return new Set(arr);
    });
  };

  const updateLevel = (levelId: string, updates: Partial<Level>) => {
    setLevels(prev => prev.map(level => 
      level.id === levelId ? { ...level, ...updates } : level
    ));
  };

  const deleteLevel = (levelId: string) => {
    setLevels(prev => prev.filter(level => level.id !== levelId));
    setExpandedLevels(prev => {
      const arr = Array.from(prev);
      return new Set(arr.filter(id => id !== levelId));
    });
  };

  const addMilestone = (levelId: string) => {
    const level = levels.find(l => l.id === levelId);
    if (!level) return;

    const newMilestone: Milestone = {
      id: `milestone_${Date.now()}`,
      title: `Milestone ${level.milestones.length + 1}`,
      description: '',
      challenges: [],
      dueDate: '',
      reward: ''
    };

    updateLevel(levelId, {
      milestones: [...level.milestones, newMilestone]
    });
    setExpandedMilestones(prev => new Set([...Array.from(prev), newMilestone.id]));
  };

  const updateMilestone = (levelId: string, milestoneId: string, updates: Partial<Milestone>) => {
    setLevels(prev => prev.map(level => {
      if (level.id !== levelId) return level;
      return {
        ...level,
        milestones: Array.isArray(level.milestones)
          ? level.milestones.map(milestone =>
              milestone.id === milestoneId ? { ...milestone, ...updates } : milestone
            )
          : []
      };
    }));
  };

  const deleteMilestone = (levelId: string, milestoneId: string) => {
    setLevels(prev => prev.map(level => {
      if (level.id !== levelId) return level;
      return {
        ...level,
        milestones: level.milestones.filter(m => m.id !== milestoneId)
      };
    }));
  };

  const addChallenge = (levelId: string, milestoneId: string) => {
    const level = levels.find(l => l.id === levelId);
    if (!level) return;
    
    const milestone = level.milestones.find(m => m.id === milestoneId);
    if (!milestone) return;

    const newChallenge: Challenge = {
      id: `challenge_${Date.now()}`,
      title: `Challenge ${milestone.challenges.length + 1}`,
      description: '',
      type: 'project',
      resources: []
    };

    updateMilestone(levelId, milestoneId, {
      challenges: [...milestone.challenges, newChallenge]
    });
  };

  const updateChallenge = (levelId: string, milestoneId: string, challengeId: string, updates: Partial<Challenge>) => {
    setLevels(prev => prev.map(level => {
      if (level.id !== levelId) return level;
      return {
        ...level,
        milestones: level.milestones.map(milestone => {
          if (milestone.id !== milestoneId) return milestone;
          return {
            ...milestone,
            challenges: milestone.challenges.map(challenge =>
              challenge.id === challengeId ? { ...challenge, ...updates } : challenge
            )
          };
        })
      };
    }));
  };

  const deleteChallenge = (levelId: string, milestoneId: string, challengeId: string) => {
    setLevels(prev => prev.map(level => {
      if (level.id !== levelId) return level;
      return {
        ...level,
        milestones: level.milestones.map(milestone => {
          if (milestone.id !== milestoneId) return milestone;
          return {
            ...milestone,
            challenges: milestone.challenges.filter(c => c.id !== challengeId)
          };
        })
      };
    }));
  };

  const toggleLevelExpansion = (levelId: string) => {
    setExpandedLevels(prev => {
      const arr = Array.from(prev);
      if (arr.includes(levelId)) {
        return new Set(arr.filter(id => id !== levelId));
      } else {
        arr.push(levelId);
        return new Set(arr);
      }
    });
  };

  const toggleMilestoneExpansion = (milestoneId: string) => {
    setExpandedMilestones(prev => {
      const arr = Array.from(prev);
      if (arr.includes(milestoneId)) {
        return new Set(arr.filter(id => id !== milestoneId));
      } else {
        arr.push(milestoneId);
        return new Set(arr);
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // حذف id از همه سطوح حتی در حالت ویرایش
      const cleanLevels = levels.map((level, index) => ({
        title: level.title,
        order: index + 1,
        unlockRequirements: level.unlockRequirements,
        milestones: level.milestones.map(milestone => ({
          title: milestone.title,
          description: milestone.description,
          dueDate: milestone.dueDate,
          reward: milestone.reward,
          challenges: milestone.challenges.map(challenge => ({
            title: challenge.title,
            description: challenge.description,
            type: challenge.type,
            resources: challenge.resources || []
          }))
        }))
      }));
      const roadmapData = {
        ...(isEdit ? { id: roadmap?._id || roadmap?.id } : {}),
        title,
        description,
        icon,
        visibility,
        levels: cleanLevels
      };

      const response = await fetch('/api/roadmaps', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roadmapData)
      });

      if (!response.ok) {
        throw new Error('Failed to save roadmap');
      }

      onClose(true);
    } catch (error) {
      console.error('Error saving roadmap:', error);
      alert('Failed to save roadmap. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'quiz': return <FileText className="w-4 h-4" />;
      case 'project': return <Code className="w-4 h-4" />;
      case 'reading': return <BookOpen className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" ref={modalRef}>
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {isEdit ? 'Edit Roadmap' : 'Create New Roadmap'}
            </h2>
            <p className="text-gray-400 mt-1">
              {isEdit ? 'Update your roadmap details and structure' : 'Design a comprehensive learning roadmap with levels, milestones, and challenges'}
            </p>
          </div>
          <button
            onClick={() => onClose(false)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {[
            { id: 'details', label: 'Basic Details', icon: Settings },
            { id: 'levels', label: 'Levels & Structure', icon: Target },
            { id: 'preview', label: 'Preview', icon: Eye }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {activeTab === 'details' && (
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Roadmap Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter roadmap title..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Icon
                  </label>
                  <div className="grid grid-cols-8 gap-2">
                    {icons.map((iconOption) => (
                      <button
                        key={iconOption}
                        type="button"
                        onClick={() => setIcon(iconOption)}
                        className={`p-2 rounded-lg border-2 transition-colors ${
                          icon === iconOption
                            ? 'border-blue-500 bg-blue-500/20'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <span className="text-lg">{iconOption}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe what this roadmap covers..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Visibility
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="public"
                      checked={visibility === 'public'}
                      onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
                      className="accent-blue-500"
                    />
                    <Eye className="w-4 h-4 text-green-400" />
                    <span className="text-white">Public</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="private"
                      checked={visibility === 'private'}
                      onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
                      className="accent-blue-500"
                    />
                    <EyeOff className="w-4 h-4 text-gray-400" />
                    <span className="text-white">Private</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'levels' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Levels & Structure</h3>
                <button
                  onClick={addLevel}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Level
                </button>
              </div>

              {levels.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-400 mb-2">No Levels Yet</h4>
                  <p className="text-gray-500 mb-4">Start by adding your first level to structure your roadmap</p>
                  <button
                    onClick={addLevel}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Add First Level
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {levels.map((level, levelIndex) => (
                    <div key={level.id} className="bg-gray-800 border border-gray-700 rounded-lg">
                      {/* Level Header */}
                      <div className="flex items-center gap-3 p-4 border-b border-gray-700">
                        <button
                          onClick={() => toggleLevelExpansion(level.id)}
                          className="p-1 hover:bg-gray-700 rounded"
                        >
                          {expandedLevels.has(level.id) ? (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                        
                        <div className="flex-1">
                          {editingLevel === level.id ? (
                            <input
                              type="text"
                              value={level.title}
                              onChange={(e) => updateLevel(level.id, { title: e.target.value })}
                              onBlur={() => setEditingLevel(null)}
                              onKeyDown={(e) => e.key === 'Enter' && setEditingLevel(null)}
                              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              autoFocus
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-medium text-white">{level.title}</span>
                              <button
                                onClick={() => setEditingLevel(level.id)}
                                className="p-1 hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Edit3 className="w-3 h-3 text-gray-400" />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => addMilestone(level.id)}
                            className="p-2 hover:bg-gray-700 rounded text-blue-400 hover:text-blue-300"
                            title="Add milestone"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteLevel(level.id)}
                            className="p-2 hover:bg-gray-700 rounded text-red-400 hover:text-red-300"
                            title="Delete level"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Level Content */}
                      {expandedLevels.has(level.id) && (
                        <div className="p-4 space-y-4">
                          {/* Level Description */}
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Unlock Requirements
                            </label>
                            <input
                              type="text"
                              value={level.unlockRequirements || ''}
                              onChange={(e) => updateLevel(level.id, { unlockRequirements: e.target.value })}
                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="What's required to unlock this level?"
                            />
                          </div>

                          {/* Milestones */}
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-md font-medium text-white">Milestones</h4>
                              <span className="text-sm text-gray-400">{level.milestones.length} milestone(s)</span>
                            </div>
                            
                            {level.milestones.length === 0 ? (
                              <div className="text-center py-6 bg-gray-700/50 rounded-lg">
                                <Award className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                                <p className="text-gray-400 text-sm">No milestones yet</p>
                                <button
                                  onClick={() => addMilestone(level.id)}
                                  className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
                                >
                                  Add first milestone
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {level.milestones.map((milestone, milestoneIndex) => (
                                  <div key={milestone.id} className="bg-gray-700 border border-gray-600 rounded-lg">
                                    {/* Milestone Header */}
                                    <div className="flex items-center gap-3 p-3 border-b border-gray-600">
                                      <button
                                        onClick={() => toggleMilestoneExpansion(milestone.id)}
                                        className="p-1 hover:bg-gray-600 rounded"
                                      >
                                        {expandedMilestones.has(milestone.id) ? (
                                          <ChevronDown className="w-3 h-3 text-gray-400" />
                                        ) : (
                                          <ChevronRight className="w-3 h-3 text-gray-400" />
                                        )}
                                      </button>
                                      
                                      <div className="flex-1">
                                        {editingMilestone === milestone.id ? (
                                          <input
                                            type="text"
                                            value={milestone.title}
                                            onChange={(e) => updateMilestone(level.id, milestone.id, { title: e.target.value })}
                                            onBlur={() => setEditingMilestone(null)}
                                            onKeyDown={(e) => e.key === 'Enter' && setEditingMilestone(null)}
                                            className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            autoFocus
                                          />
                                        ) : (
                                          <div className="flex items-center gap-2">
                                            <Award className="w-4 h-4 text-yellow-400" />
                                            <span className="font-medium text-white">{milestone.title}</span>
                                            <button
                                              onClick={() => setEditingMilestone(milestone.id)}
                                              className="p-1 hover:bg-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                              <Edit3 className="w-3 h-3 text-gray-400" />
                                            </button>
                                          </div>
                                        )}
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => addChallenge(level.id, milestone.id)}
                                          className="p-1 hover:bg-gray-600 rounded text-blue-400 hover:text-blue-300"
                                          title="Add challenge"
                                        >
                                          <Plus className="w-3 h-3" />
                                        </button>
                                        <button
                                          onClick={() => deleteMilestone(level.id, milestone.id)}
                                          className="p-1 hover:bg-gray-600 rounded text-red-400 hover:text-red-300"
                                          title="Delete milestone"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Milestone Content */}
                                    {expandedMilestones.has(milestone.id) && (
                                      <div className="p-3 space-y-3">
                                        <div>
                                          <label className="block text-xs font-medium text-gray-300 mb-1">
                                            Description
                                          </label>
                                          <textarea
                                            value={milestone.description}
                                            onChange={(e) => updateMilestone(level.id, milestone.id, { description: e.target.value })}
                                            rows={2}
                                            className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            placeholder="Describe this milestone..."
                                          />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                          <div>
                                            <label className="block text-xs font-medium text-gray-300 mb-1">
                                              Due Date
                                            </label>
                                            <input
                                              type="date"
                                              value={milestone.dueDate || ''}
                                              onChange={(e) => updateMilestone(level.id, milestone.id, { dueDate: e.target.value })}
                                              className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-xs font-medium text-gray-300 mb-1">
                                              Reward
                                            </label>
                                            <input
                                              type="text"
                                              value={milestone.reward || ''}
                                              onChange={(e) => updateMilestone(level.id, milestone.id, { reward: e.target.value })}
                                              className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                              placeholder="e.g., Certificate, Badge"
                                            />
                                          </div>
                                        </div>

                                        {/* Challenges */}
                                        <div>
                                          <div className="flex items-center justify-between mb-2">
                                            <h5 className="text-sm font-medium text-white">Challenges</h5>
                                            <span className="text-xs text-gray-400">{milestone.challenges.length} challenge(s)</span>
                                          </div>
                                          
                                          {milestone.challenges.length === 0 ? (
                                            <div className="text-center py-3 bg-gray-600/50 rounded">
                                              <Target className="w-6 h-6 text-gray-500 mx-auto mb-1" />
                                              <p className="text-gray-400 text-xs">No challenges yet</p>
                                              <button
                                                onClick={() => addChallenge(level.id, milestone.id)}
                                                className="mt-1 text-blue-400 hover:text-blue-300 text-xs"
                                              >
                                                Add first challenge
                                              </button>
                                            </div>
                                          ) : (
                                            <div className="space-y-2">
                                              {milestone.challenges.map((challenge, challengeIndex) => (
                                                <div key={challenge.id} className="bg-gray-600 border border-gray-500 rounded p-2">
                                                  <div className="flex items-center gap-2">
                                                    {getChallengeIcon(challenge.type)}
                                                    <div className="flex-1">
                                                      {editingChallenge === challenge.id ? (
                                                        <input
                                                          type="text"
                                                          value={challenge.title}
                                                          onChange={(e) => updateChallenge(level.id, milestone.id, challenge.id, { title: e.target.value })}
                                                          onBlur={() => setEditingChallenge(null)}
                                                          onKeyDown={(e) => e.key === 'Enter' && setEditingChallenge(null)}
                                                          className="w-full bg-gray-500 border border-gray-400 rounded px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                          autoFocus
                                                        />
                                                      ) : (
                                                        <div className="flex items-center gap-2">
                                                          <span className="text-sm text-white">{challenge.title}</span>
                                                          <button
                                                            onClick={() => setEditingChallenge(challenge.id)}
                                                            className="p-1 hover:bg-gray-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                                          >
                                                            <Edit3 className="w-2 h-2 text-gray-400" />
                                                          </button>
                                                        </div>
                                                      )}
                                                    </div>
                                                    <select
                                                      value={challenge.type}
                                                      onChange={(e) => updateChallenge(level.id, milestone.id, challenge.id, { type: e.target.value as any })}
                                                      className="px-2 py-1 bg-gray-500 border border-gray-400 rounded text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                      <option value="quiz">Quiz</option>
                                                      <option value="project">Project</option>
                                                      <option value="reading">Reading</option>
                                                    </select>
                                                    <button
                                                      onClick={() => deleteChallenge(level.id, milestone.id, challenge.id)}
                                                      className="p-1 hover:bg-gray-500 rounded text-red-400 hover:text-red-300"
                                                      title="Delete challenge"
                                                    >
                                                      <Trash2 className="w-3 h-3" />
                                                    </button>
                                                  </div>
                                                  <textarea
                                                    value={challenge.description}
                                                    onChange={(e) => updateChallenge(level.id, milestone.id, challenge.id, { description: e.target.value })}
                                                    rows={1}
                                                    className="w-full mt-2 px-2 py-1 bg-gray-500 border border-gray-400 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                                                    placeholder="Challenge description..."
                                                  />
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Roadmap Preview</h3>
              
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{icon}</span>
                  <div>
                    <h4 className="text-xl font-bold text-white">{title || 'Untitled Roadmap'}</h4>
                    <p className="text-gray-400">{description || 'No description provided'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {visibility === 'public' ? (
                        <Eye className="w-4 h-4 text-green-400" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-sm text-gray-400 capitalize">{visibility}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {levels.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No levels defined yet</p>
                    </div>
                  ) : (
                    levels.map((level, levelIndex) => (
                      <div key={level.id} className="border border-gray-600 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {levelIndex + 1}
                          </div>
                          <h5 className="font-semibold text-white">{level.title}</h5>
                          {level.unlockRequirements && (
                            <span className="text-xs text-gray-400">({level.unlockRequirements})</span>
                          )}
                        </div>
                        
                        <div className="ml-8 space-y-2">
                          {level.milestones.length === 0 ? (
                            <p className="text-sm text-gray-500 italic">No milestones</p>
                          ) : (
                            level.milestones.map((milestone, milestoneIndex) => (
                              <div key={milestone.id} className="flex items-center gap-2">
                                <Award className="w-4 h-4 text-yellow-400" />
                                <span className="text-sm text-white">{milestone.title}</span>
                                <span className="text-xs text-gray-400">
                                  ({milestone.challenges.length} challenges)
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-800/50">
          <div className="text-sm text-gray-400">
            {levels.length} level(s) • {levels.reduce((sum, level) => sum + level.milestones.length, 0)} milestone(s) • {levels.reduce((sum, level) => sum + level.milestones.reduce((mSum, milestone) => mSum + milestone.challenges.length, 0), 0)} challenge(s)
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => onClose(false)}
              className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !title.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEdit ? 'Update Roadmap' : 'Create Roadmap'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEditModal; 