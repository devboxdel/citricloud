import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import type React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Topbar from '../components/Topbar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiShoppingCart, FiSearch, FiStar, FiFilter, FiGrid, FiList, FiCheck, FiZap, FiPackage } from 'react-icons/fi';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useLanguage } from '../context/LanguageContext';
import { shopAPI } from '../lib/api';

// Decode HTML entities
const decodeHTMLEntities = (text: string) => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

// Get category path from product for URL generation
// Returns: 'catalog/parent-slug/child-slug' for subcategories, 'catalog/category-slug' for parent categories, 'catalog' as fallback
const getCategoryPath = (product: any): string => {
  const category = product.category;
  if (!category) return 'catalog';
  
  // If category has a parent, construct parent/child path
  if (category.parent) {
    return `catalog/${category.parent.slug}/${category.slug}`;
  }
  
  // Otherwise just use the category slug
  return `catalog/${category.slug}`;
};

// Normalize image URLs to use current origin and append cache-busting token for /uploads/
const MEDIA_BUST = String(Date.now());
const resolveImageUrl = (rawUrl?: string | null) => {
  if (!rawUrl) return null;

  // Use current origin (e.g., https://shop.citricloud.com) for same-origin image loading
  const mediaBase = import.meta.env.VITE_MEDIA_BASE_URL || window.location.origin;
  const appendBust = (full: string) => (full.includes('/uploads/') ? (full.includes('?') ? `${full}&v=${MEDIA_BUST}` : `${full}?v=${MEDIA_BUST}`) : full);

  // Trim and normalize protocol
  let url = rawUrl.trim();
  if (url.startsWith('//')) url = `https:${url}`;

  // If absolute URL
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:') parsed.protocol = 'https:';

    // If the path is /uploads, rewrite to current origin
    if (parsed.pathname.startsWith('/uploads/')) {
      const rebuilt = `${mediaBase}${parsed.pathname}${parsed.search}`;
      return appendBust(rebuilt);
    }
    return parsed.toString();
  } catch {
    // Not an absolute URL; fall through to relative handling
  }

  // Relative URL; build against current origin
  const needsLeadingSlash = url.startsWith('/') ? '' : '/';
  const full = `${mediaBase}${needsLeadingSlash}${url}`;
  return appendBust(full);
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

const Shop = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'popular'>('newest');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const { addItem, getItemCount } = useCartStore();
  const { user } = useAuthStore();
  const cartItemCount = getItemCount();

  // Fetch products from API
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['shop-products', searchQuery, selectedCategory, sortBy],
    queryFn: async () => {
      const response = await shopAPI.getProducts({
        search: searchQuery || undefined,
        category_id: selectedCategory || undefined,
        sort_by: sortBy,
        page_size: 100,
      });
      return response.data;
    },
    refetchInterval: () => (document.visibilityState === 'visible' ? 2000 : 15000),
    staleTime: 5000,
    refetchOnWindowFocus: true,
    keepPreviousData: true,
  });

  // Fetch categories from API
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['shop-categories'],
    queryFn: async () => {
      const response = await shopAPI.getCategories({ page_size: 100 });
      return response.data;
    },
    refetchInterval: () => (document.visibilityState === 'visible' ? 2000 : 15000),
    staleTime: 300000,
    refetchOnWindowFocus: true,
    keepPreviousData: true,
  });

  const products = productsData?.items || [];
  const categories = categoriesData?.items || [];

  // Debug: log products structure and images
  if (products.length > 0) {
    const rawImage = pickProductImage(products[0]);
    const resolvedImage = resolveImageUrl(rawImage);
    console.log('First product:', products[0]);
    console.log('Product keys:', Object.keys(products[0]));
    console.log('images field:', products[0].images);
    console.log('image field:', products[0].image);
    console.log('thumbnail field:', products[0].thumbnail);
    console.log('pickProductImage result:', rawImage);
    console.log('resolveImageUrl result:', resolvedImage);
    console.log('VITE_MEDIA_BASE_URL:', import.meta.env.VITE_MEDIA_BASE_URL);
  }

  const handleAddToCart = (product: any) => {
    // Demo product restriction: Only System Admin can purchase
    if (product.slug === 'demo-product' && user?.role !== 'system_admin') {
      alert('This demo product is only available for System Administrators.');
      return;
    }
    
    const primaryImage = resolveImageUrl(pickProductImage(product));
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: primaryImage || resolveImageUrl('/uploads/placeholder-product.webp') || '/uploads/placeholder-product.webp',
      category: product.categoryDisplay,
    });
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-black">
      <Topbar />
      <Navbar />

      {/* Header */}
      <section className="container mx-auto px-4 sm:px-6 pt-40 sm:pt-44 pb-6 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('shop')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mb-8">
            {t('shop_subtitle')}
          </p>

          {/* Development Warning */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-500/50 dark:border-amber-500/30"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold mt-0.5">
                ⚠
              </div>
              <div>
                <h3 className="font-bold text-amber-900 dark:text-amber-300 mb-1">Development Mode - Do Not Purchase</h3>
                <p className="text-sm text-amber-800 dark:text-amber-400">
                  {t('shop_in_development')}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Main Content with Sidebar */}
      <section className="container mx-auto px-4 sm:px-6 pb-24 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Categories */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="sticky top-24">
              <div className="glass-card bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 rounded-2xl p-6 shadow-xl">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FiFilter className="w-5 h-5" />
                  Categories
                </h2>
                
                <div className="flex flex-col gap-2">
                  {/* All Products Button */}
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setExpandedCategory(null);
                    }}
                    className={`px-4 py-3 rounded-xl font-medium transition-all text-left ${
                      !selectedCategory
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>All Products</span>
                      <span className="text-sm opacity-75">({products.length})</span>
                    </div>
                  </button>
                  
                  {/* Parent Categories */}
                  {categories.filter((cat: any) => !cat.parent_id).map((category: any) => {
                    const subcategories = categories.filter((subcat: any) => subcat.parent_id === category.id);
                    const isExpanded = expandedCategory === category.id;
                    const totalCount = category.product_count + subcategories.reduce((sum: number, subcat: any) => sum + (subcat.product_count || 0), 0);
                    
                    return (
                      <div key={category.id} className="space-y-2">
                        {/* Parent Category */}
                        <button
                          onClick={() => {
                            setSelectedCategory(category.id);
                            if (subcategories.length > 0) {
                              setExpandedCategory(isExpanded ? null : category.id);
                            }
                          }}
                          className={`w-full px-4 py-3 rounded-xl font-medium transition-all text-left ${
                            selectedCategory === category.id
                              ? 'bg-primary-600 text-white shadow-lg'
                              : 'bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span>{category.name}</span>
                              {subcategories.length > 0 && (
                                <span className="text-xs opacity-70">
                                  {isExpanded ? '▼' : '▶'}
                                </span>
                              )}
                            </div>
                            <span className="text-sm opacity-75">({totalCount})</span>
                          </div>
                        </button>
                        
                        {/* Subcategories */}
                        {isExpanded && subcategories.length > 0 && (
                          <div className="ml-4 space-y-1 pl-4 border-l-2 border-primary-300 dark:border-primary-700">
                            {subcategories.map((subcategory: any) => (
                              <button
                                key={subcategory.id}
                                onClick={() => setSelectedCategory(subcategory.id)}
                                className={`w-full px-3 py-2 rounded-lg font-medium transition-all text-left text-sm ${
                                  selectedCategory === subcategory.id
                                    ? 'bg-primary-500 text-white shadow-md'
                                    : 'bg-white/40 dark:bg-gray-800/40 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span>{subcategory.name}</span>
                                  <span className="text-xs opacity-75">({subcategory.product_count || 0})</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Products Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('products')}</h2>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t('showing')} {products.length} {products.length !== 1 ? t('products') : t('product')}
              </div>
            </div>

            {/* Search, Sort & View Toggle */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 rounded-xl glass-card bg-white/80 dark:bg-gray-900/80 border border-white/30 dark:border-gray-700/30 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="newest">Newest</option>
                <option value="popular">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>

              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-3 rounded-xl font-medium transition-all ${
                    viewMode === 'grid'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white/80 dark:bg-gray-900/80 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <FiGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-3 rounded-xl font-medium transition-all ${
                    viewMode === 'list'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white/80 dark:bg-gray-900/80 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <FiList className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Products Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
            {productsLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {products.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {products.map((product: any, index: number) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={viewMode === 'list' ? 'w-full' : ''}
              >
                <Link
                  to={`/${getCategoryPath(product)}/product/${product.slug}`}
                  className={`glass-card p-5 rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-white/30 dark:border-gray-700/30 hover:shadow-xl transition-all group block ${
                    viewMode === 'list' ? 'flex flex-row gap-6' : 'h-full flex flex-col'
                  }`}
                >
                  {/* Product Image */}
                  <div className={`relative rounded-xl overflow-hidden bg-white dark:bg-gray-800 ${viewMode === 'list' ? 'w-48 h-48 flex-shrink-0' : 'mb-4 aspect-square'}`}>
                    {pickProductImage(product) ? (
                      <img
                        src={resolveImageUrl(pickProductImage(product)) || '/placeholder-product.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                        <FiPackage className="w-16 h-16 text-gray-400 dark:text-gray-600" />
                      </div>
                    )}
                    {product.slug === 'demo-product' && (
                      <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-purple-500 text-white text-xs font-bold">
                        ADMIN ONLY
                      </div>
                    )}
                    {product.sale_price && product.sale_price < product.price && (
                      <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-bold">
                        -{Math.round(((product.price - product.sale_price) / product.price) * 100)}%
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col">
                    {/* Category Badge */}
                    <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 mb-2">
                      {product.category?.name || 'Uncategorized'}
                    </span>

                    {/* Product Name */}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {product.name}
                    </h3>
                    
                    {viewMode === 'list' && (
                      <div 
                        className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 prose prose-sm dark:prose-invert max-w-none [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:my-1"
                        dangerouslySetInnerHTML={{ __html: decodeHTMLEntities(product.short_description || product.description || '') }}
                      />
                    )}

                    {/* Stock Badge */}
                    <div className="flex items-center gap-2 mb-3">
                      {product.stock_quantity > 0 ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 font-medium">
                          In Stock ({product.stock_quantity})
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 font-medium">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mt-auto mb-4">
                      {product.sale_price && product.sale_price < product.price ? (
                        <>
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            ${product.sale_price.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                            ${product.price.toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          {product.price === 0 ? 'FREE' : `$${product.price.toFixed(2)}`}
                        </span>
                      )}
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(product);
                      }}
                      disabled={product.slug === 'demo-product' && user?.role !== 'system_admin'}
                      className={`w-full px-4 py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl ${
                        product.slug === 'demo-product' && user?.role !== 'system_admin'
                          ? 'bg-gray-400 dark:bg-gray-600 text-gray-200 cursor-not-allowed'
                          : 'bg-primary-600 hover:bg-primary-700 text-white'
                      }`}
                    >
                      <FiShoppingCart className="w-4 h-4" />
                      {product.slug === 'demo-product' && user?.role !== 'system_admin' ? 'Admin Only' : 'Add to Cart'}
                    </button>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 rounded-2xl bg-white/80 dark:bg-gray-900/80 text-center">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">{t('no_products_found')}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Try adjusting your search or filter to find what you're looking for.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
              }}
              className="px-6 py-3 rounded-xl bg-primary-600 text-white hover:bg-primary-700 font-medium transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}
          </>
        )}
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Shop;
