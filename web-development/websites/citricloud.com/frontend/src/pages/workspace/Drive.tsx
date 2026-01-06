import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFolder, FiFile, FiMoreHorizontal, FiSearch, FiGrid, FiList, FiSettings, FiHelpCircle, FiUpload, FiPlus, FiStar, FiTrash2, FiShare2, FiDownload, FiArrowLeft, FiChevronDown, FiHome, FiUsers, FiClock, FiImage, FiAlertTriangle } from 'react-icons/fi';
import BrandLogo from '../../components/BrandLogo';
import { useAuthStore } from '../../store/authStore';
import { workspaceAPI } from '../../lib/workspaceApi';

type DriveItem = {
  id: string;
  name: string;
  type: 'folder' | 'file';
  sizeBytes?: number;
  modifiedISO: string;
  owner: string;
  isPrivate: boolean;
  parentId?: string | null;
  favorite?: boolean;
  mime?: string;
};

export default function DriveApp() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'name' | 'modified' | 'size'>('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState<'recent' | 'all' | 'word' | 'excel' | 'powerpoint' | 'pdf' | 'more'>('recent');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [section, setSection] = useState<'home' | 'my-files' | 'recent' | 'favorites' | 'shared' | 'photos' | 'recycle'>('home');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load and persist items via backend workspace API (fallback to local)
  const owner = user?.email?.split('@')[0] || 'User';
  const [items, setItems] = useState<DriveItem[]>([]);
  const [storeItemId, setStoreItemId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await workspaceAPI.getItems('drive', 'items');
        const list = res.data as Array<{ id: number; data: any }>;
        if (list.length > 0) {
          setStoreItemId(list[0].id);
          setItems(list[0].data as DriveItem[]);
          return;
        }
      } catch {}
      const now = new Date().toISOString();
      const initial: DriveItem[] = [
        { id: '1', name: 'Attachments', type: 'folder', modifiedISO: now, owner, isPrivate: true, parentId: null },
        { id: '2', name: 'Microsoft Copilot Chat-bestanden', type: 'folder', modifiedISO: now, owner, isPrivate: true, parentId: null },
      ];
      setItems(initial);
      try {
        const createRes = await workspaceAPI.createOrUpdateItem({ app_name: 'drive', item_key: 'items', data: initial });
        setStoreItemId(createRes.data.id);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (storeItemId) {
          await workspaceAPI.updateItem(storeItemId, items);
        } else {
          const res = await workspaceAPI.createOrUpdateItem({ app_name: 'drive', item_key: 'items', data: items });
          setStoreItemId(res.data.id);
        }
      } catch {}
      try {
        localStorage.setItem('drive_items', JSON.stringify(items));
      } catch {}
    })();
  }, [items, storeItemId]);

  // Derived storage usage
  const storageUsed = useMemo(() => {
    const totalBytes = items.reduce((sum, it) => sum + (it.sizeBytes || 0), 0);
    return +(totalBytes / (1024 ** 3)).toFixed(2); // GB
  }, [items]);
  const storageTotal = 1024; // 1 TB
  const storagePercent = (storageUsed / storageTotal) * 100;

  // Helpers
  const timeAgo = (iso: string) => {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (mins > 0) return `${mins} minute${mins > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const extFromName = (name: string) => {
    const idx = name.lastIndexOf('.');
    return idx >= 0 ? name.slice(idx + 1).toLowerCase() : '';
  };

  // Actions
  const createFolder = (name: string) => {
    const id = `fld_${Date.now()}`;
    const now = new Date().toISOString();
    setItems(prev => [
      ...prev,
      { id, name, type: 'folder', modifiedISO: now, owner, isPrivate: true, parentId: currentFolderId }
    ]);
  };

  const handleCreateFolderClick = () => {
    const name = prompt('Folder name');
    if (name && name.trim()) createFolder(name.trim());
    setShowNewMenu(false);
  };

  const handleUploadFiles = (files: FileList) => {
    const now = new Date().toISOString();
    const newItems: DriveItem[] = [];
    for (const file of Array.from(files)) {
      newItems.push({
        id: `fil_${Date.now()}_${file.name}`,
        name: file.name,
        type: 'file',
        sizeBytes: file.size,
        modifiedISO: now,
        owner,
        isPrivate: true,
        parentId: currentFolderId,
        mime: file.type || undefined,
      });
    }
    setItems(prev => [...newItems, ...prev]);
    setShowNewMenu(false);
  };

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let candidate: DriveItem[] = [];

    switch (section) {
      case 'home': {
        candidate = items.filter(it => it.parentId === currentFolderId);
        if (activeTab !== 'all') {
          candidate = candidate.filter(it => {
            if (it.type === 'folder') return true;
            const ext = extFromName(it.name);
            if (activeTab === 'word') return ['doc', 'docx'].includes(ext);
            if (activeTab === 'excel') return ['xls', 'xlsx', 'csv'].includes(ext);
            if (activeTab === 'powerpoint') return ['ppt', 'pptx'].includes(ext);
            if (activeTab === 'pdf') return ext === 'pdf';
            return true; // recent & more act as passthrough
          });
        }
        break;
      }
      case 'my-files': {
        candidate = items.filter(it => it.parentId === currentFolderId);
        break;
      }
      case 'recent': {
        candidate = items.slice();
        break;
      }
      case 'favorites': {
        candidate = items.filter(it => it.favorite);
        break;
      }
      case 'shared': {
        candidate = items.filter(it => !it.isPrivate);
        break;
      }
      case 'photos': {
        candidate = items.filter(it => it.mime?.startsWith('image/'));
        break;
      }
      case 'recycle': {
        // placeholder if trash implemented later; currently empty set
        candidate = [];
        break;
      }
    }

    if (query) {
      candidate = candidate.filter(it => it.name.toLowerCase().includes(query));
    }
    candidate = candidate.sort((a, b) => {
      if (section === 'recent' || activeTab === 'recent') {
        return new Date(b.modifiedISO).getTime() - new Date(a.modifiedISO).getTime();
      }
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'size') return (b.sizeBytes || 0) - (a.sizeBytes || 0);
      return new Date(b.modifiedISO).getTime() - new Date(a.modifiedISO).getTime();
    });
    return candidate;
  }, [items, currentFolderId, searchQuery, sortBy, activeTab, section]);

  // Breadcrumbs
  const breadcrumbs = useMemo(() => {
    const chain: DriveItem[] = [];
    const byId = new Map(items.map(i => [i.id, i] as const));
    let cursor = currentFolderId ? byId.get(currentFolderId) : null;
    while (cursor) {
      chain.unshift(cursor);
      cursor = cursor.parentId ? byId.get(cursor.parentId) || null : null;
    }
    return chain;
  }, [items, currentFolderId]);

  const goToParent = () => {
    if (!currentFolderId) return;
    const parent = items.find(i => i.id === currentFolderId)?.parentId || null;
    setCurrentFolderId(parent || null);
  };

  const toggleFavorite = (id: string) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, favorite: !it.favorite } : it));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (storeItemId) {
        await workspaceAPI.updateItem(storeItemId, items);
      } else {
        const res = await workspaceAPI.createOrUpdateItem({ app_name: 'drive', item_key: 'items', data: items });
        setStoreItemId(res.data.id);
      }
    } catch (error) {
      console.error('Failed to save drive items:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Top Header */}
      <div className="bg-cyan-600 text-white px-2 sm:px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4 flex-1">
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 hover:bg-white/10 rounded lg:hidden"
            title="Toggle menu"
          >
            <FiList className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <BrandLogo size="small" showTagline={true} variant="light" />
            <span className="text-sm font-semibold hidden sm:inline">Drive</span>
          </div>
          <div className="relative flex-1 max-w-xl hidden md:block">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-1.5 bg-cyan-700 dark:bg-cyan-800 text-white placeholder-white/70 rounded text-sm border-none focus:outline-none focus:ring-2 focus:ring-cyan-300"
            />
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
            title="Save drive items"
          >
            <FiDownload className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
            <span className="text-xs sm:text-sm font-medium hidden sm:inline">{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
          <div className="hidden sm:block">
          </div>
          <button className="p-2 hover:bg-white/10 rounded hidden sm:block" title="Settings">
            <FiSettings className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded hidden sm:block" title="Help">
            <FiHelpCircle className="w-5 h-5" />
          </button>
          <button 
            onClick={() => navigate('/workspace')}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 hover:bg-white/10 rounded transition-colors"
            title="Go back to Workspace"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-medium hidden sm:inline">Workspace</span>
          </button>
          <div className="flex items-center gap-2 ml-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center text-xs sm:text-sm font-semibold">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="text-xs sm:text-sm hidden md:inline">{user?.email?.split('@')[0] || 'User'}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Overlay for mobile */}
        {showSidebar && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}
        
        {/* Left Sidebar */}
        <aside className={`${showSidebar ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 lg:w-56 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-300`}>
          {/* Mobile close button */}
          <div className="lg:hidden flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
            <span className="font-semibold text-gray-900 dark:text-white">Menu</span>
            <button 
              onClick={() => setShowSidebar(false)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-3">
            <div className="relative">
              <button 
                onClick={() => setShowNewMenu(!showNewMenu)}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded flex items-center gap-2 text-sm font-medium transition-colors"
              >
                <FiPlus className="w-4 h-4" />
                Create or upload
              </button>
              {showNewMenu && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10">
                  <button onClick={handleCreateFolderClick} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm flex items-center gap-2">
                    <FiFolder className="w-4 h-4" /> New folder
                  </button>
                  <label className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm flex items-center gap-2 cursor-pointer">
                    <FiUpload className="w-4 h-4" /> Upload files
                    <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => e.target.files && handleUploadFiles(e.target.files)} />
                  </label>
                </div>
              )}
            </div>
          </div>

          <nav className="flex-1 px-2">
            <div className="mb-4">
              <button onClick={() => { setSection('home'); setCurrentFolderId(null); }} className={`w-full text-left px-3 py-2 text-sm font-medium rounded flex items-center gap-2 ${section==='home' ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                <FiHome className="w-4 h-4" /> Home
              </button>
              <button onClick={() => { setSection('my-files'); }} className={`w-full text-left px-3 py-2 text-sm rounded flex items-center gap-2 font-medium ${section==='my-files' ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                <FiFolder className="w-4 h-4" /> My files
              </button>
              <button onClick={() => setSection('recent')} className={`w-full text-left px-3 py-2 text-sm rounded flex items-center gap-2 ${section==='recent' ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                <FiClock className="w-4 h-4" /> Recent
              </button>
              <button onClick={() => setSection('favorites')} className={`w-full text-left px-3 py-2 text-sm rounded flex items-center gap-2 ${section==='favorites' ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                <FiStar className="w-4 h-4" /> Favorites
              </button>
              <button onClick={() => setSection('shared')} className={`w-full text-left px-3 py-2 text-sm rounded flex items-center gap-2 ${section==='shared' ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                <FiUsers className="w-4 h-4" /> Shared
              </button>
              <button onClick={() => setSection('photos')} className={`w-full text-left px-3 py-2 text-sm rounded flex items-center gap-2 ${section==='photos' ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                <FiImage className="w-4 h-4" /> Photos
              </button>
              <button onClick={() => setSection('recycle')} className={`w-full text-left px-3 py-2 text-sm rounded flex items-center gap-2 ${section==='recycle' ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                <FiTrash2 className="w-4 h-4" /> Recycle bin
              </button>
            </div>

            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <button className="w-full text-left px-3 py-2 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                Browse by file type
              </button>
            </div>
          </nav>

          {/* Storage Info */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Storage</div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-1">
              <div 
                className="bg-cyan-600 h-1.5 rounded-full" 
                style={{ width: `${Math.min(storagePercent, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {storageUsed} GB of {storageTotal} GB ({storagePercent.toFixed(1)}%)
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar (optional: could be used for breadcrumb in folder navigation) */}
          <div className="border-b border-gray-200 dark:border-gray-700 px-2 sm:px-4 py-2 flex items-center justify-between bg-white dark:bg-gray-900">
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={goToParent}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                title="Up one level"
                disabled={!currentFolderId}
              >
                <FiArrowLeft className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
              <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300 truncate">
                <button
                  onClick={() => { setCurrentFolderId(null); if (section !== 'home') setSection('home'); }}
                  className="hover:underline font-medium shrink-0"
                >
                  Home
                </button>
                {breadcrumbs.map((b, idx) => (
                  <span key={b.id} className="flex items-center gap-1 shrink-0">
                    <span className="text-gray-400">/</span>
                    <button
                      onClick={() => setCurrentFolderId(b.id)}
                      className="hover:underline truncate max-w-[10rem]"
                      title={b.name}
                    >
                      {b.name}
                    </button>
                  </span>
                ))}
                {section !== 'home' && (
                  <span className="ml-2 text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shrink-0">
                    {section.replace('-', ' ')}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="flex border border-gray-300 dark:border-gray-600 rounded overflow-hidden">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 ${viewMode === 'list' ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  title="List view"
                >
                  <FiList className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 ${viewMode === 'grid' ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  title="Grid view"
                >
                  <FiGrid className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </div>
          {/* Content */}
          <div className="flex-1 overflow-auto px-2 sm:px-4 py-4">
            {section === 'home' && (
              <section className="mb-4 sm:mb-6">
              <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3">For you</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center flex-shrink-0">
                    <FiFile className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Drawing - Copy</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <FiClock className="w-3 h-3" />
                        You opened this recently
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{user?.email?.split('@')[0] || 'User'}</p>
                  </div>
                  <button className="px-3 py-1.5 text-xs font-medium text-cyan-600 hover:bg-cyan-50 dark:text-cyan-400 dark:hover:bg-cyan-900/20 rounded transition-colors">
                    Open
                  </button>
                </div>
              </div>
              </section>
            )}

            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  {section === 'home' && [
                    { key: 'recent', label: 'Recent' },
                    { key: 'all', label: 'Alle' },
                    { key: 'word', label: 'Word' },
                    { key: 'excel', label: 'Excel' },
                    { key: 'powerpoint', label: 'PowerPoint' },
                    { key: 'pdf', label: 'PDF' },
                    { key: 'more', label: 'Meer' },
                  ].map(t => (
                    <button
                      key={t.key}
                      onClick={() => setActiveTab(t.key as any)}
                      className={`text-sm font-medium pb-1 ${activeTab === t.key ? 'text-cyan-600 dark:text-cyan-400 border-b-2 border-cyan-600' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                      {t.label}
                    </button>
                  ))}
                  {section !== 'home' && (
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">
                      {section.replace('-', ' ')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-1">
                    <span className="hidden sm:inline">Filter by name or person</span>
                    <span className="sm:hidden">Filter</span>
                  </button>
                </div>
              </div>

              {/* File Table */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 dark:text-gray-400">
                        <button onClick={() => setSortBy('name')} className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white">
                          Name <FiChevronDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 dark:text-gray-400 hidden md:table-cell">
                        <button onClick={() => setSortBy('modified')} className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white">
                          Opened <FiChevronDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 dark:text-gray-400 hidden lg:table-cell">
                        Owner
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 dark:text-gray-400 hidden xl:table-cell">
                        Activity
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => {
                          if (item.type === 'folder') setCurrentFolderId(item.id);
                        }}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${item.type === 'folder' ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                              {item.type === 'folder' ? (
                                <FiFolder className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                              ) : (
                                <FiFile className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-gray-900 dark:text-white font-medium truncate flex items-center gap-2">
                                {item.name}
                                <button
                                  onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
                                  title={item.favorite ? 'Unfavorite' : 'Favorite'}
                                  className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                                >
                                  <FiStar className={`w-4 h-4 ${item.favorite ? 'text-amber-500' : 'text-gray-400'}`} />
                                </button>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{item.type === 'folder' ? 'Folder' : (item.mime || 'File')}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 hidden md:table-cell">{timeAgo(item.modifiedISO)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 hidden lg:table-cell">{item.owner}</td>
                        <td className="px-4 py-3 text-sm text-cyan-600 dark:text-cyan-400 hidden xl:table-cell">{item.owner}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
