'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users,
  Search,
  Filter,
  Eye,
  MessageCircle,
  Smartphone,
  Monitor,
  Globe,
  Calendar,
  Clock,
  MapPin,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Download,
  MoreHorizontal,
  User,
  Heart
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../components/AdminLayout';
// Backend removed - will rebuild
// import { AdminService } from '@/lib/database';

// Mock user data
const mockUsers = [
  {
    id: 1,
    userKey: 'LOVE-ABC123',
    createdAt: '2024-01-15T10:30:00Z',
    lastActive: '2024-01-20T15:45:00Z',
    surveyCompleted: true,
    reportUnlocked: true,
    aiConversations: 3,
    device: {
      type: 'mobile',
      os: 'iOS 17.2',
      browser: 'Safari',
      screenSize: '390x844',
      country: 'United States',
      city: 'New York'
    },
    relationship: {
      archetype: 'The Power Couple',
      overallScore: 8.2,
      status: 'committed'
    }
  },
  {
    id: 2,
    userKey: 'LOVE-XYZ789',
    createdAt: '2024-01-14T14:20:00Z',
    lastActive: '2024-01-19T09:15:00Z',
    surveyCompleted: true,
    reportUnlocked: false,
    aiConversations: 0,
    device: {
      type: 'desktop',
      os: 'Windows 11',
      browser: 'Chrome',
      screenSize: '1920x1080',
      country: 'United Kingdom',
      city: 'London'
    },
    relationship: {
      archetype: 'The Adventure Seekers',
      overallScore: 7.5,
      status: 'dating'
    }
  },
  {
    id: 3,
    userKey: 'LOVE-DEF456',
    createdAt: '2024-01-13T08:45:00Z',
    lastActive: '2024-01-20T20:30:00Z',
    surveyCompleted: true,
    reportUnlocked: true,
    aiConversations: 7,
    device: {
      type: 'mobile',
      os: 'Android 14',
      browser: 'Chrome Mobile',
      screenSize: '412x915',
      country: 'Canada',
      city: 'Toronto'
    },
    relationship: {
      archetype: 'The Steady Builders',
      overallScore: 9.1,
      status: 'married'
    }
  },
  {
    id: 4,
    userKey: 'LOVE-GHI012',
    createdAt: '2024-01-12T16:20:00Z',
    lastActive: '2024-01-18T12:10:00Z',
    surveyCompleted: false,
    reportUnlocked: false,
    aiConversations: 0,
    device: {
      type: 'tablet',
      os: 'iPadOS 17.2',
      browser: 'Safari',
      screenSize: '820x1180',
      country: 'Australia',
      city: 'Sydney'
    },
    relationship: null
  }
];

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedUser, setExpandedUser] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const isAdminLoggedIn = sessionStorage.getItem('admin_logged_in');
    if (isAdminLoggedIn !== 'true') {
      router.push('/admin');
      return;
    }
    
    // Load real users from database
    const loadUsers = async () => {
      try {
        setLoading(true);
        // AdminService not yet connected — using mock data
        // const result = await AdminService.getAllUsers(50, 0);
        const result = { success: false, users: [], total: 0 };
        if (result.success && result.users) {
          // Transform database users to match frontend format
          const transformedUsers = result.users.map((user: any, index: number) => ({
            id: index + 1,
            userKey: user.user_key,
            createdAt: user.created_at,
            lastActive: user.last_active,
            surveyCompleted: user.survey_completed,
            reportUnlocked: user.report_unlocked,
            aiConversations: user.ai_conversations_count || 0,
            device: {
              type: user.device_type || 'unknown',
              os: user.os_name || 'Unknown',
              browser: user.browser_name || 'Unknown',
              screenSize: user.screen_width && user.screen_height ? `${user.screen_width}x${user.screen_height}` : 'Unknown',
              country: user.country_name || 'Unknown',
              city: user.city_name || 'Unknown'
            },
            relationship: user.relationship_archetype ? {
              archetype: user.relationship_archetype,
              overallScore: user.normalized_score || 0,
              status: user.category_key || 'unknown'
            } : null
          }));
          setUsers(transformedUsers);
          setTotalUsers(result.total || 0);
        }
      } catch (error) {
        console.error('Error loading users:', error);
        // Keep using mock data as fallback
      }
      setLoading(false);
      setIsLoading(false);
    };
    
    loadUsers();
  }, [router]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.userKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.device.country.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'completed' && user.surveyCompleted) ||
                         (filterStatus === 'unlocked' && user.reportUnlocked) ||
                         (filterStatus === 'active' && user.aiConversations > 0);
    
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile': return Smartphone;
      case 'tablet': return Smartphone;
      default: return Monitor;
    }
  };

  const viewUserReport = (userKey: string) => {
    // In real app, this would fetch the actual report
    alert(`Viewing report for user: ${userKey}`);
  };

  const viewAIConversations = (userKey: string) => {
    // In real app, this would show AI chat history
    alert(`Viewing AI conversations for user: ${userKey}`);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
              <Users className="w-8 h-8 text-pink-500" />
              <span>Users Management</span>
            </h1>
            <p className="text-gray-600 mt-1">Manage user accounts, view reports, and monitor activity</p>
          </div>
          <button className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { title: 'Total Users', value: users.length, icon: Users, color: 'blue' },
            { title: 'Surveys Completed', value: users.filter(u => u.surveyCompleted).length, icon: Heart, color: 'green' },
            { title: 'Reports Unlocked', value: users.filter(u => u.reportUnlocked).length, icon: Eye, color: 'purple' },
            { title: 'AI Conversations', value: users.reduce((sum, u) => sum + u.aiConversations, 0), icon: MessageCircle, color: 'orange' }
          ].map((stat) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/90 backdrop-blur-sm rounded-lg p-4 border border-white/50 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.title}</div>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  stat.color === 'blue' ? 'bg-blue-100' :
                  stat.color === 'green' ? 'bg-green-100' :
                  stat.color === 'purple' ? 'bg-purple-100' : 'bg-orange-100'
                }`}>
                  <stat.icon className={`w-5 h-5 ${
                    stat.color === 'blue' ? 'text-blue-600' :
                    stat.color === 'green' ? 'text-green-600' :
                    stat.color === 'purple' ? 'text-purple-600' : 'text-orange-600'
                  }`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 border border-white/50 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by user key or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            
            {/* Filter */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="all">All Users</option>
                <option value="completed">Survey Completed</option>
                <option value="unlocked">Report Unlocked</option>
                <option value="active">AI Active</option>
              </select>
              <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-white/50 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => {
                  const DeviceIcon = getDeviceIcon(user.device.type);
                  const isExpanded = expandedUser === user.id;
                  
                  return (
                    <React.Fragment key={user.id}>
                      <tr className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.userKey}</div>
                              <div className="text-xs text-gray-500">
                                Created {formatDate(user.createdAt)}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <DeviceIcon className="w-4 h-4 text-gray-600" />
                            <div>
                              <div className="text-sm text-gray-900">{user.device.os}</div>
                              <div className="text-xs text-gray-500">{user.device.browser}</div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                              user.surveyCompleted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.surveyCompleted ? 'Survey Done' : 'Pending'}
                            </span>
                            {user.reportUnlocked && (
                              <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 ml-1">
                                Unlocked
                              </span>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {user.aiConversations > 0 ? `${user.aiConversations} chats` : 'No chats'}
                          </div>
                          <div className="text-xs text-gray-500">
                            Last: {formatDate(user.lastActive)}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {user.surveyCompleted && (
                              <button
                                onClick={() => viewUserReport(user.userKey)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                View Report
                              </button>
                            )}
                            {user.aiConversations > 0 && (
                              <button
                                onClick={() => viewAIConversations(user.userKey)}
                                className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                              >
                                View Chats
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      
                      {/* Expanded Details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-gray-50/50"
                          >
                            <td colSpan={5} className="px-6 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Device Details */}
                                <div className="space-y-2">
                                  <h4 className="text-sm font-semibold text-gray-900">Device Information</h4>
                                  <div className="text-xs space-y-1">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Screen Size:</span>
                                      <span className="text-gray-900">{user.device.screenSize}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Location:</span>
                                      <span className="text-gray-900">{user.device.city}, {user.device.country}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Relationship Info */}
                                {user.relationship && (
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-gray-900">Relationship Data</h4>
                                    <div className="text-xs space-y-1">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Archetype:</span>
                                        <span className="text-gray-900">{user.relationship.archetype}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Score:</span>
                                        <span className="text-gray-900">{user.relationship.overallScore}/10</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Status:</span>
                                        <span className="text-gray-900 capitalize">{user.relationship.status}</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Activity Timeline */}
                                <div className="space-y-2">
                                  <h4 className="text-sm font-semibold text-gray-900">Activity Timeline</h4>
                                  <div className="text-xs space-y-1">
                                    <div className="flex items-center space-x-2">
                                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                      <span className="text-gray-600">Joined: {formatDate(user.createdAt)}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                      <span className="text-gray-600">Last seen: {formatDate(user.lastActive)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {filteredUsers.length} of {users.length} users
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
              Previous
            </button>
            <button className="px-3 py-1 text-sm bg-pink-500 text-white rounded-lg">
              1
            </button>
            <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
