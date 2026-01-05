import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Topbar from '../components/Topbar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';
import { cmsAPI, shopAPI } from '../lib/api';
import { getImageUrl, handleImageError } from '../lib/imageUtils';
import { 
  FiLayout, FiUsers, FiFileText, FiShoppingCart, 
  FiZap, FiShield, FiCheck, FiTrendingUp, FiAward, FiGlobe, FiLock, FiClock,
  FiArrowRight, FiCalendar, FiTag, FiStar, FiPackage
} from 'react-icons/fi';

// Get category path from product for URL generation
// Returns: 'parent-slug/child-slug' for subcategories, 'category-slug' for parent categories, 'shop' as fallback
const getCategoryPath = (product: any): string => {
  const category = product.category;
  if (!category) return 'shop';
  
  // If category has a parent, construct parent/child path
  if (category.parent) {
    return `${category.parent.slug}/${category.slug}`;
  }
  
  // Otherwise just use the category slug
  return category.slug;
};

  // Use the shared getImageUrl utility for consistent image URL resolution
  const resolveImageUrl = (rawUrl?: string | null) => {
    return getImageUrl(rawUrl);
  };

  // Pick the first available image field from the API payload
  const pickProductImage = (product: any) => {
    const candidate = Array.isArray(product?.images)
      ? product.images.find(Boolean)
      : product?.images;
    return (
      candidate ||
      product?.image ||
      product?.thumbnail ||
      product?.thumbnail_url ||
      product?.image_url ||
      null
    );
  };

  // Prevent infinite onError loops by swapping to placeholder only once
  const handleImageError: React.EventHandler<React.SyntheticEvent<HTMLImageElement, Event>> = (e) => {
    const img = e.currentTarget;
    if (img.dataset.fallbacked === 'true') return;
    img.dataset.fallbacked = 'true';
    img.src = resolveImageUrl('/uploads/placeholder-product.webp') || '/uploads/placeholder-product.webp';
  };

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const { t } = useLanguage();
  const [isHeroVisible, setIsHeroVisible] = useState(true);

  // Track if user has scrolled past hero section
  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = 600; // Approximate hero height
      setIsHeroVisible(window.scrollY < heroHeight - 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch latest blog posts
  const { data: blogData } = useQuery({
    queryKey: ['home-latest-blog-posts'],
    queryFn: async () => {
      const response = await cmsAPI.getPublicBlogPosts({
        page: 1,
        page_size: 3,
      });
      return response.data;
    },
    retry: 1,
  });

  // Fetch latest shop products
  const { data: productsData } = useQuery({
    queryKey: ['home-latest-products'],
    queryFn: async () => {
      const response = await shopAPI.getProducts({
        page_size: 4,
        sort_by: 'newest',
      });
      return response.data;
    },
    retry: 1,
  });

  const latestPosts = blogData?.items || [];
  const latestProducts = productsData?.items || [];

  const features = [
    {
      icon: <FiLayout className="w-8 h-8" />,
      title: t('dashboard_title'),
      description: t('dashboard_desc'),
    },
    {
      icon: <FiUsers className="w-8 h-8" />,
      title: t('crm_title'),
      description: t('crm_desc'),
    },
    {
      icon: <FiFileText className="w-8 h-8" />,
      title: t('cms_title'),
      description: t('cms_desc'),
    },
    {
      icon: <FiShoppingCart className="w-8 h-8" />,
      title: t('erp_title'),
      description: t('erp_desc'),
    },
    {
      icon: <FiZap className="w-8 h-8" />,
      title: t('fast_title'),
      description: t('fast_desc'),
    },
    {
      icon: <FiShield className="w-8 h-8" />,
      title: t('secure_title'),
      description: t('secure_desc'),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-black">
      <Topbar />
      <Navbar transparent={isHeroVisible} />
      <main className="pt-10">

      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-40 pb-32 sm:pb-40 overflow-hidden min-h-[600px] sm:min-h-[700px] flex items-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1920&h=800&fit=crop&q=80" 
            alt="Programming workspace"
            className="w-full h-full object-cover"
            width="1920"
            height="800"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/75 via-gray-900/65 to-gray-900/50 dark:from-gray-800/70 dark:via-gray-900/60 dark:to-gray-900/55"></div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10 w-full">
          <div className="max-w-3xl">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-left"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  {t('home_hero_title')}
                </h1>
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg sm:text-xl text-gray-200 mb-8 leading-relaxed"
              >
                {t('home_hero_subtitle')}
              </motion.p>

              {!isAuthenticated && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <a href="https://my.citricloud.com/register">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-4 rounded-xl bg-primary-700 hover:bg-primary-800 text-white font-semibold text-lg shadow-lg shadow-primary-500/50 transition-all"
                    >
                      {t('home_start_free')}
                    </motion.button>
                  </a>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>

      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 sm:px-6 py-10 sm:py-20 max-w-7xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-8 sm:mb-12">
            {t('home_features_title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="glass-card p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white/70 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary-500/10 dark:bg-primary-500/20 flex items-center justify-center text-primary-500 dark:text-primary-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-base sm:text-base text-gray-700 dark:text-gray-200 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary-500/5 dark:bg-primary-500/10 py-10 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl sm:text-4xl lg:text-5xl font-bold text-primary-600 dark:text-primary-400 mb-2">10K+</div>
              <div className="text-base sm:text-base text-gray-700 dark:text-gray-200 font-medium">{t('active_users')}</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="text-4xl sm:text-4xl lg:text-5xl font-bold text-primary-600 dark:text-primary-400 mb-2">99.9%</div>
              <div className="text-base sm:text-base text-gray-700 dark:text-gray-200 font-medium">{t('uptime')}</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="text-4xl sm:text-4xl lg:text-5xl font-bold text-primary-600 dark:text-primary-400 mb-2">50+</div>
              <div className="text-base sm:text-base text-gray-700 dark:text-gray-200 font-medium">{t('countries')}</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="text-4xl sm:text-4xl lg:text-5xl font-bold text-primary-600 dark:text-primary-400 mb-2">24/7</div>
              <div className="text-base sm:text-base text-gray-700 dark:text-gray-200 font-medium">{t('support_hours')}</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="container mx-auto px-4 sm:px-6 py-10 sm:py-20 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              {t('why_choose_us')}
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-6 sm:mb-8">
              {t('enterprise_grade_solutions')}
            </p>
            <div className="space-y-4">
              {[
                { icon: <FiCheck />, key: 'easy_powerful_scale' },
                { icon: <FiTrendingUp />, key: 'realtime_analytics' },
                { icon: <FiAward />, key: 'award_winning_support' },
                { icon: <FiGlobe />, key: 'global_cdn_fast' },
                { icon: <FiLock />, key: 'enterprise_security' },
                { icon: <FiClock />, key: 'automated_workflows' },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                    {item.icon}
                  </div>
                  <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">{t(item.key)}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="glass-card p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-primary-600/10 dark:bg-primary-600/20 border border-white/30 dark:border-gray-700/30">
              <div className="aspect-video rounded-xl overflow-hidden bg-primary-600">
                <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop"
                  alt="Dashboard Analytics"
                  width="2426"
                  height="1365"
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-10 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-base sm:text-lg text-center text-gray-600 dark:text-gray-300 mb-8 sm:mb-12 max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include 30-day money-back guarantee.
          </p>
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {[
              { name: 'Starter', price: '12', features: ['All 15 Workspace apps', '100GB storage per user', 'Email support', 'Mobile apps', 'Basic integrations', 'Version history (30 days)'] },
              { name: 'Professional', price: '20', features: ['Everything in Starter', 'Unlimited storage', 'Priority support', 'Advanced integrations', 'Version history (90 days)', 'Admin console'] },
              { name: 'Enterprise', price: 'Custom', features: ['Everything in Professional', 'Dedicated account manager', '24/7 phone support', 'SLA guarantees', 'Unlimited version history', 'SSO & SAML'] },
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="glass-card rounded-2xl sm:rounded-3xl bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 shadow-lg p-6 sm:p-8 relative"
              >
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{plan.name}</h3>
                <div className="mb-6">
                  {plan.price === 'Custom' ? (
                    <>
                      <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">{plan.price}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Contact our sales team</div>
                    </>
                  ) : (
                    <>
                      <span className="text-5xl font-bold text-gray-900 dark:text-white">${plan.price}</span>
                      <span className="text-gray-600 dark:text-gray-400">/user/month</span>
                    </>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start space-x-2 text-sm text-gray-700 dark:text-gray-300">
                      <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <a href={plan.price === 'Custom' ? 'mailto:sales@citricloud.com' : 'https://my.citricloud.com/register'}>
                  <button className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    plan.popular 
                      ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}>
                    {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                  </button>
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 py-10 sm:py-20 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8 sm:p-12 rounded-2xl sm:rounded-3xl bg-primary-600 dark:bg-primary-600 border border-white/30 text-center shadow-xl"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-base sm:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Join thousands of businesses that trust CITRICLOUD for their digital transformation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://my.citricloud.com/register">
              <button className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary-500 rounded-xl font-medium text-base sm:text-lg hover:bg-gray-100 transition-all w-full sm:w-auto">
                Start Free Trial
              </button>
            </a>
            <a href="https://contact.citricloud.com/">
              <button className="px-6 sm:px-8 py-3 sm:py-4 bg-white/10 text-white rounded-xl font-medium text-base sm:text-lg hover:bg-white/20 transition-all backdrop-blur-sm w-full sm:w-auto">
                Contact Sales
              </button>
            </a>
          </div>
        </motion.div>
      </section>

      {/* Latest Blog Posts Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-20 max-w-7xl">
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Latest Blog Posts
          </h2>
          <Link 
            to="/blog" 
            className="flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors group"
          >
            View All
            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        {latestPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {latestPosts.map((post: any, index: number) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link 
                  to={`/blog/${post.category_slug || 'blog'}/${post.slug}`}
                  className="glass-card block rounded-2xl overflow-hidden bg-white/70 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30 hover:shadow-xl transition-all duration-300 group h-full"
                >
                  {/* Image */}
                  <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary-500 to-primary-600">
                    {post.featured_image ? (
                      <img
                        src={getImageUrl(post.featured_image)}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => handleImageError(e, 'w-full h-full object-cover')}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiFileText className="w-16 h-16 text-white/50" />
                      </div>
                    )}
                    {post.category_name && (
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-600/90 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
                          <FiTag className="w-3 h-3" />
                          {post.category_name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {post.title}
                    </h3>
                    
                    {post.excerpt && (
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <FiCalendar className="w-4 h-4" />
                        <span>{new Date(post.published_at || post.created_at).toLocaleDateString()}</span>
                      </div>
                      {post.author && (
                        <div className="flex items-center gap-1">
                          <span>by {post.author}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FiFileText className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No blog posts available yet.</p>
          </div>
        )}
      </section>

      {/* Latest Shop Products Section */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="flex items-center justify-between mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Latest Products
            </h2>
            <Link 
              to="/shop" 
              className="flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors group"
            >
              View Shop
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {latestProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {latestProducts.map((product: any, index: number) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link 
                    to={`/${getCategoryPath(product)}/product/${product.slug}`}
                    className="glass-card block rounded-2xl overflow-hidden bg-white/70 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30 hover:shadow-xl transition-all duration-300 group h-full"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                        {(() => {
                          const imageUrl = resolveImageUrl(pickProductImage(product));
                          return imageUrl ? (
                        <img
                            src={imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                            onError={handleImageError}
                        />
                          ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FiPackage className="w-16 h-16 text-gray-400 dark:text-gray-600" />
                        </div>
                          );
                        })()}
                      
                      {product.is_featured && (
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/90 text-white text-xs font-bold rounded-full backdrop-blur-sm">
                            <FiStar className="w-3 h-3" />
                            Featured
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4 sm:p-5">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {product.name}
                      </h3>
                      
                      {product.short_description && (
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                          {product.short_description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-xl sm:text-2xl font-bold text-primary-600 dark:text-primary-400">
                            ${product.price}
                          </span>
                          {product.original_price && product.original_price > product.price && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 line-through">
                              ${product.original_price}
                            </span>
                          )}
                        </div>
                        
                        {product.stock_quantity !== undefined && (
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            product.stock_quantity > 0
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FiPackage className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No products available yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                quote: 'CITRICLOUD unified our tools and cut operational overhead by 40%. The dashboards are gorgeous and incredibly intuitive.',
                author: 'Alex Morgan',
                role: 'COO, NovaRetail',
              },
              {
                quote: 'We launched in weeks, not months. The CMS and e‑commerce integration saved us countless hours.',
                author: 'Priya Shah',
                role: 'Head of Digital, Helios Labs',
              },
              {
                quote: 'Security and speed were our priorities. CITRICLOUD delivered both with 99.9% uptime and stellar support.',
                author: 'Daniel Ruiz',
                role: 'CTO, BlueOrbit',
              },
            ].map((t, i) => (
              <motion.blockquote
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 sm:p-8 rounded-2xl bg-white/70 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30"
              >
                <p className="text-gray-700 dark:text-gray-200 text-base sm:text-lg leading-relaxed mb-4">“{t.quote}”</p>
                <div className="text-sm sm:text-base text-gray-900 dark:text-white font-semibold">{t.author}</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{t.role}</div>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">Works With Your Stack</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {[
            'Stripe', 'PayPal', 'Slack', 'Mailchimp', 'Shopify', 'Notion',
          ].map((name, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-card px-4 py-3 rounded-xl text-center bg-white/70 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30"
            >
              <span className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-100">{name}</span>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-6">Plus 100+ other services via secure APIs and webhooks.</p>
      </section>

      </main>
      <Footer />
    </div>
  );
}
