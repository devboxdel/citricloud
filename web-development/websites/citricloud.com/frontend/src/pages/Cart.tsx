import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';
import { useCartStore } from '../store/cartStore';
import { FiTrash2, FiShoppingBag, FiArrowRight, FiMinus, FiPlus } from 'react-icons/fi';

export default function CartPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const total = getTotal();
  const tax = total * 0.21; // 21% tax
  const grandTotal = total + tax;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-black">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-16">
          <div className="max-w-4xl mx-auto">
            <div className="glass-card p-12 rounded-2xl bg-white/80 dark:bg-gray-900/80 text-center">
              <FiShoppingBag className="w-20 h-20 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('cart')} {t('is_empty')}</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {t('start_shopping')}
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-all"
              >
                {t('browse_products')}
                <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-black">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Shopping Cart</h1>
            <button
              onClick={() => clearCart()}
              className="text-red-600 dark:text-red-400 hover:underline font-medium"
            >
              Clear Cart
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-white/30 dark:border-gray-700/30"
                >
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <Link
                      to={`/${item.category?.toLowerCase().replace(/\s+/g, '-') || 'products'}/${item.slug}`}
                      className="flex-shrink-0"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 rounded-xl object-cover hover:scale-105 transition-transform"
                      />
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/${item.category?.toLowerCase().replace(/\s+/g, '-') || 'products'}/${item.slug}`}
                        className="font-semibold text-lg text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {item.category}
                      </p>

                      <div className="flex items-center gap-4 mt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
                          >
                            <FiMinus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center font-semibold text-gray-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
                          >
                            <FiPlus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="ml-auto text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex flex-col items-end justify-between">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                        {item.originalPrice && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 line-through">
                            ${(item.originalPrice * item.quantity).toFixed(2)}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        ${item.price.toFixed(2)} each
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-white/30 dark:border-gray-700/30 sticky top-32"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span className="font-semibold">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Tax (21%)</span>
                    <span className="font-semibold">${tax.toFixed(2)}</span>
                  </div>
                  <div className="h-px bg-gray-200 dark:bg-gray-700"></div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span>${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <FiArrowRight className="w-5 h-5" />
                </button>

                <Link
                  to="/shop"
                  className="block text-center mt-4 text-primary-600 dark:text-primary-400 hover:underline font-medium"
                >
                  Continue Shopping
                </Link>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Secure Payment Processing</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Instant Digital Delivery</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>30-Day Money Back Guarantee</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
