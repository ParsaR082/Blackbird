import React, { useEffect, useState, useRef } from 'react';
import RoadmapCard from './roadmaps/RoadmapCard';
import AddEditModal from './roadmaps/AddEditModal';
import SearchBar from './roadmaps/SearchBar';
import StatsPanel from './roadmaps/StatsPanel';
import SidePanel from './roadmaps/SidePanel';
import AnalyticsDashboard from './roadmaps/AnalyticsDashboard';
import type { Roadmap } from '@/app/roadmaps/types';
import LevelTree from './roadmaps/LevelTree';
import { BarChart4, Activity, Info, Plus, Download, Upload, Trash2, Eye, EyeOff, Settings, Filter, Search, Grid, List, TrendingUp } from 'lucide-react';

export default function RoadmapsManager() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingRoadmap, setEditingRoadmap] = useState<Roadmap | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const cardRefs = useRef<{ [id: string]: HTMLDivElement | null }>({});
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'roadmaps' | 'analytics'>('roadmaps');
  const [analyticsRoadmapId, setAnalyticsRoadmapId] = useState<string | null>(null);

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

  // Handlers for modal
  const handleAdd = () => {
    setEditingRoadmap(null);
    setShowModal(true);
  };
  const handleEdit = (roadmap: Roadmap) => {
    setEditingRoadmap(roadmap);
    setShowModal(true);
  };
  const handleModalClose = (refresh = false) => {
    setShowModal(false);
    setEditingRoadmap(null);
    if (refresh) fetchRoadmaps();
  };

  // Handler to open side panel
  const handleOpenPanel = (roadmap: Roadmap) => {
    setSelectedRoadmap(roadmap);
    setShowSidePanel(true);
  };
  const handleClosePanel = () => {
    setShowSidePanel(false);
    setSelectedRoadmap(null);
  };

  // Handler to view analytics
  const handleViewAnalytics = (roadmapId: string) => {
    setAnalyticsRoadmapId(roadmapId);
    setActiveTab('analytics');
  };

  // Deep search logic
  function matchesDeepSearch(rm: Roadmap, term: string): boolean {
    const t = term.toLowerCase();
    if (rm.title.toLowerCase().includes(t)) return true;
    for (const lvl of rm.levels || []) {
      if (lvl.title.toLowerCase().includes(t)) return true;
      for (const ms of lvl.milestones || []) {
        if (ms.title.toLowerCase().includes(t)) return true;
        for (const ch of ms.challenges || []) {
          if (ch.title.toLowerCase().includes(t)) return true;
        }
      }
    }
    return false;
  }

  // Filtered roadmaps
  const filteredRoadmaps = roadmaps.filter(rm => {
    const status = (rm as any).status || 'published';
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    const matches = search.trim() === '' ? true : matchesDeepSearch(rm, search);
    return matches && matchesStatus;
  });

  // Selection logic
  useEffect(() => {
    if (selectAll) {
      setSelected(filteredRoadmaps.map(rm => rm.id));
    } else if (selected.length > 0) {
      setSelected(selected.filter(id => filteredRoadmaps.some(rm => rm.id === id)));
    }
    // eslint-disable-next-line
  }, [selectAll, filteredRoadmaps.length]);

  // Scroll to first match on search/filter
  useEffect(() => {
    if (filteredRoadmaps.length > 0 && (search || statusFilter !== 'all')) {
      const firstId = filteredRoadmaps[0].id;
      const el = cardRefs.current[firstId];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    // eslint-disable-next-line
  }, [search, statusFilter, filteredRoadmaps.length]);

  const handleSelect = (id: string, checked: boolean) => {
    setSelected(prev => checked ? [...prev, id] : prev.filter(x => x !== id));
  };
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setSelected(checked ? filteredRoadmaps.map(rm => rm.id) : []);
  };

  // Bulk actions (mocked)
  const handleBulkAction = async (action: 'delete' | 'publish' | 'archive') => {
    if (selected.length === 0) return;
    if (action === 'delete' && !window.confirm('Are you sure you want to delete the selected roadmaps?')) return;
    setBulkActionLoading(true);
    // TODO: Replace with real backend calls
    await new Promise(res => setTimeout(res, 800));
    if (action === 'delete') {
      setRoadmaps(rms => rms.filter(rm => !selected.includes(rm.id)));
    }
    // For publish/archive, just mock status change
    if (action === 'publish' || action === 'archive') {
      setRoadmaps(rms => rms.map(rm => selected.includes(rm.id) ? { ...rm, status: action } : rm));
    }
    setSelected([]);
    setSelectAll(false);
    setBulkActionLoading(false);
  };

  // Export logic
  const handleExport = () => {
    const exportData = selected.length > 0
      ? roadmaps.filter(rm => selected.includes(rm.id))
      : roadmaps;
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selected.length > 0 ? 'roadmaps-selected.json' : 'roadmaps-all.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import logic
  const handleImportClick = () => {
    setImportError(null);
    setImportSuccess(null);
    fileInputRef.current?.click();
  };
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (!Array.isArray(data)) throw new Error('Invalid format: expected an array');
        // Basic validation: must have id and title
        for (const rm of data) {
          if (!rm.id || !rm.title) throw new Error('Each roadmap must have id and title');
        }
        setRoadmaps(rms => [...rms, ...data]);
        setImportSuccess(`Imported ${data.length} roadmaps successfully.`);
      } catch (err: any) {
        setImportError('Import failed: ' + (err.message || 'Invalid file'));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Keyboard navigation
  useEffect(() => {
    if (filteredRoadmaps.length > 0 && focusedIndex === -1) {
      setFocusedIndex(0);
    }
  }, [filteredRoadmaps.length, search, statusFilter, focusedIndex]);

  const handleGridKeyDown = (e: React.KeyboardEvent) => {
    if (viewMode !== 'grid') return;
    const cols = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;
    let newIndex = focusedIndex;
    
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        newIndex = Math.min(focusedIndex + 1, filteredRoadmaps.length - 1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = Math.max(focusedIndex - 1, 0);
        break;
      case 'ArrowDown':
        e.preventDefault();
        newIndex = Math.min(focusedIndex + cols, filteredRoadmaps.length - 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        newIndex = Math.max(focusedIndex - cols, 0);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (filteredRoadmaps[focusedIndex]) {
          handleOpenPanel(filteredRoadmaps[focusedIndex]);
        }
        break;
    }
    
    if (newIndex !== focusedIndex) {
      setFocusedIndex(newIndex);
      const roadmapId = filteredRoadmaps[newIndex]?.id;
      if (roadmapId && cardRefs.current[roadmapId]) {
        cardRefs.current[roadmapId]?.focus();
      }
    }
  };

  // Calculate stats
  const stats = {
    total: roadmaps.length,
    published: roadmaps.filter(rm => (rm as any).status === 'published').length,
    draft: roadmaps.filter(rm => (rm as any).status === 'draft').length,
    archived: roadmaps.filter(rm => (rm as any).status === 'archived').length,
    totalLevels: roadmaps.reduce((sum, rm) => sum + (rm.levels?.length || 0), 0),
    totalMilestones: roadmaps.reduce((sum, rm) => 
      sum + (rm.levels?.reduce((lSum, lvl) => lSum + (lvl.milestones?.length || 0), 0) || 0), 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          onClick={fetchRoadmaps}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Roadmaps Management</h1>
          <p className="text-gray-400 mt-1">Create, edit, and manage learning roadmaps</p>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('roadmaps')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === 'roadmaps' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Grid className="w-4 h-4 inline mr-2" />
            Roadmaps
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === 'analytics' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Analytics
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'roadmaps' ? (
        <>
          {/* Action Bar */}
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
                             <SearchBar value={search} onChange={setSearch} />
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-300"
                  title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
                >
                  {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div className="flex gap-2">
              {selected.length > 0 && (
                <>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    disabled={bulkActionLoading}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors duration-300 text-sm"
                  >
                    <Trash2 className="w-4 h-4 inline mr-1" />
                    Delete ({selected.length})
                  </button>
                  <button
                    onClick={() => handleBulkAction('publish')}
                    disabled={bulkActionLoading}
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition-colors duration-300 text-sm"
                  >
                    <Eye className="w-4 h-4 inline mr-1" />
                    Publish
                  </button>
                </>
              )}
              <button
                onClick={handleExport}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-300 text-sm"
                title="Export roadmaps"
              >
                <Download className="w-4 h-4 inline mr-1" />
                Export
              </button>
              <button
                onClick={handleImportClick}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-300 text-sm"
                title="Import roadmaps"
              >
                <Upload className="w-4 h-4 inline mr-1" />
                Import
              </button>
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300 font-medium"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add Roadmap
              </button>
            </div>
          </div>

          {/* Import/Export Messages */}
          {(importError || importSuccess) && (
            <div className={`p-4 rounded-lg ${importError ? 'bg-red-600/20 border border-red-600/50 text-red-200' : 'bg-green-600/20 border border-green-600/50 text-green-200'}`}>
              {importError || importSuccess}
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 text-gray-400">
                <div className="w-6 h-6 border-2 border-gray-600 border-t-blue-600 rounded-full animate-spin"></div>
                <span>Loading roadmaps...</span>
              </div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="text-center py-12">
              <div className="bg-red-600/20 border border-red-600/50 rounded-lg p-6 max-w-md mx-auto">
                <h3 className="text-red-200 font-semibold mb-2">Error Loading Roadmaps</h3>
                <p className="text-red-300 text-sm mb-4">{error}</p>
                <button
                  onClick={fetchRoadmaps}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-300"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          {!loading && !error && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              {filteredRoadmaps.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="accent-blue-600"
                  />
                  <span className="text-sm text-gray-400">Select all ({filteredRoadmaps.length})</span>
                </div>
              )}
              
              <div 
                className={
                  viewMode === 'grid' 
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                }
                onKeyDown={handleGridKeyDown}
                tabIndex={0}
                role="grid"
                aria-label="Roadmaps grid"
              >
                {filteredRoadmaps.map((rm, idx) => (
                  <div
                    key={rm.id}
                    ref={el => { cardRefs.current[rm.id] = el; }}
                    tabIndex={0}
                    role="gridcell"
                    aria-label={`Roadmap: ${rm.title}`}
                    className={
                      focusedIndex === idx
                        ? 'outline outline-2 outline-blue-600 rounded-md'
                        : ''
                    }
                    onFocus={() => setFocusedIndex(idx)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleOpenPanel(rm);
                      }
                    }}
                  >
                    <RoadmapCard
                      roadmap={rm}
                      onEdit={handleEdit}
                      onRefresh={fetchRoadmaps}
                      selected={selected.includes(rm.id)}
                      onSelect={checked => handleSelect(rm.id, checked)}
                      searchTerm={search}
                      onOpenPanel={() => handleOpenPanel(rm)}
                      onViewAnalytics={() => handleViewAnalytics(rm.id)}
                    />
                  </div>
                ))}
                
                {filteredRoadmaps.length === 0 && (
                  <div className="col-span-full text-center text-gray-400 italic py-12">
                    {search || statusFilter !== 'all' ? 'No roadmaps match your search criteria.' : 'No roadmaps found. Create your first roadmap to get started.'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SidePanel for roadmap details/analytics */}
          <SidePanel open={showSidePanel} onClose={handleClosePanel} title={selectedRoadmap?.title || 'Roadmap Details'}>
            {selectedRoadmap && (
              <div className="space-y-6">
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Roadmap Details</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(selectedRoadmap)}
                        className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleViewAnalytics(selectedRoadmap.id)}
                        className="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors duration-300"
                      >
                        Analytics
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-400">Title:</span> <span className="text-white">{selectedRoadmap.title}</span></div>
                    <div><span className="text-gray-400">Description:</span> <span className="text-white">{selectedRoadmap.description}</span></div>
                    <div><span className="text-gray-400">Visibility:</span> <span className="text-white capitalize">{selectedRoadmap.visibility}</span></div>
                    <div><span className="text-gray-400">Levels:</span> <span className="text-white">{selectedRoadmap.levels?.length || 0}</span></div>
                  </div>
                </div>
                                 <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                   <h3 className="text-lg font-semibold text-white mb-4">Hierarchy</h3>
                   <LevelTree roadmapId={selectedRoadmap.id} onRefresh={fetchRoadmaps} />
                 </div>
              </div>
            )}
          </SidePanel>

          {showModal && (
            <AddEditModal
              roadmap={editingRoadmap}
              onClose={handleModalClose}
            />
          )}
        </>
      ) : (
        <>
          {/* Analytics Tab Content */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            {/* Roadmap Selector for Analytics */}
            {!analyticsRoadmapId && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Select Roadmap for Analytics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {roadmaps.map((roadmap) => (
                    <button
                      key={roadmap.id}
                      onClick={() => setAnalyticsRoadmapId(roadmap.id)}
                      className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors duration-300"
                    >
                      <h4 className="font-semibold text-white mb-1">{roadmap.title}</h4>
                      <p className="text-sm text-gray-400 line-clamp-2">{roadmap.description}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <span>{roadmap.levels?.length || 0} levels</span>
                        <span>•</span>
                        <span className="capitalize">{roadmap.visibility}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Analytics Dashboard */}
            {analyticsRoadmapId && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Roadmap Analytics</h3>
                  <button
                    onClick={() => setAnalyticsRoadmapId(null)}
                    className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors duration-300"
                  >
                    Back to Selection
                  </button>
                </div>
                <AnalyticsDashboard roadmapId={analyticsRoadmapId} />
              </div>
            )}
          </div>
        </>
      )}

      <style jsx global>{`
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 6s linear infinite;
        }
      `}</style>
    </div>
  );
}

// --- Inline Editable Roadmap Details Component ---
function EditableRoadmapDetails({ roadmap, onUpdated }: { roadmap: any, onUpdated: () => void }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(roadmap.title);
  const [description, setDescription] = useState(roadmap.description);
  const [visibility, setVisibility] = useState(roadmap.visibility || 'public');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/roadmaps/${roadmap.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, visibility })
      });
      if (!res.ok) throw new Error('Failed to update roadmap');
      setEditing(false);
      onUpdated();
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-2">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-lg font-bold flex-1 text-white">{title}</h3>
          <button className="text-blue-500 underline text-sm" onClick={() => setEditing(true)}>Edit</button>
        </div>
        <p className="text-gray-400 mb-1">{description}</p>
        <span className="inline-block text-xs px-2 py-0.5 rounded bg-gray-700 text-white/80">{visibility}</span>
      </div>
    );
  }
  return (
    <form className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-2 flex flex-col gap-2" onSubmit={e => { e.preventDefault(); handleSave(); }}>
      <label className="text-xs font-semibold text-white">Title
        <input className="mt-1 p-2 rounded bg-gray-900 border border-gray-600 w-full text-white" value={title} onChange={e => setTitle(e.target.value)} required disabled={saving} />
      </label>
      <label className="text-xs font-semibold text-white">Description
        <textarea className="mt-1 p-2 rounded bg-gray-900 border border-gray-600 w-full text-white" value={description} onChange={e => setDescription(e.target.value)} required disabled={saving} />
      </label>
      <label className="text-xs font-semibold text-white">Visibility
        <select className="mt-1 p-2 rounded bg-gray-900 border border-gray-600 w-full text-white" value={visibility} onChange={e => setVisibility(e.target.value as any)} disabled={saving}>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
      </label>
      {error && <div className="text-red-500 text-xs">{error}</div>}
      <div className="flex gap-2 mt-2">
        <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded" disabled={saving}>Save</button>
        <button type="button" className="bg-gray-700 text-white px-4 py-1 rounded" onClick={() => setEditing(false)} disabled={saving}>Cancel</button>
      </div>
    </form>
  );
} 