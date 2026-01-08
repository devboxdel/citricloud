import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuthStore } from '../../store/authStore';
import { FiUsers, FiPlus, FiSearch, FiMail, FiMessageSquare, FiFolder, FiUserPlus, FiSettings, FiMoreVertical, FiStar, FiHash } from 'react-icons/fi';

interface Team {
  id: number;
  name: string;
  description: string;
  members: number;
  avatar: string;
  channels: number;
  isStarred: boolean;
  color: string;
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
}

export default function Teams() {
  const { user } = useAuthStore();
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

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
              <button className="p-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-all">
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
          {selectedTeamData && (
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
                    <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all">
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
                      <p className="text-2xl font-bold">248</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="glass-card p-4 rounded-xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 text-center hover:border-primary-500 transition-all"
                >
                  <FiMessageSquare className="w-8 h-8 mx-auto mb-2 text-primary-500" />
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Send Message</p>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="glass-card p-4 rounded-xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 text-center hover:border-primary-500 transition-all"
                >
                  <FiFolder className="w-8 h-8 mx-auto mb-2 text-primary-500" />
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Share Files</p>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
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
                  <button className="text-sm text-primary-500 hover:text-primary-600 font-semibold flex items-center space-x-1">
                    <FiPlus />
                    <span>New Channel</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {channels.map((channel) => (
                    <motion.button
                      key={channel.id}
                      whileHover={{ x: 4 }}
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
                      {channel.unread > 0 && (
                        <span className="px-2 py-1 bg-primary-500 text-white text-xs font-bold rounded-full">
                          {channel.unread}
                        </span>
                      )}
                    </motion.button>
                  ))}
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
                  {teamMembers.map((member) => (
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
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
