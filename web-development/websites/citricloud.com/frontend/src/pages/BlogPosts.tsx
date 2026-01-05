import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { cmsAPI } from '../lib/api';
import { FiCalendar, FiEye, FiClock, FiTag, FiSearch, FiVideo } from 'react-icons/fi';

export default function BlogPostsPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const {
    data: blogData,
    isLoading,
    isError: isBlogError,
    error: blogError
  } = useQuery({
    queryKey: ['public-blog-posts', selectedCategory],
    queryFn: async () => {
      const { data } = await cmsAPI.getPublicBlogPosts({ page: 1, page_size: 50, category_id: selectedCategory });
      return data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const {
    data: categoriesData,
    isError: isCategoriesError,
    error: categoriesError
  } = useQuery({
    queryKey: ['public-blog-categories'],
    queryFn: async () => (await cmsAPI.getPublicBlogCategories()).data,
    staleTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const posts = blogData?.items || [];
  const categories = categoriesData || [];

  const categorySlugForPost = (post: any) => {
    const cat = categories.find((c: any) => c.id === post?.category_id);
    return cat?.slug || 'blog';
  };

  const isVideoCategory = (post: any) => {
    const cat = categories.find((c: any) => c.id === post?.category_id);
    return cat?.icon === 'video' || cat?.icon === 'film';
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return posts;
    const q = search.toLowerCase();
    return posts.filter((p: any) =>
      (p.title || '').toLowerCase().includes(q) ||
      (p.excerpt || '').toLowerCase().includes(q) ||
      (p.content || '').toLowerCase().includes(q)
    );
  }, [posts, search]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const readingTime = (content: string) => {
    const words = (content || '').trim().split(/\s+/).length;
    return `${Math.max(1, Math.ceil(words / 200))} min read`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-black">
      <Navbar />

      <section className="container mx-auto px-4 sm:px-6 pt-40 sm:pt-44 pb-8 max-w-7xl">
        <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-5xl font-bold text-gray-800 dark:text-gray-100 mb-3">Blog Posts</motion.h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">Browse the latest stories and updates from our team.</p>

        {/* Controls */}
        <div className="mt-6 flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative w-full md:max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts..."
              className="w-full pl-9 pr-3 py-2 rounded-xl glass-card focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-gray-100"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${selectedCategory === null ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30' : 'bg-white/70 dark:bg-gray-800/70 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50'}`}
            >
              All
            </button>
            {categories.map((c: any) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${selectedCategory === c.id ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30' : 'bg-white/70 dark:bg-gray-800/70 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50'}`}
              >
                <FiTag className="w-4 h-4" />
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 pb-24 max-w-7xl">
        {isBlogError ? (
          <div className="glass-card p-12 rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-white/30 dark:border-gray-700/30 text-center">
            <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Failed to load blog posts</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{blogError?.message || 'An error occurred while fetching blog posts.'}</p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card p-6 rounded-2xl bg-white/70 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30 animate-pulse">
                <div className="h-40 bg-gray-300 dark:bg-gray-700 rounded-xl mb-4"></div>
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post: any, i: number) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-white/30 dark:border-gray-700/30 hover:shadow-xl transition-all"
              >
                {post.featured_image && (
                  <div className="mb-4 rounded-xl overflow-hidden relative h-44 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <img src={post.featured_image} alt={post.title} className="w-full h-44 object-contain" />
                    {isVideoCategory(post) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-all">
                        <div className="w-12 h-12 rounded-full bg-white/90 dark:bg-gray-100 flex items-center justify-center shadow-lg">
                          <FiVideo className="w-6 h-6 text-primary-600" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-4 mb-3 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1"><FiCalendar className="w-3.5 h-3.5" /><span>{formatDate(post.published_at || post.created_at)}</span></div>
                  <div className="flex items-center gap-1"><FiClock className="w-3.5 h-3.5" /><span>{readingTime(post.content)}</span></div>
                  {post.views_count > 0 && (<div className="flex items-center gap-1"><FiEye className="w-3.5 h-3.5" /><span>{post.views_count}</span></div>)}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">{post.title}</h3>
                {post.excerpt && (<p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{post.excerpt}</p>)}
                <a href={`https://blog.citricloud.com/${categorySlugForPost(post)}/${post.slug || post.id}`} className="px-4 py-2 rounded-xl text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 font-medium transition-all inline-block">Read more →</a>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-white/30 dark:border-gray-700/30 text-center">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">No posts found</h3>
            <p className="text-gray-600 dark:text-gray-300">Try clearing filters or search terms.</p>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
