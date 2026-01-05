import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFolderPlus, FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';
import { workspaceAPI } from '../../lib/workspaceApi';

type Task = {
  id: string;
  title: string;
  assignee?: string;
  status: 'Backlog' | 'In Progress' | 'Review' | 'Done';
  due?: string; // ISO date
  subtasks?: Array<{ id: string; title: string; done: boolean }>;
  seconds?: number;
  running?: boolean;
};

type Project = {
  id: string;
  name: string;
  description?: string;
  color: string;
  tasks: Task[];
};

type Board = {
  id: string;
  name: string;
  columns: string[];
};

const statuses: Task['status'][] = ['Backlog', 'In Progress', 'Review', 'Done'];

export default function ProjectsApp() {
  const navigate = useNavigate();
  const [storeItemId, setStoreItemId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'Overview' | 'Projects' | 'Calendar' | 'List' | 'Grid' | 'Kanban Board' | 'Timeline' | 'Raster'>('Overview');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [boards, setBoards] = useState<Board[]>([
    { id: '1', name: 'Default Kanban Board', columns: ['Backlog', 'In Progress', 'Review', 'Done'] },
  ]);
  const [selectedBoard, setSelectedBoard] = useState<string>('1');

  // Load projects from backend
  useEffect(() => {
    workspaceAPI.getItems('projects', 'data').then(res => {
      const items = res.data || [];
      if (items.length > 0) {
        const item = items[0];
        setStoreItemId(item.id);
        const data = item.data || {};
        if (Array.isArray(data.projects)) setProjects(data.projects);
        if (Array.isArray(data.boards) && data.boards.length > 0) setBoards(data.boards);
      }
    }).catch(() => {});
  }, []);

  // Save projects to backend
  useEffect(() => {
    const payload = { projects, boards };
    if (storeItemId) {
      workspaceAPI.updateItem(storeItemId, payload).catch(() => {});
    } else if (projects.length > 0 || boards.length > 1) {
      workspaceAPI.createOrUpdateItem({ app_name: 'projects', item_key: 'data', data: payload })
        .then(res => setStoreItemId(res.data.id))
        .catch(() => {});
    }
  }, [projects, boards, storeItemId]);

  // Flatten all tasks from all projects for views that need it
  const allTasks = useMemo(() => projects.flatMap(p => p.tasks), [projects]);

  const currentBoard = boards.find(b => b.id === selectedBoard) || boards[0];

  const addBoard = (name: string, columns: string[]) => {
    setBoards(prev => [...prev, { id: String(Date.now()), name, columns }]);
  };

  const deleteBoard = (boardId: string) => {
    if (boards.length <= 1) {
      alert('Cannot delete the last Kanban Board!');
      return;
    }
    if (confirm('Are you sure you want to delete this Kanban Board?')) {
      setBoards(prev => prev.filter(b => b.id !== boardId));
      if (selectedBoard === boardId) setSelectedBoard(boards[0].id);
    }
  };

  const editBoard = (boardId: string, name: string, columns: string[]) => {
    setBoards(prev => prev.map(b => b.id === boardId ? { ...b, name, columns } : b));
  };

  // Map task status to board columns
  const getTaskColumn = (task: Task, boardColumns: string[]): string => {
    // Try to find exact match
    if (boardColumns.includes(task.status)) return task.status;
    // Map common status names
    const statusMap: Record<string, string[]> = {
      'Backlog': ['To Do', 'Backlog', 'Open', 'New'],
      'In Progress': ['Doing', 'In Progress', 'Development', 'Working'],
      'Review': ['Review', 'Testing', 'QA', 'Validation'],
      'Done': ['Done', 'Completed', 'Closed', 'Finished', 'Deployment']
    };
    for (const [status, aliases] of Object.entries(statusMap)) {
      if (task.status === status) {
        const match = boardColumns.find(col => aliases.includes(col));
        if (match) return match;
      }
    }
    // Default to first column if no match
    return boardColumns[0] || 'Backlog';
  };

  // Timer tick
  useState(() => {
    const t = setInterval(() => {
      setProjects(prev => prev.map(proj => ({
        ...proj,
        tasks: proj.tasks.map(task => task.running ? { ...task, seconds: (task.seconds||0)+1 } : task)
      })));
    }, 1000);
    return () => clearInterval(t);
  });

  useEffect(() => {
    workspaceAPI.getItems('projects', 'state').then(res => {
      const items = res.data || [];
      if (items.length > 0) {
        const item = items[0];
        setStoreItemId(item.id);
        const data = item.data || {};
        if (data.projects) setProjects(data.projects);
        if (data.boards) setBoards(data.boards);
        if (data.selectedBoard) setSelectedBoard(data.selectedBoard);
      }
    }).catch(() => {
      // fallback to defaults
    });
  }, []);

  useEffect(() => {
    const payload = { projects, boards, selectedBoard };
    if (storeItemId) {
      workspaceAPI.updateItem(storeItemId, { data: payload }).catch(() => {});
    } else {
      workspaceAPI.createOrUpdateItem({ app_name: 'projects', item_key: 'state', data: payload })
        .then(res => setStoreItemId(res.data.id))
        .catch(() => {});
    }
  }, [projects, boards, selectedBoard]);

  const addProject = (name: string, description: string = '', color: string = 'bg-blue-500') => {
    setProjects(prev => [...prev, { id: String(Date.now()), name, description, color, tasks: [] }]);
  };

  const deleteProject = (projectId: string) => {
    if (confirm('Are you sure you want to delete this project and all its tasks?')) {
      setProjects(prev => prev.filter(p => p.id !== projectId));
      if (selectedProject === projectId) setSelectedProject(null);
    }
  };

  const addTaskToProject = (projectId: string, title: string) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { ...p, tasks: [...p.tasks, { id: String(Date.now()), title, status: 'Backlog', seconds: 0, subtasks: [] }] }
        : p
    ));
  };

  const deleteTask = (projectId: string, taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      setProjects(prev => prev.map(p => 
        p.id === projectId 
          ? { ...p, tasks: p.tasks.filter(t => t.id !== taskId) }
          : p
      ));
    }
  };

  const editTask = (projectId: string, taskId: string, newTitle: string) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, title: newTitle } : t) }
        : p
    ));
  };

  const addSubtask = (projectId: string, taskId: string, title: string) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, subtasks: [...(t.subtasks||[]), { id: `${taskId}-${Date.now()}`, title, done: false }] } : t) }
        : p
    ));
  };

  const toggleSubtask = (projectId: string, taskId: string, subtaskId: string) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, subtasks: (t.subtasks||[]).map(st => st.id === subtaskId ? { ...st, done: !st.done } : st) } : t) }
        : p
    ));
  };

  const deleteSubtask = (projectId: string, taskId: string, subtaskId: string) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, subtasks: (t.subtasks || []).filter(st => st.id !== subtaskId) } : t) }
        : p
    ));
  };

  const moveStatus = (projectId: string, taskId: string, statusOrColumn: string) => {
    // Map column name back to standard status if needed
    let actualStatus: Task['status'];
    if (statuses.includes(statusOrColumn as Task['status'])) {
      actualStatus = statusOrColumn as Task['status'];
    } else {
      // Map from column name to standard status
      const reverseStatusMap: Record<string, Task['status']> = {
        'To Do': 'Backlog', 'Backlog': 'Backlog', 'Open': 'Backlog', 'New': 'Backlog',
        'Doing': 'In Progress', 'In Progress': 'In Progress', 'Development': 'In Progress', 'Working': 'In Progress',
        'Review': 'Review', 'Testing': 'Review', 'QA': 'Review', 'Validation': 'Review',
        'Done': 'Done', 'Completed': 'Done', 'Closed': 'Done', 'Finished': 'Done', 'Deployment': 'Done'
      };
      actualStatus = reverseStatusMap[statusOrColumn] || 'Backlog';
    }
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, status: actualStatus } : t) }
        : p
    ));
  };

  const toggleTimer = (projectId: string, taskId: string) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, running: !t.running } : t) }
        : p
    ));
  };

  const secondsToHMS = (s?: number) => {
    const sec = s||0; const h = Math.floor(sec/3600); const m = Math.floor((sec%3600)/60); const r = sec%60;
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${r.toString().padStart(2,'0')}`;
  };

  const days = useMemo(() => Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(); d.setDate(d.getDate()+i); return d;
  }), []);

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Top Header Bar */}
      <div className="bg-orange-500 text-white px-2 sm:px-4 py-2 flex items-center justify-between">
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
            <span className="text-white font-semibold text-sm">Projects</span>
          </div>
          <div className="hidden lg:flex items-center text-sm text-white/90 px-3 py-1 bg-white/10 rounded">
            <FiFolderPlus className="w-4 h-4 mr-1.5" />
            <span>{projects.length} projects • {allTasks.length} tasks</span>
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


      {/* Tab Navigation */}
      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {(['Overview','Projects','Calendar','List','Grid','Kanban Board','Timeline','Raster'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab===tab? 'bg-orange-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>{tab}</button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <section className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">

          {/* Overview Tab - Real-time Dashboard */}
          {activeTab === 'Overview' && (
            <div className="space-y-6">
              {/* Real-time Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20 border border-orange-200 dark:border-orange-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-orange-700 dark:text-orange-300">Total Projects</h3>
                    <span className="text-2xl">📁</span>
                  </div>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-900 dark:text-orange-100">{projects.length}</div>
                  <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">Active projects</div>
                </div>

                <div className="glass-card p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 border border-green-200 dark:border-green-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-green-700 dark:text-green-300">Total Tasks</h3>
                    <span className="text-2xl">📋</span>
                  </div>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-900 dark:text-green-100">{allTasks.length}</div>
                  <div className="text-xs text-green-600 dark:text-green-400 mt-1">{allTasks.filter(t => t.status !== 'Done').length} active</div>
                </div>

                <div className="glass-card p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-purple-700 dark:text-purple-300">In Progress</h3>
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-900 dark:text-purple-100">{allTasks.filter(t => t.status === 'In Progress').length}</div>
                  <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">{allTasks.filter(t => t.running).length} with active timers</div>
                </div>

                <div className="glass-card p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20 border border-orange-200 dark:border-orange-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-orange-700 dark:text-orange-300">Completion Rate</h3>
                    <span className="text-2xl">✅</span>
                  </div>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-900 dark:text-orange-100">
                    {allTasks.length > 0 ? Math.round((allTasks.filter(t => t.status === 'Done').length / allTasks.length) * 100) : 0}%
                  </div>
                  <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">{allTasks.filter(t => t.status === 'Done').length} completed</div>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:p-6">
                {/* Status Distribution Chart */}
                <div className="glass-card p-4 sm:p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-600/30">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Task Status Distribution</h3>
                  <div className="space-y-3">
                    {currentBoard.columns.map((col, idx) => {
                      const tasksInColumn = allTasks.filter(t => getTaskColumn(t, currentBoard.columns) === col);
                      const count = tasksInColumn.length;
                      const percentage = allTasks.length > 0 ? (count / allTasks.length) * 100 : 0;
                      const colors = ['bg-gray-500 dark:bg-gray-600', 'bg-blue-500 dark:bg-blue-600', 'bg-purple-500 dark:bg-purple-600', 'bg-green-500 dark:bg-green-600', 'bg-orange-500 dark:bg-orange-600', 'bg-pink-500 dark:bg-pink-600'];
                      const color = colors[idx % colors.length];
                      return (
                        <div key={col}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{col}</span>
                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{count} ({percentage.toFixed(0)}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <div className={`${color} h-3 rounded-full transition-all duration-500`} style={{width: `${percentage}%`}}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Project Progress Chart */}
                <div className="glass-card p-4 sm:p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-600/30">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Project Progress</h3>
                  <div className="space-y-3">
                    {projects.map(proj => {
                      const total = proj.tasks.length;
                      const done = proj.tasks.filter(t => t.status === 'Done').length;
                      const percentage = total > 0 ? (done / total) * 100 : 0;
                      return (
                        <div key={proj.id}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${proj.color}`}></div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{proj.name}</span>
                            </div>
                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{done}/{total} ({percentage.toFixed(0)}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <div className={`${proj.color} h-3 rounded-full transition-all duration-500`} style={{width: `${percentage}%`}}></div>
                          </div>
                        </div>
                      );
                    })}
                    {projects.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No projects yet</p>}
                  </div>
                </div>
              </div>

              {/* Time Tracking & Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:p-6">
                {/* Time Tracking Summary */}
                <div className="glass-card p-4 sm:p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-600/30">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">⏱️ Time Tracking</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-orange-50 dark:bg-orange-900/30">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Time Tracked</div>
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 dark:text-gray-100">
                          {secondsToHMS(allTasks.reduce((sum, t) => sum + (t.seconds || 0), 0))}
                        </div>
                      </div>
                      <span className="text-4xl">⏰</span>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Top Time Consumers</h4>
                      {allTasks
                        .filter(t => (t.seconds || 0) > 0)
                        .sort((a, b) => (b.seconds || 0) - (a.seconds || 0))
                        .slice(0, 5)
                        .map(task => (
                          <div key={task.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">{task.title}</span>
                            <span className="text-sm font-mono font-bold text-gray-900 dark:text-gray-100 ml-2">{secondsToHMS(task.seconds)}</span>
                          </div>
                        ))}
                      {allTasks.filter(t => (t.seconds || 0) > 0).length === 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">No time tracked yet</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Team Activity */}
                <div className="glass-card p-4 sm:p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-600/30">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">👥 Team Activity</h3>
                  <div className="space-y-3">
                    {Array.from(new Set(allTasks.map(t => t.assignee).filter(Boolean))).map(assignee => {
                      const userTasks = allTasks.filter(t => t.assignee === assignee);
                      const completed = userTasks.filter(t => t.status === 'Done').length;
                      const inProgress = userTasks.filter(t => t.status === 'In Progress').length;
                      return (
                        <div key={assignee} className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-700/30 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                {assignee?.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-semibold text-gray-800 dark:text-gray-100">{assignee}</span>
                            </div>
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{userTasks.length} tasks</span>
                          </div>
                          <div className="flex gap-2 text-xs">
                            <span className="px-2 py-1 rounded bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">✓ {completed} done</span>
                            <span className="px-2 py-1 rounded bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300">⚡ {inProgress} in progress</span>
                          </div>
                        </div>
                      );
                    })}
                    {Array.from(new Set(allTasks.map(t => t.assignee).filter(Boolean))).length === 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No team members assigned yet</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Upcoming Deadlines */}
              <div className="glass-card p-4 sm:p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-600/30">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">📅 Upcoming Deadlines</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allTasks
                    .filter(t => t.due && t.status !== 'Done')
                    .sort((a, b) => new Date(a.due!).getTime() - new Date(b.due!).getTime())
                    .slice(0, 6)
                    .map(task => {
                      const dueDate = new Date(task.due!);
                      const today = new Date();
                      const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / 86400000);
                      const isOverdue = daysUntil < 0;
                      const isUrgent = daysUntil <= 2 && daysUntil >= 0;
                      return (
                        <div key={task.id} className={`p-4 rounded-xl border-2 ${
                          isOverdue ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700' :
                          isUrgent ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700' :
                          'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700'
                        }`}>
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-100 flex-1">{task.title}</h4>
                            <span className="text-xs px-2 py-1 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">{task.status}</span>
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Assignee: {task.assignee || 'Unassigned'}</div>
                          <div className={`text-sm font-bold ${
                            isOverdue ? 'text-red-700 dark:text-red-300' :
                            isUrgent ? 'text-orange-700 dark:text-orange-300' :
                            'text-orange-700 dark:text-orange-300'
                          }`}>
                            {isOverdue ? `Overdue by ${Math.abs(daysUntil)} day(s)` :
                             daysUntil === 0 ? 'Due today!' :
                             daysUntil === 1 ? 'Due tomorrow' :
                             `Due in ${daysUntil} days`}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{dueDate.toLocaleDateString()}</div>
                        </div>
                      );
                    })}
                  {allTasks.filter(t => t.due && t.status !== 'Done').length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4 col-span-full">No upcoming deadlines</p>
                  )}
                </div>
              </div>

              {/* Recent Activity Feed */}
              <div className="glass-card p-4 sm:p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-600/30">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">🔔 Quick Stats</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-100">{allTasks.filter(t => t.subtasks && t.subtasks.length > 0).length}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Tasks with subtasks</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-100">{allTasks.reduce((sum, t) => sum + (t.subtasks?.length || 0), 0)}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total subtasks</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-100">{allTasks.filter(t => !t.due).length}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Tasks without deadline</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-100">{allTasks.filter(t => t.status === 'Review').length}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Tasks in review</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Projects Tab - Manage Projects and their Tasks */}
          {activeTab === 'Projects' && (
            <div className="space-y-4">
              {/* Add New Project */}
              <div className="glass-card p-4 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-600/30">
                <form onSubmit={(e)=>{e.preventDefault(); const fd=new FormData(e.currentTarget); const name=String(fd.get('name')||'').trim(); const desc=String(fd.get('description')||'').trim(); const color=String(fd.get('color')||'bg-orange-500'); if(name) addProject(name, desc, color); (e.currentTarget as HTMLFormElement).reset();}} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name</label>
                    <input name="name" placeholder="New project name..." className="glass-input w-full dark:bg-gray-700/60 dark:text-gray-100 dark:placeholder-gray-400" required />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (optional)</label>
                    <input name="description" placeholder="Project description..." className="glass-input w-full dark:bg-gray-700/60 dark:text-gray-100 dark:placeholder-gray-400" />
                  </div>
                  <div className="w-40">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
                    <select name="color" className="glass-input w-full dark:bg-gray-700/60 dark:text-gray-100">
                      <option value="bg-orange-500">Orange</option>
                      <option value="bg-blue-500">Blue</option>
                      <option value="bg-green-500">Green</option>
                      <option value="bg-purple-500">Purple</option>
                      <option value="bg-red-500">Red</option>
                      <option value="bg-pink-500">Pink</option>
                    </select>
                  </div>
                  <button className="glass-button px-3 sm:px-4 lg:px-6 py-3 rounded-xl text-white">Add Project</button>
                </form>
              </div>

              {/* Projects List */}
              {projects.map(project => (
                <div key={project.id} className="glass-card p-4 sm:p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-600/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${project.color}`}></div>
                      <div>
                        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 dark:text-gray-100">{project.name}</h3>
                        {project.description && <p className="text-sm text-gray-600 dark:text-gray-400">{project.description}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setSelectedProject(selectedProject === project.id ? null : project.id)} className="px-4 py-2 rounded-lg bg-orange-500/80 dark:bg-orange-600/80 text-white hover:bg-orange-600 dark:hover:bg-orange-700">
                        {selectedProject === project.id ? 'Hide Tasks' : 'Show Tasks'}
                      </button>
                      <button onClick={() => deleteProject(project.id)} className="px-4 py-2 rounded-lg bg-red-500/80 dark:bg-red-600/80 text-white hover:bg-red-600 dark:hover:bg-red-700">Delete</button>
                    </div>
                  </div>

                  {/* Project Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:p-4 mb-4">
                    <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700/60">
                      <div className="text-xs text-gray-600 dark:text-gray-400">Total Tasks</div>
                      <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 dark:text-gray-100">{project.tasks.length}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/40">
                      <div className="text-xs text-orange-600 dark:text-orange-400">In Progress</div>
                      <div className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-700 dark:text-orange-300">{project.tasks.filter(t => t.status === 'In Progress').length}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/40">
                      <div className="text-xs text-purple-600 dark:text-purple-400">Review</div>
                      <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-700 dark:text-purple-300">{project.tasks.filter(t => t.status === 'Review').length}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/40">
                      <div className="text-xs text-green-600 dark:text-green-400">Done</div>
                      <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-700 dark:text-green-300">{project.tasks.filter(t => t.status === 'Done').length}</div>
                    </div>
                  </div>

                  {/* Tasks List (expandable) */}
                  {selectedProject === project.id && (
                    <div className="space-y-3 mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                      {/* Add Task Form */}
                      <form onSubmit={(e)=>{e.preventDefault(); const fd=new FormData(e.currentTarget); const title=String(fd.get('title')||'').trim(); if(title) addTaskToProject(project.id, title); (e.currentTarget as HTMLFormElement).reset();}} className="flex gap-2">
                        <input name="title" placeholder="Add a task to this project..." className="glass-input flex-1 dark:bg-gray-700/60 dark:text-gray-100 dark:placeholder-gray-400" />
                        <button className="glass-button px-4 rounded-xl text-white">Add Task</button>
                      </form>

                      {/* Tasks */}
                      {project.tasks.map(task => (
                        <div key={task.id} className="p-4 rounded-xl bg-white/70 dark:bg-gray-700/70 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-between mb-2">
                            <input 
                              defaultValue={task.title} 
                              onBlur={(e)=>editTask(project.id, task.id, e.target.value)} 
                              className="font-medium text-gray-800 dark:text-gray-100 bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-500 dark:focus:border-blue-400 outline-none flex-1" 
                            />
                            <div className="flex gap-2 items-center">
                              <select value={task.status} onChange={(e)=>moveStatus(project.id, task.id, e.target.value as Task['status'])} className="text-xs px-2 py-1 rounded bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600">
                                {statuses.map(s => <option key={s}>{s}</option>)}
                              </select>
                              <button onClick={()=>toggleTimer(project.id, task.id)} className="px-2 py-1 rounded-lg bg-orange-500/80 dark:bg-orange-600/80 text-white hover:bg-orange-600 dark:hover:bg-orange-700 text-xs">{task.running? 'Stop' : 'Start'}</button>
                              <button onClick={()=>deleteTask(project.id, task.id)} className="px-2 py-1 rounded-lg bg-red-500/80 dark:bg-red-600/80 text-white hover:bg-red-600 dark:hover:bg-red-700 text-xs">Del</button>
                            </div>
                          </div>
                          
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                            <span>Assignee: {task.assignee || 'Unassigned'}</span> • <span>Time: {secondsToHMS(task.seconds)}</span>
                          </div>

                          {/* Subtasks */}
                          <div className="mt-3 space-y-2">
                            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">Subtasks:</div>
                            {(task.subtasks || []).map(subtask => (
                              <div key={subtask.id} className="flex items-center gap-2 text-sm">
                                <input 
                                  type="checkbox" 
                                  checked={subtask.done} 
                                  onChange={() => toggleSubtask(project.id, task.id, subtask.id)}
                                  className="rounded"
                                />
                                <span className={`flex-1 ${subtask.done ? 'line-through text-gray-500 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>{subtask.title}</span>
                                <button onClick={() => deleteSubtask(project.id, task.id, subtask.id)} className="text-red-500 hover:text-red-700 text-xs">✕</button>
                              </div>
                            ))}
                            <form onSubmit={(e)=>{e.preventDefault(); const fd=new FormData(e.currentTarget); const title=String(fd.get('subtitle')||'').trim(); if(title) addSubtask(project.id, task.id, title); (e.currentTarget as HTMLFormElement).reset();}} className="flex gap-2">
                              <input name="subtitle" placeholder="Add subtask..." className="glass-input flex-1 text-sm dark:bg-gray-600/60 dark:text-gray-100 dark:placeholder-gray-400" />
                              <button className="px-3 py-1 rounded-lg bg-green-500/80 dark:bg-green-600/80 text-white hover:bg-green-600 dark:hover:bg-green-700 text-xs">Add</button>
                            </form>
                          </div>
                        </div>
                      ))}
                      {project.tasks.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No tasks yet. Add one above!</p>}
                    </div>
                  )}
                </div>
              ))}
              {projects.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-8">No projects yet. Create one above!</p>}
            </div>
          )}

          {/* Calendar Tab */}
          {activeTab === 'Calendar' && (
            <div className="glass-card p-4 sm:p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-600/30">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Calendar View</h3>
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-sm font-semibold text-gray-600 dark:text-gray-300 py-2">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 35 }).map((_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - date.getDay() + i);
                  const dateStr = date.toISOString().slice(0, 10);
                  const dayTasks = allTasks.filter(t => t.due?.slice(0, 10) === dateStr);
                  const isToday = dateStr === new Date().toISOString().slice(0, 10);
                  const isCurrentMonth = date.getMonth() === new Date().getMonth();
                  
                  return (
                    <div
                      key={i}
                      className={`min-h-24 p-2 rounded-xl border ${
                        isToday
                          ? 'bg-orange-50 dark:bg-orange-900/30 border-orange-400 dark:border-orange-600'
                          : isCurrentMonth
                          ? 'bg-white/60 dark:bg-gray-700/60 border-gray-200 dark:border-gray-600'
                          : 'bg-gray-50/40 dark:bg-gray-800/40 border-gray-100 dark:border-gray-700'
                      }`}
                    >
                      <div className={`text-xs font-medium mb-1 ${
                        isToday ? 'text-orange-600 dark:text-orange-400' : 
                        isCurrentMonth ? 'text-gray-700 dark:text-gray-200' : 
                        'text-gray-400 dark:text-gray-500'
                      }`}>
                        {date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayTasks.slice(0, 3).map(task => (
                          <div
                            key={task.id}
                            className={`text-xs px-2 py-1 rounded-lg truncate ${
                              task.status === 'Done'
                                ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                                : task.status === 'In Progress'
                                ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300'
                                : task.status === 'Review'
                                ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                            title={task.title}
                          >
                            {task.title}
                          </div>
                        ))}
                        {dayTasks.length > 3 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 pl-2">
                            +{dayTasks.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'List' && (
            <div className="glass-card p-4 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-600/30 overflow-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-600 dark:text-gray-300 font-semibold">
                    <th className="py-2">Project</th>
                    <th className="py-2">Task</th>
                    <th className="py-2">Assignee</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Due</th>
                    <th className="py-2">Timer</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.flatMap(proj => proj.tasks.map(t => ({ ...t, projectId: proj.id, projectName: proj.name, projectColor: proj.color }))).map(t => (
                    <tr key={`${t.projectId}-${t.id}`} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${t.projectColor}`}></div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{t.projectName}</span>
                        </div>
                      </td>
                      <td className="py-2">
                        <input 
                          defaultValue={t.title} 
                          onBlur={(e)=>editTask(t.projectId, t.id, e.target.value)} 
                          className="glass-input dark:bg-gray-700/60 dark:text-gray-100 dark:border-gray-600 text-gray-800" 
                        />
                      </td>
                      <td className="py-2"><input defaultValue={t.assignee} onBlur={(e)=>setProjects(p=>p.map(proj=>proj.id===t.projectId?{...proj,tasks:proj.tasks.map(x=>x.id===t.id?{...x, assignee: e.target.value}:x)}:proj))} className="glass-input dark:bg-gray-700/60 dark:text-gray-100 dark:border-gray-600" placeholder="Assign" /></td>
                      <td className="py-2">
                        <select value={getTaskColumn(t, currentBoard.columns)} onChange={(e)=>moveStatus(t.projectId, t.id, e.target.value)} className="px-2 py-1 rounded-xl bg-white/60 dark:bg-gray-700/80 dark:text-gray-200 border border-gray-200 dark:border-gray-600">
                          {currentBoard.columns.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </td>
                      <td className="py-2"><input type="date" defaultValue={t.due?.slice(0,10)} onBlur={(e)=>setProjects(p=>p.map(proj=>proj.id===t.projectId?{...proj,tasks:proj.tasks.map(x=>x.id===t.id?{...x, due: e.target.value}:x)}:proj))} className="glass-input dark:bg-gray-700/60 dark:text-gray-100 dark:border-gray-600" /></td>
                      <td className="py-2 text-gray-700 dark:text-gray-200 font-mono">{secondsToHMS(t.seconds)}</td>
                      <td className="py-2 space-x-1">
                        <button onClick={()=>toggleTimer(t.projectId, t.id)} className="px-3 py-1 rounded-lg bg-orange-500/80 dark:bg-orange-600/80 text-white hover:bg-orange-600 dark:hover:bg-orange-700">{t.running? 'Stop' : 'Start'}</button>
                        <button onClick={()=>addSubtask(t.projectId, t.id, 'New subtask')} className="px-3 py-1 rounded-lg bg-green-500/80 dark:bg-green-600/80 text-white hover:bg-green-600 dark:hover:bg-green-700">+ Sub</button>
                        <button onClick={()=>deleteTask(t.projectId, t.id)} className="px-3 py-1 rounded-lg bg-red-500/80 dark:bg-red-600/80 text-white hover:bg-red-600 dark:hover:bg-red-700">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'Grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.flatMap(proj => proj.tasks.map(t => ({ ...t, projectId: proj.id, projectName: proj.name, projectColor: proj.color }))).map(t => (
                <div key={`${t.projectId}-${t.id}`} className="glass-card p-4 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-600/30">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${t.projectColor}`}></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{t.projectName}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <input 
                      defaultValue={t.title} 
                      onBlur={(e)=>editTask(t.projectId, t.id, e.target.value)} 
                      className="font-semibold text-gray-800 dark:text-gray-100 bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 outline-none flex-1" 
                    />
                    <span className="text-xs px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 ml-2">{t.status}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Assignee: {t.assignee || 'Unassigned'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Due: {t.due?.slice(0,10) || '-'}</p>
                  <div className="mt-2 text-sm text-gray-700 dark:text-gray-200 font-mono">Time: {secondsToHMS(t.seconds)}</div>
                  <div className="mt-3 flex gap-2 flex-wrap">
                    <button onClick={()=>toggleTimer(t.projectId, t.id)} className="px-3 py-1 rounded-lg bg-orange-500/80 dark:bg-orange-600/80 text-white hover:bg-orange-600 dark:hover:bg-orange-700 text-sm">{t.running? 'Stop' : 'Start'}</button>
                    <button onClick={()=>addSubtask(t.projectId, t.id, 'New subtask')} className="px-3 py-1 rounded-lg bg-green-500/80 dark:bg-green-600/80 text-white hover:bg-green-600 dark:hover:bg-green-700 text-sm">+ Sub</button>
                    <button onClick={()=>deleteTask(t.projectId, t.id)} className="px-3 py-1 rounded-lg bg-red-500/80 dark:bg-red-600/80 text-white hover:bg-red-600 dark:hover:bg-red-700 text-sm">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Kanban Board' && (
            <div className="space-y-4">
              {/* Kanban Board Management */}
              <div className="glass-card p-4 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-600/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Kanban Board:</label>
                    <select 
                      value={selectedBoard} 
                      onChange={(e) => setSelectedBoard(e.target.value)}
                      className="px-4 py-2 rounded-xl bg-white/60 dark:bg-gray-700/80 dark:text-gray-200 border border-gray-200 dark:border-gray-600 font-medium"
                    >
                      {boards.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        const name = prompt('Kanban Board name:');
                        if (!name) return;
                        const columnsStr = prompt('Enter columns (comma-separated):', 'To Do,In Progress,Done');
                        if (!columnsStr) return;
                        const columns = columnsStr.split(',').map(c => c.trim()).filter(Boolean);
                        if (columns.length > 0) addBoard(name, columns);
                      }}
                      className="px-4 py-2 rounded-xl bg-green-500/80 dark:bg-green-600/80 text-white hover:bg-green-600 dark:hover:bg-green-700 font-medium"
                    >
                      + New Kanban Board
                    </button>
                    <button 
                      onClick={() => deleteBoard(currentBoard.id)}
                      className="px-4 py-2 rounded-xl bg-red-500/80 dark:bg-red-600/80 text-white hover:bg-red-600 dark:hover:bg-red-700 font-medium"
                    >
                      Delete Kanban Board
                    </button>
                  </div>
                </div>
                
                {/* Column Management */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Manage Columns</h4>
                    <button 
                      onClick={() => {
                        const newColName = prompt('New column name:');
                        if (newColName?.trim()) {
                          editBoard(currentBoard.id, currentBoard.name, [...currentBoard.columns, newColName.trim()]);
                        }
                      }}
                      className="px-3 py-1 rounded-lg bg-orange-500/80 dark:bg-orange-600/80 text-white hover:bg-orange-600 dark:hover:bg-orange-700 text-sm"
                    >
                      + Add Column
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentBoard.columns.map((col, idx) => (
                      <div key={col} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                        <button
                          onClick={() => {
                            if (idx > 0) {
                              const newCols = [...currentBoard.columns];
                              [newCols[idx], newCols[idx-1]] = [newCols[idx-1], newCols[idx]];
                              editBoard(currentBoard.id, currentBoard.name, newCols);
                            }
                          }}
                          disabled={idx === 0}
                          className={`text-xs ${idx === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400'}`}
                        >
                          ◀
                        </button>
                        <input
                          defaultValue={col}
                          onBlur={(e) => {
                            const newName = e.target.value.trim();
                            if (newName && newName !== col) {
                              const newCols = [...currentBoard.columns];
                              newCols[idx] = newName;
                              editBoard(currentBoard.id, currentBoard.name, newCols);
                            } else {
                              e.target.value = col;
                            }
                          }}
                          className="bg-transparent border-b border-transparent hover:border-gray-400 dark:hover:border-gray-500 focus:border-blue-500 dark:focus:border-blue-400 outline-none text-sm font-medium text-gray-800 dark:text-gray-100 w-28"
                        />
                        <button
                          onClick={() => {
                            if (idx < currentBoard.columns.length - 1) {
                              const newCols = [...currentBoard.columns];
                              [newCols[idx], newCols[idx+1]] = [newCols[idx+1], newCols[idx]];
                              editBoard(currentBoard.id, currentBoard.name, newCols);
                            }
                          }}
                          disabled={idx === currentBoard.columns.length - 1}
                          className={`text-xs ${idx === currentBoard.columns.length - 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400'}`}
                        >
                          ▶
                        </button>
                        <button
                          onClick={() => {
                            if (currentBoard.columns.length <= 1) {
                              alert('Cannot delete the last column!');
                              return;
                            }
                            if (confirm(`Delete column "${col}"? Tasks in this column will remain but may not display correctly.`)) {
                              editBoard(currentBoard.id, currentBoard.name, currentBoard.columns.filter((_, i) => i !== idx));
                            }
                          }}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Kanban Board Columns */}
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${currentBoard.columns.length}, minmax(250px, 1fr))` }}>
                {currentBoard.columns.map(col => {
                  const tasksWithProject = projects.flatMap(proj => 
                    proj.tasks.map(t => ({ ...t, projectId: proj.id, projectName: proj.name, projectColor: proj.color }))
                  );
                  const columnTasks = tasksWithProject.filter(t => getTaskColumn(t, currentBoard.columns) === col);
                  
                  return (
                    <div key={col} className="glass-card p-4 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-600/30">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100">{col}</h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">{columnTasks.length}</span>
                      </div>
                      <div className="space-y-3">
                        {columnTasks.map(t => (
                          <div key={`${t.projectId}-${t.id}`} className="p-3 rounded-xl bg-white/70 dark:bg-gray-700/70 border border-gray-200 dark:border-gray-600">
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${t.projectColor}`}></div>
                              <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{t.projectName}</span>
                            </div>
                            <div className="mb-2">
                              <input 
                                defaultValue={t.title} 
                                onBlur={(e)=>editTask(t.projectId, t.id, e.target.value)} 
                                className="font-medium text-gray-800 dark:text-gray-100 bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-500 dark:focus:border-blue-400 outline-none w-full text-sm" 
                              />
                            </div>
                            <div className="space-y-1 mb-2">
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">👤 {t.assignee || 'Unassigned'}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">⏱️ {secondsToHMS(t.seconds)}</div>
                            </div>
                            <select 
                              value={getTaskColumn(t, currentBoard.columns)} 
                              onChange={(e)=>moveStatus(t.projectId, t.id, e.target.value)} 
                              className="text-xs px-2 py-1 rounded bg-white dark:bg-gray-600 dark:text-gray-200 border border-gray-300 dark:border-gray-500 w-full mb-2"
                            >
                              {currentBoard.columns.map(c => <option key={c}>{c}</option>)}
                            </select>
                            <div className="flex gap-1 flex-wrap">
                              <button onClick={()=>toggleTimer(t.projectId, t.id)} className="px-2 py-1 rounded-lg bg-orange-500/80 dark:bg-orange-600/80 text-white hover:bg-orange-600 dark:hover:bg-orange-700 text-xs flex-1">{t.running? '⏸' : '▶'}</button>
                              <button onClick={()=>addSubtask(t.projectId, t.id, 'New subtask')} className="px-2 py-1 rounded-lg bg-green-500/80 dark:bg-green-600/80 text-white hover:bg-green-600 dark:hover:bg-green-700 text-xs flex-1">+Sub</button>
                              <button onClick={()=>deleteTask(t.projectId, t.id)} className="px-2 py-1 rounded-lg bg-red-500/80 dark:bg-red-600/80 text-white hover:bg-red-600 dark:hover:bg-red-700 text-xs flex-1">🗑</button>
                            </div>
                          </div>
                        ))}
                        {columnTasks.length === 0 && (
                          <div className="text-center py-8 text-sm text-gray-400 dark:text-gray-500">No tasks</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'Timeline' && (
            <div className="glass-card p-4 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-600/30 overflow-auto">
              <div className="grid" style={{ gridTemplateColumns: `200px repeat(${days.length}, 1fr)` }}>
                <div></div>
                {days.map((d,i)=> (
                  <div key={i} className="text-xs text-gray-600 dark:text-gray-300 text-center font-medium">{d.toLocaleDateString()}</div>
                ))}
                {allTasks.map(t => (
                  <>
                    <div key={t.id+':label'} className="text-sm text-gray-800 dark:text-gray-200 py-2 font-medium">{t.title}</div>
                    {days.map((d,i)=>{
                      const isDue = t.due && t.due.slice(0,10) === new Date(d).toISOString().slice(0,10);
                      return <div key={t.id+':'+i} className={`h-6 ${isDue? 'bg-orange-500/60 dark:bg-orange-600/70' : 'bg-transparent'} rounded`}></div>;
                    })}
                  </>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Raster' && (
            <div className="space-y-6">
              {/* Eisenhower Matrix (Urgency vs Importance) */}
              <div className="glass-card p-4 sm:p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-600/30">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Eisenhower Matrix (Urgency vs Importance)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Urgent & Important */}
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700">
                    <h4 className="font-semibold text-red-700 dark:text-red-300 mb-3 flex items-center gap-2">
                      <span className="text-lg">🔥</span> Urgent & Important
                    </h4>
                    <div className="space-y-2">
                      {allTasks.filter(t => {
                        const due = t.due ? new Date(t.due) : null;
                        const daysUntil = due ? Math.floor((due.getTime() - new Date().getTime()) / 86400000) : 999;
                        return daysUntil <= 2 && t.status !== 'Done';
                      }).map(task => (
                        <div key={task.id} className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800">
                          <div className="font-medium text-sm text-gray-800 dark:text-gray-100">{task.title}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Due: {task.due?.slice(0,10) || 'No date'} • {task.assignee || 'Unassigned'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Not Urgent but Important */}
                  <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700">
                    <h4 className="font-semibold text-green-700 dark:text-green-300 mb-3 flex items-center gap-2">
                      <span className="text-lg">📅</span> Not Urgent but Important
                    </h4>
                    <div className="space-y-2">
                      {allTasks.filter(t => {
                        const due = t.due ? new Date(t.due) : null;
                        const daysUntil = due ? Math.floor((due.getTime() - new Date().getTime()) / 86400000) : 999;
                        return daysUntil > 2 && daysUntil < 7 && t.status !== 'Done';
                      }).map(task => (
                        <div key={task.id} className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-green-200 dark:border-green-800">
                          <div className="font-medium text-sm text-gray-800 dark:text-gray-100">{task.title}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Due: {task.due?.slice(0,10) || 'No date'} • {task.assignee || 'Unassigned'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Urgent but Not Important */}
                  <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700">
                    <h4 className="font-semibold text-yellow-700 dark:text-yellow-300 mb-3 flex items-center gap-2">
                      <span className="text-lg">⚡</span> Urgent but Not Important
                    </h4>
                    <div className="space-y-2">
                      {allTasks.filter(t => {
                        const due = t.due ? new Date(t.due) : null;
                        const daysUntil = due ? Math.floor((due.getTime() - new Date().getTime()) / 86400000) : 999;
                        return daysUntil <= 1 && t.status === 'Backlog';
                      }).map(task => (
                        <div key={task.id} className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-yellow-200 dark:border-yellow-800">
                          <div className="font-medium text-sm text-gray-800 dark:text-gray-100">{task.title}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Due: {task.due?.slice(0,10) || 'No date'} • {task.assignee || 'Unassigned'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Neither Urgent nor Important */}
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/40 border-2 border-gray-300 dark:border-gray-600">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <span className="text-lg">📋</span> Neither Urgent nor Important
                    </h4>
                    <div className="space-y-2">
                      {allTasks.filter(t => {
                        const due = t.due ? new Date(t.due) : null;
                        const daysUntil = due ? Math.floor((due.getTime() - new Date().getTime()) / 86400000) : 999;
                        return (daysUntil >= 7 || !t.due) && t.status === 'Backlog';
                      }).map(task => (
                        <div key={task.id} className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                          <div className="font-medium text-sm text-gray-800 dark:text-gray-100">{task.title}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Due: {task.due?.slice(0,10) || 'No date'} • {task.assignee || 'Unassigned'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Resource Allocation Matrix */}
              <div className="glass-card p-4 sm:p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-600/30">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Resource Allocation Matrix</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-200">Task</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-200">Assignee</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-200">Status</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-200">Time Spent</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-200">Priority</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allTasks.map((task, idx) => {
                        const due = task.due ? new Date(task.due) : null;
                        const daysUntil = due ? Math.floor((due.getTime() - new Date().getTime()) / 86400000) : 999;
                        const priority = daysUntil <= 2 ? 'High' : daysUntil <= 7 ? 'Medium' : 'Low';
                        
                        return (
                          <tr key={task.id} className={`border-b border-gray-200 dark:border-gray-700 ${idx % 2 === 0 ? 'bg-gray-50/50 dark:bg-gray-700/30' : ''}`}>
                            <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-100">{task.title}</td>
                            <td className="py-3 px-4 text-sm text-center">
                              <span className="inline-block px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300">
                                {task.assignee || 'Unassigned'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-center">
                              <span className={`inline-block px-3 py-1 rounded-full ${
                                task.status === 'Done' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' :
                                task.status === 'In Progress' ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300' :
                                task.status === 'Review' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' :
                                'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                              }`}>
                                {getTaskColumn(task, currentBoard.columns)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-center font-mono text-gray-700 dark:text-gray-200">
                              {secondsToHMS(task.seconds)}
                            </td>
                            <td className="py-3 px-4 text-sm text-center">
                              <span className={`inline-block px-3 py-1 rounded-full font-semibold ${
                                priority === 'High' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' :
                                priority === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300' :
                                'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                              }`}>
                                {priority}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
