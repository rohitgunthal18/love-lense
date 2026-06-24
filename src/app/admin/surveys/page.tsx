'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Save,
  X,
  ChevronDown,
  ChevronRight,
  Target,
  TrendingUp,
  Copy
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../components/AdminLayout';

interface Question {
  id: number;
  text: string;
  type: 'single_choice' | 'multiple_choice' | 'scale' | 'text';
  options?: string[];
  required: boolean;
  order: number;
  category: string;
  showForStatus: 'all' | 'current' | 'breakup';
  analytics: {
    responses: number;
    averageTime: string;
    dropOffRate: number;
  };
}

interface Survey {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'draft' | 'archived';
  questions: Question[];
  analytics: {
    totalResponses: number;
    completionRate: number;
    averageTime: string;
    lastModified: string;
  };
}

// Mock survey data
const mockSurveys: Survey[] = [
  {
    id: 1,
    name: 'Relationship Health Assessment',
    description: 'Main survey for assessing relationship health and compatibility',
    status: 'active',
    questions: [
      {
        id: 1,
        text: 'What is your current relationship status?',
        type: 'single_choice',
        options: ['Single', 'Dating', 'In a committed relationship', 'Engaged', 'Married', 'Recently broke up'],
        required: true,
        order: 1,
        category: 'Status',
        showForStatus: 'all',
        analytics: { responses: 12847, averageTime: '15s', dropOffRate: 2.1 }
      },
      {
        id: 2,
        text: 'How long have you been in your current relationship?',
        type: 'single_choice',
        options: ['Less than 6 months', '6 months - 1 year', '1-2 years', '2-5 years', '5+ years'],
        required: true,
        order: 2,
        category: 'Duration',
        showForStatus: 'current',
        analytics: { responses: 8932, averageTime: '12s', dropOffRate: 3.4 }
      },
      {
        id: 3,
        text: 'How would you rate your communication with your partner?',
        type: 'scale',
        required: true,
        order: 3,
        category: 'Communication',
        showForStatus: 'current',
        analytics: { responses: 8654, averageTime: '18s', dropOffRate: 4.2 }
      },
      {
        id: 4,
        text: 'What was the main reason for your last breakup?',
        type: 'single_choice',
        options: ['Communication issues', 'Different life goals', 'Trust issues', 'Long distance', 'Grew apart', 'Other'],
        required: false,
        order: 4,
        category: 'Breakup',
        showForStatus: 'breakup',
        analytics: { responses: 2156, averageTime: '25s', dropOffRate: 8.7 }
      }
    ],
    analytics: {
      totalResponses: 12847,
      completionRate: 68.7,
      averageTime: '4m 23s',
      lastModified: '2024-01-20T15:30:00Z'
    }
  }
];

export default function SurveysPage() {
  const router = useRouter();
  const [surveys, setSurveys] = useState<Survey[]>(mockSurveys);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form state for questions
  const [questionForm, setQuestionForm] = useState({
    text: '',
    type: 'single_choice' as Question['type'],
    options: [''],
    required: true,
    category: '',
    showForStatus: 'all' as Question['showForStatus']
  });

  useEffect(() => {
    // Check authentication
    const isAdminLoggedIn = sessionStorage.getItem('admin_logged_in');
    if (isAdminLoggedIn !== 'true') {
      router.push('/admin');
      return;
    }
    
    // Set default selected survey
    if (surveys.length > 0) {
      setSelectedSurvey(surveys[0]);
    }
    
    setTimeout(() => setIsLoading(false), 800);
  }, [router, surveys]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAddOption = () => {
    setQuestionForm({
      ...questionForm,
      options: [...(questionForm.options || []), '']
    });
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = questionForm.options?.filter((_, i) => i !== index) || [];
    setQuestionForm({ ...questionForm, options: newOptions });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(questionForm.options || [])];
    newOptions[index] = value;
    setQuestionForm({ ...questionForm, options: newOptions });
  };

  const resetQuestionForm = () => {
    setQuestionForm({
      text: '',
      type: 'single_choice',
      options: [''],
      required: true,
      category: '',
      showForStatus: 'all'
    });
  };

  const handleSaveQuestion = () => {
    if (!selectedSurvey) return;

    const newQuestion: Question = {
      id: Date.now(),
      text: questionForm.text,
      type: questionForm.type,
      options: questionForm.type === 'scale' || questionForm.type === 'text' ? undefined : questionForm.options?.filter(opt => opt.trim() !== ''),
      required: questionForm.required,
      order: selectedSurvey.questions.length + 1,
      category: questionForm.category,
      showForStatus: questionForm.showForStatus,
      analytics: { responses: 0, averageTime: '0s', dropOffRate: 0 }
    };

    const updatedSurvey = {
      ...selectedSurvey,
      questions: [...selectedSurvey.questions, newQuestion]
    };

    setSurveys(surveys.map(s => s.id === selectedSurvey.id ? updatedSurvey : s));
    setSelectedSurvey(updatedSurvey);
    setShowQuestionModal(false);
    resetQuestionForm();
  };

  const handleDeleteQuestion = (questionId: number) => {
    if (!selectedSurvey) return;
    
    if (confirm('Are you sure you want to delete this question?')) {
      const updatedSurvey = {
        ...selectedSurvey,
        questions: selectedSurvey.questions.filter(q => q.id !== questionId)
      };
      
      setSurveys(surveys.map(s => s.id === selectedSurvey.id ? updatedSurvey : s));
      setSelectedSurvey(updatedSurvey);
    }
  };

  const getQuestionTypeLabel = (type: Question['type']) => {
    switch (type) {
      case 'single_choice': return 'Single Choice';
      case 'multiple_choice': return 'Multiple Choice';
      case 'scale': return 'Rating Scale';
      case 'text': return 'Text Input';
      default: return type;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
              <FileText className="w-8 h-8 text-pink-500" />
              <span>Survey Management</span>
            </h1>
            <p className="text-gray-600 mt-1">Manage survey questions, analyze responses, and optimize user experience</p>
          </div>
          <button 
            onClick={() => setShowQuestionModal(true)}
            className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Question</span>
          </button>
        </div>

        {/* Survey Overview Stats */}
        {selectedSurvey && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { 
                title: 'Total Responses', 
                value: selectedSurvey.analytics.totalResponses.toLocaleString(), 
                icon: Users, 
                color: 'blue',
                change: '+12.5%'
              },
              { 
                title: 'Completion Rate', 
                value: `${selectedSurvey.analytics.completionRate}%`, 
                icon: Target, 
                color: 'green',
                change: '+2.3%'
              },
              { 
                title: 'Average Time', 
                value: selectedSurvey.analytics.averageTime, 
                icon: Clock, 
                color: 'purple',
                change: '-0.5m'
              },
              { 
                title: 'Total Questions', 
                value: selectedSurvey.questions.length.toString(), 
                icon: FileText, 
                color: 'orange',
                change: 'No change'
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
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Survey List */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-white/50 shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Surveys</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {surveys.map((survey) => (
                  <motion.div
                    key={survey.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-4 hover:bg-gray-50/50 cursor-pointer transition-colors ${
                      selectedSurvey?.id === survey.id ? 'bg-pink-50 border-l-4 border-pink-500' : ''
                    }`}
                    onClick={() => setSelectedSurvey(survey)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">{survey.name}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(survey.status)}`}>
                        {survey.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{survey.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{survey.questions.length} questions</span>
                      <span>{survey.analytics.totalResponses} responses</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Questions List */}
          <div className="lg:col-span-2">
            {selectedSurvey ? (
              <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-white/50 shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Questions - {selectedSurvey.name}
                    </h3>
                    <div className="text-sm text-gray-500">
                      Last modified: {formatDate(selectedSurvey.analytics.lastModified)}
                    </div>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                  {selectedSurvey.questions.map((question, index) => {
                    const isExpanded = expandedQuestion === question.id;
                    
                    return (
                      <div key={question.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1">
                            <button
                              onClick={() => setExpandedQuestion(isExpanded ? null : question.id)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                            <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900 mb-1">
                                {question.text}
                              </div>
                              <div className="flex items-center space-x-3 text-xs text-gray-500">
                                <span className="px-2 py-1 bg-gray-100 rounded">
                                  {getQuestionTypeLabel(question.type)}
                                </span>
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                  {question.showForStatus}
                                </span>
                                {question.required && (
                                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded">
                                    Required
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 ml-9 space-y-3"
                            >
                              {/* Question Options */}
                              {question.options && (
                                <div>
                                  <h5 className="text-sm font-medium text-gray-900 mb-2">Options:</h5>
                                  <div className="space-y-1">
                                    {question.options.map((option, idx) => (
                                      <div key={idx} className="text-sm text-gray-600 ml-4">
                                        • {option}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Analytics */}
                              <div className="grid grid-cols-3 gap-4 bg-gray-50 rounded-lg p-3">
                                <div className="text-center">
                                  <div className="text-lg font-bold text-gray-900">
                                    {question.analytics.responses.toLocaleString()}
                                  </div>
                                  <div className="text-xs text-gray-600">Responses</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold text-gray-900">
                                    {question.analytics.averageTime}
                                  </div>
                                  <div className="text-xs text-gray-600">Avg. Time</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold text-red-600">
                                    {question.analytics.dropOffRate}%
                                  </div>
                                  <div className="text-xs text-gray-600">Drop-off</div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-white/50 shadow-sm p-8 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Select a survey to view and edit questions</p>
              </div>
            )}
          </div>
        </div>

        {/* Add Question Modal */}
        <AnimatePresence>
          {showQuestionModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => {
                setShowQuestionModal(false);
                resetQuestionForm();
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Add New Question</h3>
                  <button
                    onClick={() => {
                      setShowQuestionModal(false);
                      resetQuestionForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  {/* Question Text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Text *
                    </label>
                    <textarea
                      value={questionForm.text}
                      onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      rows={3}
                      placeholder="Enter your question..."
                    />
                  </div>

                  {/* Question Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Type
                    </label>
                    <select
                      value={questionForm.type}
                      onChange={(e) => setQuestionForm({ ...questionForm, type: e.target.value as Question['type'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="single_choice">Single Choice</option>
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="scale">Rating Scale (1-10)</option>
                      <option value="text">Text Input</option>
                    </select>
                  </div>

                  {/* Options (for choice questions) */}
                  {(questionForm.type === 'single_choice' || questionForm.type === 'multiple_choice') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Answer Options
                      </label>
                      <div className="space-y-2">
                        {questionForm.options?.map((option, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleOptionChange(index, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                              placeholder={`Option ${index + 1}`}
                            />
                            {questionForm.options && questionForm.options.length > 1 && (
                              <button
                                onClick={() => handleRemoveOption(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={handleAddOption}
                          className="text-pink-600 hover:text-pink-800 text-sm font-medium"
                        >
                          + Add Option
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      value={questionForm.category}
                      onChange={(e) => setQuestionForm({ ...questionForm, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="e.g., Communication, Trust, Future Planning"
                    />
                  </div>

                  {/* Show for Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Show for Users
                    </label>
                    <select
                      value={questionForm.showForStatus}
                      onChange={(e) => setQuestionForm({ ...questionForm, showForStatus: e.target.value as Question['showForStatus'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="all">All Users</option>
                      <option value="current">Current Relationships</option>
                      <option value="breakup">Post-Breakup</option>
                    </select>
                  </div>

                  {/* Required */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="required"
                      checked={questionForm.required}
                      onChange={(e) => setQuestionForm({ ...questionForm, required: e.target.checked })}
                      className="w-4 h-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                    />
                    <label htmlFor="required" className="ml-2 block text-sm text-gray-900">
                      Required question
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowQuestionModal(false);
                      resetQuestionForm();
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveQuestion}
                    disabled={!questionForm.text.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Question</span>
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
