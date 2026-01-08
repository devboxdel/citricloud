import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuthStore } from '../../store/authStore';
import { FiMessageSquare, FiSearch, FiSend, FiPaperclip, FiSmile, FiMoreVertical, FiPhone, FiVideo, FiStar, FiImage, FiUserPlus, FiUsers, FiX } from 'react-icons/fi';

interface Conversation {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  status: string;
  isGroup?: boolean;
  isStarred?: boolean;
}

interface Message {
  id: number;
  sender: string;
  avatar: string;
  content: string;
  time: string;
  isSelf: boolean;
}

export default function Messages() {
  const { user } = useAuthStore();
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);

  useEffect(() => {
    fetchConversations();
    fetchTeamMembers();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat);
    }
  }, [selectedChat]);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/v1/collaboration/conversations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const data = await response.json();
      setConversations(data.conversations || []);
      if (data.conversations && data.conversations.length > 0 && !selectedChat) {
        setSelectedChat(data.conversations[0].id);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: number) => {
    try {
      const response = await fetch(`/api/v1/collaboration/conversations/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch('/api/v1/collaboration/users/messageable', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const data = await response.json();
      setTeamMembers(data.users || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const startConversation = async (userId: number) => {
    try {
      const response = await fetch('/api/v1/collaboration/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          recipient_id: userId,
          content: messageInput || 'Hi!'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setShowNewMessageModal(false);
        setMessageInput('');
        await fetchConversations();
        setSelectedChat(data.conversation_id);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChat) return;

    try {
      const response = await fetch('/api/v1/collaboration/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          conversation_id: selectedChat,
          content: messageInput
        })
      });

      if (response.ok) {
        setMessageInput('');
        fetchMessages(selectedChat);
        fetchConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConv = conversations.find(c => c.id === selectedChat);

  return (
    <DashboardLayout
      title="Messages"
      breadcrumb={<div className="text-xs text-gray-500">Main / Messages</div>}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <div className="glass-card rounded-2xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 flex flex-col" style={{ height: 'calc(100vh - 12rem)' }}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                  <FiMessageSquare className="text-primary-500" />
                  <span>Conversations</span>
                </h2>
                <button
                  onClick={() => setShowNewMessageModal(true)}
                  className="p-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-all"
                  title="New Message"
                >
                  <FiUserPlus />
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto p-2">
              {loading ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">No conversations yet</div>
              ) : (
                filteredConversations.map((conv) => (
                  <motion.button
                    key={conv.id}
                    onClick={() => setSelectedChat(conv.id)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`w-full text-left p-4 rounded-xl mb-2 transition-all ${
                      selectedChat === conv.id
                        ? 'bg-primary-500 text-white shadow-lg'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-900 dark:text-white'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative flex-shrink-0">
                        <div className="text-2xl">{conv.avatar}</div>
                        {!conv.isGroup && (
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 ${
                            selectedChat === conv.id ? 'border-primary-500' : 'border-white dark:border-gray-800'
                          } ${
                            conv.status === 'online' ? 'bg-green-500' :
                            conv.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`}></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold truncate">{conv.name}</span>
                            {conv.isStarred && (
                              <FiStar className={`w-3 h-3 flex-shrink-0 ${
                                selectedChat === conv.id ? 'fill-white' : 'fill-yellow-500 text-yellow-500'
                              }`} />
                            )}
                          </div>
                          <span className={`text-xs flex-shrink-0 ${
                            selectedChat === conv.id ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {conv.time}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className={`text-sm truncate ${
                            selectedChat === conv.id ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {conv.lastMessage}
                          </p>
                          {conv.unread > 0 && (
                            <span className={`ml-2 px-2 py-0.5 text-xs font-bold rounded-full flex-shrink-0 ${
                              selectedChat === conv.id ? 'bg-white/20' : 'bg-primary-500 text-white'
                            }`}>
                              {conv.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          {selectedConv ? (
            <div className="glass-card rounded-2xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 flex flex-col" style={{ height: 'calc(100vh - 12rem)' }}>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="text-3xl">{selectedConv.avatar}</div>
                    {!selectedConv.isGroup && (
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                        selectedConv.status === 'online' ? 'bg-green-500' :
                        selectedConv.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`}></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{selectedConv.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedConv.isGroup ? 'Group chat' : 
                       selectedConv.status === 'online' ? 'Active now' : 
                       selectedConv.status === 'away' ? 'Away' : 'Offline'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                    <FiPhone className="text-gray-600 dark:text-gray-300" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                    <FiVideo className="text-gray-600 dark:text-gray-300" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                    <FiMoreVertical className="text-gray-600 dark:text-gray-300" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">No messages yet. Start the conversation!</div>
                ) : (
                  messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-start space-x-3 ${message.isSelf ? 'flex-row-reverse space-x-reverse' : ''}`}
                    >
                      <div className="text-2xl flex-shrink-0">{message.avatar}</div>
                      <div className={`flex-1 ${message.isSelf ? 'flex flex-col items-end' : ''}`}>
                        <div className={`inline-block px-4 py-3 rounded-2xl max-w-md ${
                          message.isSelf
                            ? 'bg-primary-500 text-white rounded-tr-none'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-none'
                        }`}>
                          <p>{message.content}</p>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{message.time}</span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex items-end space-x-2">
                  <button className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-gray-600 dark:text-gray-300">
                    <FiPaperclip className="w-5 h-5" />
                  </button>
                  <button className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-gray-600 dark:text-gray-300">
                    <FiImage className="w-5 h-5" />
                  </button>
                  <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-3">
                    <textarea
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      className="w-full bg-transparent border-none focus:outline-none resize-none text-gray-900 dark:text-white"
                      rows={1}
                    />
                  </div>
                  <button className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-gray-600 dark:text-gray-300">
                    <FiSmile className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className="p-3 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiSend className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-center" style={{ height: 'calc(100vh - 12rem)' }}>
              <div className="text-center">
                <FiMessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Message Modal */}
      <AnimatePresence>
        {showNewMessageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowNewMessageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                  <FiUsers className="text-primary-500" />
                  <span>Start a Conversation</span>
                </h3>
                <button
                  onClick={() => setShowNewMessageModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <FiX className="text-gray-500" />
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {teamMembers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <FiUsers className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No team members yet</p>
                    <p className="text-sm mt-1">Join a team to start messaging!</p>
                  </div>
                ) : (
                  teamMembers.map((member) => (
                    <motion.button
                      key={member.id}
                      whileHover={{ x: 4 }}
                      onClick={() => startConversation(member.id)}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {member.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">{member.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{member.team} • {member.role}</div>
                      </div>
                    </motion.button>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
