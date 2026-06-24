'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings,
  Save,
  RefreshCw,
  Globe,
  Mail,
  Zap,
  Shield,
  Palette,
  Database,
  Bell,
  Users,
  MessageCircle,
  BarChart3,
  Eye,
  Lock,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Copy,
  Key
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../components/AdminLayout';

interface SettingsData {
  general: {
    siteName: string;
    siteDescription: string;
    maintenanceMode: boolean;
    allowRegistration: boolean;
    maxSurveyTime: number;
  };
  ai: {
    openaiApiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
    systemPrompt: string;
    safetyFilters: boolean;
  };
  analytics: {
    googleAnalyticsId: string;
    hotjarId: string;
    enableTracking: boolean;
    anonymizeData: boolean;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    enableRateLimiting: boolean;
    corsOrigins: string;
  };
  ui: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    enableDarkMode: boolean;
    customCss: string;
  };
}

// Mock settings data
const mockSettings: SettingsData = {
  general: {
    siteName: 'Love Lens',
    siteDescription: 'Discover your relationship insights with our AI-powered assessment platform',
    maintenanceMode: false,
    allowRegistration: true,
    maxSurveyTime: 30
  },
  ai: {
    openaiApiKey: 'sk-...',
    model: 'gpt-4',
    maxTokens: 2000,
    temperature: 0.7,
    systemPrompt: 'You are a helpful relationship counseling assistant...',
    safetyFilters: true
  },
  analytics: {
    googleAnalyticsId: 'GA-XXXXXXXXX',
    hotjarId: '12345',
    enableTracking: true,
    anonymizeData: true
  },
  email: {
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: 'admin@lovelens.app',
    smtpPassword: '••••••••',
    fromEmail: 'noreply@lovelens.app',
    fromName: 'Love Lens Team'
  },
  security: {
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    enableRateLimiting: true,
    corsOrigins: 'https://lovelens.app'
  },
  ui: {
    primaryColor: '#FF6B6B',
    secondaryColor: '#E63946',
    accentColor: '#FDCB6E',
    enableDarkMode: false,
    customCss: ''
  }
};

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<SettingsData>(mockSettings);
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    // Check authentication
    const isAdminLoggedIn = sessionStorage.getItem('admin_logged_in');
    if (isAdminLoggedIn !== 'true') {
      router.push('/admin');
      return;
    }
    
    setTimeout(() => setIsLoading(false), 800);
  }, [router]);

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'ai', name: 'AI Configuration', icon: Zap },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'ui', name: 'UI/UX', icon: Palette }
  ];

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSaveMessage('Settings saved successfully!');
    setIsSaving(false);
    
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleInputChange = (section: keyof SettingsData, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <RefreshCw className="w-8 h-8 text-pink-500" />
          </motion.div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
              <Settings className="w-8 h-8 text-pink-500" />
              <span>System Settings</span>
            </h1>
            <p className="text-gray-600 mt-1">Configure platform settings, AI parameters, and system preferences</p>
          </div>
          <div className="flex items-center space-x-3">
            {saveMessage && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-2 text-green-600"
              >
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{saveMessage}</span>
              </motion.div>
            )}
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
            >
              {isSaving ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <RefreshCw className="w-4 h-4" />
                </motion.div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-white/50 shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-pink-500 text-pink-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">General Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site Name
                    </label>
                    <input
                      type="text"
                      value={settings.general.siteName}
                      onChange={(e) => handleInputChange('general', 'siteName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Survey Time (minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.general.maxSurveyTime}
                      onChange={(e) => handleInputChange('general', 'maxSurveyTime', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Description
                  </label>
                  <textarea
                    value={settings.general.siteDescription}
                    onChange={(e) => handleInputChange('general', 'siteDescription', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="maintenanceMode"
                      checked={settings.general.maintenanceMode}
                      onChange={(e) => handleInputChange('general', 'maintenanceMode', e.target.checked)}
                      className="w-4 h-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                    />
                    <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900">
                      Enable Maintenance Mode
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="allowRegistration"
                      checked={settings.general.allowRegistration}
                      onChange={(e) => handleInputChange('general', 'allowRegistration', e.target.checked)}
                      className="w-4 h-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                    />
                    <label htmlFor="allowRegistration" className="ml-2 block text-sm text-gray-900">
                      Allow New User Registration
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {/* AI Configuration */}
            {activeTab === 'ai' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      OpenAI API Key
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={settings.ai.openaiApiKey}
                        onChange={(e) => handleInputChange('ai', 'openaiApiKey', e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => copyToClipboard(settings.ai.openaiApiKey)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      AI Model
                    </label>
                    <select
                      value={settings.ai.model}
                      onChange={(e) => handleInputChange('ai', 'model', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="gpt-4">GPT-4</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      <option value="claude-3">Claude 3</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Tokens
                    </label>
                    <input
                      type="number"
                      value={settings.ai.maxTokens}
                      onChange={(e) => handleInputChange('ai', 'maxTokens', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Temperature (0-1)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={settings.ai.temperature}
                      onChange={(e) => handleInputChange('ai', 'temperature', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    System Prompt
                  </label>
                  <textarea
                    value={settings.ai.systemPrompt}
                    onChange={(e) => handleInputChange('ai', 'systemPrompt', e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Enter the system prompt for the AI chatbot..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="safetyFilters"
                    checked={settings.ai.safetyFilters}
                    onChange={(e) => handleInputChange('ai', 'safetyFilters', e.target.checked)}
                    className="w-4 h-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                  />
                  <label htmlFor="safetyFilters" className="ml-2 block text-sm text-gray-900">
                    Enable Safety Filters
                  </label>
                </div>
              </motion.div>
            )}

            {/* Analytics Settings */}
            {activeTab === 'analytics' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Google Analytics ID
                    </label>
                    <input
                      type="text"
                      value={settings.analytics.googleAnalyticsId}
                      onChange={(e) => handleInputChange('analytics', 'googleAnalyticsId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="GA-XXXXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hotjar Site ID
                    </label>
                    <input
                      type="text"
                      value={settings.analytics.hotjarId}
                      onChange={(e) => handleInputChange('analytics', 'hotjarId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="12345"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableTracking"
                      checked={settings.analytics.enableTracking}
                      onChange={(e) => handleInputChange('analytics', 'enableTracking', e.target.checked)}
                      className="w-4 h-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enableTracking" className="ml-2 block text-sm text-gray-900">
                      Enable User Tracking
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="anonymizeData"
                      checked={settings.analytics.anonymizeData}
                      onChange={(e) => handleInputChange('analytics', 'anonymizeData', e.target.checked)}
                      className="w-4 h-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                    />
                    <label htmlFor="anonymizeData" className="ml-2 block text-sm text-gray-900">
                      Anonymize User Data
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Email Settings */}
            {activeTab === 'email' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      value={settings.email.smtpHost}
                      onChange={(e) => handleInputChange('email', 'smtpHost', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP Port
                    </label>
                    <input
                      type="number"
                      value={settings.email.smtpPort}
                      onChange={(e) => handleInputChange('email', 'smtpPort', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP Username
                    </label>
                    <input
                      type="email"
                      value={settings.email.smtpUser}
                      onChange={(e) => handleInputChange('email', 'smtpUser', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP Password
                    </label>
                    <input
                      type="password"
                      value={settings.email.smtpPassword}
                      onChange={(e) => handleInputChange('email', 'smtpPassword', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From Email
                    </label>
                    <input
                      type="email"
                      value={settings.email.fromEmail}
                      onChange={(e) => handleInputChange('email', 'fromEmail', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From Name
                    </label>
                    <input
                      type="text"
                      value={settings.email.fromName}
                      onChange={(e) => handleInputChange('email', 'fromName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Timeout (hours)
                    </label>
                    <input
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => handleInputChange('security', 'sessionTimeout', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Login Attempts
                    </label>
                    <input
                      type="number"
                      value={settings.security.maxLoginAttempts}
                      onChange={(e) => handleInputChange('security', 'maxLoginAttempts', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CORS Origins
                  </label>
                  <input
                    type="text"
                    value={settings.security.corsOrigins}
                    onChange={(e) => handleInputChange('security', 'corsOrigins', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="https://example.com,https://app.example.com"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableRateLimiting"
                    checked={settings.security.enableRateLimiting}
                    onChange={(e) => handleInputChange('security', 'enableRateLimiting', e.target.checked)}
                    className="w-4 h-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                  />
                  <label htmlFor="enableRateLimiting" className="ml-2 block text-sm text-gray-900">
                    Enable Rate Limiting
                  </label>
                </div>
              </motion.div>
            )}

            {/* UI/UX Settings */}
            {activeTab === 'ui' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">UI/UX Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Color
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={settings.ui.primaryColor}
                        onChange={(e) => handleInputChange('ui', 'primaryColor', e.target.value)}
                        className="w-12 h-10 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        value={settings.ui.primaryColor}
                        onChange={(e) => handleInputChange('ui', 'primaryColor', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secondary Color
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={settings.ui.secondaryColor}
                        onChange={(e) => handleInputChange('ui', 'secondaryColor', e.target.value)}
                        className="w-12 h-10 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        value={settings.ui.secondaryColor}
                        onChange={(e) => handleInputChange('ui', 'secondaryColor', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Accent Color
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={settings.ui.accentColor}
                        onChange={(e) => handleInputChange('ui', 'accentColor', e.target.value)}
                        className="w-12 h-10 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        value={settings.ui.accentColor}
                        onChange={(e) => handleInputChange('ui', 'accentColor', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom CSS
                  </label>
                  <textarea
                    value={settings.ui.customCss}
                    onChange={(e) => handleInputChange('ui', 'customCss', e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent font-mono text-sm"
                    placeholder="/* Custom CSS styles */&#10;.custom-class {&#10;  /* Your styles here */&#10;}"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableDarkMode"
                    checked={settings.ui.enableDarkMode}
                    onChange={(e) => handleInputChange('ui', 'enableDarkMode', e.target.checked)}
                    className="w-4 h-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                  />
                  <label htmlFor="enableDarkMode" className="ml-2 block text-sm text-gray-900">
                    Enable Dark Mode Support
                  </label>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
