/**
 * Love Lens Database Service
 * Handles all database operations for users, surveys, and chat
 */

import { supabase, generateUserKey, getDeviceInfo } from '../supabase';

// =====================================================
// TYPES
// =====================================================

export interface User {
  id: string;
  user_key: string;
  category: string;
  created_at: string;
  survey_completed: boolean;
  survey_completed_at?: string;
  report_unlocked: boolean;
  device_type?: string;
  os_name?: string;
  browser_name?: string;
}

export interface SurveySubmission {
  id: string;
  user_id: string;
  user_key: string;
  category: string;
  created_at: string;
  completed_at?: string;
  questions_answers: QuestionAnswer[];
  raw_score: number;
  max_possible_score: number;
  normalized_score: number;
  communication_score?: number;
  trust_score?: number;
  intimacy_score?: number;
  conflict_score?: number;
  future_alignment_score?: number;
  finances_score?: number;
  breakup_risk_score?: number;
  breakup_risk_label?: string;
  has_abuse_flag: boolean;
  has_trust_issues: boolean;
  has_conflict_issues: boolean;
  has_intimacy_issues: boolean;
  has_finance_issues: boolean;
  relationship_archetype?: string;
  percentile_rank?: number;
  strengths?: string[];
  concerns?: string[];
  recommendations?: string[];
  total_questions: number;
  time_to_complete_seconds?: number;
}

export interface QuestionAnswer {
  question_id: string;
  question_text: string;
  answer_id: string;
  answer_text: string;
  score: number;
  tags: string[];
  weight: number;
}

export interface ChatConversation {
  id: string;
  user_id: string;
  user_key: string;
  created_at: string;
  messages: ChatMessage[];
  total_messages: number;
  total_tokens_used: number;
  ai_model: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  tokens?: number;
}

export interface GlobalStats {
  total_users: number;
  completed_surveys: number;
  avg_overall_score: number;
  avg_communication_score: number;
  avg_trust_score: number;
  avg_intimacy_score: number;
  avg_conflict_score: number;
  avg_future_alignment_score: number;
  avg_finances_score: number;
  category: string;
}

// =====================================================
// DATABASE SERVICE
// =====================================================

export class DatabaseService {
  
  // =====================================================
  // USER OPERATIONS
  // =====================================================
  
  /**
   * Create a new user with generated key
   */
  async createUser(category: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const userKey = generateUserKey();
      const deviceInfo = getDeviceInfo();
      
      const { data, error } = await supabase
        .from('users')
        .insert({
          user_key: userKey,
          category: category,
          device_type: deviceInfo.deviceType,
          os_name: deviceInfo.osName,
          browser_name: deviceInfo.browserName,
          survey_completed: false,
          report_unlocked: true, // Auto-unlock for now
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating user:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true, user: data };
    } catch (error: any) {
      console.error('Exception creating user:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Get user by user_key
   */
  async getUserByKey(userKey: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_key', userKey)
        .single();
      
      if (error) {
        console.error('Error fetching user:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true, user: data };
    } catch (error: any) {
      console.error('Exception fetching user:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Update user's last active timestamp
   */
  async updateUserActivity(userKey: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ last_active: new Date().toISOString() })
        .eq('user_key', userKey);
      
      if (error) {
        console.error('Error updating user activity:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Mark survey as completed
   */
  async markSurveyCompleted(userKey: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          survey_completed: true,
          survey_completed_at: new Date().toISOString()
        })
        .eq('user_key', userKey);
      
      if (error) {
        console.error('Error marking survey completed:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
  
  // =====================================================
  // SURVEY OPERATIONS
  // =====================================================
  
  /**
   * Save complete survey submission with scores
   */
  async saveSurveySubmission(
    userKey: string,
    category: string,
    questionsAnswers: QuestionAnswer[],
    scores: any,
    timeToComplete?: number
  ): Promise<{ success: boolean; submission?: SurveySubmission; error?: string }> {
    try {
      // Get user first
      const userResult = await this.getUserByKey(userKey);
      if (!userResult.success || !userResult.user) {
        return { success: false, error: 'User not found' };
      }
      
      const { data, error } = await supabase
        .from('survey_submissions')
        .insert({
          user_id: userResult.user.id,
          user_key: userKey,
          category: category,
          completed_at: new Date().toISOString(),
          questions_answers: questionsAnswers,
          raw_score: scores.raw_score,
          max_possible_score: scores.max_possible,
          normalized_score: scores.normalized_score,
          communication_score: scores.subscores?.communication,
          trust_score: scores.subscores?.trust,
          intimacy_score: scores.subscores?.intimacy,
          conflict_score: scores.subscores?.conflict,
          future_alignment_score: scores.subscores?.future_alignment,
          finances_score: scores.subscores?.finances,
          breakup_risk_score: scores.breakup_risk?.score,
          breakup_risk_label: scores.breakup_risk?.label,
          has_abuse_flag: scores.flags?.abuse_flag || false,
          has_trust_issues: scores.flags?.trust_issue || false,
          has_conflict_issues: scores.flags?.conflict_high_freq || false,
          has_intimacy_issues: scores.flags?.intimacy_low || false,
          has_finance_issues: scores.flags?.finance_conflict || false,
          total_questions: questionsAnswers.length,
          time_to_complete_seconds: timeToComplete
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error saving survey submission:', error);
        return { success: false, error: error.message };
      }
      
      // Mark user survey as completed
      await this.markSurveyCompleted(userKey);
      
      return { success: true, submission: data };
    } catch (error: any) {
      console.error('Exception saving survey:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Get survey submission by user key
   */
  async getSurveyByUserKey(userKey: string): Promise<{ success: boolean; submission?: SurveySubmission; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('survey_submissions')
        .select('*')
        .eq('user_key', userKey)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        console.error('Error fetching survey:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true, submission: data };
    } catch (error: any) {
      console.error('Exception fetching survey:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Update survey submission with report insights
   */
  async updateSurveyInsights(
    userKey: string,
    insights: {
      relationship_archetype?: string;
      percentile_rank?: number;
      strengths?: string[];
      concerns?: string[];
      recommendations?: string[];
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('survey_submissions')
        .update(insights)
        .eq('user_key', userKey);
      
      if (error) {
        console.error('Error updating insights:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
  
  // =====================================================
  // CHAT OPERATIONS
  // =====================================================
  
  /**
   * Create new chat conversation
   */
  async createChatConversation(userKey: string): Promise<{ success: boolean; conversation?: ChatConversation; error?: string }> {
    try {
      // Get user first
      const userResult = await this.getUserByKey(userKey);
      if (!userResult.success || !userResult.user) {
        return { success: false, error: 'User not found' };
      }
      
      const { data, error } = await supabase
        .from('chat_conversations')
        .insert({
          user_id: userResult.user.id,
          user_key: userKey,
          messages: [],
          total_messages: 0,
          total_tokens_used: 0,
          ai_model: 'gpt-4'
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating chat:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true, conversation: data };
    } catch (error: any) {
      console.error('Exception creating chat:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Get or create chat conversation for user
   */
  async getChatConversation(userKey: string): Promise<{ success: boolean; conversation?: ChatConversation; error?: string }> {
    try {
      // Try to get existing conversation
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_key', userKey)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
        console.error('Error fetching chat:', error);
        return { success: false, error: error.message };
      }
      
      // If conversation exists, return it
      if (data) {
        return { success: true, conversation: data };
      }
      
      // Otherwise create new conversation
      return await this.createChatConversation(userKey);
    } catch (error: any) {
      console.error('Exception getting chat:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Add message to chat conversation
   */
  async addChatMessage(
    userKey: string,
    message: ChatMessage
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get current conversation
      const chatResult = await this.getChatConversation(userKey);
      if (!chatResult.success || !chatResult.conversation) {
        return { success: false, error: 'Chat conversation not found' };
      }
      
      const conversation = chatResult.conversation;
      const updatedMessages = [...(conversation.messages || []), message];
      
      const { error } = await supabase
        .from('chat_conversations')
        .update({
          messages: updatedMessages,
          total_messages: updatedMessages.length,
          total_tokens_used: conversation.total_tokens_used + (message.tokens || 0),
          updated_at: new Date().toISOString()
        })
        .eq('user_key', userKey)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error('Error adding message:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Exception adding message:', error);
      return { success: false, error: error.message };
    }
  }
  
  // =====================================================
  // ANALYTICS & STATS
  // =====================================================
  
  /**
   * Get global statistics
   */
  async getGlobalStats(): Promise<{ success: boolean; stats?: GlobalStats[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('global_stats')
        .select('*');
      
      if (error) {
        console.error('Error fetching global stats:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true, stats: data || [] };
    } catch (error: any) {
      console.error('Exception fetching stats:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Get stats for specific category
   */
  async getCategoryStats(category: string): Promise<{ success: boolean; stats?: any; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('category_stats')
        .select('*')
        .eq('category', category)
        .single();
      
      if (error) {
        console.error('Error fetching category stats:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true, stats: data };
    } catch (error: any) {
      console.error('Exception fetching category stats:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Calculate percentile rank for a user's score
   */
  async calculatePercentileRank(
    normalizedScore: number,
    category: string
  ): Promise<{ success: boolean; percentile?: number; error?: string }> {
    try {
      // Get all scores in the same category
      const { data, error } = await supabase
        .from('survey_submissions')
        .select('normalized_score')
        .eq('category', category)
        .not('normalized_score', 'is', null);
      
      if (error) {
        console.error('Error calculating percentile:', error);
        return { success: false, error: error.message };
      }
      
      if (!data || data.length === 0) {
        return { success: true, percentile: 50 }; // Default to median if no data
      }
      
      // Count how many scores are below this score
      const scoresBelow = data.filter(s => s.normalized_score < normalizedScore).length;
      const percentile = Math.round((scoresBelow / data.length) * 100);
      
      return { success: true, percentile };
    } catch (error: any) {
      console.error('Exception calculating percentile:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export const dbService = new DatabaseService();

