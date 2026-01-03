import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { cmsAPI } from '../lib/api';
import { getImageUrl, handleImageError } from '../lib/imageUtils';
import { FiCalendar, FiEye, FiUser, FiClock, FiTag, FiSearch, FiChevronLeft, FiChevronRight, FiVideo } from 'react-icons/fi';
import { getCategoryIcon } from '../lib/iconMap';
import { useLanguage } from '../context/LanguageContext';

export default function BlogPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const categorySlug = searchParams.get('category');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 9; // 1 featured + 8 grid items on first page, or 9 grid items on other pages
  

  const {
    data: blogData,
    isLoading,
    isError: isBlogError,
    error: blogError
  } = useQuery({
    queryKey: ['public-blog-posts', selectedCategory, page],
    queryFn: async () => {
      const response = await cmsAPI.getPublicBlogPosts({
        page: page,
        page_size: pageSize,
        category_id: selectedCategory
      });
      return response.data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    isError: isCategoriesError,
    error: categoriesError
  } = useQuery({
    queryKey: ['public-blog-categories'],
    queryFn: async () => {
      const response = await cmsAPI.getPublicBlogCategories();
      return response.data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Posts are already filtered by backend (published only, and by category if selected)
  const posts = blogData?.items || [];
  const totalPosts = blogData?.total || 0;
  const totalPages = Math.ceil(totalPosts / pageSize);
  
  // Filter posts by search query (client-side for now, ideally should be server-side)
  const filteredPosts = posts
    .filter((post: any) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    // Sort sticky posts to the top
    .sort((a: any, b: any) => {
      if (a.is_sticky && !b.is_sticky) return -1;
      if (!a.is_sticky && b.is_sticky) return 1;
      return 0;
    });

  // Categories are already filtered by backend (active only)
  const categories = categoriesData || [];

  const categorySlugForPost = (post: any) => {
    const cat = categories.find((c: any) => c.id === post?.category_id);
    return cat?.slug || 'blog';
  };

  const isVideoCategory = (post: any) => {
    const cat = categories.find((c: any) => c.id === post?.category_id);
    return cat?.icon === 'video' || cat?.icon === 'film';
  };

  // Set selected category from URL parameter
  useEffect(() => {
    if (categorySlug && categories.length > 0) {
      const category = categories.find((cat: any) => cat.slug === categorySlug);
      if (category && category.id !== selectedCategory) {
        setSelectedCategory(category.id);
        setPage(1); // Reset to first page when category changes
      }
    } else if (!categorySlug && selectedCategory !== null) {
      setSelectedCategory(null);
      setPage(1);
    }
  }, [categorySlug, categories, selectedCategory]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  const navigateToPost = (post: any) => {
    navigate(`/${categorySlugForPost(post)}/${post.slug || post.id}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Featured post is the first post of the first page
  const featuredPost = page === 1 && filteredPosts.length > 0 ? filteredPosts[0] : null;
  const gridPosts = page === 1 ? filteredPosts.slice(1) : filteredPosts;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-black">
      <Navbar />

      <section className="container mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-10 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('blog')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mb-8">
            {t('latest_posts')}
          </p>

          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl glass-card bg-white/80 dark:bg-gray-900/80 border border-white/30 dark:border-gray-700/30 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </motion.div>
      </section>

      {isBlogError ? (
        <section className="container mx-auto px-4 sm:px-6 pb-24 max-w-7xl">
          <div className="glass-card p-12 rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-white/30 dark:border-gray-700/30 text-center">
            <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">{t('error_pages')}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{blogError?.message || t('server_error_desc')}</p>
          </div>
        </section>
      ) : isLoading ? (
        <section className="container mx-auto px-4 sm:px-6 pb-24 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card p-6 rounded-2xl bg-white/70 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30 animate-pulse">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
                <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </section>
      ) : filteredPosts.length > 0 ? (
        <section className="container mx-auto px-4 sm:px-6 pb-24 max-w-7xl">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-3 space-y-6 lg:sticky lg:top-24 lg:self-start">
              {/* Categories Widget */}
              {!categoriesLoading && categories.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-card p-6 rounded-2xl bg-white/90 dark:bg-gray-900/90 border border-white/30 dark:border-gray-700/30"
                >
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <FiTag className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    Categories
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setSelectedCategory(null);
                        setSearchParams({});
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-full text-left px-4 py-2.5 rounded-xl font-medium transition-all flex items-center justify-between group ${
                        selectedCategory === null
                          ? 'bg-primary-600 text-white shadow-lg'
                          : 'bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
                      }`}
                    >
                      <span>All Posts</span>
                    </button>
                    {categories.map((category: any) => {
                      const IconComponent = getCategoryIcon(category.icon);
                      const isActive = selectedCategory === category.id;
                      return (
                        <button
                          key={category.id}
                          onClick={() => {
                            setSelectedCategory(category.id);
                            setSearchParams({ category: category.slug });
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`w-full text-left px-4 py-2.5 rounded-xl font-medium transition-all flex items-center justify-between group ${
                            isActive
                              ? 'bg-primary-600 text-white shadow-lg'
                              : 'bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <IconComponent
                              className={`w-4 h-4 ${
                                isActive
                                  ? 'text-white'
                                  : 'text-primary-600 group-hover:text-primary-700 dark:text-primary-400 dark:group-hover:text-primary-300'
                              }`}
                            />
                            {category.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Archives Widget */}
              {/* {filteredPosts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-card p-6 rounded-2xl bg-white/90 dark:bg-gray-900/90 border border-white/30 dark:border-gray-700/30"
                >
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <FiCalendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    Archives
                  </h3>
                  <div className="space-y-2">
                    {(() => {
                      const archivesByMonth: { [key: string]: number } = {};
                      posts.forEach((post: any) => {
                        const date = new Date(post.published_at || post.created_at);
                        const monthKey = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                        archivesByMonth[monthKey] = (archivesByMonth[monthKey] || 0) + 1;
                      });
                      
                      return Object.entries(archivesByMonth)
                        .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                        .slice(0, 12)
                        .map(([month, count]) => (
                          <div
                            key={month}
                            className="flex items-center justify-between p-3 rounded-xl bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800 transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-2">
                              <FiCalendar className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                {month}
                              </span>
                            </div>
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-lg">
                              {count}
                            </span>
                          </div>
                        ));
                    })()}
                  </div>
                </motion.div>
              )}

              {/* Popular Posts Widget */}
              {posts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass-card p-6 rounded-2xl bg-white/90 dark:bg-gray-900/90 border border-white/30 dark:border-gray-700/30"
                >
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <FiEye className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    Popular Posts
                  </h3>
                  <div className="space-y-4">
                    {posts
                      .sort((a: any, b: any) => (b.views_count || 0) - (a.views_count || 0))
                      .slice(0, 5)
                      .map((post: any) => (
                        <Link
                          key={post.id}
                          to={`/${categorySlugForPost(post)}/${post.slug || post.id}`}
                          className="block group"
                        >
                          <div className="flex gap-3">
                            {post.featured_image && (
                              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  src={getImageUrl(post.featured_image)}
                                  alt={post.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const img = e.target as HTMLImageElement;
                                    img.src = '/default-monochrome.svg';
                                    img.className = 'w-full h-full object-contain p-2 bg-white';
                                  }}
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2 mb-1">
                                {post.title}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <FiCalendar className="w-3 h-3" />
                                <span>{formatDate(post.published_at || post.created_at)}</span>
                                {post.views_count > 0 && (
                                  <>
                                    <span>•</span>
                                    <FiEye className="w-3 h-3" />
                                    <span>{post.views_count}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                  </div>
                </motion.div>
              )}
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-9">
              {/* Featured Post */}
              {featuredPost && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <div
                    role="link"
                    tabIndex={0}
                    onClick={() => navigateToPost(featuredPost)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigateToPost(featuredPost);
                      }
                    }}
                    className="glass-card rounded-3xl overflow-hidden bg-white/80 dark:bg-gray-900/80 border border-white/30 dark:border-gray-700/30 shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    <div className="grid lg:grid-cols-2 gap-0 items-stretch">
                      <div className="relative overflow-hidden h-72 lg:h-full min-h-[280px]">
                        {featuredPost.featured_image ? (
                          <>
                            <img
                              src={getImageUrl(featuredPost.featured_image)}
                              alt={featuredPost.title}
                              className="w-full h-full object-cover"
                              onError={(e) => handleImageError(e, 'w-full h-full object-cover bg-gradient-to-br from-primary-500 to-blue-600')}
                            />
                            {isVideoCategory(featuredPost) && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-all">
                                <div className="w-16 h-16 rounded-full bg-white/90 dark:bg-gray-100 flex items-center justify-center shadow-lg">
                                  <FiVideo className="w-8 h-8 text-primary-600" />
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center">
                            <FiTag className="w-16 h-16 text-white/50" />
                          </div>
                        )}
                        <div className="absolute top-4 left-4 flex gap-2 z-10">
                          <span className="px-3 py-1 rounded-lg text-xs font-bold bg-primary-600 text-white shadow-lg">
                            Featured
                          </span>
                          {featuredPost.is_sticky && (
                            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-500 text-white shadow-lg">
                              ⭐ Sticky
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-8 lg:p-12 flex flex-col justify-center">
                        <div className="flex items-center gap-4 mb-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1.5">
                            <FiCalendar className="w-4 h-4" />
                            <span>{formatDate(featuredPost.published_at || featuredPost.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <FiClock className="w-4 h-4" />
                            <span>{calculateReadingTime(featuredPost.content)}</span>
                          </div>
                        </div>
                        
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {featuredPost.title}
                        </h2>
                        
                        {featuredPost.excerpt && (
                          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 line-clamp-3">
                            {featuredPost.excerpt}
                          </p>
                        )}
                      </div>

                      <div className="absolute bottom-4 right-4">
                        {categories.find((c: any) => c.id === featuredPost.category_id) && (
                          <span className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm font-medium">
                            {categories.find((c: any) => c.id === featuredPost.category_id).name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-12">
                {gridPosts.map((post: any, i: number) => {
                  const postCategory = categories.find((cat: any) => cat.id === post.category_id);
                  
                  return (
                  <motion.article 
                    key={post.id} 
                    initial={{ opacity: 0, y: 12 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: i * 0.05 }} 
                    role="link"
                    tabIndex={0}
                    onClick={() => navigateToPost(post)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigateToPost(post);
                      }
                    }}
                    className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-white/30 dark:border-gray-700/30 hover:shadow-xl transition-all cursor-pointer group flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    {post.featured_image && (
                      <div className="mb-4 rounded-xl overflow-hidden relative h-48">
                        <img 
                          src={getImageUrl(post.featured_image)} 
                          alt={post.title}
                          className="w-full h-full object-cover"
                          onError={(e) => handleImageError(e, 'w-full h-full object-cover bg-white')}
                        />
                        {isVideoCategory(post) && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-all">
                            <div className="w-12 h-12 rounded-full bg-white/90 dark:bg-gray-100 flex items-center justify-center shadow-lg">
                              <FiVideo className="w-6 h-6 text-primary-600" />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 mb-3 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <FiCalendar className="w-3.5 h-3.5" />
                      <span>{formatDate(post.published_at || post.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiClock className="w-3.5 h-3.5" />
                      <span>{calculateReadingTime(post.content)}</span>
                    </div>
                    {post.is_sticky && (
                      <div className="ml-auto px-2 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold flex items-center gap-1">
                        <span>⭐</span>
                        <span>Sticky</span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  
                  {post.excerpt && (
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 flex-grow">
                      {post.excerpt}
                    </p>
                  )}
                  </motion.article>
                );
              })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mb-12">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="p-2 rounded-xl glass-card bg-white/80 dark:bg-gray-900/80 border border-white/30 dark:border-gray-700/30 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-gray-800 transition-all"
                  >
                    <FiChevronLeft className="w-5 h-5" />
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => {
                    const p = i + 1;
                    // Show first, last, and pages around current
                    if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                      return (
                        <button
                          key={p}
                          onClick={() => handlePageChange(p)}
                          className={`w-10 h-10 rounded-xl font-medium transition-all ${
                            page === p
                              ? 'bg-primary-600 text-white shadow-lg'
                              : 'glass-card bg-white/80 dark:bg-gray-900/80 border border-white/30 dark:border-gray-700/30 hover:bg-white dark:hover:bg-gray-800'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    } else if (p === page - 2 || p === page + 2) {
                      return <span key={p} className="px-1">...</span>;
                    }
                    return null;
                  })}

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="p-2 rounded-xl glass-card bg-white/80 dark:bg-gray-900/80 border border-white/30 dark:border-gray-700/30 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-gray-800 transition-all"
                  >
                    <FiChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              <div className="mt-6 text-gray-600 dark:text-gray-400 text-center">
                Showing {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="container mx-auto px-4 sm:px-6 pb-24 max-w-7xl">
          <div className="glass-card p-12 rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-white/30 dark:border-gray-700/30 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              {selectedCategory ? (
                <FiTag className="w-10 h-10 text-gray-400 dark:text-gray-600" />
              ) : (
                <FiUser className="w-10 h-10 text-gray-400 dark:text-gray-600" />
              )}
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              {selectedCategory ? 'No posts in this category' : 'No blog posts yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {selectedCategory 
                ? 'Try selecting a different category to see more posts.' 
                : 'Check back soon for updates from the CITRICLOUD team!'}
            </p>
            {selectedCategory && (
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSearchParams({});
                }}
                className="px-6 py-3 rounded-xl bg-primary-600 text-white hover:bg-primary-700 font-medium transition-all"
              >
                View all posts
              </button>
            )}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}