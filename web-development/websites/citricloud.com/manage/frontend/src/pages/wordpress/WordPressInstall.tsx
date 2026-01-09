import React from 'react';
import { Download, Zap } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const WordPressInstall: React.FC = () => {
  const [selectedVersion, setSelectedVersion] = React.useState('latest');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Install WordPress</h1>
          <p className="text-gray-600 dark:text-gray-400">
            One-click WordPress installation with optimized configuration
          </p>
        </div>

        {/* Installation Options */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Choose Installation Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-xl border-2 border-primary-600 bg-primary-50 dark:bg-primary-900/20 cursor-pointer">
              <Zap className="mb-3 text-primary-600" size={32} />
              <h3 className="text-lg font-bold mb-2">Quick Install</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Automatic installation with recommended settings
              </p>
              <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <li>✓ Latest WordPress version</li>
                <li>✓ Pre-configured security</li>
                <li>✓ Essential plugins included</li>
                <li>✓ Ready in 2 minutes</li>
              </ul>
            </div>
            <div className="p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-primary-400 cursor-pointer">
              <Download className="mb-3" size={32} />
              <h3 className="text-lg font-bold mb-2">Custom Install</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Choose specific version and configure settings
              </p>
              <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <li>✓ Version selection</li>
                <li>✓ Custom database settings</li>
                <li>✓ Advanced configuration</li>
                <li>✓ Plugin selection</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Site Configuration</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Site Title</label>
                <input type="text" placeholder="My WordPress Site" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Domain</label>
                <select className="input-field">
                  <option>example.com</option>
                  <option>blog.example.com</option>
                  <option>shop.example.com</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Installation Directory</label>
              <input type="text" placeholder="/public_html" defaultValue="/public_html" className="input-field" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Admin Username</label>
                <input type="text" placeholder="admin" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Admin Email</label>
                <input type="email" placeholder="admin@example.com" className="input-field" />
              </div>
            </div>
          </div>
        </div>

        {/* WordPress Version */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">WordPress Version</h2>
          <div className="flex flex-wrap gap-3">
            {['latest', '6.4', '6.3', '6.2'].map((version) => (
              <button
                key={version}
                onClick={() => setSelectedVersion(version)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedVersion === version
                    ? 'bg-primary-600 text-white'
                    : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {version === 'latest' ? 'Latest (6.5)' : `Version ${version}`}
              </button>
            ))}
          </div>
        </div>

        {/* Pre-install Plugins */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Pre-install Popular Plugins</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              'Yoast SEO',
              'Wordfence Security',
              'WP Super Cache',
              'Contact Form 7',
              'Akismet Anti-Spam',
              'Elementor',
            ].map((plugin) => (
              <label key={plugin} className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">{plugin}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Install Button */}
        <button className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all flex items-center justify-center space-x-2">
          <Download size={20} />
          <span>Install WordPress</span>
        </button>

        {/* Info */}
        <div className="glass-card p-4 bg-blue-50 dark:bg-blue-900/20">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Note:</strong> Installation typically takes 2-3 minutes. You'll receive an email with login credentials once complete.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WordPressInstall;
