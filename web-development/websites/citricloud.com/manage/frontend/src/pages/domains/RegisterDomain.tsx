import React, { useState } from 'react';
import { Search, CheckCircle, XCircle } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const RegisterDomain: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const popularExtensions = [
    { ext: '.com', price: '$12.99/yr', popular: true },
    { ext: '.net', price: '$14.99/yr', popular: true },
    { ext: '.org', price: '$13.99/yr', popular: false },
    { ext: '.io', price: '$39.99/yr', popular: true },
    { ext: '.co', price: '$29.99/yr', popular: false },
    { ext: '.dev', price: '$14.99/yr', popular: false },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    setTimeout(() => setSearching(false), 1500);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Register Domain</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Search and register your perfect domain name
          </p>
        </div>

        {/* Search */}
        <div className="glass-card p-8">
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for your domain (e.g., mycompany.com)"
                className="w-full text-lg px-6 py-4 rounded-xl bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
              <button
                type="submit"
                disabled={searching}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all disabled:opacity-50"
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>
        </div>

        {/* Popular Extensions */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Popular Extensions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularExtensions.map((item) => (
              <div key={item.ext} className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-500 transition-all cursor-pointer">
                <p className="text-lg font-bold mb-1">{item.ext}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.price}</p>
                {item.popular && (
                  <span className="inline-block mt-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-xs rounded">
                    Popular
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold mb-4">Search Results</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="text-green-600" size={24} />
                  <div>
                    <p className="font-bold">{searchQuery || 'example.com'}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Available</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary-600">$12.99/yr</p>
                  <button className="mt-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm transition-all">
                    Add to Cart
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl opacity-60">
                <div className="flex items-center space-x-3">
                  <XCircle className="text-red-600" size={24} />
                  <div>
                    <p className="font-bold">{searchQuery ? searchQuery.replace(/\.[^.]+$/, '.net') : 'example.net'}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Taken</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Why Choose Us */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6">
            <p className="text-3xl mb-2">🔒</p>
            <h3 className="font-bold mb-2">Free Privacy Protection</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Keep your personal information private</p>
          </div>
          <div className="glass-card p-6">
            <p className="text-3xl mb-2">⚡</p>
            <h3 className="font-bold mb-2">Instant Activation</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Your domain is ready in seconds</p>
          </div>
          <div className="glass-card p-6">
            <p className="text-3xl mb-2">🎯</p>
            <h3 className="font-bold mb-2">Easy Management</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Simple DNS and domain settings</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RegisterDomain;
