import React from 'react';
import { ArrowRightLeft, CheckCircle, AlertCircle } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const DomainTransfer: React.FC = () => {
  const [authCode, setAuthCode] = React.useState('');
  const [domainName, setDomainName] = React.useState('');

  const steps = [
    { title: 'Unlock Domain', description: 'Unlock your domain at current registrar', completed: false },
    { title: 'Get Auth Code', description: 'Obtain EPP/Auth code from current registrar', completed: false },
    { title: 'Initiate Transfer', description: 'Submit transfer request with auth code', completed: false },
    { title: 'Confirm Transfer', description: 'Approve transfer via email confirmation', completed: false },
    { title: 'Complete Transfer', description: 'Wait 5-7 days for completion', completed: false },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Transfer Domain</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Move your domain to CitriCloud for better management
          </p>
        </div>

        {/* Transfer Steps */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-6">Transfer Process</h2>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step.completed ? 'bg-green-100 dark:bg-green-900/20 text-green-600' : 'bg-gray-100 dark:bg-gray-900 text-gray-400'
                }`}>
                  {step.completed ? <CheckCircle size={20} /> : <span>{index + 1}</span>}
                </div>
                <div className="flex-1">
                  <p className="font-medium mb-1">{step.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transfer Form */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Initiate Transfer</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Domain Name</label>
              <input
                type="text"
                placeholder="example.com"
                value={domainName}
                onChange={(e) => setDomainName(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Authorization Code (EPP Code)</label>
              <input
                type="text"
                placeholder="Enter auth code from current registrar"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                className="input-field"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                You can find this code in your current registrar's control panel
              </p>
            </div>
            <div className="flex items-start space-x-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <AlertCircle className="text-blue-600 mt-0.5" size={20} />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Before transferring:</p>
                <ul className="list-disc list-inside text-blue-800 dark:text-blue-200 space-y-1">
                  <li>Domain must be unlocked at current registrar</li>
                  <li>Domain must be at least 60 days old</li>
                  <li>Domain must not have been transferred in the last 60 days</li>
                  <li>WHOIS contact information must be up to date</li>
                </ul>
              </div>
            </div>
            <button className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all flex items-center justify-center space-x-2">
              <ArrowRightLeft size={20} />
              <span>Start Transfer ($9.99 + 1 Year Extension)</span>
            </button>
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6">
            <span className="text-3xl mb-3 block">🔒</span>
            <h3 className="font-bold mb-2">Enhanced Security</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Advanced protection and 2FA support</p>
          </div>
          <div className="glass-card p-6">
            <span className="text-3xl mb-3 block">⚡</span>
            <h3 className="font-bold mb-2">Better Management</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Intuitive control panel and DNS management</p>
          </div>
          <div className="glass-card p-6">
            <span className="text-3xl mb-3 block">💰</span>
            <h3 className="font-bold mb-2">Competitive Pricing</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Lower renewal rates and bulk discounts</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DomainTransfer;
