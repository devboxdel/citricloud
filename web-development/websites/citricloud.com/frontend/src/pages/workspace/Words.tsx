import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFileText, FiUser, FiClock, FiSearch, FiGrid, FiList, FiArrowLeft, FiPlus, FiTrash2, FiEdit2, FiFolder } from 'react-icons/fi';
import BrandLogo from '../../components/BrandLogo';
import { RichTextEditor } from '../../components/RichTextEditor';
import { workspaceAPI } from '../../lib/workspaceApi';
import { useAuthStore } from '../../store/authStore';

type Document = {
  id: string;
  name: string;
  owner: string;
  lastModified: string;
  thumbnail: string;
  content?: string;
};

export default function WordsApp() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [newDocName, setNewDocName] = useState('');
  const [recentDocs, setRecentDocs] = useState<Document[]>([]);
  const [storeItemId, setStoreItemId] = useState<number | null>(null);
  const selectedDoc = recentDocs.find(d => d.id === selectedDocId) || null;
  const owner = user?.email?.split('@')[0] || 'User';

  // Load documents from backend
  useEffect(() => {
    workspaceAPI.getItems('words', 'documents').then(res => {
      const items = res.data || [];
      if (items.length > 0) {
        const item = items[0];
        setStoreItemId(item.id);
        const data = item.data || {};
        if (Array.isArray(data.documents)) {
          setRecentDocs(data.documents);
          if (data.documents.length > 0 && !selectedDocId) setSelectedDocId(data.documents[0].id);
        }
      }
    }).catch(() => {});
  }, []);

  // Save documents to backend
  useEffect(() => {
    const payload = { documents: recentDocs };
    if (storeItemId) {
      workspaceAPI.updateItem(storeItemId, payload).catch(() => {});
    } else if (recentDocs.length > 0) {
      workspaceAPI.createOrUpdateItem({ app_name: 'words', item_key: 'documents', data: payload })
        .then(res => setStoreItemId(res.data.id))
        .catch(() => {});
    }
  }, [recentDocs, storeItemId]);

  // Document actions
  const addDocument = () => {
    if (!newDocName.trim()) return;
    const newDoc: Document = {
      id: Date.now().toString(),
      name: newDocName.trim(),
      owner,
      lastModified: 'Just now',
      thumbnail: 'document',
      content: ''
    };
    setRecentDocs(prev => [newDoc, ...prev]);
    setNewDocName('');
    setSelectedDocId(newDoc.id);
  };

  const deleteDocument = (id: string) => {
    setRecentDocs(prev => prev.filter(d => d.id !== id));
    if (selectedDocId === id) setSelectedDocId(recentDocs[0]?.id || null);
  };

  const renameDocument = (id: string, name: string) => {
    setRecentDocs(prev => prev.map(d => d.id === id ? { ...d, name } : d));
  };

  const updateDocumentContent = (content: string) => {
    if (!selectedDoc) return;
    setRecentDocs(prev => prev.map(d => d.id === selectedDoc.id ? { ...d, content, lastModified: 'Just now' } : d));
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Top Header Bar */}
      <div className="bg-purple-600 text-white px-2 sm:px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4 flex-1">
          <div className="flex items-center gap-2">
            <BrandLogo size="small" showTagline={true} variant="light" />
            <span className="text-white font-semibold text-sm">Words</span>
          </div>
          <div className="hidden lg:flex items-center text-sm text-white/90 px-3 py-1 bg-white/10 rounded">
            <FiFileText className="w-4 h-4 mr-1.5" />
            <span>{recentDocs.length} documents</span>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden sm:block">
          </div>
          <button 
            onClick={() => navigate('/workspace')}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 hover:bg-white/10 rounded transition-colors"
            title="Go back to Workspace"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Back</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="bg-white dark:bg-gray-800 flex flex-col md:flex-row w-full">
          {/* Sidebar: Documents */}
          <aside className="w-full md:w-64 border-r border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">My Documents</h2>
              <form onSubmit={e => { e.preventDefault(); addDocument(); }} className="flex gap-2">
                <input 
                  value={newDocName} 
                  onChange={e => setNewDocName(e.target.value)} 
                  placeholder="New document" 
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600" 
                />
                <button type="submit" className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium transition-colors">
                  <FiPlus className="w-4 h-4" />
                </button>
              </form>
            </div>
            <ul className="p-2 overflow-y-auto">
              {recentDocs.map(doc => (
                <li 
                  key={doc.id} 
                  className={`group flex items-center justify-between px-3 py-2 rounded cursor-pointer transition-colors ${
                    selectedDocId === doc.id 
                      ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => setSelectedDocId(doc.id)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FiFileText className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate text-sm font-medium">{doc.name}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={e => { 
                        e.stopPropagation(); 
                        const newName = prompt('Rename document', doc.name); 
                        if (newName) renameDocument(doc.id, newName); 
                      }} 
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      <FiEdit2 className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={e => { 
                        e.stopPropagation(); 
                        if (window.confirm('Delete this document?')) deleteDocument(doc.id); 
                      }} 
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      <FiTrash2 className="w-3 h-3" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </aside>

          {/* Main: Document Editor */}
          <section className="flex-1">
            {selectedDoc ? (
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedDoc.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Last modified: {selectedDoc.lastModified}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                  <RichTextEditor
                    value={selectedDoc.content || ''}
                    onChange={updateDocumentContent}
                    placeholder="Start typing your document..."
                    minHeight="500px"
                    className="h-full"
                  />
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedDoc.content?.length || 0} characters
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm font-medium transition-colors">
                      Export
                    </button>
                    <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium transition-colors">
                      Save
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FiFileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500 dark:text-gray-400">Select a document to view or edit</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
