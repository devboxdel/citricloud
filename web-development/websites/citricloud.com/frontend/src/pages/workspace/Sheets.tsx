import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiGrid, FiPlus, FiTrash2, FiEdit2, FiArrowLeft } from 'react-icons/fi';
import { FiGrid as FiExcel } from 'react-icons/fi';
import { workspaceAPI } from '../../lib/workspaceApi';

type Sheet = {
  id: number;
  name: string;
  data: string[][];
  created_at: string;
};

export default function SheetsApp() {
  const navigate = useNavigate();
  const rows = 20;
  const cols = 10;
  
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [selectedSheetId, setSelectedSheetId] = useState<number | null>(null);
  const [newSheetName, setNewSheetName] = useState('');
  const [storeItemId, setStoreItemId] = useState<number | null>(null);

  // Load sheets from backend
  useEffect(() => {
    workspaceAPI.getItems('sheets', 'data').then(res => {
      const items = res.data || [];
      if (items.length > 0) {
        const item = items[0];
        setStoreItemId(item.id);
        const data = item.data || {};
        if (Array.isArray(data.sheets) && data.sheets.length > 0) {
          setSheets(data.sheets);
          setSelectedSheetId(data.sheets[0].id);
        } else {
          // Create default sheet
          const defaultSheet = { id: 1, name: 'Sheet 1', data: Array.from({ length: rows }, () => Array(cols).fill('')), created_at: new Date().toISOString() };
          setSheets([defaultSheet]);
          setSelectedSheetId(1);
        }
      } else {
        // Create default sheet
        const defaultSheet = { id: 1, name: 'Sheet 1', data: Array.from({ length: rows }, () => Array(cols).fill('')), created_at: new Date().toISOString() };
        setSheets([defaultSheet]);
        setSelectedSheetId(1);
      }
    }).catch(() => {
      // Create default sheet
      const defaultSheet = { id: 1, name: 'Sheet 1', data: Array.from({ length: rows }, () => Array(cols).fill('')), created_at: new Date().toISOString() };
      setSheets([defaultSheet]);
      setSelectedSheetId(1);
    });
  }, []);

  // Save sheets to backend
  useEffect(() => {
    const payload = { sheets };
    if (storeItemId) {
      workspaceAPI.updateItem(storeItemId, payload).catch(() => {});
    } else if (sheets.length > 0) {
      workspaceAPI.createOrUpdateItem({ app_name: 'sheets', item_key: 'data', data: payload })
        .then(res => setStoreItemId(res.data.id))
        .catch(() => {});
    }
  }, [sheets, storeItemId]);
  
  const selectedSheet = sheets.find(s => s.id === selectedSheetId) || null;

  // Sheet actions
  const addSheet = () => {
    if (!newSheetName.trim()) return;
    const newSheet: Sheet = {
      id: Date.now(),
      name: newSheetName.trim(),
      data: Array.from({ length: rows }, () => Array(cols).fill('')),
      created_at: new Date().toISOString()
    };
    setSheets(prev => [...prev, newSheet]);
    setNewSheetName('');
    setSelectedSheetId(newSheet.id);
  };

  const deleteSheet = (id: number) => {
    setSheets(prev => prev.filter(s => s.id !== id));
    if (selectedSheetId === id) setSelectedSheetId(sheets[0]?.id || null);
  };

  const renameSheet = (id: number, name: string) => {
    setSheets(prev => prev.map(s => s.id === id ? { ...s, name } : s));
  };

  const updateCell = (r: number, c: number, value: string) => {
    if (!selectedSheet) return;
    setSheets(prev => prev.map(s => {
      if (s.id === selectedSheet.id) {
        const newData = s.data.map((row) => row.slice());
        newData[r][c] = value;
        return { ...s, data: newData };
      }
      return s;
    }));
  };

  const colLabel = (i: number) => {
    let label = '';
    i++;
    while (i > 0) {
      const rem = (i - 1) % 26;
      label = String.fromCharCode(65 + rem) + label;
      i = Math.floor((i - 1) / 26);
    }
    return label;
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Top Header Bar */}
      <div className="bg-green-600 text-white px-2 sm:px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4 flex-1">
          <div className="flex items-center gap-2">
            <img 
              src="/box-white.svg" 
              alt="CITRICLOUD" 
              className="h-7 sm:h-8 w-auto rounded-lg"
            />
            <div className="flex flex-col">
              <span className="text-white font-semibold text-xs sm:text-sm" style={{ fontFamily: "'Source Code Pro', monospace" }}>CITRICLOUD.com</span>
              <span className="text-white/80 text-[8px] sm:text-[9px] tracking-wide" style={{ fontFamily: "'Source Code Pro', monospace" }}>Enterprise Cloud Platform</span>
            </div>
            <span className="text-white font-semibold text-sm">Sheets</span>
          </div>
          <div className="hidden lg:flex items-center text-sm text-white/90 px-3 py-1 bg-white/10 rounded">
            <FiExcel className="w-4 h-4 mr-1.5" />
            <span>{sheets.length} sheets</span>
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
          {/* Sidebar: Sheets */}
          <aside className="w-full md:w-64 border-r border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">My Sheets</h2>
              <form onSubmit={e => { e.preventDefault(); addSheet(); }} className="flex gap-2">
                <input 
                  value={newSheetName} 
                  onChange={e => setNewSheetName(e.target.value)} 
                  placeholder="New sheet" 
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-600" 
                />
                <button type="submit" className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors">
                  <FiPlus className="w-4 h-4" />
                </button>
              </form>
            </div>
            <ul className="p-2 overflow-y-auto">
              {sheets.map(sheet => (
                <li 
                  key={sheet.id} 
                  className={`group flex items-center justify-between px-3 py-2 rounded cursor-pointer transition-colors ${
                    selectedSheetId === sheet.id 
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => setSelectedSheetId(sheet.id)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FiExcel className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate text-sm font-medium">{sheet.name}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={e => { 
                        e.stopPropagation(); 
                        const newName = prompt('Rename sheet', sheet.name); 
                        if (newName) renameSheet(sheet.id, newName); 
                      }} 
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      <FiEdit2 className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={e => { 
                        e.stopPropagation(); 
                        if (window.confirm('Delete this sheet?')) deleteSheet(sheet.id); 
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

          {/* Main: Spreadsheet */}
          <section className="flex-1">
            {selectedSheet ? (
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedSheet.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{rows} rows × {cols} columns</p>
                </div>
                <div className="flex-1 overflow-auto p-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-auto">
                    <table className="border-collapse min-w-max">
                      <thead>
                        <tr>
                          <th className="sticky left-0 top-0 z-10 bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-300 px-3 py-2 border-r border-b border-gray-200 dark:border-gray-700">#</th>
                          {Array.from({ length: cols }).map((_, c) => (
                            <th key={c} className="sticky top-0 bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-300 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                              {colLabel(c)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedSheet.data.map((row, r) => (
                          <tr key={r}>
                            <td className="sticky left-0 bg-gray-50 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-300 px-3 py-2 border-r border-b border-gray-200 dark:border-gray-700">{r + 1}</td>
                            {row.map((value, c) => (
                              <td key={c} className="border-b border-gray-200 dark:border-gray-700">
                                <input
                                  value={value}
                                  onChange={(e) => updateCell(r, c, e.target.value)}
                                  className="w-32 sm:w-36 md:w-40 lg:w-44 px-2 py-2 text-sm outline-none bg-transparent text-gray-900 dark:text-white focus:bg-green-50 dark:focus:bg-gray-700"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {rows} rows × {cols} columns
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm font-medium transition-colors">
                      Export CSV
                    </button>
                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors">
                      Save
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FiExcel className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500 dark:text-gray-400">Select a sheet to view or edit</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
