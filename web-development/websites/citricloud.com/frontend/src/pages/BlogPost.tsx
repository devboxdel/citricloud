import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { cmsAPI } from '../lib/api';
import { getImageUrl, handleImageError } from '../lib/imageUtils';
import { FiPrinter, FiThumbsUp, FiThumbsDown, FiAlertCircle, FiTag, FiCalendar, FiClock } from 'react-icons/fi';

export default function BlogPostPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { slug } = useParams();
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  }, []);

  const {
    data: post,
    isLoading: isPostLoading,
    isError: isPostError,
    error: postError,
  } = useQuery({
    queryKey: ['public-blog-post', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Missing slug');
      const isNumeric = /^\d+$/.test(slug);
      const resp = isNumeric ? await cmsAPI.getPublicBlogPost(Number(slug)) : await cmsAPI.getPublicBlogPostBySlug(slug);
      return resp.data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const { data: categories } = useQuery({
    queryKey: ['public-blog-categories'],
    queryFn: async () => (await cmsAPI.getPublicBlogCategories()).data,
    staleTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const resolveCategorySlug = (categoryId: number | null | undefined) => {
    const cat = (categories || []).find((c: any) => c.id === categoryId);
    return cat?.slug || 'blog';
  };

  const { data: relatedData } = useQuery({
    queryKey: ['public-blog-posts-related', post?.category_id],
    queryFn: async () => {
      if (!post?.category_id) return { items: [] } as any;
      const { data } = await cmsAPI.getPublicBlogPosts({ page: 1, page_size: 10, category_id: post.category_id });
      return data;
    },
    enabled: !!post?.category_id,
    retry: 1,
    refetchOnWindowFocus: false,
  });
  const relatedPosts = useMemo(() => {
    const items = relatedData?.items || [];
    return items.filter((p: any) => p.id !== post?.id).slice(0, 3);
  }, [relatedData, post]);

  const { data: commentsData, refetch: refetchComments } = useQuery({
    queryKey: ['public-blog-comments', post?.id],
    queryFn: async () => (await cmsAPI.getPublicBlogComments(post!.id)).data,
    enabled: !!post?.id,
    retry: 1,
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Poll every 30 seconds for real-time sync
  });
  const comments = commentsData || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  const readingTime = (content: string) => {
    const words = (content || '').trim().split(/\s+/).length;
    return `${Math.max(1, Math.ceil(words / 200))} min read`;
  };

  const printPost = () => window.print();

  const handleSubmitComment = async () => {
    if (!post?.id || !newComment.trim()) return;
    try {
      setIsSubmittingComment(true);
      await cmsAPI.submitBlogComment({
        post_id: post.id,
        content: newComment.trim(),
        post_type: 'blog',
        post_title: post.title,
        post_slug: post.slug,
        author_name: user?.name || 'Anonymous',
        author_email: user?.email || undefined,
        platform: 'web'
      });
      setNewComment('');
      setShowSuccessMessage(true);
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccessMessage(false), 5000);
      // Invalidate and refetch comments to show the new comment immediately
      await queryClient.invalidateQueries({ queryKey: ['public-blog-comments', post.id] });
      await refetchComments();
    } catch (e) {
      console.log('Failed to submit comment:', e);
      alert('Failed to submit comment. Please try again.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleLikeComment = async (commentId: number) => {
    if (!post?.id) return;
    try {
      await cmsAPI.likePublicBlogComment(post.id, commentId);
      // Invalidate and refetch to show updated like count
      await queryClient.invalidateQueries({ queryKey: ['public-blog-comments', post.id] });
      await refetchComments();
    } catch (e) {
      console.log(e);
    }
  };
  const handleDislikeComment = async (commentId: number) => {
    if (!post?.id) return;
    try {
      await cmsAPI.dislikePublicBlogComment(post.id, commentId);
      // Invalidate and refetch to show updated dislike count
      await queryClient.invalidateQueries({ queryKey: ['public-blog-comments', post.id] });
      await refetchComments();
    } catch (e) {
      console.log(e);
    }
  };
  const handleReportComment = async (commentId: number) => {
    if (!post?.id) return;
    try {
      await cmsAPI.reportPublicBlogComment(post.id, commentId, 'inappropriate');
      alert('Comment reported successfully.');
      // Invalidate and refetch comments
      await queryClient.invalidateQueries({ queryKey: ['public-blog-comments', post.id] });
      await refetchComments();
    } catch (e) {
      console.log(e);
      alert('Failed to report comment.');
    }
  };

  const handleEmojiReaction = async (commentId: number, emoji: string) => {
    if (!user) return;
    try {
      const userIdentifier = user.email;
      await cmsAPI.addCommentReaction(commentId, emoji, userIdentifier, 'web');
      // Invalidate and refetch comments to show updated reactions
      await queryClient.invalidateQueries({ queryKey: ['public-blog-comments', post?.id] });
      await refetchComments();
    } catch (e) {
      console.log('Failed to add reaction:', e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-black">
      <Navbar />

      {/* Page Header */}
      {!isPostError && !isPostLoading && post && (
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative border-b border-white/30 dark:border-gray-700/30 overflow-hidden"
          style={{
            backgroundImage: post.featured_image ? `url(${getImageUrl(post.featured_image)})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 dark:from-black/70 dark:via-black/50 dark:to-black/80"></div>
          
          <div className="relative h-[500px] flex flex-col">
            {/* Title centered in the absolute middle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
                <div className="max-w-4xl mx-auto text-center">
                  <h1 className="text-4xl sm:text-6xl font-bold text-white drop-shadow-2xl">
                    {post.title}
                  </h1>
                </div>
              </div>
            </div>
            
            {/* Metadata at bottom center */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-3 pb-8">
              <Link
                to={`/${resolveCategorySlug(post.category_id)}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors shadow-lg"
              >
                <FiTag className="w-4 h-4" />
                <span className="font-medium">{resolveCategorySlug(post.category_id)}</span>
              </Link>
              {(post.published_at || post.created_at) && (
                <div className="flex items-center gap-2 text-white/90 backdrop-blur-sm bg-black/20 px-3 py-1.5 rounded-full">
                  <FiCalendar className="w-4 h-4" />
                  <span>{formatDate(post.published_at || post.created_at)}</span>
                </div>
              )}
              {post.content && (
                <div className="flex items-center gap-2 text-white/90 backdrop-blur-sm bg-black/20 px-3 py-1.5 rounded-full">
                  <FiClock className="w-4 h-4" />
                  <span>{readingTime(post.content)}</span>
                </div>
              )}
            </div>
          </div>
        </motion.section>
      )}

      <section className="container mx-auto px-4 sm:px-6 pt-8 pb-10 max-w-7xl">
        {isPostError ? (
          <div className="glass-card p-12 rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-white/30 dark:border-gray-700/30 text-center">
            <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Failed to load post</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{(postError as any)?.message || 'An error occurred while fetching the post.'}</p>
            <button onClick={() => navigate('/blog')} className="px-5 py-2 rounded-xl bg-primary-600 text-white">Back to Blog</button>
          </div>
        ) : isPostLoading || !post ? (
          <div className="glass-card p-12 rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-white/30 dark:border-gray-700/30 animate-pulse">
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
            <div className="h-40 bg-gray-300 dark:bg-gray-700 rounded mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-4/6"></div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Sidebar */}
            <aside className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-6 rounded-2xl bg-white/90 dark:bg-gray-900/90 border border-white/30 dark:border-gray-700/30 sticky top-24"
              >
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Post Info</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <FiTag className="w-4 h-4 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Category</div>
                      <div className="font-medium">{resolveCategorySlug(post.category_id)}</div>
                    </div>
                  </div>
                  {(post.published_at || post.created_at) && (
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <FiCalendar className="w-4 h-4 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Published</div>
                        <div className="font-medium">{formatDate(post.published_at || post.created_at)}</div>
                      </div>
                    </div>
                  )}
                  {post.content && (
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <FiClock className="w-4 h-4 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Reading Time</div>
                        <div className="font-medium">{readingTime(post.content)}</div>
                      </div>
                    </div>
                  )}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={printPost}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/70 dark:bg-gray-800/70 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 inline-flex items-center justify-center gap-2 font-medium transition-all"
                    >
                      <FiPrinter className="w-4 h-4" />
                      <span>Print Article</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </aside>

            {/* Right Content Area */}
            <div className="lg:col-span-3 space-y-8">
              {/* Blog Content */}
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 rounded-2xl bg-white/90 dark:bg-gray-900/90 border border-white/30 dark:border-gray-700/30"
              >
                {/* Tags Section */}
                {post.tags && post.tags.length > 0 && (
                  <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 flex-wrap">
                      <FiTag className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags:</span>
                      {post.tags.map((tag: string, idx: number) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: post.content || '' }} />
                </div>
              </motion.article>

              {/* Related Posts Section */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-8 rounded-2xl bg-white/90 dark:bg-gray-900/90 border border-white/30 dark:border-gray-700/30"
              >
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Related Posts</h2>
                {relatedPosts && relatedPosts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {relatedPosts.map((rp: any) => (
                      <Link
                        key={rp.id}
                        to={`/${resolveCategorySlug(rp.category_id)}/${rp.slug || rp.id}`}
                        className="group glass-card p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-all border border-transparent hover:border-primary-200 dark:hover:border-primary-700/50 hover:shadow-lg"
                      >
                        {rp.featured_image && (
                          <div className="w-full h-40 rounded-lg overflow-hidden mb-3">
                            <img
                              src={getImageUrl(rp.featured_image)}
                              alt={rp.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => handleImageError(e, 'w-full h-full object-contain p-2 bg-white')}
                            />
                          </div>
                        )}
                        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {rp.title}
                        </h3>
                        {rp.excerpt && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">{rp.excerpt}</p>
                        )}
                        {(rp.published_at || rp.created_at) && (
                          <p className="text-xs text-gray-500 dark:text-gray-500">{formatDate(rp.published_at || rp.created_at)}</p>
                        )}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                    No related posts available yet.
                  </div>
                )}
              </motion.section>

              {/* Comments Section */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-8 rounded-2xl bg-white/90 dark:bg-gray-900/90 border border-white/30 dark:border-gray-700/30"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    Comments ({comments.length})
                  </h2>
                  <button
                    onClick={() => setShowRules(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors font-medium"
                  >
                    <FiAlertCircle className="w-5 h-5" />
                    <span>Rules</span>
                  </button>
                </div>
                
                {/* Success Message */}
                {showSuccessMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/50"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-green-800 dark:text-green-200">Thank you for your comment!</h3>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          Your comment is under review by our Editorial team. It will be published shortly after moderation.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {user ? (
                  <div className="mb-8">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your thoughts..."
                      className="w-full p-4 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                      rows={4}
                      maxLength={500}
                    />
                    
                    {/* Emoji Reactions for New Comment */}
                    <div className="mt-3 flex flex-wrap items-center gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Add emoji:</span>
                      {['👍', '❤️', '😊', '🎉', '🔥', '👏', '💯', '✨'].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => setNewComment(prev => prev + emoji)}
                          className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 transition-all hover:scale-110"
                          title={`Add ${emoji}`}
                        >
                          <span className="text-xl" style={{ fontFamily: '"Segoe UI Emoji", "Noto Color Emoji", "Apple Color Emoji", sans-serif' }}>{emoji}</span>
                        </button>
                      ))}
                    </div>
                    
                    <div className="mt-4 flex flex-wrap justify-between items-center gap-2">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{newComment.length}/500</div>
                      <button
                        onClick={handleSubmitComment}
                        disabled={!newComment.trim() || isSubmittingComment}
                        className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-xl font-medium transition-all shadow-sm hover:shadow"
                      >
                        {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-6 rounded-xl bg-primary-50/50 dark:bg-primary-900/10 border border-primary-200/50 dark:border-primary-700/30">
                    <p className="text-gray-700 dark:text-gray-300">Sign in to leave a comment and join the discussion.</p>
                    <button
                      onClick={() => navigate('/login')}
                      className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium shadow-sm hover:shadow transition-all"
                    >
                      Sign In
                    </button>
                  </div>
                )}

                <div className="space-y-4">
                  {comments.length > 0 ? (
                    comments.map((comment: any) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-5 rounded-xl bg-white/60 dark:bg-gray-800/60 border border-white/30 dark:border-gray-700/30"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {comment.author || 'Anonymous'}
                            </h4>
                            {comment.timestamp && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(String(comment.timestamp))}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{comment.content}</p>
                        
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleLikeComment(comment.id)}
                            className={`inline-flex items-center gap-2 transition-colors ${
                              user ? 'text-gray-500 hover:text-primary-600' : 'text-gray-400'
                            }`}
                            disabled={!user}
                          >
                            <FiThumbsUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDislikeComment(comment.id)}
                            className={`inline-flex items-center gap-2 transition-colors ${
                              user ? 'text-gray-500 hover:text-red-600' : 'text-gray-400'
                            }`}
                            disabled={!user}
                          >
                            <FiThumbsDown className="w-4 h-4" />
                          </button>
                          {user && (
                            <button
                              onClick={() => handleReportComment(comment.id)}
                              className="inline-flex items-center gap-2 text-gray-500 hover:text-amber-600 transition-colors"
                            >
                              <FiAlertCircle className="w-4 h-4" />
                              <span className="text-sm">Report</span>
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="p-8 rounded-xl bg-white/60 dark:bg-gray-800/60 border border-white/30 dark:border-gray-700/30 text-center">
                      <p className="text-gray-600 dark:text-gray-400">
                        No comments yet. Be the first to share your thoughts!
                      </p>
                    </div>
                  )}
                </div>
              </motion.section>
            </div>
          </div>
        )}
      </section>
      
      {/* Community Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowRules(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card max-w-md w-full p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl"
          >
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Community Rules</h3>
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-2">
                <span className="text-primary-600 dark:text-primary-400 mt-0.5">•</span>
                <p className="text-gray-700 dark:text-gray-300">Be respectful; no harassment or hate speech.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary-600 dark:text-primary-400 mt-0.5">•</span>
                <p className="text-gray-700 dark:text-gray-300">No links or ads; avoid spammy content.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary-600 dark:text-primary-400 mt-0.5">•</span>
                <p className="text-gray-700 dark:text-gray-300">Keep comments relevant and constructive.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary-600 dark:text-primary-400 mt-0.5">•</span>
                <p className="text-gray-700 dark:text-gray-300">Avoid excessive repeated characters or caps.</p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowRules(false)}
                className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium transition-all shadow-sm hover:shadow"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
}
