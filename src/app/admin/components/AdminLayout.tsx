'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart,
  LayoutDashboard,
  Users,
  MessageCircle,
  Ticket,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  Database,
  FileText
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Database Setup', href: '/admin/setup', icon: Database },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'AI Conversations', href: '/admin/conversations', icon: MessageCircle },
    { name: 'Coupons', href: '/admin/coupons', icon: Ticket },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Survey Management', href: '/admin/surveys', icon: FileText },
    { name: 'System Settings', href: '/admin/settings', icon: Settings }
  ];

  const handleLogout = () => {
    sessionStorage.removeItem('admin_logged_in');
    router.push('/admin');
  };

  return (
    <div className="admin-layout-container bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 overflow-hidden">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="flex h-full w-full m-0 p-0">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: sidebarOpen ? 0 : -300 }}
          transition={{ type: 'tween', duration: 0.3 }}
          className="fixed inset-y-0 left-0 w-64 bg-white/90 backdrop-blur-sm border-r border-white/50 z-50 lg:translate-x-0 lg:static lg:flex lg:flex-col lg:w-64 lg:flex-shrink-0 lg:m-0 lg:p-0"
        >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center space-x-3 p-6 border-b border-gray-200">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Love Lens</h1>
              <p className="text-xs text-gray-500">Admin Dashboard</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Admin</div>
                <div className="text-xs text-gray-500">Administrator</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
        </motion.div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Top bar */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-white/50 px-4 py-3 lg:px-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block">
                <div className="text-sm text-gray-600">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="System Online" />
            </div>
          </div>
        </div>

          {/* Page content */}
          <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>

      {/* Background Hearts */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-red-100"
            initial={{ 
              x: `${Math.random() * 100}%`, 
              y: `${Math.random() * 100}%`,
              scale: Math.random() * 0.2 + 0.1
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, Math.random() * 20 - 10, 0],
              rotate: [0, Math.random() * 10 - 5, 0]
            }}
            transition={{
              duration: 12 + Math.random() * 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Heart size={12 + (i % 4) * 4} fill="currentColor" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
