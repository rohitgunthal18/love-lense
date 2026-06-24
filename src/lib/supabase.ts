import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rigenfuxkrlfxqsfczgh.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpZ2VuZnV4a3JsZnhxc2ZjemdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyNTM3ODMsImV4cCI6MjA5NTgyOTc4M30.SegB6dRIwUEKuq2zVbXcIA-b6AQluRJyBqZZQAuYPsQ'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)


// Types for database
export interface DatabaseUser {
  id: string
  user_key: string
  created_at: string
  updated_at: string
  last_active: string
  device_type?: string
  os_name?: string
  browser_name?: string
  country_name?: string
  city_name?: string
  survey_completed: boolean
  survey_completed_at?: string
  report_unlocked: boolean
  report_unlocked_at?: string
  unlock_method?: 'whatsapp_share' | 'coupon' | 'admin_override'
  ai_conversations_count: number
  total_sessions: number
  total_page_views: number
  ip_address_hash?: string
  user_agent_hash?: string
  session_id?: string
}

export interface SurveySubmission {
  id: string
  user_id: string
  submission_key: string
  category_key: string
  started_at: string
  completed_at?: string
  total_duration?: number
  is_completed: boolean
  completion_percentage: number
  questions_answered: number
  questions_skipped: number
  raw_score: number
  max_possible_score: number
  normalized_score: number
  has_crisis_flags: boolean
  has_trust_issues: boolean
  needs_professional_help: boolean
}

export interface SurveyResponse {
  id: string
  submission_id: string
  user_id: string
  question_id: string
  selected_option_id?: string
  text_response?: string
  numeric_response?: number
  answered_at: string
  time_to_answer?: number
  is_skipped: boolean
  points_awarded: number
  weighted_points: number
}

export interface SurveySubscores {
  id: string
  submission_id: string
  communication_score: number
  trust_score: number
  intimacy_score: number
  conflict_resolution_score: number
  future_alignment_score: number
  financial_compatibility_score: number
  breakup_risk_percentage: number
  stability_index: number
  growth_potential: number
  better_than_percentage: number
  relationship_archetype?: string
  calculated_at: string
}

export interface ChatSession {
  id: string
  user_id: string
  session_key: string
  started_at: string
  last_message_at: string
  ended_at?: string
  is_active: boolean
  total_messages: number
  user_messages: number
  ai_messages: number
  total_duration: number
  ai_model_used: string
  primary_topic?: string
  conversation_sentiment?: string
  crisis_level: number
  professional_referral_triggered: boolean
}

export interface ChatMessage {
  id: string
  session_id: string
  sender_type: 'user' | 'ai' | 'system'
  message_content: string
  message_timestamp: string
  ai_model?: string
  ai_tokens_used?: number
  ai_response_time?: number
  message_sentiment?: string
  contains_crisis_keywords: boolean
  safety_check_passed: boolean
}

// Helper functions
export const hashForPrivacy = (input: string): string => {
  // Simple hash function for client-side (server-side will use proper SHA256)
  let hash = 0
  if (input.length === 0) return hash.toString()
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16)
}

export const generateUserKey = (): string => {
  const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789'
  let result = 'LOVE-'
  for (let i = 0; i < 8; i++) {
    if (i === 4) result += '-'
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export const generateSessionKey = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'chat_'
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Device detection helpers
export const getDeviceInfo = () => {
  if (typeof window === 'undefined') return {}
  
  const userAgent = navigator.userAgent
  const platform = navigator.platform
  
  // Device type detection
  let deviceType = 'desktop'
  if (/Mobi|Android/i.test(userAgent)) {
    deviceType = 'mobile'
  } else if (/Tablet|iPad/i.test(userAgent)) {
    deviceType = 'tablet'
  }
  
  // OS detection
  let osName = 'Unknown'
  if (userAgent.indexOf('Windows') > -1) osName = 'Windows'
  else if (userAgent.indexOf('Mac') > -1) osName = 'macOS'
  else if (userAgent.indexOf('Linux') > -1) osName = 'Linux'
  else if (userAgent.indexOf('Android') > -1) osName = 'Android'
  else if (userAgent.indexOf('iPhone') > -1 || userAgent.indexOf('iPad') > -1) osName = 'iOS'
  
  // Browser detection
  let browserName = 'Unknown'
  if (userAgent.indexOf('Chrome') > -1) browserName = 'Chrome'
  else if (userAgent.indexOf('Firefox') > -1) browserName = 'Firefox'
  else if (userAgent.indexOf('Safari') > -1) browserName = 'Safari'
  else if (userAgent.indexOf('Edge') > -1) browserName = 'Edge'
  
  return {
    deviceType,
    osName,
    browserName,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    userAgent: hashForPrivacy(userAgent),
    platform
  }
}
