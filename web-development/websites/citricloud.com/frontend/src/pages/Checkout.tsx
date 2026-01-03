import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCartStore } from '../store/cartStore';
import { erpAPI } from '../lib/api';
import { FiLock, FiCreditCard, FiUser, FiMail, FiMapPin } from 'react-icons/fi';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getTotal, clearCart, createOrder } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const { user, isAuthenticated } = useAuthStore();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = 'https://my.citricloud.com/login?redirect=' + encodeURIComponent(window.location.href);
    }
  }, [isAuthenticated]);
  const [formData, setFormData] = useState({
    firstName: user?.full_name?.split(' ')[0] || '',
    lastName: user?.full_name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    address: user?.address || '',
    city: user?.city || '',
    country: user?.country || '',
    zipCode: user?.zip_code || '',
    province: user?.province || '',
    district: user?.district || '',
    block: user?.block || '',
    phoneNumber: user?.phone_number || '',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    selectedCardId: '',
  });

  // Example Stripe cards, replace with API fetch
  const savedCards = [
    {id:1,brand:'Visa',last4:'4242',exp:'12/28',cardName:'John Doe'},
    {id:2,brand:'Mastercard',last4:'4444',exp:'09/27',cardName:'John Doe'},
  ];

  // Sync billing info with profile info
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      firstName: user?.full_name?.split(' ')[0] || '',
      lastName: user?.full_name?.split(' ').slice(1).join(' ') || '',
      email: user?.email || '',
      address: user?.address || '',
      city: user?.city || '',
      country: user?.country || '',
      zipCode: user?.zip_code || '',
      province: user?.province || '',
      district: user?.district || '',
      block: user?.block || '',
      phoneNumber: user?.phone_number || '',
    }));
  }, [user]);

  const total = getTotal();
  const tax = total * 0.21;
  const grandTotal = total + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.address) {
        throw new Error('Please fill in all required fields');
      }

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Prepare order data
      const orderData = {
        items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        })),
        shipping_address: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          zip_code: formData.zipCode
        },
        billing_address: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          zip_code: formData.zipCode
        },
        notes: "Checkout via web"
      };

      console.log('Creating order with data:', orderData);
      console.log('API base URL:', import.meta.env.VITE_API_URL || '/api/v1');
      console.log('Full URL will be:', (import.meta.env.VITE_API_URL || '/api/v1') + '/erp/orders');
      
      // Create order on backend
      const response = await erpAPI.createOrder(orderData);
      const order = response.data;
      
      console.log('Order created successfully:', order);
      
      // Clear cart
      clearCart();

      // Redirect to thank you page with order ID
      navigate(`/thank-you?order=${order.order_number}`);
    } catch (error: any) {
      console.error("Failed to create order:", error);
      setError(
        error.response?.data?.detail || 
        error.message || 
        'Failed to process your order. Please try again.'
      );
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Checkout</h1>

          {/* Development Warning - Hidden for System Admin */}
          {user?.role !== 'system_admin' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-6 rounded-xl bg-red-50 dark:bg-red-900/20 border-2 border-red-500/50 dark:border-red-500/30"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center text-lg font-bold">
                  ⚠
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-900 dark:text-red-300 mb-2">⚠️ DEVELOPMENT MODE - DO NOT PURCHASE ⚠️</h3>
                  <p className="text-red-800 dark:text-red-400 mb-2">
                    This checkout system is currently in development and testing phase. <strong>DO NOT</strong> enter real payment information or attempt to complete a purchase.
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    All payment processing is disabled. This page is for demonstration and testing purposes only.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-6 rounded-xl bg-red-50 dark:bg-red-900/20 border-2 border-red-500/50 dark:border-red-500/30"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center text-lg font-bold">
                  ✕
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-900 dark:text-red-300 mb-2">Order Failed</h3>
                  <p className="text-red-800 dark:text-red-400">{error}</p>
                </div>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Billing Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6 rounded-2xl bg-white/90 dark:bg-gray-950/90 border border-white/40 dark:border-primary-700/60 shadow-xl"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <FiUser className="w-6 h-6" />
                  Billing Information
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl glass-card bg-white/90 dark:bg-gray-800/80 border border-white/40 dark:border-gray-600/60 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/80"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl glass-card bg-white/90 dark:bg-gray-800/80 border border-white/40 dark:border-gray-600/60 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/80"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-700 dark:text-white" />
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 rounded-xl glass-card bg-white/90 dark:bg-gray-800/80 border border-white/40 dark:border-gray-600/60 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/80"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Address *
                    </label>
                    <div className="relative">
                      <FiMapPin className="absolute left-4 top-4 w-5 h-5 text-gray-700 dark:text-white" />
                      <input
                        type="text"
                        name="address"
                        required
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 rounded-xl glass-card bg-white/90 dark:bg-gray-800/80 border border-white/40 dark:border-gray-600/60 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/80"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl glass-card bg-white/90 dark:bg-gray-800/80 border border-white/40 dark:border-gray-600/60 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/80"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Country *
                    </label>
                    <select
                      name="country"
                      required
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl glass-card bg-white/90 dark:bg-gray-800/80 border border-white/40 dark:border-gray-600/60 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/80"
                    >
                      <option value="">Select a country</option>
                      <option value="Netherlands">Netherlands</option>
                      <option value="Belgium">Belgium</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ZIP / Postal Code *
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      required
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl glass-card bg-white/90 dark:bg-gray-800/80 border border-white/40 dark:border-gray-600/60 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/80"
                    />
                  </div>

                  {/* Province/State */}
                  {formData.province && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Province / State
                      </label>
                      <input
                        type="text"
                        name="province"
                        value={formData.province}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl glass-card bg-white/90 dark:bg-gray-800/80 border border-white/40 dark:border-gray-600/60 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/80"
                      />
                    </div>
                  )}

                  {/* District */}
                  {formData.district && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        District
                      </label>
                      <input
                        type="text"
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl glass-card bg-white/90 dark:bg-gray-800/80 border border-white/40 dark:border-gray-600/60 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/80"
                      />
                    </div>
                  )}

                  {/* Block/Neighborhood */}
                  {formData.block && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Block / Neighborhood
                      </label>
                      <input
                        type="text"
                        name="block"
                        value={formData.block}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl glass-card bg-white/90 dark:bg-gray-800/80 border border-white/40 dark:border-gray-600/60 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/80"
                      />
                    </div>
                  )}

                  {/* Phone Number */}
                  {formData.phoneNumber && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl glass-card bg-white/90 dark:bg-gray-800/80 border border-white/40 dark:border-gray-600/60 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/80"
                      />
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Payment Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6 rounded-2xl bg-white/90 dark:bg-gray-950/90 border border-white/40 dark:border-primary-700/60 shadow-xl"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <FiCreditCard className="w-6 h-6" />
                  Payment Information
                </h2>

                {/* Payment Provider Logos */}
                <div className="mb-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">We accept:</p>
                  <div className="flex items-center gap-4 flex-wrap">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" 
                      alt="Stripe" 
                      className="h-6 dark:invert opacity-70"
                    />
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Paypal_2014_logo.png" 
                      alt="PayPal" 
                      className="h-6 opacity-70"
                    />
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" 
                      alt="Visa" 
                      className="h-6 opacity-70"
                    />
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" 
                      alt="Mastercard" 
                      className="h-8 opacity-70"
                    />
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" 
                      alt="American Express" 
                      className="h-6 opacity-70"
                    />
                  </div>
                </div>

                {/* Saved Stripe Cards */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Saved Card</label>
                  <select
                    name="selectedCardId"
                    value={formData.selectedCardId}
                    onChange={e => setFormData({ ...formData, selectedCardId: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl glass-card bg-white/90 dark:bg-gray-800/80 border border-white/40 dark:border-gray-600/60 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/80"
                  >
                    <option value="">-- Enter new card --</option>
                    {savedCards.map(card => (
                      <option key={card.id} value={card.id}>{card.brand} **** {card.last4} (Exp: {card.exp})</option>
                    ))}
                  </select>
                </div>

                {/* If no saved card selected, show manual entry */}
                {formData.selectedCardId === '' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Card Number *</label>
                      <input type="text" name="cardNumber" required placeholder="1234 5678 9012 3456" maxLength={19} value={formData.cardNumber} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl glass-card bg-white/90 dark:bg-gray-800/80 border border-white/40 dark:border-gray-600/60 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/80" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cardholder Name *</label>
                      <input type="text" name="cardName" required value={formData.cardName} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl glass-card bg-white/90 dark:bg-gray-800/80 border border-white/40 dark:border-gray-600/60 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/80" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Expiry Date *</label>
                        <input type="text" name="expiryDate" required placeholder="MM/YY" maxLength={5} value={formData.expiryDate} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl glass-card bg-white/90 dark:bg-gray-800/80 border border-white/40 dark:border-gray-600/60 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/80" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CVV *</label>
                        <input type="text" name="cvv" required placeholder="123" maxLength={4} value={formData.cvv} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl glass-card bg-white/90 dark:bg-gray-800/80 border border-white/40 dark:border-gray-600/60 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/80" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Notice */}
                <div className="mt-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <FiLock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="text-sm text-blue-900 dark:text-blue-100">
                      <p className="font-semibold mb-1">Your payment is secure</p>
                      <p className="text-blue-700 dark:text-blue-300">All transactions are encrypted and securely processed. We never store your card details.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6 rounded-2xl bg-white/90 dark:bg-gray-950/90 border border-white/40 dark:border-primary-700/60 shadow-xl sticky top-32"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Order Summary</h2>

                {/* Order Items */}
                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Subtotal</span>
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
                  type="submit"
                  disabled={isProcessing}
                  className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiLock className="w-5 h-5" />
                      Complete Purchase
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                  By completing this purchase, you agree to our Terms of Service and Privacy Policy
                </p>
              </motion.div>
            </div>
          </form>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
