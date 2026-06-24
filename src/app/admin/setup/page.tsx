'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import ImportButton from '@/components/ImportButton';

export default function SetupPage() {
  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Database Setup</h1>
                <p className="text-gray-600">Initialize the Love Lens database with survey questions and configuration</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid gap-6">
          {/* Survey Data Import */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Upload className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900">Survey Questions Import</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Import all survey questions from the JSON file to the database. This includes detection questions, category-specific questions, and branching logic.
            </p>
            
            <ImportButton />
          </motion.div>

          {/* Database Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50"
          >
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <h2 className="text-xl font-semibold text-gray-900">Database Status</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-2">✅ Tables Created</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Users & Analytics</li>
                  <li>• Survey System</li>
                  <li>• Chat & Conversations</li>
                  <li>• Unlock & Sharing</li>
                  <li>• Admin Management</li>
                </ul>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">🔧 Configuration</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Row Level Security</li>
                  <li>• Utility Functions</li>
                  <li>• Analytics Views</li>
                  <li>• Admin Policies</li>
                  <li>• Default Data</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <h3 className="font-semibold text-yellow-800">Next Steps</h3>
              </div>
              <p className="text-sm text-yellow-700 mt-2">
                After importing survey questions, you can test the complete user flow from survey completion to report generation.
              </p>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/50"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => window.open('/survey', '_blank')}
                className="p-4 text-left bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all"
              >
                <h3 className="font-semibold mb-2">Test Survey</h3>
                <p className="text-sm opacity-90">Complete a survey to test the flow</p>
              </button>
              
              <button
                onClick={() => window.open('/report', '_blank')}
                className="p-4 text-left bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                <h3 className="font-semibold mb-2">View Report</h3>
                <p className="text-sm opacity-90">Check report generation</p>
              </button>
              
              <button
                onClick={() => window.location.href = '/admin/users'}
                className="p-4 text-left bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all"
              >
                <h3 className="font-semibold mb-2">User Management</h3>
                <p className="text-sm opacity-90">View user data and analytics</p>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}
