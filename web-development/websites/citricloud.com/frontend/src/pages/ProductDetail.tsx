import { motion } from 'framer-motion';
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../components/Navbar';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { FiArrowLeft, FiShoppingCart, FiCheck, FiStar, FiHeart, FiShare2, FiPackage, FiTruck, FiShield, FiMinus, FiPlus } from 'react-icons/fi';
import { shopAPI } from '../lib/api';

// Decode HTML entities
const decodeHTMLEntities = (text: string) => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

// Normalize media URLs to use current origin and add cache-busting for /uploads/
const MEDIA_BUST = String(Date.now());
const resolveImageUrl = (rawUrl?: string | null) => {
  if (!rawUrl) return null;

  const mediaBase = import.meta.env.VITE_MEDIA_BASE_URL || window.location.origin;
  const appendBust = (full: string) => (full.includes('/uploads/') ? (full.includes('?') ? `${full}&v=${MEDIA_BUST}` : `${full}?v=${MEDIA_BUST}`) : full);

  let url = rawUrl.trim();
  if (url.startsWith('//')) url = `https:${url}`;

  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:') parsed.protocol = 'https:';

    if (parsed.pathname.startsWith('/uploads/')) {
      const rebuilt = `${mediaBase}${parsed.pathname}${parsed.search}`;
      return appendBust(rebuilt);
    }
    return parsed.toString();
  } catch {
    // relative URL handling below
  }

  const needsLeadingSlash = url.startsWith('/') ? '' : '/';
  const full = `${mediaBase}${needsLeadingSlash}${url}`;
  return appendBust(full);
};

export default function ProductDetailPage() {
  const { slug, category, subcategory } = useParams<{ slug: string; category: string; subcategory?: string }>();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { user } = useAuthStore();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  // Prevent infinite onError loops by swapping to placeholder only once
  const handleImageError: React.EventHandler<React.SyntheticEvent<HTMLImageElement, Event>> = (e) => {
    const img = e.currentTarget;
    if (img.dataset.fallbacked === 'true') {
      return; // already replaced, avoid loops/spam
    }
    img.dataset.fallbacked = 'true';
    img.src = resolveImageUrl('/uploads/placeholder-product.webp') || '/uploads/placeholder-product.webp';
  };

  // Fetch product from API
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      if (!slug) throw new Error('No product slug provided');
      const response = await shopAPI.getProductBySlug(slug);
      return response.data;
    },
    enabled: !!slug,
    refetchInterval: slug
      ? () => (document.visibilityState === 'visible' ? 2000 : 15000)
      : false,
    staleTime: 5000,
    refetchOnWindowFocus: true,
    keepPreviousData: true,
  });

  const handleAddToCart = () => {
    // Demo product restriction: Only System Admin can purchase
    if (product && product.slug === 'demo-product' && user?.role !== 'system_admin') {
      alert('This demo product is only available for System Administrators.');
      return;
    }
    
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addItem({
          id: product.id,
          slug: product.slug,
          name: product.name,
          price: product.sale_price || product.price,
          originalPrice: product.sale_price ? product.price : undefined,
          image: resolveImageUrl(product.images?.[0]) || '/placeholder-product.jpg',
          category: product.category?.name || 'General',
        });
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description || '',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-black">
        <Topbar />
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 pt-40 sm:pt-44 pb-16">
          <div className="max-w-4xl mx-auto">
            <div className="glass-card p-12 rounded-2xl bg-white/80 dark:bg-gray-900/80 text-center">
              <h2 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-4">Product Not Found</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">The product you're looking for doesn't exist.</p>
              <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-all">
                <FiArrowLeft className="w-4 h-4" />
                Back to Shop
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const productImages = product.images && product.images.length > 0 
    ? product.images.map((img: string) => resolveImageUrl(img) || '/placeholder-product.jpg') 
    : ['/placeholder-product.jpg'];

  const discount = product.sale_price 
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-black">
      <Topbar />
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 pt-40 sm:pt-44 pb-16 max-w-7xl">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back
          </button>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="glass-card rounded-2xl bg-white dark:bg-gray-900 overflow-hidden aspect-[16/10] sm:aspect-[4/3] lg:aspect-square">
              <img
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            </div>

            {/* Thumbnail Images */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {productImages.map((img: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`glass-card p-2 rounded-xl overflow-hidden aspect-square transition-all ${
                      selectedImage === index
                        ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/30'
                        : 'bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Category Badge */}
            {product.category && (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 text-sm rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                  {product.category.name}
                </span>
                {product.is_featured && (
                  <span className="px-3 py-1 text-sm rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 flex items-center gap-1">
                    <FiStar className="w-3 h-3" />
                    Featured
                  </span>
                )}
              </div>
            )}

            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {product.name}
              </h1>
              {product.short_description && (
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {product.short_description}
                </p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                ${product.sale_price || product.price}
              </span>
              {product.sale_price && (
                <>
                  <span className="text-2xl text-gray-500 dark:text-gray-400 line-through">
                    ${product.price}
                  </span>
                  <span className="px-3 py-1 text-sm font-semibold rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {(product.stock_quantity || 0) > 10 ? (
                <span className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <FiCheck className="w-5 h-5" />
                  In Stock ({product.stock_quantity} available)
                </span>
              ) : (product.stock_quantity || 0) > 0 ? (
                <span className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                  <FiPackage className="w-5 h-5" />
                  Low Stock ({product.stock_quantity} left)
                </span>
              ) : (
                <span className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <FiPackage className="w-5 h-5" />
                  Out of Stock
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="glass-card p-6 rounded-xl bg-white/60 dark:bg-gray-800/60">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                <div 
                  className="text-gray-600 dark:text-gray-300 leading-relaxed prose prose-sm dark:prose-invert max-w-none [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-2 [&_li]:my-1 [&_li]:ml-2"
                  dangerouslySetInnerHTML={{ __html: decodeHTMLEntities(product.description) }}
                />
              </div>
            )}

            {/* Quantity & Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-gray-700 dark:text-gray-300 font-medium">Quantity:</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    <FiMinus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-semibold text-gray-900 dark:text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    disabled={(product.stock_quantity || 0) <= quantity}
                  >
                    <FiPlus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={(product.stock_quantity || 0) === 0}
                  className="flex-1 py-3 px-6 rounded-xl font-semibold text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <FiShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`p-3 rounded-xl transition-colors ${
                    isFavorite
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <FiHeart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-3 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  <FiShare2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Features/Benefits */}
            <div className="space-y-3">
              {/* Only show Fast Delivery for non-Developments category and its subcategories */}
              {product?.category?.slug !== 'developments' && product?.category?.parent?.slug !== 'developments' && (
                <div className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                  <FiTruck className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Fast Delivery</p>
                    <p className="text-sm text-gray-500">Ships within 24 hours</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                <FiShield className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Secure Payment</p>
                  <p className="text-sm text-gray-500">100% secure transactions</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
