import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiArrowLeft, FiEdit2, FiTrash2, FiPlus, FiAlertTriangle } from 'react-icons/fi';
import BrandLogo from '../../components/BrandLogo';
import { RichTextEditor } from '../../components/RichTextEditor';
import { workspaceAPI } from '../../lib/workspaceApi';

type PlannerEvent = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  notes?: string;
};

function uuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function groupBy<T>(arr: T[], key: (item: T) => string) {
  return arr.reduce((acc, item) => {
    const k = key(item);
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

export default function PlannerApp() {
  const navigate = useNavigate();
  const [storeItemId, setStoreItemId] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Track dark mode
  useEffect(() => {
    const checkDarkMode = () => setIsDarkMode(document.documentElement.classList.contains('dark'));
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  const [events, setEvents] = useState<PlannerEvent[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));
  const [newNotes, setNewNotes] = useState('');
  const [editing, setEditing] = useState<PlannerEvent | null>(null);

  const addEvent = () => {
    if (!newTitle.trim() || !newDate) return;
    setEvents(prev => [...prev, { id: uuid(), title: newTitle.trim(), date: newDate, notes: newNotes.trim() }]);
    setNewTitle('');
    setNewDate(new Date().toISOString().slice(0, 10));
    setNewNotes('');
  };
  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };
  const startEdit = (event: PlannerEvent) => {
    setEditing({ ...event });
  };
  const saveEdit = () => {
    if (!editing) return;
    setEvents(prev => prev.map(e => e.id === editing.id ? editing : e));
    setEditing(null);
  };

  const grouped = groupBy(events, e => e.date);
  const sortedDates = Object.keys(grouped).sort();
  const upcomingCount = events.filter(e => new Date(e.date) >= new Date()).length;

  useEffect(() => {
    workspaceAPI.getItems('planner', 'events').then(res => {
      const items = res.data || [];
      if (items.length > 0) {
        const item = items[0];
        setStoreItemId(item.id);
        const data = item.data || {};
        if (Array.isArray(data.events)) setEvents(data.events);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const payload = { events };
    if (storeItemId) {
      workspaceAPI.updateItem(storeItemId, payload).catch(() => {});
    } else if (events.length > 0) {
      workspaceAPI.createOrUpdateItem({ app_name: 'planner', item_key: 'events', data: payload })
        .then(res => setStoreItemId(res.data.id))
        .catch(() => {});
    }
  }, [events, storeItemId]);

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Top Header Bar */}
      <div className="bg-pink-500 text-white px-2 sm:px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4 flex-1">
          <div className="flex items-center gap-2">
            <img src={isDarkMode ? "/darkmode-cc-logo.svg" : "/lightmode-cc-logo.svg"} alt="CITRICLOUD" className="h-12 w-auto" />
            <span className="text-white font-semibold text-sm">Planner</span>
          </div>
          <div className="hidden lg:flex items-center text-sm text-white/90 px-3 py-1 bg-white/10 rounded">
            <FiCalendar className="w-4 h-4 mr-1.5" />
            <span>{upcomingCount} upcoming</span>
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
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          {/* Add Event */}
          <form onSubmit={e => { e.preventDefault(); editing ? saveEdit() : addEvent(); }} className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 sm:mb-6">
            <input
              type="text"
              value={editing ? editing.title : newTitle}
              onChange={e => editing ? setEditing({ ...editing, title: e.target.value }) : setNewTitle(e.target.value)}
              placeholder="Event title"
              className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="date"
              value={editing ? editing.date : newDate}
              onChange={e => editing ? setEditing({ ...editing, date: e.target.value }) : setNewDate(e.target.value)}
              className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <RichTextEditor
              value={editing ? editing.notes || '' : newNotes}
              onChange={value => editing ? setEditing({ ...editing, notes: value }) : setNewNotes(value)}
              placeholder="Notes (optional)"
              minHeight="100px"
              compact={true}
            />
            <div className="flex gap-2">
              <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-sm font-medium transition-colors">
                <FiPlus className="w-4 h-4" />
                {editing ? 'Save' : 'Add Event'}
              </button>
              {editing && (
                <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors">Cancel</button>
              )}
            </div>
          </form>
          {/* Events List */}
          {sortedDates.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400 text-center py-12">No events yet.</div>
          ) : (
            <div className="space-y-6">
              {sortedDates.map(date => (
                <div key={date}>
                  <div className="text-lg font-bold text-pink-500 dark:text-pink-300 mb-3 flex items-center gap-2">
                    <FiCalendar className="w-5 h-5" />
                    <span>{new Date(date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">({grouped[date].length} event{grouped[date].length > 1 ? 's' : ''})</span>
                  </div>
                  <ul className="space-y-2">
                    {grouped[date].map(event => (
                      <li key={event.id} className="group bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-lg hover:border-pink-500 dark:hover:border-pink-500 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white">{event.title}</div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEdit(event)} className="p-2 text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 rounded transition-colors" title="Edit">
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteEvent(event.id)} className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors" title="Delete">
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {event.notes && (
                          <div 
                            className="text-sm text-gray-500 dark:text-gray-400 mt-2 prose prose-sm dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: event.notes }}
                          />
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
