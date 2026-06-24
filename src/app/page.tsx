'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  Heart, 
  Shield, 
  Zap, 
  Users, 
  Star, 
  ArrowRight, 
  Lock, 
  BarChart3,
  Clock,
  TrendingUp,
  CheckCircle,
  Brain,
  Target,
  MessageCircle,
  Key,
  X,
  Clipboard,
  Eye
} from 'lucide-react'

export default function LoveLensHomepage() {
  const [mounted, setMounted] = useState(false)
  const [assessmentCount, setAssessmentCount] = useState(15247)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [showKeyPopup, setShowKeyPopup] = useState(false)
  const [userKey, setUserKey] = useState('')

  useEffect(() => {
    setMounted(true)
    
    // Realistic counter increment
    const countInterval = setInterval(() => {
      setAssessmentCount(prev => prev + Math.floor(Math.random() * 2) + 1)
    }, 8000)

    return () => clearInterval(countInterval)
  }, [])

  const handlePasteKey = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setUserKey(text)
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      console.log('Clipboard access not available')
    }
  }

  const handleSubmitKey = () => {
    if (userKey.trim()) {
      // For now, just redirect to results with the key
      // In the future, this will validate the key and load user data
      window.location.href = `/results?key=${userKey.trim()}`
    }
  }

  const testimonials = [
    {
      text: "Found out the average couple fights about money 3x per month. We fight 8x! Now I know why.",
      age: "28, together 2 years",
      insight: "Communication patterns"
    },
    {
      text: "Learned that most relationships last 2.5 years on average. We're at 4 years - feeling good!",
      age: "32, together 4 years", 
      insight: "Relationship longevity"
    },
    {
      text: "Discovered that 40% of couples break up over life goals. Finally understand our issues.",
      age: "26, together 1 year",
      insight: "Future alignment"
    }
  ]

  useEffect(() => {
    if (!mounted) return
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [mounted])

  const simpleInsights = [
    {
      icon: <Clock className="w-6 h-6 text-blue-600" />,
      question: "How long do most relationships actually last?",
      teaser: "The average might surprise you..."
    },
    {
      icon: <MessageCircle className="w-6 h-6 text-green-600" />,
      question: "What do couples fight about most?",
      teaser: "It's not what you think..."
    },
    {
      icon: <Heart className="w-6 h-6 text-red-500" />,
      question: "At what age do people find their life partner?",
      teaser: "See where you stand..."
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-purple-600" />,
      question: "What makes relationships last 10+ years?",
      teaser: "The secret factors..."
    },
    {
      icon: <Target className="w-6 h-6 text-orange-600" />,
      question: "What's the #1 reason couples break up?",
      teaser: "Avoid this common mistake..."
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-indigo-600" />,
      question: "How do you compare to other couples?",
      teaser: "Get your relationship score..."
    }
  ]

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 relative overflow-hidden">
      
      {/* Compact Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" fill="currentColor" />
              <span className="font-semibold text-lg sm:text-xl text-gray-900">Love Lens</span>
            </div>
            
            <button 
              onClick={() => setShowKeyPopup(true)}
              className="text-sm text-gray-900 hover:text-gray-700 flex items-center space-x-1 transition-colors border border-red-500 rounded-lg"
              style={{ paddingTop: '0.4rem', paddingBottom: '0.4rem', paddingLeft: '0.60rem', paddingRight: '0.60rem' }}
            >
              <Key className="w-4 h-4" />
              <span className="hidden sm:inline">Have a key?</span>
              <span className="sm:hidden">Key</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Floating Hearts */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-red-300/30"
            animate={{
              y: [0, -100, 0],
              x: [0, Math.sin(i) * 20, 0],
              rotate: [0, 360],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 8 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeInOut"
            }}
            style={{
              left: `${10 + (i * 8)}%`,
              top: `${20 + (i * 5)}%`,
            }}
          >
            <Heart size={16 + (i % 3) * 4} fill="currentColor" />
          </motion.div>
        ))}
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white/95 to-red-50/90 backdrop-blur-sm relative z-10 min-h-[100svh] sm:min-h-[80vh] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-20 w-full">
          <div className="text-center max-w-5xl mx-auto">
            
            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-3xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-4 sm:mb-8 leading-tight">
                Curious About Your
                <span className="text-red-500"> Relationship?</span>
              </h1>

              <p className="text-base sm:text-2xl text-gray-600 mb-4 sm:mb-6 leading-relaxed max-w-4xl mx-auto">
                <span className="font-semibold text-gray-900">Data-driven relationship insights.</span>
                <span className="hidden sm:inline"><br />Skip the astrology — get real insights based on 15,000+ relationship data points.</span>
                <span className="sm:hidden"> Real insights, not astrology.</span>
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5 sm:p-4 mb-6 sm:mb-10 max-w-2xl mx-auto">
                <div className="flex items-center justify-center space-x-2">
                  <Shield className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-xs sm:text-base text-blue-800 font-medium text-center">
                    <strong>100% Anonymous</strong><span className="hidden sm:inline"> — No name, contact, address or signup required</span>
                  </span>
                </div>
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-16"
            >
              <Link href="/survey">
                <button className="btn-primary text-xl sm:text-2xl px-12 sm:px-16 py-5 sm:py-6 group shadow-xl">
                  Take the Assessment
                  <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              
              {/* Feature pills — horizontal scroll on mobile, wrap on desktop */}
              <div className="mt-4 sm:mt-6">
                {/* Mobile: marquee ticker */}
                <div className="sm:hidden overflow-hidden relative">
                  <div className="flex animate-marquee whitespace-nowrap gap-6 text-sm text-gray-500">
                    {[
                      { icon: <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />, text: '3 minutes only' },
                      { icon: <Shield className="w-4 h-4 text-blue-500 flex-shrink-0" />, text: 'Completely anonymous' },
                      { icon: <Zap className="w-4 h-4 text-yellow-500 flex-shrink-0" />, text: 'Instant report' },
                      { icon: <Shield className="w-4 h-4 text-blue-600 flex-shrink-0" />, text: 'SSL Encrypted' },
                      { icon: <Lock className="w-4 h-4 text-green-600 flex-shrink-0" />, text: 'Privacy Certified' },
                      { icon: <BarChart3 className="w-4 h-4 text-purple-600 flex-shrink-0" />, text: 'Research Based' },
                      { icon: <Users className="w-4 h-4 text-orange-600 flex-shrink-0" />, text: '15,000+ Users' },
                      { icon: <Brain className="w-4 h-4 text-red-600 flex-shrink-0" />, text: 'AI Powered' },
                      // duplicate for seamless loop
                      { icon: <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />, text: '3 minutes only' },
                      { icon: <Shield className="w-4 h-4 text-blue-500 flex-shrink-0" />, text: 'Completely anonymous' },
                      { icon: <Zap className="w-4 h-4 text-yellow-500 flex-shrink-0" />, text: 'Instant report' },
                      { icon: <Shield className="w-4 h-4 text-blue-600 flex-shrink-0" />, text: 'SSL Encrypted' },
                      { icon: <Lock className="w-4 h-4 text-green-600 flex-shrink-0" />, text: 'Privacy Certified' },
                      { icon: <BarChart3 className="w-4 h-4 text-purple-600 flex-shrink-0" />, text: 'Research Based' },
                      { icon: <Users className="w-4 h-4 text-orange-600 flex-shrink-0" />, text: '15,000+ Users' },
                      { icon: <Brain className="w-4 h-4 text-red-600 flex-shrink-0" />, text: 'AI Powered' },
                    ].map((item, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 flex-shrink-0">
                        {item.icon}{item.text}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Desktop: original wrap layout */}
                <div className="hidden sm:flex flex-wrap justify-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                    3 minutes only
                  </div>
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-blue-500" />
                    Completely anonymous
                  </div>
                  <div className="flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                    Instant detailed report
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Trust Indicators & Certifications — desktop only (mobile uses marquee above) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="hidden sm:flex flex-wrap justify-center items-center gap-6 sm:gap-8 max-w-4xl mx-auto"
            >
              {/* Data Security */}
              <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-200">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-700 font-medium">SSL Encrypted</span>
              </div>
              
              {/* Privacy Certified */}
              <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-200">
                <Lock className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700 font-medium">Privacy Certified</span>
              </div>
              
              {/* Scientific Method */}
              <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-200">
                <BarChart3 className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-gray-700 font-medium">Research Based</span>
              </div>
              
              {/* User Count */}
              <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-200">
                <Users className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-gray-700 font-medium">15,000+ Users</span>
              </div>
              
              {/* AI Powered */}
              <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-200">
                <Brain className="w-4 h-4 text-red-600" />
                <span className="text-sm text-gray-700 font-medium">AI Powered</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Platform Explanation Section */}
      <section className="py-8 sm:py-16 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-6 sm:mb-12">
            <h2 className="text-xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-6">
              Data-Driven Insights, Not Astrology
            </h2>
            <div className="max-w-4xl mx-auto">
              <p className="hidden sm:block text-lg text-gray-600 mb-8">
                While others guess based on stars, we analyze real relationship data. Our AI-powered system
                gives you accurate insights based on patterns from thousands of successful and failed relationships.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 items-center">
            <div>
              <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-3 sm:mb-6">How It Works:</h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center sm:items-start space-x-3">
                  <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Answer 15-20 Questions</h4>
                    <p className="text-gray-500 text-xs sm:text-sm hidden sm:block">Quick assessment about your relationship patterns, no personal details needed</p>
                  </div>
                </div>

                <div className="flex items-center sm:items-start space-x-3">
                  <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">AI Analyzes Your Data</h4>
                    <p className="text-gray-500 text-xs sm:text-sm hidden sm:block">Our system compares your answers with 15,000+ relationship patterns</p>
                  </div>
                </div>

                <div className="flex items-center sm:items-start space-x-3">
                  <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Get Your Report + AI Chat</h4>
                    <p className="text-gray-500 text-xs sm:text-sm hidden sm:block">Detailed insights plus AI chatbot for personalized relationship advice</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 sm:mt-8 bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-center space-x-2 mb-1 sm:mb-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-green-800 text-sm">Your Privacy is Protected</span>
                </div>
                <ul className="text-xs sm:text-sm text-green-700 flex flex-wrap gap-x-4 gap-y-0.5 sm:block sm:space-y-1">
                  <li>• No personal info required</li>
                  <li>• Anonymous key system</li>
                  <li className="hidden sm:list-item">• Data never linked to you</li>
                </ul>
              </div>
            </div>

            {/* Compact Report Dashboard Preview */}
            <div className="relative max-w-lg mx-auto">
              <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                
                {/* Report Header */}
                <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-3">
                  <div className="text-center">
                    <h4 className="text-lg font-bold mb-1">Relationship Health Report</h4>
                    <p className="text-red-100 text-xs">Based on 15,000+ data points</p>
                  </div>
                </div>
                
                {/* Overall Score Section */}
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600 mb-1">6.8</div>
                    <div className="text-gray-600 text-xs mb-2">Overall Health Score</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                      <div className="bg-gradient-to-r from-red-400 to-orange-400 h-2 rounded-full" style={{width: '68%'}}></div>
                    </div>
                    <div className="text-xs text-gray-500">Higher than 43% of couples</div>
                  </div>
                </div>
                
                {/* Key Metrics Grid */}
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-red-50 rounded-lg p-3 border-l-3 border-red-400">
                      <div className="text-base font-bold text-red-600">67%</div>
                      <div className="text-xs text-red-800">Breakup Risk</div>
                      <div className="text-xs text-red-600">⚠️ High</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 border-l-3 border-blue-400">
                      <div className="text-base font-bold text-blue-600">8.4/10</div>
                      <div className="text-xs text-blue-800">Communication</div>
                      <div className="text-xs text-blue-600">✅ Excellent</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3 border-l-3 border-orange-400">
                      <div className="text-base font-bold text-orange-600">2.3 yrs</div>
                      <div className="text-xs text-orange-800">Duration</div>
                      <div className="text-xs text-orange-600">📊 Predicted</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 border-l-3 border-green-400">
                      <div className="text-base font-bold text-green-600">73%</div>
                      <div className="text-xs text-green-800">Trust Level</div>
                      <div className="text-xs text-green-600">✅ Strong</div>
                    </div>
                  </div>
                  
                  {/* AI Analysis */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200">
                    <div className="flex items-center mb-1">
                      <Brain className="w-3 h-3 text-purple-600 mr-1" />
                      <span className="font-semibold text-purple-900 text-xs">AI Analysis</span>
                    </div>
                    <p className="text-xs text-purple-800 leading-tight">
                      "Communication 94% compatible, but financial discussions trigger breakup patterns."
                    </p>
                  </div>
                  
                  {/* Comparative Data */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-gray-50 rounded p-2">
                      <div className="text-xs font-semibold text-gray-700">#427</div>
                      <div className="text-xs text-gray-500">Rank</div>
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <div className="text-xs font-semibold text-gray-700">1K+</div>
                      <div className="text-xs text-gray-500">Compared</div>
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <div className="text-xs font-semibold text-gray-700">15</div>
                      <div className="text-xs text-gray-500">Areas</div>
                    </div>
                  </div>
                </div>
                
                {/* Action Items */}
                <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 border-t border-gray-200">
                  <div className="text-center">
                    <h5 className="font-semibold text-gray-900 mb-1 text-xs">🎯 Next Steps</h5>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div>• Focus on financial communication</div>
                      <div>• Leverage humor compatibility (94%)</div>
                    </div>
                    <div className="mt-2 bg-white rounded-lg p-2 border">
                      <div className="flex items-center justify-center">
                        <MessageCircle className="w-3 h-3 text-purple-600 mr-1" />
                        <span className="text-xs text-purple-700 font-medium">AI Chatbot Available</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Preview Label */}
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                  📊 PREVIEW
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Discover Section */}
      <section className="py-12 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4">
              What Would You Like to Know?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get answers to the relationship questions you've always wondered about
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {simpleInsights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {insight.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {insight.question}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {insight.teaser}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Not Astrology Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
              Why Choose Data Over Astrology?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🔮</span>
                  </div>
                  <h3 className="font-bold text-gray-900">Astrology</h3>
                </div>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Based on birth date and star positions</li>
                  <li>• Generic predictions for everyone</li>
                  <li>• No scientific backing</li>
                  <li>• Vague, interpretable answers</li>
                  <li>• Same advice for millions of people</li>
                </ul>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Brain className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">Love Lens</h3>
                </div>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Based on your actual relationship patterns</li>
                  <li>• Personalized insights just for you</li>
                  <li>• AI-powered data analysis</li>
                  <li>• Specific, actionable advice</li>
                  <li>• Unique report based on your answers</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200">
              <p className="text-lg text-gray-700 mb-4">
                <strong>Get real solutions to real problems.</strong> Our AI chatbot gives you specific advice 
                based on your relationship data, not your zodiac sign.
              </p>
              <p className="text-sm text-gray-600">
                "My astrologer said Mercury was in retrograde. Love Lens told me exactly why we fight about money 
                and how to fix it." - Sarah, 28
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4">
              What People Discovered
            </h2>
            <p className="text-lg text-gray-600">Real insights from real people</p>
          </div>

          {/* Testimonial */}
          <div className="max-w-3xl mx-auto mb-12">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-50 rounded-xl p-6 sm:p-8"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 text-red-500" fill="currentColor" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 mb-3 italic">
                    "{testimonials[currentTestimonial].text}"
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{testimonials[currentTestimonial].age}</span>
                    <span className="font-medium text-red-600">
                      {testimonials[currentTestimonial].insight}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <Shield className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="font-semibold text-gray-900 text-sm">100% Anonymous</div>
              <div className="text-xs text-gray-600">No personal data stored</div>
            </div>
            
            <div className="text-center">
              <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="font-semibold text-gray-900 text-sm">Instant Results</div>
              <div className="text-xs text-gray-600">Get insights immediately</div>
            </div>
            
            <div className="text-center">
              <Brain className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="font-semibold text-gray-900 text-sm">Science-Based</div>
              <div className="text-xs text-gray-600">Research-backed insights</div>
            </div>
            
            <div className="text-center">
              <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="font-semibold text-gray-900 text-sm">15,000+ Users</div>
              <div className="text-xs text-gray-600">Trusted by thousands</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 bg-red-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6">
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-6">
            Ready to Discover Your Relationship Insights?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands who already know where they stand
          </p>
          
          <button className="btn-primary text-lg sm:text-xl px-8 sm:px-12 py-4 sm:py-5 mb-6">
            Start My Assessment
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
          
          {/* Genuine Offer */}
          <div className="bg-white rounded-lg p-4 border border-red-200 max-w-md mx-auto">
            <div className="text-sm text-gray-600 mb-1">Limited Time</div>
            <div className="font-semibold text-gray-900">Use code <span className="text-red-600">FIRST100</span> for free detailed report</div>
            <div className="text-xs text-gray-500 mt-1">Valid for first 100 users only</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="w-5 h-5 text-red-500" fill="currentColor" />
            <span className="font-semibold text-white">Love Lens</span>
          </div>
          <p className="text-sm mb-4">
            Understanding relationships through data and insights
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Contact</a>
          </div>
        </div>
      </footer>

      {/* Have Key Popup */}
      <AnimatePresence>
        {showKeyPopup && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md mx-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Key className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Access Your Report</h3>
                </div>
                <button 
                  onClick={() => setShowKeyPopup(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Explanation */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">What is your key? 🔑</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Your unique key is generated after completing the relationship assessment. 
                    It lets you access your personalized report and chat with our AI coach anytime.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800">
                      <strong>Where to find it:</strong> Your key appears on the completion page after taking the assessment.
                    </p>
                  </div>
                </div>

                {/* Key Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Your Key
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={userKey}
                      onChange={(e) => setUserKey(e.target.value)}
                      placeholder="e.g., LL-ABC123-XYZ789"
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    />
                    <button
                      onClick={handlePasteKey}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Paste from clipboard"
                    >
                      <Clipboard className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={handleSubmitKey}
                    disabled={!userKey.trim()}
                    className="w-full btn-primary py-3 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Eye className="w-5 h-5" />
                    <span>View My Report</span>
                  </button>
                  
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-2">Don't have a key yet?</p>
                    <button
                      onClick={() => {
                        setShowKeyPopup(false)
                        // Scroll to CTA or redirect to survey
                        document.querySelector('.btn-primary')?.scrollIntoView({ behavior: 'smooth' })
                      }}
                      className="text-red-600 hover:text-red-700 font-medium text-sm transition-colors"
                    >
                      Take Assessment First →
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}