import DashboardLayout from '../../components/DashboardLayout';
import { motion } from 'framer-motion';
import { FiSettings, FiToggleLeft, FiImage, FiType, FiLayout, FiMonitor, FiSave } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { siteSettingsAPI } from '../../lib/api';

export default function CMSFrontendSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'CITRICLOUD',
    siteTagline: 'Code delivered. Projects accelerated.',
    enableBlog: true,
    enableShop: true,
    enableCommunity: true,
    enableWorkspace: true,
    maintenanceMode: false,
    darkModeDefault: false,
    logoUrl: '/logo.svg',
    faviconUrl: '/favicon.ico',
    primaryColor: '#3B82F6',
    accentColor: '#8B5CF6',
    fontFamily: 'Inter',
    headerLayout: 'centered',
    footerLayout: 'full',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await siteSettingsAPI.getSettings();
      const data = response.data;
      
      setSettings({
        siteName: data.site_name || 'CITRICLOUD',
        siteTagline: 'Code delivered. Projects accelerated.',
        enableBlog: data.enable_blog ?? true,
        enableShop: data.enable_shop ?? true,
        enableCommunity: data.enable_community ?? true,
        enableWorkspace: data.enable_workspace ?? true,
        maintenanceMode: data.maintenance_mode ?? false,
        darkModeDefault: data.dark_mode_default ?? false,
        logoUrl: data.logo_url || '/logo.svg',
        faviconUrl: data.favicon_url || '/favicon.ico',
        primaryColor: data.primary_color || '#3B82F6',
        accentColor: data.accent_color || '#8B5CF6',
        fontFamily: data.font_family || 'Inter',
        headerLayout: data.header_layout || 'centered',
        footerLayout: data.footer_layout || 'full',
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await siteSettingsAPI.updateSettings({
        site_name: settings.siteName,
        enable_blog: settings.enableBlog,
        enable_shop: settings.enableShop,
        enable_community: settings.enableCommunity,
        enable_workspace: settings.enableWorkspace,
        maintenance_mode: settings.maintenanceMode,
        dark_mode_default: settings.darkModeDefault,
        logo_url: settings.logoUrl,
        favicon_url: settings.faviconUrl,
        primary_color: settings.primaryColor,
        accent_color: settings.accentColor,
        font_family: settings.fontFamily,
        header_layout: settings.headerLayout,
        footer_layout: settings.footerLayout,
      });
      
      alert('Settings saved successfully!');
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      alert(error?.response?.data?.detail || 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const SettingSection = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50 shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)]"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
          {icon}
        </div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{title}</h3>
      </div>
      {children}
    </motion.div>
  );

  const ToggleSetting = ({ label, description, value, onChange }: { label: string; description: string; value: boolean; onChange: (val: boolean) => void }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
      <div>
        <p className="font-medium text-gray-800 dark:text-gray-100">{label}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          value ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const InputSetting = ({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (val: string) => void; type?: string }) => (
    <div className="py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
      <label className="block font-medium text-gray-800 dark:text-gray-100 mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );

  const SelectSetting = ({ label, value, onChange, options }: { label: string; value: string; onChange: (val: string) => void; options: { value: string; label: string }[] }) => (
    <div className="py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
      <label className="block font-medium text-gray-800 dark:text-gray-100 mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <DashboardLayout
      title="Frontend Settings"
      breadcrumb={<div className="text-xs text-gray-500">CMS / Frontend Settings</div>}
    >
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Frontend Configuration</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Customize your website appearance and features
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="glass-button px-6 py-3 rounded-xl text-white font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSave className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <SettingSection title="General Settings" icon={<FiSettings className="w-5 h-5" />}>
          <InputSetting
            label="Site Name"
            value={settings.siteName}
            onChange={(val) => setSettings({ ...settings, siteName: val })}
          />
          <InputSetting
            label="Site Tagline"
            value={settings.siteTagline}
            onChange={(val) => setSettings({ ...settings, siteTagline: val })}
          />
          <ToggleSetting
            label="Maintenance Mode"
            description="Put the site in maintenance mode"
            value={settings.maintenanceMode}
            onChange={(val) => setSettings({ ...settings, maintenanceMode: val })}
          />
          <ToggleSetting
            label="Dark Mode by Default"
            description="Enable dark mode as default theme"
            value={settings.darkModeDefault}
            onChange={(val) => setSettings({ ...settings, darkModeDefault: val })}
          />
        </SettingSection>

        {/* Feature Toggles */}
        <SettingSection title="Feature Toggles" icon={<FiToggleLeft className="w-5 h-5" />}>
          <ToggleSetting
            label="Enable Blog"
            description="Show blog section on the website"
            value={settings.enableBlog}
            onChange={(val) => setSettings({ ...settings, enableBlog: val })}
          />
          <ToggleSetting
            label="Enable Shop"
            description="Show shop and products section"
            value={settings.enableShop}
            onChange={(val) => setSettings({ ...settings, enableShop: val })}
          />
          <ToggleSetting
            label="Enable Community"
            description="Show community features"
            value={settings.enableCommunity}
            onChange={(val) => setSettings({ ...settings, enableCommunity: val })}
          />
          <ToggleSetting
            label="Enable Workspace"
            description="Show workspace applications"
            value={settings.enableWorkspace}
            onChange={(val) => setSettings({ ...settings, enableWorkspace: val })}
          />
        </SettingSection>

        {/* Brand & Logo */}
        <SettingSection title="Brand & Logo" icon={<FiImage className="w-5 h-5" />}>
          <InputSetting
            label="Logo URL"
            value={settings.logoUrl}
            onChange={(val) => setSettings({ ...settings, logoUrl: val })}
          />
          <InputSetting
            label="Favicon URL"
            value={settings.faviconUrl}
            onChange={(val) => setSettings({ ...settings, faviconUrl: val })}
          />
          <InputSetting
            label="Primary Color"
            value={settings.primaryColor}
            onChange={(val) => setSettings({ ...settings, primaryColor: val })}
            type="color"
          />
          <InputSetting
            label="Accent Color"
            value={settings.accentColor}
            onChange={(val) => setSettings({ ...settings, accentColor: val })}
            type="color"
          />
        </SettingSection>

        {/* Typography & Layout */}
        <SettingSection title="Typography & Layout" icon={<FiType className="w-5 h-5" />}>
          <SelectSetting
            label="Font Family"
            value={settings.fontFamily}
            onChange={(val) => setSettings({ ...settings, fontFamily: val })}
            options={[
              { value: 'Inter', label: 'Inter' },
              { value: 'Roboto', label: 'Roboto' },
              { value: 'Poppins', label: 'Poppins' },
              { value: 'Open Sans', label: 'Open Sans' },
              { value: 'Lato', label: 'Lato' },
            ]}
          />
          <SelectSetting
            label="Header Layout"
            value={settings.headerLayout}
            onChange={(val) => setSettings({ ...settings, headerLayout: val })}
            options={[
              { value: 'centered', label: 'Centered' },
              { value: 'left', label: 'Left Aligned' },
              { value: 'split', label: 'Split' },
            ]}
          />
          <SelectSetting
            label="Footer Layout"
            value={settings.footerLayout}
            onChange={(val) => setSettings({ ...settings, footerLayout: val })}
            options={[
              { value: 'full', label: 'Full Width' },
              { value: 'compact', label: 'Compact' },
              { value: 'minimal', label: 'Minimal' },
            ]}
          />
        </SettingSection>
      </div>

      {/* Preview Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 glass-card p-6 rounded-2xl bg-white/80 dark:bg-gray-800/90 border border-white/30 dark:border-gray-700/50"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <FiMonitor className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Live Preview</h3>
        </div>
        <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Preview functionality coming soon...
          </p>
        </div>
      </motion.div>
        </>
      )}
    </DashboardLayout>
  );
}
