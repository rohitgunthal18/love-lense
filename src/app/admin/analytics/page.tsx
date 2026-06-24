'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Globe,
  Smartphone,
  Monitor,
  Heart,
  Eye,
  MessageCircle,
  Clock,
  MapPin,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  Target,
  Zap,
  Activity
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../components/AdminLayout';

// Mock analytics data
const mockAnalytics = {
  overview: {
    totalVisitors: 45782,
    uniqueVisitors: 32164,
    pageViews: 127843,
    avgSessionDuration: '5m 23s',
    bounceRate: 32.4,
    conversionRate: 68.7
  },
  timeRange: {
    visitors: [
      { date: '2024-01-15', visitors: 1245, surveys: 856, unlocked: 587 },
      { date: '2024-01-16', visitors: 1567, surveys: 1089, unlocked: 723 },
      { date: '2024-01-17', visitors: 1832, surveys: 1234, unlocked: 834 },
      { date: '2024-01-18', visitors: 1423, surveys: 967, unlocked: 645 },
      { date: '2024-01-19', visitors: 1789, surveys: 1203, unlocked: 812 },
      { date: '2024-01-20', visitors: 2156, surveys: 1456, unlocked: 982 },
      { date: '2024-01-21', visitors: 1934, surveys: 1298, unlocked: 876 }
    ]
  },
  devices: {
    mobile: 67.3,
    desktop: 28.1,
    tablet: 4.6
  },
  locations: [
    { country: 'United States', visitors: 15423, percentage: 33.7 },
    { country: 'United Kingdom', visitors: 8234, percentage: 18.0 },
    { country: 'Canada', visitors: 6543, percentage: 14.3 },
    { country: 'Australia', visitors: 4321, percentage: 9.4 },
    { country: 'Germany', visitors: 3456, percentage: 7.6 }
  ],
  surveys: {
    completionRate: 68.7,
    averageTime: '4m 12s',
    topExitPoints: [
      { question: 'Question 8', exitRate: 12.3 },
      { question: 'Question 12', exitRate: 8.7 },
      { question: 'Question 15', exitRate: 6.2 }
    ]
  },
  relationships: {
    archetypes: [
      { name: 'The Power Couple', count: 2843, percentage: 23.1 },
      { name: 'The Steady Builders', count: 2156, percentage: 17.5 },
      { name: 'The Adventure Seekers', count: 1987, percentage: 16.1 },
      { name: 'The Creative Souls', count: 1654, percentage: 13.4 },
      { name: 'The Peaceful Waters', count: 1432, percentage: 11.6 }
    ],
    avgScore: 7.8,
    scoreDistribution: {
      excellent: 34.2,
      good: 42.1,
      needsAttention: 23.7
    }
  }
};

export default function AnalyticsPage() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const isAdminLoggedIn = sessionStorage.getItem('admin_logged_in');
    if (isAdminLoggedIn !== 'true') {
      router.push('/admin');
      return;
    }
    
    setTimeout(() => setIsLoading(false), 800);
  }, [router]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
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
              <BarChart3 className="w-8 h-8 text-pink-500" />
              <span>Analytics Dashboard</span>
            </h1>
            <p className="text-gray-600 mt-1">Comprehensive insights into platform performance and user behavior</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            <button className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {[
            { 
              title: 'Total Visitors', 
              value: formatNumber(mockAnalytics.overview.totalVisitors), 
              change: '+12.5%',
              trend: 'up',
              icon: Users, 
              color: 'blue' 
            },
            { 
              title: 'Unique Visitors', 
              value: formatNumber(mockAnalytics.overview.uniqueVisitors), 
              change: '+8.3%',
              trend: 'up',
              icon: Globe, 
              color: 'green' 
            },
            { 
              title: 'Page Views', 
              value: formatNumber(mockAnalytics.overview.pageViews), 
              change: '+15.7%',
              trend: 'up',
              icon: Eye, 
              color: 'purple' 
            },
            { 
              title: 'Avg. Session', 
              value: mockAnalytics.overview.avgSessionDuration, 
              change: '+0.8m',
              trend: 'up',
              icon: Clock, 
              color: 'orange' 
            },
            { 
              title: 'Bounce Rate', 
              value: `${mockAnalytics.overview.bounceRate}%`, 
              change: '-2.1%',
              trend: 'down',
              icon: TrendingDown, 
              color: 'red' 
            },
            { 
              title: 'Conversion', 
              value: `${mockAnalytics.overview.conversionRate}%`, 
              change: '+4.2%',
              trend: 'up',
              icon: Target, 
              color: 'emerald' 
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/90 backdrop-blur-sm rounded-lg p-4 border border-white/50 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  stat.color === 'blue' ? 'bg-blue-100' :
                  stat.color === 'green' ? 'bg-green-100' :
                  stat.color === 'purple' ? 'bg-purple-100' :
                  stat.color === 'orange' ? 'bg-orange-100' :
                  stat.color === 'red' ? 'bg-red-100' : 'bg-emerald-100'
                }`}>
                  <stat.icon className={`w-5 h-5 ${
                    stat.color === 'blue' ? 'text-blue-600' :
                    stat.color === 'green' ? 'text-green-600' :
                    stat.color === 'purple' ? 'text-purple-600' :
                    stat.color === 'orange' ? 'text-orange-600' :
                    stat.color === 'red' ? 'text-red-600' : 'text-emerald-600'
                  }`} />
                </div>
                {stat.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600 mb-1">{stat.title}</div>
              <div className={`text-xs font-medium ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change} vs last period
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Visitors Trend */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/90 backdrop-blur-sm rounded-lg p-6 border border-white/50 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-pink-500" />
              <span>Visitor Trends</span>
            </h3>
            
            {/* Simple chart representation */}
            <div className="space-y-3">
              {mockAnalytics.timeRange.visitors.map((day, index) => (
                <div key={day.date} className="flex items-center space-x-3">
                  <div className="text-xs text-gray-500 w-16">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-3 relative">
                    <div 
                      className="bg-gradient-to-r from-pink-500 to-rose-500 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${(day.visitors / 2500) * 100}%` }}
                    />
                  </div>
                  <div className="text-sm font-medium text-gray-900 w-16 text-right">
                    {formatNumber(day.visitors)}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Device Breakdown */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white/90 backdrop-blur-sm rounded-lg p-6 border border-white/50 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Smartphone className="w-5 h-5 text-pink-500" />
              <span>Device Usage</span>
            </h3>
            
            <div className="space-y-4">
              {[
                { name: 'Mobile', percentage: mockAnalytics.devices.mobile, icon: Smartphone, color: 'blue' },
                { name: 'Desktop', percentage: mockAnalytics.devices.desktop, icon: Monitor, color: 'green' },
                { name: 'Tablet', percentage: mockAnalytics.devices.tablet, icon: Smartphone, color: 'purple' }
              ].map((device) => (
                <div key={device.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <device.icon className={`w-5 h-5 ${
                      device.color === 'blue' ? 'text-blue-600' :
                      device.color === 'green' ? 'text-green-600' : 'text-purple-600'
                    }`} />
                    <span className="text-sm font-medium text-gray-900">{device.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          device.color === 'blue' ? 'bg-blue-500' :
                          device.color === 'green' ? 'bg-green-500' : 'bg-purple-500'
                        }`}
                        style={{ width: `${device.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-900 w-12 text-right">
                      {device.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Location and Survey Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Locations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white/90 backdrop-blur-sm rounded-lg p-6 border border-white/50 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-pink-500" />
              <span>Top Locations</span>
            </h3>
            
            <div className="space-y-3">
              {mockAnalytics.locations.map((location, index) => (
                <div key={location.country} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{location.country}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-sm text-gray-600">{formatNumber(location.visitors)}</div>
                    <div className="text-sm font-bold text-gray-900">{location.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Survey Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-white/90 backdrop-blur-sm rounded-lg p-6 border border-white/50 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Heart className="w-5 h-5 text-pink-500" />
              <span>Survey Performance</span>
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{mockAnalytics.surveys.completionRate}%</div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{mockAnalytics.surveys.averageTime}</div>
                  <div className="text-sm text-gray-600">Avg. Time</div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Top Exit Points</h4>
                <div className="space-y-2">
                  {mockAnalytics.surveys.topExitPoints.map((point) => (
                    <div key={point.question} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{point.question}</span>
                      <span className="text-sm font-medium text-red-600">{point.exitRate}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Relationship Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-white/90 backdrop-blur-sm rounded-lg p-6 border border-white/50 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <Heart className="w-5 h-5 text-pink-500" />
            <span>Relationship Insights</span>
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Archetype Distribution */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4">Most Popular Archetypes</h4>
              <div className="space-y-3">
                {mockAnalytics.relationships.archetypes.map((archetype, index) => (
                  <div key={archetype.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${
                        index === 0 ? 'bg-purple-500' :
                        index === 1 ? 'bg-green-500' :
                        index === 2 ? 'bg-orange-500' :
                        index === 3 ? 'bg-pink-500' : 'bg-blue-500'
                      }`} />
                      <span className="text-sm font-medium text-gray-900">{archetype.name}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-sm text-gray-600">{formatNumber(archetype.count)}</div>
                      <div className="text-sm font-bold text-gray-900">{archetype.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Score Distribution */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4">Relationship Health Scores</h4>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-600 mb-1">{mockAnalytics.relationships.avgScore}/10</div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>
                
                <div className="space-y-3">
                  {[
                    { label: 'Excellent (8-10)', percentage: mockAnalytics.relationships.scoreDistribution.excellent, color: 'green' },
                    { label: 'Good (6-7)', percentage: mockAnalytics.relationships.scoreDistribution.good, color: 'yellow' },
                    { label: 'Needs Attention (1-5)', percentage: mockAnalytics.relationships.scoreDistribution.needsAttention, color: 'red' }
                  ].map((score) => (
                    <div key={score.label} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{score.label}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              score.color === 'green' ? 'bg-green-500' :
                              score.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${score.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{score.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
