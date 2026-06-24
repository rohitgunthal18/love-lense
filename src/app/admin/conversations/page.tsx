'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle,
  Search,
  Filter,
  Eye,
  User,
  Bot,
  Clock,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Heart,
  RefreshCw,
  Download,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../components/AdminLayout';

// Mock conversation data
const mockConversations = [
  {
    id: 1,
    userKey: 'LOVE-ABC123',
    sessionId: 'session_001',
    startedAt: '2024-01-20T14:30:00Z',
    lastMessage: '2024-01-20T14:45:00Z',
    messageCount: 12,
    duration: '15 minutes',
    status: 'completed',
    topic: 'Communication Issues',
    sentiment: 'positive',
    messages: [
      { id: 1, sender: 'user', content: 'How can I improve communication with my partner?', timestamp: '2024-01-20T14:30:00Z' },
      { id: 2, sender: 'ai', content: 'Based on your relationship assessment, I can see you\'re a Power Couple type. Here are some specific strategies for your relationship style...', timestamp: '2024-01-20T14:30:30Z' },
      { id: 3, sender: 'user', content: 'That makes sense. What about when we disagree on financial decisions?', timestamp: '2024-01-20T14:32:00Z' },
      { id: 4, sender: 'ai', content: 'Financial discussions can be challenging. For Power Couples like yourselves, I recommend setting up regular money meetings...', timestamp: '2024-01-20T14:32:45Z' }
    ]
  },
  {
    id: 2,
    userKey: 'LOVE-DEF456',
    sessionId: 'session_002',
    startedAt: '2024-01-19T16:20:00Z',
    lastMessage: '2024-01-19T17:05:00Z',
    messageCount: 18,
    duration: '45 minutes',
    status: 'completed',
    topic: 'Future Planning',
    sentiment: 'neutral',
    messages: [
      { id: 1, sender: 'user', content: 'My partner and I have different timeline expectations for marriage. What should we do?', timestamp: '2024-01-19T16:20:00Z' },
      { id: 2, sender: 'ai', content: 'Timeline differences are common, especially for Steady Builder couples like you. Let\'s explore this together...', timestamp: '2024-01-19T16:20:30Z' }
    ]
  },
  {
    id: 3,
    userKey: 'LOVE-GHI789',
    sessionId: 'session_003',
    startedAt: '2024-01-18T10:15:00Z',
    lastMessage: '2024-01-18T10:25:00Z',
    messageCount: 6,
    duration: '10 minutes',
    status: 'abandoned',
    topic: 'Trust Issues',
    sentiment: 'negative',
    messages: [
      { id: 1, sender: 'user', content: 'I think my partner might be hiding something from me', timestamp: '2024-01-18T10:15:00Z' },
      { id: 2, sender: 'ai', content: 'I understand this must be very concerning for you. Trust is fundamental in relationships. Can you tell me more about what\'s making you feel this way?', timestamp: '2024-01-18T10:15:30Z' }
    ]
  }
];

export default function ConversationsPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState(mockConversations);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
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

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.userKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.topic.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'completed' && conv.status === 'completed') ||
                         (filterStatus === 'active' && conv.status === 'active') ||
                         (filterStatus === 'abandoned' && conv.status === 'abandoned');
    
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

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'abandoned': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
              <MessageCircle className="w-8 h-8 text-pink-500" />
              <span>AI Conversations</span>
            </h1>
            <p className="text-gray-600 mt-1">Monitor and analyze AI chatbot conversations with users</p>
          </div>
          <button className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Conversations</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { 
              title: 'Total Conversations', 
              value: conversations.length, 
              icon: MessageCircle, 
              color: 'blue',
              change: '+12% this week'
            },
            { 
              title: 'Completed Sessions', 
              value: conversations.filter(c => c.status === 'completed').length, 
              icon: Heart, 
              color: 'green',
              change: '85% completion rate'
            },
            { 
              title: 'Avg Duration', 
              value: '23m', 
              icon: Clock, 
              color: 'purple',
              change: '+5m from last week'
            },
            { 
              title: 'User Satisfaction', 
              value: '4.8/5', 
              icon: TrendingUp, 
              color: 'orange',
              change: 'Based on feedback'
            }
          ].map((stat) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/90 backdrop-blur-sm rounded-lg p-4 border border-white/50 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
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
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600 mb-1">{stat.title}</div>
              <div className="text-xs text-green-600">{stat.change}</div>
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
                placeholder="Search by user key or topic..."
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
                <option value="all">All Conversations</option>
                <option value="completed">Completed</option>
                <option value="active">Active</option>
                <option value="abandoned">Abandoned</option>
              </select>
              <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Conversations List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversations Table */}
          <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-white/50 shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Conversations</h3>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {filteredConversations.map((conversation) => (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-4 hover:bg-gray-50/50 cursor-pointer transition-colors ${
                    selectedConversation === conversation.id ? 'bg-pink-50 border-l-4 border-pink-500' : ''
                  }`}
                  onClick={() => setSelectedConversation(conversation.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{conversation.userKey}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(conversation.status)}`}>
                        {conversation.status}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getSentimentColor(conversation.sentiment)}`}>
                        {conversation.sentiment}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Topic:</strong> {conversation.topic}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{conversation.messageCount} messages • {conversation.duration}</span>
                    <span>{formatDate(conversation.startedAt)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Conversation Details */}
          <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-white/50 shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedConversation ? 'Conversation Details' : 'Select a Conversation'}
              </h3>
            </div>
            
            {selectedConversation ? (
              <div className="p-4">
                {(() => {
                  const conversation = conversations.find(c => c.id === selectedConversation);
                  if (!conversation) return null;
                  
                  return (
                    <div className="space-y-4">
                      {/* Conversation Info */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">User:</span>
                            <span className="text-gray-900 ml-2 font-medium">{conversation.userKey}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Session:</span>
                            <span className="text-gray-900 ml-2">{conversation.sessionId}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Duration:</span>
                            <span className="text-gray-900 ml-2">{conversation.duration}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Messages:</span>
                            <span className="text-gray-900 ml-2">{conversation.messageCount}</span>
                          </div>
                        </div>
                      </div>

                      {/* Messages */}
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {conversation.messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex items-start space-x-3 ${
                              message.sender === 'ai' ? 'flex-row-reverse space-x-reverse' : ''
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              message.sender === 'ai' 
                                ? 'bg-purple-100' 
                                : 'bg-blue-100'
                            }`}>
                              {message.sender === 'ai' ? (
                                <Bot className="w-4 h-4 text-purple-600" />
                              ) : (
                                <User className="w-4 h-4 text-blue-600" />
                              )}
                            </div>
                            <div className={`flex-1 ${message.sender === 'ai' ? 'text-right' : ''}`}>
                              <div className={`inline-block p-3 rounded-lg max-w-xs ${
                                message.sender === 'ai'
                                  ? 'bg-purple-100 text-purple-900'
                                  : 'bg-blue-100 text-blue-900'
                              }`}>
                                <p className="text-sm">{message.content}</p>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {formatDate(message.timestamp)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Select a conversation to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
