import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiPlus, FiEdit2, FiTrash2, FiArrowLeft, FiStar } from 'react-icons/fi';
import { workspaceAPI } from '../../lib/workspaceApi';

type Team = {
  id: number;
  name: string;
  description?: string;
  members: string[];
  is_starred?: boolean;
  created_at?: string;
  updated_at?: string;
};

export default function TeamsApp() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Team | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [membersText, setMembersText] = useState('');

  useEffect(() => {
    // Load Teams from generic workspace API bucket "teams"
    workspaceAPI.getItems('teams').then((res: any) => {
      const data = res && res.data;
      setTeams(Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, []);

  const startCreate = () => {
    setEditing(null);
    setName('');
    setDescription('');
    setMembersText('');
  };

  const startEdit = (team: Team) => {
    setEditing(team);
    setName(team.name);
    setDescription(team.description || '');
    setMembersText((team.members || []).join(', '));
  };

  const saveTeam = async () => {
    const payload: Team = {
      id: editing?.id || Date.now(),
      name: name || 'Untitled Team',
      description,
      members: membersText.split(',').map(m => m.trim()).filter(Boolean),
      is_starred: editing?.is_starred || false,
    };
    if (editing) {
      await workspaceAPI.updateItem(payload.id, { app_name: 'teams', item_key: String(payload.id), data: payload });
      setTeams(teams.map(t => t.id === payload.id ? { ...t, ...payload } : t));
    } else {
      await workspaceAPI.createOrUpdateItem({ app_name: 'teams', item_key: String(payload.id), data: payload });
      setTeams([payload, ...teams]);
    }
    startCreate();
  };

  const deleteTeam = async (id: number) => {
    await workspaceAPI.deleteItem(id);
    setTeams(teams.filter(t => t.id !== id));
  };

  const toggleStar = async (id: number) => {
    setTeams(teams.map(t => t.id === id ? { ...t, is_starred: !t.is_starred } : t));
    const team = teams.find(t => t.id === id);
    if (team) {
      await workspaceAPI.updateItem(id, { app_name: 'teams', item_key: String(id), data: { ...team, is_starred: !team.is_starred } });
    }
  };

  const safeLower = (s: unknown) => (typeof s === 'string' ? s : '').toLowerCase();
  const searchLower = safeLower(search);
  const filtered = (Array.isArray(teams) ? teams : []).filter(t => (
    safeLower((t as any)?.name).includes(searchLower) ||
    safeLower((t as any)?.description).includes(searchLower)
  ));

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      <div className="bg-teal-700 text-white px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">            <img 
              src="/box-white.svg" 
              alt="CITRICLOUD" 
              className="h-7 sm:h-8 w-auto rounded-lg"
            />          <div className="flex flex-col">
            <span className="text-white font-semibold text-xs sm:text-sm" style={{ fontFamily: "'Source Code Pro', monospace" }}>CITRICLOUD.com</span>
            <span className="text-white/80 text-[8px] sm:text-[9px] tracking-wide" style={{ fontFamily: "'Source Code Pro', monospace" }}>Enterprise Cloud Platform</span>
          </div>
          <span className="font-semibold text-sm">Teams</span>
          <input
            className="ml-4 px-3 py-1.5 rounded bg-teal-800 text-white text-sm hidden md:block"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/workspace')} className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 rounded text-sm text-white">
            <FiArrowLeft className="inline mr-1" /> Back
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{editing ? 'Edit Team' : 'Create Team'}</h3>
            <button onClick={startCreate} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">New</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Team name"
              className="px-3 py-2 rounded border bg-white dark:bg-gray-900 text-sm"
            />
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="px-3 py-2 rounded border bg-white dark:bg-gray-900 text-sm"
            />
            <input
              value={membersText}
              onChange={(e) => setMembersText(e.target.value)}
              placeholder="Members (comma-separated)"
              className="px-3 py-2 rounded border bg-white dark:bg-gray-900 text-sm"
            />
          </div>
          <div className="mt-3 flex items-center justify-end gap-2">
            <button onClick={saveTeam} className="inline-flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded text-sm">
              <FiPlus className="w-4 h-4" /> {editing ? 'Save Changes' : 'Add Team'}
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-500 dark:text-gray-400">No teams yet</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(team => (
              <div key={team.id} className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FiUsers className="w-4 h-4 text-teal-700" />
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">{team.name}</span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{team.description}</div>
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">Members: {(team.members || []).join(', ') || '—'}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleStar(team.id)} className={`p-1.5 rounded ${team.is_starred ? 'text-yellow-500' : 'text-gray-500'} hover:bg-gray-100 dark:hover:bg-gray-700`}><FiStar className="w-4 h-4" /></button>
                    <button onClick={() => startEdit(team)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"><FiEdit2 className="w-4 h-4" /></button>
                    <button onClick={() => deleteTeam(team.id)} className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><FiTrash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
