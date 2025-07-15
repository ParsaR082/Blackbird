import React, { useEffect, useState, useRef } from 'react';
import RoadmapCard from './roadmaps/RoadmapCard';
import AddEditModal from './roadmaps/AddEditModal';
import SearchBar from './roadmaps/SearchBar';
import StatsPanel from './roadmaps/StatsPanel';
import SidePanel from './roadmaps/SidePanel';
import type { Roadmap } from '@/app/roadmaps/types';
import LevelTree from './roadmaps/LevelTree';
import { BarChart4, Activity, Info, Plus, Download, Upload, Trash2, Eye, EyeOff, Settings, Filter, Search, Grid, List } from 'lucide-react';

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
  }, [filteredRoadmaps.length, search, statusFilter]);

  useEffect(() => {
    if (focusedIndex >= 0 && filteredRoadmaps[focusedIndex]) {
      const el = cardRefs.current[filteredRoadmaps[focusedIndex].id];
      if (el) el.focus();
    }
  }, [focusedIndex, filteredRoadmaps]);

  const handleGridKeyDown = (e: React.KeyboardEvent) => {
    if (filteredRoadmaps.length === 0) return;
    if (focusedIndex === -1) setFocusedIndex(0);
    if (['ArrowRight', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
      setFocusedIndex(i => Math.min(i + 1, filteredRoadmaps.length - 1));
    } else if (['ArrowLeft', 'ArrowUp'].includes(e.key)) {
      e.preventDefault();
      setFocusedIndex(i => Math.max(i - 1, 0));
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
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Roadmaps Management</h1>
          <p className="text-gray-400">Manage learning roadmaps, levels, milestones, and challenges</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Roadmap
          </button>
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
              title="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Panel */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <BarChart4 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-sm text-gray-400">Total Roadmaps</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Eye className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.published}</p>
              <p className="text-sm text-gray-400">Published</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Settings className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.draft}</p>
              <p className="text-sm text-gray-400">Draft</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-500/20 rounded-lg">
              <EyeOff className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.archived}</p>
              <p className="text-sm text-gray-400">Archived</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalLevels}</p>
              <p className="text-sm text-gray-400">Total Levels</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <Info className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalMilestones}</p>
              <p className="text-sm text-gray-400">Milestones</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search roadmaps, levels, milestones..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selected.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">{selected.length} selected</span>
              <button
                onClick={() => handleBulkAction('publish')}
                disabled={bulkActionLoading}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
              >
                Publish
              </button>
              <button
                onClick={() => handleBulkAction('archive')}
                disabled={bulkActionLoading}
                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 disabled:opacity-50"
              >
                Archive
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                disabled={bulkActionLoading}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Import/Export */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-700">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={handleImportClick}
            className="flex items-center gap-2 px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600"
          >
            <Upload className="w-4 h-4" />
            Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          {importError && <span className="text-red-400 text-sm">{importError}</span>}
          {importSuccess && <span className="text-green-400 text-sm">{importSuccess}</span>}
        </div>
      </div>

      {/* Roadmaps Grid/List */}
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

      {/* SidePanel for roadmap details/analytics */}
      <SidePanel open={showSidePanel} onClose={handleClosePanel} title={selectedRoadmap?.title || 'Roadmap Details'}>
        {selectedRoadmap && (
          <div className="space-y-6">
            <EditableRoadmapDetails roadmap={selectedRoadmap} onUpdated={fetchRoadmaps} />
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Hierarchy</h3>
              <LevelTree levels={selectedRoadmap.levels || []} />
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