'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ticket,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Users,
  Percent,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Copy,
  Download
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../components/AdminLayout';

interface Coupon {
  id: number;
  code: string;
  description: string;
  type: 'percentage' | 'fixed' | 'free_unlock';
  value: number;
  usageLimit: number;
  usedCount: number;
  expiryDate: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
}

// Mock coupon data
const mockCoupons: Coupon[] = [
  {
    id: 1,
    code: 'FIRST100',
    description: 'Free unlock for first 100 users',
    type: 'free_unlock',
    value: 0,
    usageLimit: 100,
    usedCount: 47,
    expiryDate: '2024-12-31T23:59:59Z',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'admin'
  },
  {
    id: 2,
    code: 'VALENTINE50',
    description: '50% off premium features',
    type: 'percentage',
    value: 50,
    usageLimit: 500,
    usedCount: 123,
    expiryDate: '2024-02-14T23:59:59Z',
    isActive: true,
    createdAt: '2024-01-20T10:00:00Z',
    createdBy: 'admin'
  },
  {
    id: 3,
    code: 'WELCOME10',
    description: '$10 off first purchase',
    type: 'fixed',
    value: 10,
    usageLimit: 1000,
    usedCount: 856,
    expiryDate: '2024-06-30T23:59:59Z',
    isActive: false,
    createdAt: '2024-01-01T00:00:00Z',
    createdBy: 'admin'
  }
];

export default function CouponsPage() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>(mockCoupons);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form state for creating/editing coupons
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: 'free_unlock' as 'percentage' | 'fixed' | 'free_unlock',
    value: 0,
    usageLimit: 100,
    expiryDate: '',
    isActive: true
  });

  useEffect(() => {
    // Check authentication
    const isAdminLoggedIn = sessionStorage.getItem('admin_logged_in');
    if (isAdminLoggedIn !== 'true') {
      router.push('/admin');
      return;
    }
    
    setTimeout(() => setIsLoading(false), 800);
  }, [router]);

  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coupon.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'active' && coupon.isActive) ||
                         (filterStatus === 'inactive' && !coupon.isActive) ||
                         (filterStatus === 'expired' && new Date(coupon.expiryDate) < new Date());
    
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.round((used / limit) * 100);
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  const handleCreateCoupon = () => {
    const newCoupon: Coupon = {
      id: Date.now(),
      code: formData.code.toUpperCase(),
      description: formData.description,
      type: formData.type,
      value: formData.value,
      usageLimit: formData.usageLimit,
      usedCount: 0,
      expiryDate: formData.expiryDate,
      isActive: formData.isActive,
      createdAt: new Date().toISOString(),
      createdBy: 'admin'
    };

    setCoupons([...coupons, newCoupon]);
    setShowCreateModal(false);
    resetForm();
  };

  const handleUpdateCoupon = () => {
    if (!editingCoupon) return;

    setCoupons(coupons.map(coupon => 
      coupon.id === editingCoupon.id 
        ? { ...editingCoupon, ...formData }
        : coupon
    ));
    setEditingCoupon(null);
    resetForm();
  };

  const handleDeleteCoupon = (id: number) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      setCoupons(coupons.filter(coupon => coupon.id !== id));
    }
  };

  const toggleCouponStatus = (id: number) => {
    setCoupons(coupons.map(coupon =>
      coupon.id === id ? { ...coupon, isActive: !coupon.isActive } : coupon
    ));
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      type: 'free_unlock',
      value: 0,
      usageLimit: 100,
      expiryDate: '',
      isActive: true
    });
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value,
      usageLimit: coupon.usageLimit,
      expiryDate: coupon.expiryDate.split('T')[0],
      isActive: coupon.isActive
    });
    setShowCreateModal(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
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
              <Ticket className="w-8 h-8 text-pink-500" />
              <span>Coupon Management</span>
            </h1>
            <p className="text-gray-600 mt-1">Create and manage discount coupons and promotional codes</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Coupon</span>
            </button>
            <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { 
              title: 'Total Coupons', 
              value: coupons.length, 
              icon: Ticket, 
              color: 'blue'
            },
            { 
              title: 'Active Coupons', 
              value: coupons.filter(c => c.isActive).length, 
              icon: CheckCircle, 
              color: 'green'
            },
            { 
              title: 'Total Usage', 
              value: coupons.reduce((sum, c) => sum + c.usedCount, 0), 
              icon: Users, 
              color: 'purple'
            },
            { 
              title: 'Expired Coupons', 
              value: coupons.filter(c => isExpired(c.expiryDate)).length, 
              icon: Clock, 
              color: 'orange'
            }
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
                placeholder="Search by coupon code or description..."
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
                <option value="all">All Coupons</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
              </select>
              <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Coupons Table */}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-white/50 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coupon</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type & Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCoupons.map((coupon) => {
                  const usagePercentage = getUsagePercentage(coupon.usedCount, coupon.usageLimit);
                  const expired = isExpired(coupon.expiryDate);
                  
                  return (
                    <tr key={coupon.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded font-mono">
                              {coupon.code}
                            </span>
                            <button
                              onClick={() => copyToClipboard(coupon.code)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">{coupon.description}</div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {coupon.type === 'percentage' && <Percent className="w-4 h-4 text-green-600" />}
                          {coupon.type === 'fixed' && <span className="text-green-600 font-bold">$</span>}
                          {coupon.type === 'free_unlock' && <Ticket className="w-4 h-4 text-purple-600" />}
                          <div>
                            <div className="text-sm font-medium text-gray-900 capitalize">
                              {coupon.type.replace('_', ' ')}
                            </div>
                            {coupon.value > 0 && (
                              <div className="text-sm text-gray-600">
                                {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value}`}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {coupon.usedCount} / {coupon.usageLimit}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                usagePercentage >= 90 ? 'bg-red-500' :
                                usagePercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{usagePercentage}% used</div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{formatDate(coupon.expiryDate)}</div>
                        {expired && (
                          <div className="text-xs text-red-600 font-medium">Expired</div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleCouponStatus(coupon.id)}
                          className={`inline-flex items-center space-x-1 px-2 py-1 text-xs rounded-full font-medium ${
                            coupon.isActive && !expired
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {coupon.isActive && !expired ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              <span>{expired ? 'Expired' : 'Inactive'}</span>
                            </>
                          )}
                        </button>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openEditModal(coupon)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(coupon.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create/Edit Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => {
                setShowCreateModal(false);
                setEditingCoupon(null);
                resetForm();
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                </h3>
                
                <div className="space-y-4">
                  {/* Coupon Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Coupon Code
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent uppercase"
                      placeholder="SUMMER2024"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="Summer promotion discount"
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Coupon Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="free_unlock">Free Report Unlock</option>
                      <option value="percentage">Percentage Discount</option>
                      <option value="fixed">Fixed Amount Discount</option>
                    </select>
                  </div>

                  {/* Value */}
                  {formData.type !== 'free_unlock' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discount Value {formData.type === 'percentage' ? '(%)' : '($)'}
                      </label>
                      <input
                        type="number"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        min="0"
                        max={formData.type === 'percentage' ? 100 : undefined}
                      />
                    </div>
                  )}

                  {/* Usage Limit */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Usage Limit
                    </label>
                    <input
                      type="number"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      min="1"
                    />
                  </div>

                  {/* Expiry Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                      Active (users can use this coupon)
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingCoupon(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingCoupon ? handleUpdateCoupon : handleCreateCoupon}
                    className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                  >
                    {editingCoupon ? 'Update' : 'Create'} Coupon
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
