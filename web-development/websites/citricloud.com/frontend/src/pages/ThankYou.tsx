import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCartStore } from '../store/cartStore';
import { FiCheckCircle, FiDownload, FiFileText, FiPackage, FiArrowRight } from 'react-icons/fi';

export default function ThankYouPage() {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order');
  const { orders } = useCartStore();
  
  const order = orders.find((o) => o.orderNumber === orderNumber);

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-black">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 pt-40 sm:pt-44 pb-16">
          <div className="max-w-4xl mx-auto">
            <div className="glass-card p-12 rounded-2xl bg-white/80 dark:bg-gray-900/80 text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Order Not Found</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                We couldn't find the order you're looking for.
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-all"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const orderDate = new Date(order.date);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-black">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 pt-40 sm:pt-44 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Success Message */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/20 mb-6"
            >
              <FiCheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </motion.div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Thank You for Your Purchase!
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Your order has been successfully processed and is ready for download.
            </p>
          </div>

          {/* Order Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-8 rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-white/30 dark:border-gray-700/30 mb-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Order Number</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{order.orderNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Order Date</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {orderDate.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-4 mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FiPackage className="w-5 h-5" />
                Order Items
              </h2>
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {item.category} • Qty: {item.quantity}
                    </p>
                    <button className="inline-flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium">
                      <FiDownload className="w-4 h-4" />
                      Download Now
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Total */}
            <div className="space-y-2 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                <span>Total Paid</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </motion.div>

          {/* Invoice & Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid sm:grid-cols-2 gap-4 mb-8"
          >
            {/* Download Invoice */}
            <button className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-white/30 dark:border-gray-700/30 hover:shadow-xl transition-all text-left group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FiFileText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Download Invoice
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Invoice #{order.invoice?.invoiceNumber}
                  </p>
                  <span className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                    Download PDF →
                  </span>
                </div>
              </div>
            </button>

            {/* View Orders */}
            <Link
              to="/profile?tab=orders"
              className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-white/30 dark:border-gray-700/30 hover:shadow-xl transition-all group block"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FiPackage className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    View All Orders
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Access your purchase history
                  </p>
                  <span className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                    Go to Profile →
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-8 rounded-2xl bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border border-primary-200 dark:border-primary-800/30"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">What's Next?</h2>
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  1
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  Check your email for order confirmation and download links
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  2
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  Download your products using the links above or from your profile
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  3
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  Access documentation and support resources in your account
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="flex-1 min-w-[200px] px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-all text-center flex items-center justify-center gap-2"
              >
                Continue Shopping
                <FiArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/help-center"
                className="flex-1 min-w-[200px] px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold border border-gray-300 dark:border-gray-600 transition-all text-center"
              >
                Get Support
              </Link>
            </div>
          </motion.div>

          {/* Thank You Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-12 p-6 rounded-2xl bg-white/60 dark:bg-gray-900/60"
          >
            <p className="text-gray-600 dark:text-gray-400">
              Thank you for choosing CITRICLOUD. We appreciate your business and look forward to serving you again!
            </p>
          </motion.div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
