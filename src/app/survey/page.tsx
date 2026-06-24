'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, Heart, Shield, Users, MessageCircle, TrendingUp, AlertTriangle, Phone, Copy, Check, Lock, FileText, CheckCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Import NEW backend services
import { dbService, QuestionAnswer } from '@/lib/services/db.service';
import { generateUserKey } from '@/lib/supabase';

// Import survey data and scoring
import surveyData from '@/data/surveys.json';
import { calculateSurveyScore, generateInsights } from '@/utils/scoring';

// Types
interface SurveyOption {
  id: string;
  label: string;
  score: number;
  tags: string[];
  crisis?: boolean;
  inverted?: boolean;
  branch_to?: string;
  trust_issue?: boolean;
}

interface SurveyQuestion {
  id: string;
  category: string;
  text: string;
  ui: string;
  options: SurveyOption[];
  weight: number;
  required: boolean;
  follow_up: any;
  crisis: boolean;
  help_text?: string;
  tags?: string[];
}

interface SurveyResponse {
  questionId: string;
  selectedOptionId: string;
  question: SurveyQuestion;
  selectedOption: SurveyOption;
  timestamp: number;
}

export default function SurveyPage() {
  const [currentStep, setCurrentStep] = useState(0); // 0 = category selection, 1+ = questions
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [userKey, setUserKey] = useState('');
  const [showSafetyAlert, setShowSafetyAlert] = useState(false);
  const [currentQuestions, setCurrentQuestions] = useState<SurveyQuestion[]>([]);
  const [selectedAnswerId, setSelectedAnswerId] = useState('');
  const [keyCopied, setKeyCopied] = useState(false);

  // Database state
  const [dbUser, setDbUser] = useState<any>(null);
  const [submissionId, setSubmissionId] = useState<string>('');
  const [startTime, setStartTime] = useState<number>(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);

  // Initialize or load progress (WITHOUT creating user yet)
  useEffect(() => {
    const loadSavedState = () => {
      const savedState = sessionStorage.getItem('love-lens-survey-state');
      
      if (savedState) {
        const state = JSON.parse(savedState);
        setCurrentStep(state.currentStep || 0);
        setSelectedCategory(state.selectedCategory || '');
        setCurrentQuestionIndex(state.currentQuestionIndex || 0);
        setResponses(state.responses || []);
        setSubmissionId(state.submissionId || '');
        
        // If user key exists in saved state, they're resuming
        if (state.userKey) {
          setUserKey(state.userKey);
          // Track page view with existing key
          // AnalyticsService.trackPageView(state.userKey, '/survey', 'Love Lens Survey - Resumed');
        }
      }
    };
    
    loadSavedState();
  }, []);

  // Auto-save progress
  useEffect(() => {
    if (currentStep > 0) {
      const state = {
        currentStep,
        selectedCategory,
        currentQuestionIndex,
        responses,
        userKey,
        submissionId,
        timestamp: Date.now()
      };
      sessionStorage.setItem('love-lens-survey-state', JSON.stringify(state));
    }
  }, [currentStep, selectedCategory, currentQuestionIndex, responses, userKey, submissionId]);

  // Load questions when category is selected
  useEffect(() => {
    if (selectedCategory && (surveyData.surveys as any)[selectedCategory]) {
      const detectionQuestions = (surveyData.detection_questions || []) as SurveyQuestion[];
      const categoryQuestions = ((surveyData.surveys as any)[selectedCategory] || []) as SurveyQuestion[];
      setCurrentQuestions([...detectionQuestions, ...categoryQuestions]);
    }
  }, [selectedCategory]);

  // Handle adaptive branching
  const handleBranching = (selectedOption: SurveyOption, newResponses: SurveyResponse[]) => {
    if (selectedOption?.branch_to) {
      const branchQuestions = ((surveyData.branching_questions as any)?.[selectedOption.branch_to] || []) as SurveyQuestion[];
      if (branchQuestions.length > 0) {
        // Insert branch questions after current question
        const beforeCurrent = currentQuestions.slice(0, currentQuestionIndex + 1);
        const afterCurrent = currentQuestions.slice(currentQuestionIndex + 1);
        const updatedQuestions = [...beforeCurrent, ...branchQuestions, ...afterCurrent];
        setCurrentQuestions(updatedQuestions);
      }
    }
  };

  // Copy key to clipboard
  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(userKey);
      setKeyCopied(true);
      setTimeout(() => setKeyCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = userKey;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setKeyCopied(true);
      setTimeout(() => setKeyCopied(false), 2000);
    }
  };

  const categories = [
    {
      id: 'single',
      title: 'Single & Dating',
      description: 'Exploring new relationships and dating experiences',
      icon: '💕',
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: 'committed',
      title: 'In a Relationship',
      description: 'Committed partnership, living together or serious dating',
      icon: '❤️',
      color: 'from-red-500 to-pink-500'
    },
    {
      id: 'engaged',
      title: 'Engaged',
      description: 'Planning marriage or long-term commitment',
      icon: '💍',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'married',
      title: 'Married/Long-term',
      description: 'Married or in a long-term committed partnership',
      icon: '👫',
      color: 'from-blue-500 to-purple-500'
    },
    {
      id: 'recently_ended',
      title: 'Recently Ended',
      description: 'Processing a recent breakup or separation',
      icon: '🌱',
      color: 'from-green-500 to-blue-500'
    }
  ];

  const handleCategorySelect = async (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentStep(1);
    setCurrentQuestionIndex(0);
    setStartTime(Date.now());
    setQuestionStartTime(Date.now());
    
    // Don't create database records yet - wait until submission
    // Just save category selection to session storage
  };

  const handleAnswer = async (selectedOptionId: string) => {
    const currentQuestion = currentQuestions[currentQuestionIndex];
    const selectedOption = currentQuestion.options?.find(opt => opt.id === selectedOptionId);
    
    if (!selectedOption) return;
    
    // Set selected answer for visual feedback
    setSelectedAnswerId(selectedOptionId);
    
    // Safety warnings disabled as requested
    // if (selectedOption?.crisis || currentQuestion.crisis) {
    //   setShowSafetyAlert(true);
    //   return;
    // }

    const timeToAnswer = Date.now() - questionStartTime;
    const newResponse: SurveyResponse = {
      questionId: currentQuestion.id,
      selectedOptionId,
      question: currentQuestion,
      selectedOption,
      timestamp: Date.now()
    };

    const newResponses = [...responses, newResponse];
    setResponses(newResponses);

    // Don't save to database yet - collect all answers first
    // They'll be saved in bulk when user submits the survey
    
    // Handle adaptive branching
    handleBranching(selectedOption, newResponses);

    // Auto-advance or complete after showing selection
    setTimeout(() => {
      setSelectedAnswerId(''); // Clear selection for next question
      if (currentQuestionIndex < currentQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setQuestionStartTime(Date.now());
      } else {
        completeAssessment(newResponses);
      }
    }, 800);
  };

  const handleTextAnswer = (text: string) => {
    const currentQuestion = currentQuestions[currentQuestionIndex];
    
    const newResponse: SurveyResponse = {
      questionId: currentQuestion.id,
      selectedOptionId: 'text_input',
      question: currentQuestion,
      selectedOption: { id: 'text_input', label: text, score: 0, tags: currentQuestion.tags || [] },
      timestamp: Date.now()
    };

    const newResponses = [...responses, newResponse];
    setResponses(newResponses);

    // Auto-advance or complete
    setTimeout(() => {
      if (currentQuestionIndex < currentQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        completeAssessment(newResponses);
      }
    }, 300);
  };

  const completeAssessment = async (finalResponses: SurveyResponse[]) => {
    try {
      console.log('🚀 Starting survey submission...');
      
      // STEP 1: Create user in database and get unique key
      const createUserResult = await dbService.createUser(selectedCategory);
      
      if (!createUserResult.success || !createUserResult.user) {
        throw new Error('Failed to create user: ' + createUserResult.error);
      }
      
      const generatedUserKey = createUserResult.user.user_key;
      console.log('✅ User created with key:', generatedUserKey);
      setUserKey(generatedUserKey);
      
      // STEP 2: Calculate scores from responses
      const results = calculateSurveyScore(finalResponses, surveyData);
      console.log('📊 Scores calculated:', results);
      
      // STEP 3: Prepare questions and answers for database
      const questionsAnswers: QuestionAnswer[] = finalResponses.map(response => ({
        question_id: response.questionId,
        question_text: response.question.text,
        answer_id: response.selectedOptionId,
        answer_text: response.selectedOption.label,
        score: response.selectedOption.score,
        tags: response.selectedOption.tags || [],
        weight: response.question.weight || 1
      }));
      
      // STEP 4: Save complete survey submission
      const totalDuration = Math.floor((Date.now() - startTime) / 1000); // Convert to seconds
      
      const submissionResult = await dbService.saveSurveySubmission(
        generatedUserKey,
        selectedCategory,
        questionsAnswers,
        results,
        totalDuration
      );
      
      if (!submissionResult.success) {
        throw new Error('Failed to save survey: ' + submissionResult.error);
      }
      
      console.log('✅ Survey submission saved successfully!');
      
      // STEP 5: Store results locally for immediate display (optional fallback)
      const assessmentResults = {
        userKey: generatedUserKey,
        category: selectedCategory,
        responses: finalResponses,
        results,
        completedAt: new Date().toISOString()
      };

      sessionStorage.setItem('love-lens-results', JSON.stringify(assessmentResults));
      localStorage.setItem(`love-lens-key-${generatedUserKey}`, JSON.stringify(assessmentResults));
      
      console.log('🎉 Survey completed successfully!');
      setIsCompleted(true);
      
    } catch (error: any) {
      console.error('❌ Error completing survey:', error);
      alert('There was an error saving your survey. Please try again.\n\nError: ' + error.message);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      // Remove the last response
      setResponses(responses.slice(0, -1));
    } else if (currentStep > 0) {
      setCurrentStep(0);
      setSelectedCategory('');
      setResponses([]);
    }
  };

  const progress = currentStep === 0 ? 0 : ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
  const currentQuestion = currentQuestions[currentQuestionIndex];

  // Safety Alert Component
  if (showSafetyAlert) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Safety First</h2>
            <p className="text-gray-600">Your safety is our priority. We're here to help.</p>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="p-4 bg-red-50 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2">Emergency Resources</h3>
              <div className="space-y-2 text-sm text-red-700">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>National Domestic Violence Hotline: 1-800-799-7233</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>Crisis Text Line: Text HOME to 741741</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => window.open('https://www.thehotline.org/', '_blank')}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-red-700 transition-colors"
            >
              Get Help Now
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Return to Safety
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Completion Screen
  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" fill="currentColor" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Assessment Complete!</h2>
            <p className="text-gray-600 mb-4">Your personalized relationship insights are ready.</p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-2">Your access key:</p>
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-3 flex items-center justify-between">
                <code className="text-lg font-mono text-gray-800 font-bold tracking-wider">{userKey}</code>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopyKey}
                  className={`ml-3 p-2 rounded-lg transition-all duration-200 ${
                    keyCopied 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {keyCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </motion.button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {keyCopied ? '✅ Copied to clipboard!' : 'Save this key to access your report anytime'}
              </p>
            </div>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Shield className="w-4 h-4" />
              <span>100% Anonymous & Secure</span>
            </div>
          </div>
          
          <Link href={`/report?key=${userKey}`}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              View My Report
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // Category Selection Screen
  if (currentStep === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex flex-col justify-center">
        <div className="max-w-md mx-auto px-4 w-full">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              Choose Your Status
            </h2>
            <p className="text-sm text-gray-600">
              Get personalized relationship insights
            </p>
          </motion.div>

          {/* Horizontal Category Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCategorySelect(category.id)}
                className="w-full bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50 group flex items-center space-x-4"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center text-xl group-hover:scale-110 transition-transform flex-shrink-0`}>
                  {category.icon}
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-gray-800">
                    {category.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {category.description}
                  </p>
                </div>
                <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </motion.button>
            ))}
          </motion.div>

          {/* Bottom Info */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center mt-6"
          >
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Shield className="w-3 h-3" />
                <span>Anonymous</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="w-3 h-3" />
                <span>5-7 Min</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Question Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="w-6 h-6 text-pink-500" fill="currentColor" />
              <span className="font-semibold text-gray-900">Love Lens</span>
            </div>
            <div className="text-sm text-gray-500">
              {currentQuestionIndex + 1} of {currentQuestions.length}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">Progress</span>
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-gray-400" />
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">Unlock Report</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 relative">
              <motion.div 
                className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
              {/* Locked report icon at the end */}
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                  progress >= 100 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {progress >= 100 ? (
                    <FileText className="w-3 h-3" />
                  ) : (
                    <Lock className="w-3 h-3" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {currentQuestion && (
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl shadow-lg p-6 md:p-8"
            >
              <h2 className="text-base md:text-xl font-bold text-gray-900 mb-4 md:mb-8 leading-snug">
                {currentQuestion.text}
              </h2>

              {currentQuestion.ui === "radio" && (
                <div className="space-y-2 md:space-y-3">
                  {currentQuestion.options.map((option) => (
                    <motion.button
                      key={option.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(option.id)}
                      className={`w-full p-3 md:p-4 text-left rounded-xl border-2 transition-all duration-200 min-h-[48px] md:min-h-[60px] flex items-center ${
                        selectedAnswerId === option.id
                          ? 'border-pink-500 bg-pink-50 text-pink-800'
                          : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50'
                      }`}
                    >
                      <span className="text-sm md:text-base font-medium">{option.label}</span>
                    </motion.button>
                  ))}
                </div>
              )}

              {currentQuestion.ui === "text" && (
                <div className="space-y-4">
                  <textarea
                    id="text-answer-input"
                    placeholder="Your answer (optional, max 80 characters)..."
                    maxLength={80}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none resize-none"
                    rows={3}
                  />
                  
                  {/* Submit Button - This is the last question */}
                  <button
                    onClick={() => {
                      const textarea = document.getElementById('text-answer-input') as HTMLTextAreaElement;
                      const answer = textarea?.value.trim() || '';
                      handleTextAnswer(answer);
                    }}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Submit Survey</span>
                  </button>
                  
                  <p className="text-xs text-gray-500 text-center">
                    This field is optional. Click Submit to complete your assessment.
                  </p>
                </div>
              )}

              {currentQuestion.help_text && (
                <p className="text-sm text-gray-500 mt-4">{currentQuestion.help_text}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrevious}
            disabled={currentStep === 0 && currentQuestionIndex === 0}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              currentStep === 0 && currentQuestionIndex === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-pink-600 hover:bg-white hover:shadow-md'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back</span>
          </motion.button>

          <div className="text-sm text-gray-500">
            Quick - this only takes 10s!
          </div>
        </div>
      </div>

      {/* Encouragement Messages */}
      <div className="fixed bottom-4 right-4 z-10">
        <AnimatePresence>
          {progress >= 25 && progress < 30 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-lg shadow-lg p-4 max-w-xs"
            >
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-700">Nice! You're unlocking deeper insights</span>
              </div>
            </motion.div>
          )}
          {progress >= 50 && progress < 55 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-lg shadow-lg p-4 max-w-xs"
            >
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Halfway there! Keep going</span>
              </div>
            </motion.div>
          )}
          {progress >= 75 && progress < 80 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-lg shadow-lg p-4 max-w-xs"
            >
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium text-gray-700">Almost done! Your insights await</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}