'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  MessageCircle, 
  Ticket, 
  BarChart3, 
  Heart,
  TrendingUp,
  Eye,
  Calendar,
  Shield,
  Database,
  Activity,
  UserCheck,
  Zap,
  Globe,
  Clock
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../components/AdminLayout';
// Backend removed - will rebuild
// import { AdminService } from '@/lib/database';

// Mock data - in real app, this would come from Supabase
const mockStats = {
  totalUsers: 12847,
  todayUsers: 342,
  surveysCompleted: 8932,
  reportsUnlocked: 6743,
  aiConversations: 4521,
  activeCoupons: 3,
  conversionRate: 68.5,
  avgSessionTime: '4m 32s'
};

const mockRecentActivity = [
  { id: 1, type: 'survey', message: 'New survey completed', time: '2 minutes ago', userKey: 'LOVE-ABC123' },
  { id: 2, type: 'unlock', message: 'Report unlocked via WhatsApp sharing', time: '5 minutes ago', userKey: 'LOVE-XYZ789' },
  { id: 3, type: 'chat', message: 'AI conversation started', time: '8 minutes ago', userKey: 'LOVE-DEF456' },
  { id: 4, type: 'coupon', message: 'FIRST100 coupon used', time: '12 minutes ago', userKey: 'LOVE-GHI012' },
  { id: 5, type: 'survey', message: 'New survey completed', time: '15 minutes ago', userKey: 'LOVE-JKL345' }
];

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(mockStats);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Check authentication
    const isAdminLoggedIn = sessionStorage.getItem('admin_logged_in');
    if (isAdminLoggedIn !== 'true') {
      router.push('/admin');
      return;
    }
    
    // Load real dashboard stats (BACKEND REMOVED)
    const loadDashboardStats = async () => {
      try {
        // const result = await AdminService.getDashboardStats();
        // if (result.success && result.stats) {
        //   setStats({
        //     ...mockStats,
        //     totalUsers: result.stats.totalUsers,
        //     surveysCompleted: result.stats.completedSurveys,
        //     reportsUnlocked: result.stats.unlockedReports,
        //     todayUsers: result.stats.recentActivity?.[0]?.new_users || mockStats.todayUsers,
        //     aiConversations: result.stats.totalConversations,
        //   });
        // }
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
        // Keep using mock data as fallback
      }
      setIsLoading(false);
    };
    
    loadDashboardStats();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16"
        >
          <Heart className="w-16 h-16 text-pink-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with Love Lens today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              title: 'Total Users', 
              value: stats.totalUsers.toLocaleString(), 
              change: `+${stats.todayUsers} today`,
              icon: Users, 
              color: 'blue',
              trend: 'up'
            },
            { 
              title: 'Surveys Completed', 
              value: stats.surveysCompleted.toLocaleString(), 
              change: `${stats.conversionRate}% completion rate`,
              icon: UserCheck, 
              color: 'green',
              trend: 'up'
            },
            { 
              title: 'Reports Unlocked', 
              value: stats.reportsUnlocked.toLocaleString(), 
              change: `${((stats.reportsUnlocked/stats.surveysCompleted)*100).toFixed(1)}% unlock rate`,
              icon: Eye, 
              color: 'purple',
              trend: 'up'
            },
            { 
              title: 'AI Conversations', 
              value: stats.aiConversations.toLocaleString(), 
              change: `Avg: ${stats.avgSessionTime}`,
              icon: MessageCircle, 
              color: 'orange',
              trend: 'up'
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  stat.color === 'blue' ? 'bg-blue-100' :
                  stat.color === 'green' ? 'bg-green-100' :
                  stat.color === 'purple' ? 'bg-purple-100' : 'bg-orange-100'
                }`}>
                  <stat.icon className={`w-6 h-6 ${
                    stat.color === 'blue' ? 'text-blue-600' :
                    stat.color === 'green' ? 'text-green-600' :
                    stat.color === 'purple' ? 'text-purple-600' : 'text-orange-600'
                  }`} />
                </div>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.title}</div>
                <div className="text-xs text-green-600 font-medium mt-1">{stat.change}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Manage Users', icon: Users, href: '/admin/users', color: 'blue' },
            { title: 'AI Conversations', icon: MessageCircle, href: '/admin/conversations', color: 'green' },
            { title: 'Coupon Management', icon: Ticket, href: '/admin/coupons', color: 'purple' },
            { title: 'Analytics', icon: BarChart3, href: '/admin/analytics', color: 'orange' }
          ].map((action, index) => (
            <motion.button
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              onClick={() => router.push(action.href)}
              className={`p-4 rounded-xl border-2 border-dashed transition-all duration-200 hover:shadow-lg ${
                action.color === 'blue' ? 'border-blue-300 hover:border-blue-500 hover:bg-blue-50' :
                action.color === 'green' ? 'border-green-300 hover:border-green-500 hover:bg-green-50' :
                action.color === 'purple' ? 'border-purple-300 hover:border-purple-500 hover:bg-purple-50' :
                'border-orange-300 hover:border-orange-500 hover:bg-orange-50'
              }`}
            >
              <action.icon className={`w-8 h-8 mx-auto mb-2 ${
                action.color === 'blue' ? 'text-blue-600' :
                action.color === 'green' ? 'text-green-600' :
                action.color === 'purple' ? 'text-purple-600' : 'text-orange-600'
              }`} />
              <div className="text-sm font-medium text-gray-700">{action.title}</div>
            </motion.button>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Activity Feed */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-lg"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-pink-500" />
              <span>Recent Activity</span>
            </h3>
            <div className="space-y-4">
              {mockRecentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'survey' ? 'bg-blue-100' :
                    activity.type === 'unlock' ? 'bg-green-100' :
                    activity.type === 'chat' ? 'bg-purple-100' : 'bg-orange-100'
                  }`}>
                    {activity.type === 'survey' && <UserCheck className="w-4 h-4 text-blue-600" />}
                    {activity.type === 'unlock' && <Eye className="w-4 h-4 text-green-600" />}
                    {activity.type === 'chat' && <MessageCircle className="w-4 h-4 text-purple-600" />}
                    {activity.type === 'coupon' && <Ticket className="w-4 h-4 text-orange-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{activity.message}</div>
                    <div className="text-xs text-gray-500">User: {activity.userKey} • {activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* System Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0 }}
            className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-lg"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-pink-500" />
              <span>System Status</span>
            </h3>
            <div className="space-y-4">
              {[
                { name: 'Database', status: 'Operational', color: 'green', icon: Database },
                { name: 'AI Chatbot', status: 'Operational', color: 'green', icon: Zap },
                { name: 'Web Server', status: 'Operational', color: 'green', icon: Globe },
                { name: 'Analytics', status: 'Operational', color: 'green', icon: BarChart3 }
              ].map((service) => (
                <div key={service.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <service.icon className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">{service.name}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    service.color === 'green' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {service.status}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Last updated</span>
                <span className="text-gray-900 font-medium">Just now</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}
