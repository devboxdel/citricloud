import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheckSquare, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';

import { todoAPI } from '../../lib/todoApi';

type TodoItem = {
  id: number;
  text: string;
  done: boolean;
};

export default function TodoApp() {
  const navigate = useNavigate();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [editing, setEditing] = useState<{ id: number; text: string } | null>(null);

  // Fetch todos on mount
  useEffect(() => {
    todoAPI.getTodos().then(res => setTodos(res.data));
  }, []);

  const addTodo = async () => {
    if (!newTodo.trim()) return;
    const res = await todoAPI.createTodo({ text: newTodo.trim() });
    setTodos(prev => [...prev, res.data]);
    setNewTodo('');
  };
  const toggleTodo = async (id: number) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    const res = await todoAPI.updateTodo(id, { text: todo.text, done: !todo.done });
    setTodos(prev => prev.map(t => t.id === id ? res.data : t));
  };
  const deleteTodo = async (id: number) => {
    await todoAPI.deleteTodo(id);
    setTodos(prev => prev.filter(t => t.id !== id));
  };
  const startEdit = (id: number, text: string) => {
    setEditing({ id, text });
  };
  const saveEdit = async () => {
    if (!editing) return;
    const todo = todos.find(t => t.id === editing.id);
    if (!todo) return;
    const res = await todoAPI.updateTodo(editing.id, { text: editing.text, done: todo.done });
    setTodos(prev => prev.map(t => t.id === editing.id ? res.data : t));
    setEditing(null);
  };

  const completedCount = todos.filter(t => t.done).length;
  const totalCount = todos.length;

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Top Header Bar */}
      <div className="bg-indigo-500 text-white px-2 sm:px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4 flex-1">
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="text-white font-semibold text-xs sm:text-sm" style={{ fontFamily: "'Source Code Pro', monospace" }}>CITRICLOUD.com</span>
              <span className="text-white/80 text-[8px] sm:text-[9px] tracking-wide" style={{ fontFamily: "'Source Code Pro', monospace" }}>Enterprise Cloud Platform</span>
            </div>
            <span className="text-white font-semibold text-sm">To Do</span>
          </div>
          {totalCount > 0 && (
            <div className="hidden sm:flex items-center text-sm text-white/90 px-3 py-1 bg-white/10 rounded">
              <FiCheckSquare className="w-4 h-4 mr-1.5" />
              <span>{completedCount} of {totalCount} completed</span>
            </div>
          )}
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
          {/* Add New Task */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 mb-3 sm:mb-4">
            <form onSubmit={e => { e.preventDefault(); editing ? saveEdit() : addTodo(); }} className="flex gap-2">
              <input
                type="text"
                value={editing ? editing.text : newTodo}
                onChange={e => editing ? setEditing({ ...editing, text: e.target.value }) : setNewTodo(e.target.value)}
                placeholder="Add a new task..."
                className="flex-1 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors">
                <FiPlus className="w-4 h-4" />
                {editing ? 'Save' : 'Add'}
              </button>
              {editing && (
                <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors">Cancel</button>
              )}
            </form>
          </div>

          {/* Todo List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            {todos.length === 0 ? (
              <div className="text-center py-16">
                <FiCheckSquare className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No tasks yet. Add one above to get started.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {todos.map(todo => (
                  <div key={todo.id} className="group flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={todo.done} 
                      onChange={() => toggleTodo(todo.id)} 
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                    />
                    {editing && editing.id === todo.id ? (
                      <form onSubmit={e => { e.preventDefault(); saveEdit(); }} className="flex-1 flex gap-2">
                        <input 
                          value={editing.text} 
                          onChange={e => setEditing({ ...editing, text: e.target.value })} 
                          className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                          autoFocus 
                        />
                        <button type="submit" className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm">Save</button>
                        <button type="button" onClick={() => setEditing(null)} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm">Cancel</button>
                      </form>
                    ) : (
                      <>
                        <span className={`flex-1 text-sm ${todo.done ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                          {todo.text}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => startEdit(todo.id, todo.text)} 
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteTodo(todo.id)} 
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>


          {/* Progress Stats */}
          {totalCount > 0 && (
            <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {Math.round((completedCount / totalCount) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
