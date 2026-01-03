import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FiUsers, FiMessageCircle, FiHelpCircle, FiStar, FiBookOpen, FiTrendingUp, FiPlus, FiX, FiArrowLeft, FiHeart, FiSearch, FiFilter, FiShare2, FiFlag, FiThumbsUp, FiEye } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuthStore } from '../store/authStore';

interface Topic {
  id: string;
  categoryId: string;
  title: string;
  author: string;
  content: string;
  replies: number;
  views: number;
  likes: number;
  likedBy: string[];
  createdAt: Date;
  updatedAt: Date;
  solved?: boolean;
}

interface Reply {
  id: string;
  topicId: string;
  author: string;
  content: string;
  likes: number;
  likedBy: string[];
  createdAt: Date;
  isSolution?: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  topicsCount: number;
}

export default function CommunityPage() {
  const { user, isAuthenticated, loadFromStorage } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'categories' | 'topics' | 'topic-detail'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'views'>('recent');

  const [topics, setTopics] = useState<Topic[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);

  // Load auth on mount
  useEffect(() => {
    const init = async () => {
      await loadFromStorage();
      setLoading(false);
    };
    init();
  }, [loadFromStorage]);

  const categories: Category[] = [
    {
      id: 'general',
      name: 'General Discussion',
      description: 'General topics and announcements',
      icon: <FiMessageCircle className="w-6 h-6" />,
      topicsCount: 12
    },
    {
      id: 'cloud',
      name: 'Cloud Infrastructure',
      description: 'Cloud platforms, deployment, and architecture',
      icon: <FiTrendingUp className="w-6 h-6" />,
      topicsCount: 28
    },
    {
      id: 'devops',
      name: 'DevOps & Automation',
      description: 'CI/CD, automation, and infrastructure as code',
      icon: <FiBookOpen className="w-6 h-6" />,
      topicsCount: 19
    },
    {
      id: 'security',
      name: 'Security',
      description: 'Security best practices and discussions',
      icon: <FiHelpCircle className="w-6 h-6" />,
      topicsCount: 15
    }
  ];

  const handleCreateTopic = () => {
    if (!newTopicTitle.trim() || !newTopicContent.trim() || !user) return;

    const topic: Topic = {
      id: String(topics.length + 1),
      categoryId: selectedCategory?.id || 'general',
      title: newTopicTitle,
      author: user.username || user.email,
      content: newTopicContent,
      replies: 0,
      views: 0,
      likes: 0,
      likedBy: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setTopics([topic, ...topics]);
    setNewTopicTitle('');
    setNewTopicContent('');
    setShowNewTopicModal(false);
  };

  const handleAddReply = () => {
    if (!replyContent.trim() || !selectedTopic || !user) return;

    const reply: Reply = {
      id: String(replies.length + 1),
      topicId: selectedTopic.id,
      author: user.username || user.email,
      content: replyContent,
      likes: 0,
      likedBy: [],
      createdAt: new Date()
    };

    setReplies([...replies, reply]);
    const updatedTopic = { ...selectedTopic, replies: selectedTopic.replies + 1 };
    setTopics(topics.map(t => t.id === selectedTopic.id ? updatedTopic : t));
    setSelectedTopic(updatedTopic);
    setReplyContent('');
    setShowReplyModal(false);
  };

  const handleLikeTopic = (topicId: string) => {
    if (!user) return;
    setTopics(topics.map(topic => {
      if (topic.id === topicId) {
        const isLiked = topic.likedBy.includes(user.username || user.email);
        return {
          ...topic,
          likes: isLiked ? topic.likes - 1 : topic.likes + 1,
          likedBy: isLiked 
            ? topic.likedBy.filter(u => u !== (user.username || user.email))
            : [...topic.likedBy, user.username || user.email]
        };
      }
      return topic;
    }));
  };

  const handleLikeReply = (replyId: string) => {
    if (!user) return;
    setReplies(replies.map(reply => {
      if (reply.id === replyId) {
        const isLiked = reply.likedBy.includes(user.username || user.email);
        return {
          ...reply,
          likes: isLiked ? reply.likes - 1 : reply.likes + 1,
          likedBy: isLiked 
            ? reply.likedBy.filter(u => u !== (user.username || user.email))
            : [...reply.likedBy, user.username || user.email]
        };
      }
      return reply;
    }));
  };

  const handleMarkSolution = (replyId: string) => {
    if (selectedTopic?.author !== user?.username && selectedTopic?.author !== user?.email) return;
    
    setReplies(replies.map(reply => ({
      ...reply,
      isSolution: reply.id === replyId ? !reply.isSolution : false
    })));
    
    setSelectedTopic(prev => prev ? { ...prev, solved: true } : null);
  };

  const filteredTopics = topics
    .filter(t => t.categoryId === selectedCategory?.id)
    .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                 t.content.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'recent') return b.createdAt.getTime() - a.createdAt.getTime();
      if (sortBy === 'popular') return b.likes - a.likes;
      if (sortBy === 'views') return b.views - a.views;
      return 0;
    });

  // Not logged in view
  if (!isAuthenticated && !loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-black pt-32 pb-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Join Our Community
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Sign in to join the discussion and share your knowledge
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-8 rounded-2xl bg-gradient-to-br from-primary-500/10 to-primary-600/10 dark:from-primary-500/20 dark:to-primary-600/20 border border-primary-500/30 dark:border-primary-400/30 text-center max-w-md mx-auto"
            >
              <FiUsers className="w-16 h-16 text-primary-500 dark:text-primary-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Sign In Required
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Please sign in to access the community forum
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://my.citricloud.com/register"
                  className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-all"
                >
                  Sign Up Now
                </a>
                <a
                  href="https://my.citricloud.com/login"
                  className="px-8 py-3 bg-white/70 dark:bg-gray-800/70 hover:bg-white dark:hover:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-lg transition-all border border-gray-300 dark:border-gray-700"
                >
                  Sign In
                </a>
              </div>
            </motion.div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-black flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300">Loading...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Categories view
  if (view === 'categories') {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-black pt-32 pb-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Community Forum</h1>
              {user && <p className="text-gray-600 dark:text-gray-300">Welcome, {user.username || user.email}!</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => {
                    setSelectedCategory(category);
                    setView('topics');
                  }}
                  className="glass-card p-6 rounded-xl bg-white/70 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30 cursor-pointer hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-primary-500 dark:text-primary-400">{category.icon}</div>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{category.topicsCount} topics</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">{category.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Topics view
  if (view === 'topics' && selectedCategory) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-black pt-32 pb-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setView('categories')}
                  className="p-2 hover:bg-white/50 dark:hover:bg-gray-800 rounded-lg transition-all"
                >
                  <FiArrowLeft className="w-6 h-6 text-gray-900 dark:text-white" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{selectedCategory.name}</h1>
                  <p className="text-gray-600 dark:text-gray-300">{filteredTopics.length} topics</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewTopicModal(true)}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
              >
                <FiPlus className="w-5 h-5" />
                New Topic
              </button>
            </div>

            <div className="mb-6 flex gap-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="recent">Recent</option>
                <option value="popular">Popular</option>
                <option value="views">Most Viewed</option>
              </select>
            </div>

            {filteredTopics.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-300 text-lg">No topics yet. Be the first to start a discussion!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTopics.map((topic) => (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => {
                      setSelectedTopic({...topic, views: topic.views + 1});
                      setView('topic-detail');
                    }}
                    className="glass-card p-6 rounded-xl bg-white/70 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30 cursor-pointer hover:shadow-lg transition-all"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400">
                            {topic.title}
                          </h3>
                          {topic.solved && <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded-full">Solved</span>}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          by <span className="font-medium">{topic.author}</span>
                        </p>
                      </div>
                      <div className="text-right text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex gap-4 justify-end">
                          <div className="flex items-center gap-1">
                            <FiMessageCircle className="w-4 h-4" />
                            {topic.replies}
                          </div>
                          <div className="flex items-center gap-1">
                            <FiEye className="w-4 h-4" />
                            {topic.views}
                          </div>
                          <div className="flex items-center gap-1">
                            <FiHeart className="w-4 h-4" fill="currentColor" />
                            {topic.likes}
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 line-clamp-2">{topic.content}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* New Topic Modal */}
            {showNewTopicModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full p-6"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Topic</h2>
                    <button onClick={() => setShowNewTopicModal(false)}>
                      <FiX className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Topic Title"
                      value={newTopicTitle}
                      onChange={(e) => setNewTopicTitle(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <textarea
                      placeholder="Topic Content"
                      value={newTopicContent}
                      onChange={(e) => setNewTopicContent(e.target.value)}
                      rows={6}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <div className="flex gap-4">
                      <button
                        onClick={handleCreateTopic}
                        className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-all"
                      >
                        Create Topic
                      </button>
                      <button
                        onClick={() => setShowNewTopicModal(false)}
                        className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold rounded-lg transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Topic detail view
  if (view === 'topic-detail' && selectedTopic) {
    const topicReplies = replies.filter(r => r.topicId === selectedTopic.id);
    const isTopicAuthor = selectedTopic.author === user?.username || selectedTopic.author === user?.email;
    const isLiked = user && selectedTopic.likedBy.includes(user.username || user.email);

    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-black pt-32 pb-20 px-4">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setView('topics')}
              className="mb-6 p-2 hover:bg-white/50 dark:hover:bg-gray-800 rounded-lg transition-all"
            >
              <FiArrowLeft className="w-6 h-6 text-gray-900 dark:text-white" />
            </button>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-8 rounded-xl bg-white/70 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30 mb-8"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{selectedTopic.title}</h1>
                  {selectedTopic.solved && <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded-full">Solved</span>}
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Posted by <span className="font-semibold">{selectedTopic.author}</span> • {selectedTopic.views} views • {selectedTopic.replies} replies
              </p>
              <p className="text-gray-700 dark:text-gray-200 leading-relaxed mb-6">{selectedTopic.content}</p>
              
              <div className="flex gap-4 pt-4 border-t border-gray-300 dark:border-gray-700">
                <button
                  onClick={() => handleLikeTopic(selectedTopic.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isLiked
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <FiHeart className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} />
                  {selectedTopic.likes} Like{selectedTopic.likes !== 1 ? 's' : ''}
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
                  <FiShare2 className="w-5 h-5" />
                  Share
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
                  <FiFlag className="w-5 h-5" />
                  Report
                </button>
              </div>
            </motion.div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Replies ({topicReplies.length})</h2>
                <button
                  onClick={() => setShowReplyModal(true)}
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
                >
                  <FiPlus className="w-5 h-5" />
                  Reply
                </button>
              </div>

              <div className="space-y-4">
                {topicReplies.map((reply) => {
                  const isReplyLiked = user && reply.likedBy.includes(user.username || user.email);
                  return (
                    <motion.div
                      key={reply.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`glass-card p-6 rounded-xl border transition-all ${
                        reply.isSolution
                          ? 'bg-green-50/70 dark:bg-green-900/30 border-green-300 dark:border-green-700/50'
                          : 'bg-white/70 dark:bg-gray-900/70 border-white/30 dark:border-gray-700/30'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{reply.author}</p>
                        {reply.isSolution && (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-xs rounded-full">✓ Solution</span>
                        )}
                      </div>
                      <p className="text-gray-700 dark:text-gray-200 mb-4">{reply.content}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {reply.createdAt.toLocaleDateString()} {reply.createdAt.toLocaleTimeString()}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleLikeReply(reply.id)}
                            className={`flex items-center gap-1 px-3 py-1 rounded transition-all text-sm ${
                              isReplyLiked
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                          >
                            <FiHeart className="w-4 h-4" fill={isReplyLiked ? 'currentColor' : 'none'} />
                            {reply.likes}
                          </button>
                          {isTopicAuthor && (
                            <button
                              onClick={() => handleMarkSolution(reply.id)}
                              className={`flex items-center gap-1 px-3 py-1 rounded transition-all text-sm ${
                                reply.isSolution
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                              }`}
                            >
                              <FiThumbsUp className="w-4 h-4" />
                              {reply.isSolution ? 'Marked' : 'Mark as Solution'}
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Reply Modal */}
            {showReplyModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full p-6"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add Reply</h2>
                    <button onClick={() => setShowReplyModal(false)}>
                      <FiX className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <textarea
                      placeholder="Write your reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      rows={6}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <div className="flex gap-4">
                      <button
                        onClick={handleAddReply}
                        className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-all"
                      >
                        Post Reply
                      </button>
                      <button
                        onClick={() => setShowReplyModal(false)}
                        className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold rounded-lg transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return null;
}
