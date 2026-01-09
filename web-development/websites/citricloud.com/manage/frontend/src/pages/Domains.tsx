import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Globe, Plus, Search, ExternalLink, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/DashboardLayout';
import { hostingAPI } from '../lib/api';

const Domains: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['domains'],
    queryFn: () => hostingAPI.getDomains(),
  });

  const searchMutation = useMutation({
    mutationFn: hostingAPI.searchDomain,
    onSuccess: (data) => {
      setSearchResult(data);
    },
    onError: () => {
      toast.error('Failed to search domain');
    },
  });

  const registerMutation = useMutation({
    mutationFn: hostingAPI.registerDomain,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains'] });
      toast.success('Domain registration initiated!');
      setShowRegisterModal(false);
      setSearchResult(null);
    },
    onError: () => {
      toast.error('Failed to register domain');
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery) {
      searchMutation.mutate(searchQuery);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Domains</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Register and manage your domain names
          </p>
        </div>

        {/* Domain Search */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Search & Register Domain</h2>
          <form onSubmit={handleSearch} className="flex space-x-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 input-field"
              placeholder="Search for a domain (e.g., mycompany.com)"
            />
            <button
              type="submit"
              disabled={searchMutation.isPending}
              className="px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white transition-all disabled:opacity-50 flex items-center space-x-2"
            >
              <Search size={20} />
              <span>{searchMutation.isPending ? 'Searching...' : 'Search'}</span>
            </button>
          </form>

          {/* Search Results */}
          {searchResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold">{searchResult.domain}</p>
                  <p className={`text-sm ${searchResult.available ? 'text-green-600' : 'text-red-600'}`}>
                    {searchResult.available ? 'Available' : 'Not Available'}
                  </p>
                </div>
                {searchResult.available && (
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">${searchResult.price}/year</p>
                    <button
                      onClick={() => setShowRegisterModal(true)}
                      className="mt-2 btn-primary text-sm"
                    >
                      Register
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* My Domains */}
        <div>
          <h2 className="text-2xl font-bold mb-4">My Domains</h2>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data?.items?.map((domain: any, index: number) => (
                <motion.div
                  key={domain.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 rounded-xl bg-purple-600 text-white">
                        <Globe size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{domain.name}</h3>
                        <p className="text-sm text-gray-500">Registered</p>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
                      Active
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Expires:</span>
                      <span className="font-medium">
                        {new Date(domain.expires_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Auto-Renew:</span>
                      <span className={domain.auto_renew ? 'text-green-600' : 'text-red-600'}>
                        {domain.auto_renew ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Registrar:</span>
                      <span className="font-medium">CITRICLOUD</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <a
                      href={`/dns?domain=${domain.name}`}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all"
                    >
                      <span className="text-sm">Manage DNS</span>
                    </a>
                    <button className="flex items-center justify-center px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all">
                      <RefreshCw size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Register Modal */}
        {showRegisterModal && searchResult && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-6 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold mb-6">Register Domain</h2>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <p className="text-lg font-bold">{searchResult.domain}</p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">
                    ${searchResult.price}/year
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Registration Period</label>
                  <select className="input-field">
                    <option value="1">1 Year - ${searchResult.price}</option>
                    <option value="2">2 Years - ${searchResult.price * 2}</option>
                    <option value="3">3 Years - ${searchResult.price * 3}</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="auto-renew" className="rounded" />
                  <label htmlFor="auto-renew" className="text-sm">
                    Enable auto-renewal
                  </label>
                </div>
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowRegisterModal(false)}
                    className="flex-1 px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() =>
                      registerMutation.mutate({
                        domain: searchResult.domain,
                        years: 1,
                        auto_renew: true,
                      })
                    }
                    disabled={registerMutation.isPending}
                    className="flex-1 btn-primary disabled:opacity-50"
                  >
                    {registerMutation.isPending ? 'Processing...' : 'Register'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Domains;
