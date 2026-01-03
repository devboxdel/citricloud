import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '../../components/DashboardLayout';
import { motion } from 'framer-motion';
import {
  FiMessageCircle,
  FiUsers,
  FiClock,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSave,
  FiX,
  FiMail,
  FiPhone,
  FiToggleLeft,
  FiToggleRight,
  FiSend,
} from 'react-icons/fi';
import { crmAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import { useChatContext } from '../../context/ChatContext';
import { useOpeningHours } from '../../context/OpeningHoursContext';
import { useOperators, type Operator } from '../../context/OperatorsContext';


interface OpeningTime {
  id: number;
  day: string;
  open_time: string;
  close_time: string;
  is_open: boolean;
}

interface ChatSession {
  id: number;
  user_name: string;
  user_email: string;
  status: 'active' | 'closed';
  messages_count: number;
  created_at: string;
  last_message_at: string;
}

export default function ChatSupport() {
  const { sessions, closeSession, addMessageToSession } = useChatContext();
  const { openingHours, updateOpeningHours } = useOpeningHours();
  const { operators, addOperator: addOperatorContext, updateOperator: updateOperatorContext, deleteOperator: deleteOperatorContext } = useOperators();
  const [activeTab, setActiveTab] = useState<'chats' | 'operators' | 'hours'>('chats');
  const [showAddOperator, setShowAddOperator] = useState(false);
  const [showEditOperator, setShowEditOperator] = useState<number | null>(null);
  const [editingHours, setEditingHours] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [localHours, setLocalHours] = useState(openingHours);
  const queryClient = useQueryClient();

  // Form states
  const [operatorForm, setOperatorForm] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'offline' as 'online' | 'offline' | 'away',
    is_active: true,
  });

  // Use real data from context instead of mock data
  const { data: chatSessions, isLoading: chatsLoading } = useQuery({
    queryKey: ['chat-sessions', sessions],
    queryFn: async () => {
      console.log('📊 ChatSupport: Fetching sessions from context', sessions);
      return {
        data: sessions.map(session => ({
          id: parseInt(session.id.replace('session-', '')),
          user_name: session.user_name,
          user_email: session.user_email,
          status: session.status,
          messages_count: session.messages.length,
          created_at: session.created_at,
          last_message_at: session.last_message_at,
        })),
      };
    },
    refetchInterval: 1000, // Poll every second for ultra-real-time updates
  });

  // Sync local hours with context
  useEffect(() => {
    setLocalHours(openingHours);
  }, [openingHours]);

  // Add operator mutation
  const addOperatorMutation = useMutation({
    mutationFn: async (data: typeof operatorForm) => {
      addOperatorContext(data);
      return { data };
    },
    onSuccess: () => {
      toast.success('Operator added successfully');
      setShowAddOperator(false);
      setOperatorForm({
        name: '',
        email: '',
        phone: '',
        status: 'offline',
        is_active: true,
      });
    },
    onError: () => {
      toast.error('Failed to add operator');
    },
  });

  // Update operator mutation
  const updateOperatorMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Operator> }) => {
      updateOperatorContext(id, data);
      return { data: { id, ...data } };
    },
    onSuccess: () => {
      toast.success('Operator updated successfully');
      setShowEditOperator(null);
    },
    onError: () => {
      toast.error('Failed to update operator');
    },
  });

  // Delete operator mutation
  const deleteOperatorMutation = useMutation({
    mutationFn: async (id: number) => {
      deleteOperatorContext(id);
      return { data: { id } };
    },
    onSuccess: () => {
      toast.success('Operator deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete operator');
    },
  });

  // Update opening hours mutation
  const updateHoursMutation = useMutation({
    mutationFn: async (data: typeof localHours) => {
      updateOpeningHours(data);
      return { data };
    },
    onSuccess: () => {
      toast.success('Opening hours updated successfully');
      setEditingHours(false);
    },
    onError: () => {
      toast.error('Failed to update opening hours');
    },
  });

  const handleAddOperator = () => {
    if (!operatorForm.name || !operatorForm.email) {
      toast.error('Name and email are required');
      return;
    }
    addOperatorMutation.mutate(operatorForm);
  };

  const handleToggleOperatorStatus = (operator: Operator) => {
    updateOperatorMutation.mutate({
      id: operator.id,
      data: { is_active: !operator.is_active },
    });
  };

  const handleDeleteOperator = (id: number) => {
    if (confirm('Are you sure you want to delete this operator?')) {
      deleteOperatorMutation.mutate(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'closed':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <DashboardLayout
      title="Chat Support"
      breadcrumb={<div className="text-xs text-gray-500">CRM / Support / Chat Support</div>}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Chat Support Management
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage live chat sessions, operators, and business hours
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('chats')}
          className={`px-6 py-3 font-medium transition-all relative ${
            activeTab === 'chats'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            <FiMessageCircle className="w-4 h-4" />
            <span>Chat Sessions</span>
          </div>
          {activeTab === 'chats' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab('operators')}
          className={`px-6 py-3 font-medium transition-all relative ${
            activeTab === 'operators'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            <FiUsers className="w-4 h-4" />
            <span>Operators</span>
          </div>
          {activeTab === 'operators' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab('hours')}
          className={`px-6 py-3 font-medium transition-all relative ${
            activeTab === 'hours'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            <FiClock className="w-4 h-4" />
            <span>Opening Times</span>
          </div>
          {activeTab === 'hours' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
            />
          )}
        </button>
      </div>

      {/* Chat Sessions Tab */}
      {activeTab === 'chats' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {chatsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : chatSessions?.data && chatSessions.data.length > 0 ? (
            chatSessions.data.map((session) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {session.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {session.user_name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                        <FiMail className="w-3 h-3" />
                        <span>{session.user_email}</span>
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {session.messages_count} messages • Last active{' '}
                        {new Date(session.last_message_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                        session.status
                      )}`}
                    >
                      {session.status}
                    </span>
                    <button 
                      onClick={() => {
                        const fullSession = sessions.find(s => s.id === `session-${session.id}`);
                        setSelectedSession(fullSession);
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                    >
                      View Chat
                    </button>
                    {session.status === 'active' && (
                      <button 
                        onClick={() => {
                          closeSession(`session-${session.id}`);
                          toast.success('Chat session closed');
                        }}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                      >
                        Close Chat
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <FiMessageCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No active chat sessions</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Operators Tab */}
      {activeTab === 'operators' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowAddOperator(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              <span>Add Operator</span>
            </button>
          </div>

          <div className="grid gap-4">
            {operators.map((operator) => (
              <motion.div
                key={operator.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {operator.name.charAt(0).toUpperCase()}
                        </div>
                        <div
                          className={`absolute bottom-0 right-0 w-4 h-4 ${getStatusColor(
                            operator.status
                          )} rounded-full border-2 border-white dark:border-gray-800`}
                        ></div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {operator.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                          <FiMail className="w-3 h-3" />
                          <span>{operator.email}</span>
                        </p>
                        {operator.phone && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2 mt-1">
                            <FiPhone className="w-3 h-3" />
                            <span>{operator.phone}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleOperatorStatus(operator)}
                        className={`p-2 rounded-lg transition-colors ${
                          operator.is_active
                            ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                            : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        title={operator.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {operator.is_active ? (
                          <FiToggleRight className="w-6 h-6" />
                        ) : (
                          <FiToggleLeft className="w-6 h-6" />
                        )}
                      </button>
                      <button
                        onClick={() => setShowEditOperator(operator.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        <FiEdit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteOperator(operator.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

          {/* Add Operator Modal */}
          {showAddOperator && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Add New Operator
                  </h3>
                  <button
                    onClick={() => setShowAddOperator(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={operatorForm.name}
                      onChange={(e) =>
                        setOperatorForm({ ...operatorForm, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter operator name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={operatorForm.email}
                      onChange={(e) =>
                        setOperatorForm({ ...operatorForm, email: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="operator@citricloud.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={operatorForm.phone}
                      onChange={(e) =>
                        setOperatorForm({ ...operatorForm, phone: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="+1 234 567 8900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Initial Status
                    </label>
                    <select
                      value={operatorForm.status}
                      onChange={(e) =>
                        setOperatorForm({
                          ...operatorForm,
                          status: e.target.value as 'online' | 'offline' | 'away',
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="offline">Offline</option>
                      <option value="online">Online</option>
                      <option value="away">Away</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-4 pt-4">
                    <button
                      onClick={() => setShowAddOperator(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddOperator}
                      disabled={addOperatorMutation.isPending}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {addOperatorMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Adding...</span>
                        </>
                      ) : (
                        <>
                          <FiSave className="w-4 h-4" />
                          <span>Add Operator</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}

      {/* Opening Times Tab */}
      {activeTab === 'hours' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex justify-end mb-4">
            {!editingHours ? (
              <button
                onClick={() => setEditingHours(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <FiEdit className="w-4 h-4" />
                <span>Edit Hours</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setEditingHours(false)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <FiX className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={() => updateHoursMutation.mutate(localHours)}
                  disabled={updateHoursMutation.isPending}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  <FiSave className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Day
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Opening Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Closing Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {localHours.map((day) => (
                    <tr key={day.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {day.day}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingHours ? (
                          <input
                            type="time"
                            value={day.open_time}
                            disabled={!day.is_open}
                            onChange={(e) => {
                              setLocalHours(prev => prev.map(h => 
                                h.id === day.id ? { ...h, open_time: e.target.value } : h
                              ));
                            }}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white disabled:opacity-50"
                          />
                        ) : (
                          <span className="text-gray-700 dark:text-gray-300">
                            {day.is_open ? day.open_time : '-'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingHours ? (
                          <input
                            type="time"
                            value={day.close_time}
                            disabled={!day.is_open}
                            onChange={(e) => {
                              setLocalHours(prev => prev.map(h => 
                                h.id === day.id ? { ...h, close_time: e.target.value } : h
                              ));
                            }}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white disabled:opacity-50"
                          />
                        ) : (
                          <span className="text-gray-700 dark:text-gray-300">
                            {day.is_open ? day.close_time : '-'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingHours ? (
                          <button
                            onClick={() => {
                              setLocalHours(prev => prev.map(h => 
                                h.id === day.id ? { ...h, is_open: !h.is_open } : h
                              ));
                            }}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                              day.is_open
                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
                            }`}
                          >
                            {day.is_open ? 'Open' : 'Closed'}
                          </button>
                        ) : (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              day.is_open
                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
                            }`}
                          >
                            {day.is_open ? 'Open' : 'Closed'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <FiClock className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
                  Business Hours Information
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  These hours determine when the live chat widget shows as "Online" to visitors.
                  Outside these hours, visitors can still leave messages which will be delivered
                  to their email within 2 hours.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Chat Viewer Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Chat with {selectedSession.user_name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedSession.user_email}
                </p>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-900/50">
              {selectedSession.messages.map((msg: any, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.sender === 'user'
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : msg.sender === 'support'
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-bl-none'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm italic'
                    }`}
                  >
                    {msg.sender === 'support' && msg.name && (
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                        {msg.name}
                      </p>
                    )}
                    <p className="text-sm">{msg.message}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Reply Input */}
            {selectedSession.status === 'active' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!replyMessage.trim()) return;

                  const agentMessage = {
                    id: Date.now().toString(),
                    sender: 'support' as const,
                    name: 'Support Agent',
                    message: replyMessage,
                    timestamp: new Date(),
                  };

                  addMessageToSession(selectedSession.id, agentMessage);
                  setReplyMessage('');
                  toast.success('Message sent');
                }}
                className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900"
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Type your reply..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!replyMessage.trim()}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FiSend className="w-5 h-5" />
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
