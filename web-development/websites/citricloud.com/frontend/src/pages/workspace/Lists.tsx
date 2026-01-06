import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiTrash2, FiEdit2, FiCheck, FiX, FiList, FiMoreVertical, FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';

import { listsAPI } from '../../lib/listsApi';


type ListItem = {
  id: number;
  text: string;
  checked: boolean;
  priority?: 'low' | 'medium' | 'high';
};

type List = {
  id: number;
  name: string;
  items: ListItem[];
  created_at: string;
};

export default function ListsApp() {
  const navigate = useNavigate();
  const [lists, setLists] = useState<List[]>([]);
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [newListName, setNewListName] = useState('');
  const [newItemText, setNewItemText] = useState('');
  const [editingItem, setEditingItem] = useState<{listId: number, itemId: number, text: string} | null>(null);
  const selectedList = lists.find(l => l.id === selectedListId) || null;

  // Fetch lists on mount
  useEffect(() => {
    listsAPI.getLists().then(res => {
      setLists(res.data);
      if (res.data.length > 0) setSelectedListId(res.data[0].id);
    });
  }, []);


  // List actions
  const addList = async () => {
    if (!newListName.trim()) return;
    const res = await listsAPI.createList({ name: newListName.trim() });
    setLists(prev => [...prev, { ...res.data, items: [] }]);
    setNewListName('');
    setSelectedListId(res.data.id);
  };
  const deleteList = async (id: number) => {
    await listsAPI.deleteList(id);
    setLists(prev => prev.filter(l => l.id !== id));
    if (selectedListId === id) setSelectedListId(lists[0]?.id || null);
  };
  const renameList = async (id: number, name: string) => {
    const res = await listsAPI.updateList(id, { name });
    setLists(prev => prev.map(l => l.id === id ? { ...l, name: res.data.name } : l));
  };

  // Item actions
  const addItem = async () => {
    if (!newItemText.trim() || !selectedList) return;
    const res = await listsAPI.addItem(selectedList.id, { text: newItemText.trim() });
    setLists(prev => prev.map(l => l.id === selectedList.id ? { ...l, items: [...l.items, res.data] } : l));
    setNewItemText('');
  };
  const deleteItem = async (itemId: number) => {
    if (!selectedList) return;
    await listsAPI.deleteItem(selectedList.id, itemId);
    setLists(prev => prev.map(l => l.id === selectedList.id ? { ...l, items: l.items.filter(i => i.id !== itemId) } : l));
  };
  const toggleItem = async (itemId: number) => {
    if (!selectedList) return;
    const item = selectedList.items.find(i => i.id === itemId);
    if (!item) return;
    const res = await listsAPI.updateItem(selectedList.id, itemId, { ...item, checked: !item.checked });
    setLists(prev => prev.map(l => l.id === selectedList.id ? {
      ...l,
      items: l.items.map(i => i.id === itemId ? res.data : i)
    } : l));
  };
  const startEditItem = (itemId: number, text: string) => {
    if (!selectedList) return;
    setEditingItem({ listId: selectedList.id, itemId, text });
  };
  const saveEditItem = async () => {
    if (!editingItem) return;
    const item = selectedList?.items.find(i => i.id === editingItem.itemId);
    if (!item) return;
    const res = await listsAPI.updateItem(editingItem.listId, editingItem.itemId, { ...item, text: editingItem.text });
    setLists(prev => prev.map(l => l.id === editingItem.listId ? {
      ...l,
      items: l.items.map(i => i.id === editingItem.itemId ? res.data : i)
    } : l));
    setEditingItem(null);
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Top Header Bar */}
      <div className="bg-red-500 text-white px-2 sm:px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4 flex-1">
          <div className="flex items-center gap-2">
            <img 
              src="/box-white.svg" 
              alt="citricloud.com" 
              className="h-2.5 w-auto rounded-md"
            />
            <div className="flex flex-col">
              <span className="text-white font-semibold text-xs sm:text-sm" style={{ fontFamily: "'Orbitron', sans-serif" }}>citricloud.com</span>
              <span className="text-white/80 text-[8px] sm:text-[9px] tracking-wide" style={{ fontFamily: "'Source Code Pro', monospace" }}>Enterprise Cloud Platform</span>
            </div>
            <span className="text-white font-semibold text-sm">Lists</span>
          </div>
          <div className="hidden lg:flex items-center text-sm text-white/90 px-3 py-1 bg-white/10 rounded">
            <FiList className="w-4 h-4 mr-1.5" />
            <span>{lists.length} lists • {lists.reduce((sum, l) => sum + l.items.length, 0)} items</span>
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
          {/* Sidebar: Lists */}
          <aside className="w-full md:w-64 lg:w-72 border-r border-gray-200 dark:border-gray-700">
            <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">My Lists</h2>
              <form onSubmit={e => { e.preventDefault(); addList(); }} className="flex gap-2">
                <input value={newListName} onChange={e => setNewListName(e.target.value)} placeholder="New list" className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                <button type="submit" className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium transition-colors"><FiPlus className="w-4 h-4" /></button>
              </form>
            </div>
            <ul className="p-2">
              {lists.map(list => (
                <li key={list.id} className={`group flex items-center justify-between px-3 py-2 rounded cursor-pointer transition-colors ${selectedListId === list.id ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                    onClick={() => setSelectedListId(list.id)}>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FiList className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate text-sm font-medium">{list.name}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={e => { e.stopPropagation(); const newName = prompt('Rename list', list.name); if (newName) renameList(list.id, newName); }} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"><FiEdit2 className="w-3 h-3" /></button>
                    <button onClick={e => { e.stopPropagation(); if (window.confirm('Delete this list?')) deleteList(list.id); }} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"><FiTrash2 className="w-3 h-3" /></button>
                  </div>
                </li>
              ))}
            </ul>
          </aside>
          {/* Main: List Items */}
          <section className="flex-1">
            {selectedList ? (
              <div className="flex flex-col h-full">
                <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{selectedList.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedList.items.filter(i => !i.checked).length} of {selectedList.items.length} items remaining</p>
                </div>
                <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
                  <form onSubmit={e => { e.preventDefault(); addItem(); }} className="flex gap-2">
                    <input value={newItemText} onChange={e => setNewItemText(e.target.value)} placeholder="Add an item" className="flex-1 px-2 sm:px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                    <button type="submit" className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium transition-colors">Add</button>
                  </form>
                </div>
                <ul className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1">
                  {selectedList.items.map(item => (
                    <li key={item.id} className="group flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <input type="checkbox" checked={item.checked} onChange={() => toggleItem(item.id)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      {editingItem && editingItem.itemId === item.id ? (
                        <form onSubmit={e => { e.preventDefault(); saveEditItem(); }} className="flex-1 flex gap-2">
                          <input value={editingItem.text} onChange={e => setEditingItem({ ...editingItem, text: e.target.value })} className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" autoFocus />
                          <button type="submit" className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"><FiCheck className="w-4 h-4 text-green-600" /></button>
                          <button type="button" onClick={() => setEditingItem(null)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"><FiX className="w-4 h-4 text-gray-600" /></button>
                        </form>
                      ) : (
                        <>
                          <span className={`flex-1 text-sm ${item.checked ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>{item.text}</span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEditItem(item.id, item.text)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"><FiEdit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" /></button>
                            <button onClick={() => deleteItem(item.id)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"><FiTrash2 className="w-4 h-4 text-gray-600 dark:text-gray-400" /></button>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FiList className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500 dark:text-gray-400">Select a list to view items</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
