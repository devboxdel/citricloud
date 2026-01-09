import React from 'react';
import { Package, Palette, Star, Download } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const WordPressThemes: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = React.useState('all');

  const themes = [
    { name: 'Astra', category: 'multipurpose', downloads: '1.5M+', rating: 4.9, premium: false, active: true },
    { name: 'OceanWP', category: 'multipurpose', downloads: '800K+', rating: 4.8, premium: false, active: false },
    { name: 'Neve', category: 'business', downloads: '200K+', rating: 4.9, premium: false, active: false },
    { name: 'GeneratePress', category: 'multipurpose', downloads: '400K+', rating: 4.9, premium: true, active: false },
    { name: 'Divi', category: 'business', downloads: '1M+', rating: 4.8, premium: true, active: false },
    { name: 'Avada', category: 'multipurpose', downloads: '800K+', rating: 4.7, premium: true, active: false },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">WordPress Themes</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse and install themes for your WordPress sites
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-card p-6">
            <Palette className="text-purple-600 mb-3" size={32} />
            <p className="text-3xl font-bold mb-1">1</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Theme</p>
          </div>
          <div className="glass-card p-6">
            <Package className="text-blue-600 mb-3" size={32} />
            <p className="text-3xl font-bold mb-1">8</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Installed Themes</p>
          </div>
          <div className="glass-card p-6">
            <Download className="text-green-600 mb-3" size={32} />
            <p className="text-3xl font-bold mb-1">2</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Updates Available</p>
          </div>
          <div className="glass-card p-6">
            <Star className="text-orange-600 mb-3" size={32} />
            <p className="text-3xl font-bold mb-1">Premium</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">3 Premium Themes</p>
          </div>
        </div>

        {/* Categories */}
        <div className="glass-card p-4">
          <div className="flex flex-wrap gap-2">
            {['all', 'multipurpose', 'business', 'blog', 'ecommerce', 'portfolio'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg transition-all capitalize ${
                  selectedCategory === cat
                    ? 'bg-primary-600 text-white'
                    : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Themes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes
            .filter(t => selectedCategory === 'all' || t.category === selectedCategory)
            .map((theme, index) => (
              <div key={index} className="glass-card overflow-hidden">
                {/* Theme Preview */}
                <div className="h-48 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                  <Palette className="text-white/50" size={64} />
                </div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold mb-1">{theme.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{theme.category}</p>
                    </div>
                    {theme.active && (
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200">
                        Active
                      </span>
                    )}
                    {theme.premium && !theme.active && (
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200">
                        Premium
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{theme.downloads} downloads</span>
                    <div className="flex items-center">
                      <Star className="text-yellow-500 mr-1" size={16} fill="currentColor" />
                      <span className="text-sm font-medium">{theme.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {theme.active ? (
                      <>
                        <button className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all">
                          Customize
                        </button>
                        <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all">
                          Options
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all">
                          Activate
                        </button>
                        <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all">
                          Preview
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Upload Theme */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Upload Custom Theme</h2>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
            <Package className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="mb-4 text-gray-600 dark:text-gray-400">Drop theme ZIP file here or click to browse</p>
            <button className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all">
              Choose File
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WordPressThemes;
