import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuthStore } from '../../store/authStore';
import { FiUsers, FiPlus, FiSearch, FiMail, FiMessageSquare, FiFolder, FiUserPlus, FiSettings, FiMoreVertical, FiStar, FiHash, FiX, FiCheck, FiSend } from 'react-icons/fi';

interface Team {
  id: number;
  name: string;
  description: string;
  members: number;
  avatar: string;
  channels: number;
  isStarred: boolean;
  color: string;
  files?: number;
}

interface TeamMember {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: string;
  status: string;
}

interface Channel {
  id: number;
  name: string;
  description: string;
  isPrivate: boolean;
  members: number;
  lastActivity: string;
  unread?: number;
}

interface AvailableUser {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

export default function Teams() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [addingMembers, setAddingMembers] = useState(false);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDescription, setNewChannelDescription] = useState('');
  const [newChannelPrivate, setNewChannelPrivate] = useState(false);
  const [creatingChannel, setCreatingChannel] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<number | null>(null);
  const [channelMessages, setChannelMessages] = useState<any[]>([]);
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [channelMessageInput, setChannelMessageInput] = useState('');
  const [sendingChannelMessage, setSendingChannelMessage] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      fetchTeamDetails(selectedTeam);
    }
  }, [selectedTeam]);

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/v1/collaboration/teams', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const data = await response.json();
      setTeams(data.teams || []);
      if (data.teams && data.teams.length > 0 && !selectedTeam) {
        setSelectedTeam(data.teams[0].id);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamDetails = async (teamId: number) => {
    try {
      const response = await fetch(`/api/v1/collaboration/teams/${teamId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const data = await response.json();
      setTeamMembers(data.members || []);
      setChannels(data.channels || []);
    } catch (error) {
      console.error('Error fetching team details:', error);
    }
  };

  const createTeam = async () => {
    if (!newTeamName.trim()) {
      alert('Please enter a team name');
      return;
    }

    setCreatingTeam(true);
    try {
      const response = await fetch('/api/v1/collaboration/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          name: newTeamName,
          description: newTeamDescription
        })
      });

      if (response.ok) {
        const data = await response.json();
        setShowCreateTeamModal(false);
        setNewTeamName('');
        setNewTeamDescription('');
        await fetchTeams();
        setSelectedTeam(data.id);
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to create team');
      }
    } catch (error) {
      console.error('Error creating team:', error);
      alert('Failed to create team');
    } finally {
      setCreatingTeam(false);
    }
  };

  const createChannel = async () => {
    if (!newChannelName.trim()) {
      alert('Please enter a channel name');
      return;
    }

    if (!selectedTeam) return;

    setCreatingChannel(true);
    try {
      const response = await fetch(`/api/v1/collaboration/teams/${selectedTeam}/channels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          name: newChannelName,
          description: newChannelDescription,
          is_private: newChannelPrivate
        })
      });

      if (response.ok) {
        setShowCreateChannelModal(false);
        setNewChannelName('');
        setNewChannelDescription('');
        setNewChannelPrivate(false);
        await fetchTeamDetails(selectedTeam);
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to create channel');
      }
    } catch (error) {
      console.error('Error creating channel:', error);
      alert('Failed to create channel');
    } finally {
      setCreatingChannel(false);
    }
  };

  const fetchChannelMessages = async (channelId: number) => {
    try {
      const response = await fetch(`/api/v1/collaboration/channels/${channelId}/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const data = await response.json();
      setChannelMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching channel messages:', error);
    }
  };

  const sendChannelMessage = async () => {
    if (!channelMessageInput.trim() || !selectedChannel) return;

    setSendingChannelMessage(true);
    try {
      const response = await fetch(`/api/v1/collaboration/channels/${selectedChannel}/messages?content=${encodeURIComponent(channelMessageInput)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (response.ok) {
        setChannelMessageInput('');
        await fetchChannelMessages(selectedChannel);
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSendingChannelMessage(false);
    }
  };

  const fetchAvailableUsers = async (teamId: number) => {
    try {
      const url = roleFilter 
        ? `/api/v1/collaboration/teams/${teamId}/available-users?role_filter=${roleFilter}`
        : `/api/v1/collaboration/teams/${teamId}/available-users`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const data = await response.json();
      setAvailableUsers(data.available_users || []);
    } catch (error) {
      console.error('Error fetching available users:', error);
    }
  };

  const handleAddMembers = async () => {
    if (selectedUsers.size === 0 || !selectedTeam) return;
    
    setAddingMembers(true);
    try {
      const response = await fetch(`/api/v1/collaboration/teams/${selectedTeam}/members/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          user_ids: Array.from(selectedUsers),
          role: 'MEMBER'
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ ${data.message}`);
        setShowAddMemberModal(false);
        setSelectedUsers(new Set());
        fetchTeamDetails(selectedTeam);
        fetchTeams();
      } else {
        const error = await response.json();
        alert(`❌ ${error.detail || 'Failed to add members'}`);
      }
    } catch (error) {
      console.error('Error adding members:', error);
      alert('❌ Failed to add members');
    } finally {
      setAddingMembers(false);
    }
  };

  const toggleUserSelection = (userId: number) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const selectAllByRole = (role: string) => {
    const usersWithRole = availableUsers.filter(u => u.role === role);
    const newSelection = new Set(selectedUsers);
    usersWithRole.forEach(u => newSelection.add(u.id));
    setSelectedUsers(newSelection);
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedTeamData = teams.find(t => t.id === selectedTeam);

  return (
    <DashboardLayout
      title="Teams"
      breadcrumb={<div className="text-xs text-gray-500">Main / Teams</div>}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teams List */}
        <div className="lg:col-span-1">
          <div className="glass-card rounded-2xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                <FiUsers className="text-primary-500" />
                <span>Your Teams</span>
              </h2>
              <button 
                onClick={() => setShowCreateTeamModal(true)}
                className="p-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-all"
              >
                <FiPlus />
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
              />
            </div>

            {/* Teams */}
            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</div>
              ) : filteredTeams.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">No teams found</div>
              ) : (
                filteredTeams.map((team) => (
                  <motion.button
                    key={team.id}
                    onClick={() => setSelectedTeam(team.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full text-left p-4 rounded-xl transition-all ${
                      selectedTeam === team.id
                        ? 'bg-gradient-to-r ' + team.color + ' text-white shadow-lg'
                        : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className={`text-2xl ${selectedTeam === team.id ? '' : 'opacity-80'}`}>
                          {team.avatar}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{team.name}</h3>
                            {team.isStarred && (
                              <FiStar className={`w-3 h-3 ${selectedTeam === team.id ? 'fill-white' : 'fill-yellow-500 text-yellow-500'}`} />
                            )}
                          </div>
                          <p className={`text-sm ${selectedTeam === team.id ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                            {team.members} members
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Team Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTeamData ? (
            <>
              {/* Team Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`glass-card rounded-2xl p-6 bg-gradient-to-br ${selectedTeamData.color} text-white relative overflow-hidden`}
              >
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="text-5xl">{selectedTeamData.avatar}</div>
                      <div>
                        <h1 className="text-3xl font-bold mb-2">{selectedTeamData.name}</h1>
                        <p className="text-white/80">{selectedTeamData.description}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => alert('Team settings coming soon!')}
                      className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all"
                    >
                      <FiSettings />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-1">
                        <FiUsers className="w-5 h-5" />
                        <span className="text-sm">Members</span>
                      </div>
                      <p className="text-2xl font-bold">{selectedTeamData.members}</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-1">
                        <FiHash className="w-5 h-5" />
                        <span className="text-sm">Channels</span>
                      </div>
                      <p className="text-2xl font-bold">{selectedTeamData.channels}</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-1">
                        <FiFolder className="w-5 h-5" />
                        <span className="text-sm">Files</span>
                      </div>
                      <p className="text-2xl font-bold">{selectedTeamData.files || 0}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/dashboard/messages')}
                  className="glass-card p-4 rounded-xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 text-center hover:border-primary-500 transition-all"
                >
                  <FiMessageSquare className="w-8 h-8 mx-auto mb-2 text-primary-500" />
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Send Message</p>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/dashboard/file-sharing')}
                  className="glass-card p-4 rounded-xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 text-center hover:border-primary-500 transition-all"
                >
                  <FiFolder className="w-8 h-8 mx-auto mb-2 text-primary-500" />
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Share Files</p>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowAddMemberModal(true);
                    if (selectedTeam) fetchAvailableUsers(selectedTeam);
                  }}
                  className="glass-card p-4 rounded-xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 text-center hover:border-primary-500 transition-all"
                >
                  <FiUserPlus className="w-8 h-8 mx-auto mb-2 text-primary-500" />
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Invite Member</p>
                </motion.button>
              </div>

              {/* Channels */}
              <div className="glass-card rounded-2xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                    <FiHash className="text-primary-500" />
                    <span>Channels</span>
                  </h3>
                  <button 
                    onClick={() => setShowCreateChannelModal(true)}
                    className="text-sm text-primary-500 hover:text-primary-600 font-semibold flex items-center space-x-1"
                  >
                    <FiPlus />
                    <span>New Channel</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {channels.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">No channels yet</div>
                  ) : (
                    channels.map((channel) => (
                      <motion.button
                        key={channel.id}
                        whileHover={{ x: 4 }}
                        onClick={() => {
                          setSelectedChannel(channel.id);
                          setShowChannelModal(true);
                          fetchChannelMessages(channel.id);
                        }}
                        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all text-left"
                      >
                        <div className="flex items-center space-x-3">
                          <FiHash className={`${channel.isPrivate ? 'text-orange-500' : 'text-gray-400'}`} />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900 dark:text-white">{channel.name}</span>
                              {channel.isPrivate && (
                                <span className="text-xs px-2 py-0.5 bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded">
                                  Private
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{channel.description}</p>
                          </div>
                        </div>
                        {channel.unread && channel.unread > 0 && (
                          <span className="px-2 py-1 bg-primary-500 text-white text-xs font-bold rounded-full">
                            {channel.unread}
                          </span>
                        )}
                      </motion.button>
                    ))
                  )}
                </div>
              </div>

              {/* Team Members */}
              <div className="glass-card rounded-2xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                    <FiUsers className="text-primary-500" />
                    <span>Team Members</span>
                  </h3>
                  <button className="text-sm text-primary-500 hover:text-primary-600 font-semibold">
                    View All ({selectedTeamData.members})
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {teamMembers.length === 0 ? (
                    <div className="col-span-2 text-center py-8 text-gray-500 dark:text-gray-400">No members yet</div>
                  ) : (
                    teamMembers.map((member) => (
                      <motion.div
                        key={member.id}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 cursor-pointer"
                      >
                        <div className="relative">
                          <div className="text-3xl">{member.avatar}</div>
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                            member.status === 'online' ? 'bg-green-500' :
                            member.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`}></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white truncate">{member.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{member.role}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-600 transition-all">
                            <FiMail className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-600 transition-all">
                            <FiMoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="glass-card rounded-2xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 p-12 text-center">
              <FiUsers className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Select a team to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Team Modal */}
      <AnimatePresence>
        {showCreateTeamModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateTeamModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create New Team</h3>
                <button
                  onClick={() => setShowCreateTeamModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <FiX className="text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="e.g., Marketing Team"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                    disabled={creatingTeam}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={newTeamDescription}
                    onChange={(e) => setNewTeamDescription(e.target.value)}
                    placeholder="What does this team do?"
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white resize-none"
                    disabled={creatingTeam}
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateTeamModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={creatingTeam}
                >
                  Cancel
                </button>
                <button
                  onClick={createTeam}
                  disabled={creatingTeam || !newTeamName.trim()}
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {creatingTeam ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <FiCheck />
                      <span>Create Team</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Channel Modal */}
      <AnimatePresence>
        {showCreateChannelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateChannelModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create New Channel</h3>
                <button
                  onClick={() => setShowCreateChannelModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <FiX className="text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Channel Name *
                  </label>
                  <input
                    type="text"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    placeholder="e.g., announcements, random"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                    disabled={creatingChannel}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={newChannelDescription}
                    onChange={(e) => setNewChannelDescription(e.target.value)}
                    placeholder="What is this channel about?"
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white resize-none"
                    disabled={creatingChannel}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="private-channel"
                    checked={newChannelPrivate}
                    onChange={(e) => setNewChannelPrivate(e.target.checked)}
                    className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                    disabled={creatingChannel}
                  />
                  <label htmlFor="private-channel" className="text-sm text-gray-700 dark:text-gray-300">
                    Make this channel private
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateChannelModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={creatingChannel}
                >
                  Cancel
                </button>
                <button
                  onClick={createChannel}
                  disabled={creatingChannel || !newChannelName.trim()}
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {creatingChannel ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <FiCheck />
                      <span>Create Channel</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Channel Chat Modal */}
      <AnimatePresence>
        {showChannelModal && selectedChannel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowChannelModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full h-[80vh] flex flex-col"
            >
              {/* Channel Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <FiHash className="text-primary-500 text-xl" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {channels.find(c => c.id === selectedChannel)?.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {channels.find(c => c.id === selectedChannel)?.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChannelModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <FiX className="text-gray-500" />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {channelMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <FiMessageSquare className="text-6xl text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No messages yet</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Be the first to send a message!</p>
                  </div>
                ) : (
                  channelMessages.map((msg) => (
                    <div key={msg.id} className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {msg.user.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-baseline space-x-2">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {msg.user.name}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(msg.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mt-1">{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={channelMessageInput}
                    onChange={(e) => setChannelMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !sendingChannelMessage && sendChannelMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                    disabled={sendingChannelMessage}
                  />
                  <button
                    onClick={sendChannelMessage}
                    disabled={sendingChannelMessage || !channelMessageInput.trim()}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <FiSend />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Member Modal */}
      <AnimatePresence>
        {showAddMemberModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card rounded-2xl bg-white dark:bg-gray-800 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add Team Members</h2>
                <button
                  onClick={() => {
                    setShowAddMemberModal(false);
                    setSelectedUsers(new Set());
                    setRoleFilter('');
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Role Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Filter by Role
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    if (selectedTeam) fetchAvailableUsers(selectedTeam);
                  }}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                >
                  <option value="">All Users</option>
                  <option value="admin">Admins</option>
                  <option value="user">Users</option>
                  <option value="crm_admin">CRM Admins</option>
                  <option value="crm_user">CRM Users</option>
                  <option value="cms_admin">CMS Admins</option>
                  <option value="cms_user">CMS Users</option>
                </select>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 mb-4">
                {['admin', 'user', 'crm_admin', 'crm_user'].map((role) => {
                  const roleUsers = availableUsers.filter(u => u.role === role);
                  if (roleUsers.length === 0) return null;
                  return (
                    <button
                      key={role}
                      onClick={() => selectAllByRole(role)}
                      className="px-3 py-1 text-sm bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-400 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-500/30 transition-all"
                    >
                      + All {role.replace('_', ' ')} ({roleUsers.length})
                    </button>
                  );
                })}
              </div>

              {/* Selected Count */}
              {selectedUsers.size > 0 && (
                <div className="mb-4 p-3 bg-primary-50 dark:bg-primary-500/10 rounded-lg">
                  <p className="text-sm font-medium text-primary-700 dark:text-primary-400">
                    {selectedUsers.size} user(s) selected
                  </p>
                </div>
              )}

              {/* Available Users List */}
              <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
                {availableUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No available users to add
                  </div>
                ) : (
                  availableUsers.map((user) => (
                    <motion.div
                      key={user.id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => toggleUserSelection(user.id)}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                        selectedUsers.has(user.id)
                          ? 'bg-primary-100 dark:bg-primary-500/20 border-2 border-primary-500'
                          : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                          {user.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                        <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded">
                          {user.role.replace('_', ' ')}
                        </span>
                      </div>
                      {selectedUsers.has(user.id) && (
                        <FiCheck className="w-5 h-5 text-primary-500" />
                      )}
                    </motion.div>
                  ))
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAddMemberModal(false);
                    setSelectedUsers(new Set());
                    setRoleFilter('');
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMembers}
                  disabled={selectedUsers.size === 0 || addingMembers}
                  className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
                >
                  {addingMembers ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <FiUserPlus />
                      <span>Add {selectedUsers.size} Member(s)</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
