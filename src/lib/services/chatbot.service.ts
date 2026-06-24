/**
 * Love Lens AI Chatbot Service
 * Handles AI-powered relationship guidance with full context
 */

import { dbService, ChatMessage } from './db.service';

// =====================================================
// TYPES
// =====================================================

export interface ChatContext {
  userKey: string;
  category: string;
  surveyData: {
    questions: Array<{
      question: string;
      answer: string;
      score: number;
    }>;
    scores: {
      overall: number;
      communication: number;
      trust: number;
      intimacy: number;
      conflict: number;
      futureAlignment: number;
      finances: number | null;
    };
    archetype: string;
    flags: {
      hasAbuseWarning: boolean;
      hasTrustIssues: boolean;
      hasConflictIssues: boolean;
    };
  };
}

export interface ChatResponse {
  success: boolean;
  message?: string;
  error?: string;
  tokens?: number;
  needsHelp?: boolean;
}

// =====================================================
// SYSTEM PROMPTS
// =====================================================

const SYSTEM_PROMPT = `You are the Love Lens Coach — a sharp, funny, and genuinely helpful relationship advisor built into the Love Lens platform. Love Lens is a data-driven relationship assessment app where users answer 15-20 questions and get a scored report across 6 dimensions: Communication, Trust, Intimacy, Conflict Resolution, Future Alignment, and Financial Harmony. Each score is out of 10.

You have the user's full report in front of you. Your job is to help them understand it, act on it, and feel better about their situation — all in a conversational, human way.

## YOUR PERSONALITY:
- You're like a smart, slightly sarcastic best friend who happens to know a lot about relationships
- Dry wit and light dark humor are welcome — think "your communication score is 0.0 which is... a choice 😬" not mean, just real
- You're direct and honest, not preachy or clinical
- You genuinely care about helping, not just sounding smart

## HOW TO RESPOND:
- Keep replies SHORT — 2-3 sentences max
- NO markdown formatting (no **, no *, no bullet points)
- Use 1-2 emojis naturally, not forced
- NEVER repeat the same score or fact twice across the conversation — vary your references
- If a score is 0.0, mention it ONCE with context, then move on to actionable advice
- Match the user's energy: if they're frustrated, acknowledge it first; if they're casual, be casual back
- If they ask something off-topic (like "2+3"), answer briefly then pivot back naturally
- If they're rude or venting, don't lecture — just acknowledge and redirect warmly
- End with a question only when it feels natural, not every single time

## CONVERSATION FLOW:
- First message: warm welcome + one interesting insight from their report
- Follow-up questions: give actual advice, not just more questions back
- If they ask "what now" or "guide me": give a CONCRETE next step, not a vague suggestion
- If they keep asking the same thing: you're not giving good enough answers — try a different angle

## CONCRETE ADVICE EXAMPLES (use these patterns):
- Communication 0.0: "Try the 10-minute rule — no phones, just talk about one thing that bothered you this week. Low stakes, high impact."
- Trust issues: "Trust rebuilds through small consistent actions, not big gestures. What's one promise you can keep this week?"
- Financial conflict: "Money fights are usually about control, not cash. Try a shared 'fun fund' — ₹500 each, no questions asked."
- Future alignment 0.0: "You two need a 'where are we going' conversation. Not marriage talk — just: same city in 2 years? Same vibe?"

## SAFETY:
- If abuse, violence, or self-harm comes up: drop all humor immediately, be serious, share crisis resources (988 / 1-800-799-7233)
- Never advise staying in an abusive situation

## NEVER:
- Repeat the same score or phrase more than once in the conversation
- Ask a question when the user clearly wants advice, not more questions
- Be generic — always tie advice to their specific scores and situation
- Write paragraphs

The user's full relationship profile is below. Read it carefully before responding.`;

// =====================================================
// CHATBOT SERVICE CLASS
// =====================================================

export class ChatbotService {
  // Google Gemini API — free tier: 1500 requests/day, 15 RPM
  // Get your free key at: https://aistudio.google.com/apikey
  private geminiApiKey: string = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
  private geminiEndpoint: string = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

  setApiKey(apiKey: string) {
    this.geminiApiKey = apiKey;
  }
  
  /**
   * Build context from user's survey data
   */
  private async buildContext(userKey: string): Promise<{ success: boolean; context?: ChatContext; error?: string }> {
    try {
      // Get user's survey submission
      const surveyResult = await dbService.getSurveyByUserKey(userKey);
      if (!surveyResult.success || !surveyResult.submission) {
        return { success: false, error: 'Survey not found. Please complete the survey first.' };
      }
      
      const submission = surveyResult.submission;
      
      // Extract questions and answers
      const questions = (submission.questions_answers as any[]).map((qa: any) => ({
        question: qa.question_text,
        answer: qa.answer_text,
        score: qa.score
      }));
      
      // Build context
      const context: ChatContext = {
        userKey,
        category: submission.category,
        surveyData: {
          questions,
          scores: {
            overall: submission.normalized_score,
            communication: submission.communication_score || 0,
            trust: submission.trust_score || 0,
            intimacy: submission.intimacy_score || 0,
            conflict: submission.conflict_score || 0,
            futureAlignment: submission.future_alignment_score || 0,
            finances: submission.finances_score || null
          },
          archetype: submission.relationship_archetype || 'Not yet determined',
          flags: {
            hasAbuseWarning: submission.has_abuse_flag,
            hasTrustIssues: submission.has_trust_issues,
            hasConflictIssues: submission.has_conflict_issues
          }
        }
      };
      
      return { success: true, context };
    } catch (error: any) {
      console.error('Error building context:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Build context summary for AI
   */
  private buildContextSummary(context: ChatContext): string {
    const { surveyData } = context;
    
    let summary = `## USER'S RELATIONSHIP PROFILE\n\n`;
    summary += `**Relationship Type:** ${this.formatCategory(context.category)}\n`;
    summary += `**Overall Relationship Score:** ${surveyData.scores.overall.toFixed(1)}/10\n`;
    summary += `**Relationship Archetype:** ${surveyData.archetype}\n\n`;
    
    summary += `### Detailed Scores:\n`;
    summary += `- Communication: ${surveyData.scores.communication.toFixed(1)}/10\n`;
    summary += `- Trust: ${surveyData.scores.trust.toFixed(1)}/10\n`;
    summary += `- Intimacy: ${surveyData.scores.intimacy.toFixed(1)}/10\n`;
    summary += `- Conflict Resolution: ${surveyData.scores.conflict.toFixed(1)}/10\n`;
    summary += `- Future Alignment: ${surveyData.scores.futureAlignment.toFixed(1)}/10\n`;
    if (surveyData.scores.finances) {
      summary += `- Financial Harmony: ${surveyData.scores.finances.toFixed(1)}/10\n`;
    }
    summary += `\n`;
    
    // Add flags if present
    if (surveyData.flags.hasAbuseWarning) {
      summary += `⚠️ **CRITICAL: User has indicated abuse or safety concerns in their responses.**\n\n`;
    }
    if (surveyData.flags.hasTrustIssues) {
      summary += `⚠️ User has significant trust issues in their relationship.\n\n`;
    }
    if (surveyData.flags.hasConflictIssues) {
      summary += `⚠️ User struggles with conflict resolution.\n\n`;
    }
    
    // Add selected Q&A (top concerns)
    summary += `### Key Survey Responses:\n`;
    const lowScoreAnswers = surveyData.questions
      .filter(q => q.score <= 2)
      .slice(0, 5);
    
    if (lowScoreAnswers.length > 0) {
      summary += `**Areas of Concern:**\n`;
      lowScoreAnswers.forEach(qa => {
        summary += `- Q: "${qa.question}"\n`;
        summary += `  A: "${qa.answer}" (Score: ${qa.score}/4)\n`;
      });
      summary += `\n`;
    }
    
    const highScoreAnswers = surveyData.questions
      .filter(q => q.score >= 3)
      .slice(0, 3);
    
    if (highScoreAnswers.length > 0) {
      summary += `**Strengths:**\n`;
      highScoreAnswers.forEach(qa => {
        summary += `- Q: "${qa.question}"\n`;
        summary += `  A: "${qa.answer}" (Score: ${qa.score}/4)\n`;
      });
    }
    
    return summary;
  }
  
  /**
   * Send message to AI and get response
   */
  async sendMessage(userKey: string, userMessage: string): Promise<ChatResponse> {
    try {
      // Build context
      const contextResult = await this.buildContext(userKey);
      if (!contextResult.success || !contextResult.context) {
        return { success: false, error: contextResult.error };
      }

      const context = contextResult.context;
      const contextSummary = this.buildContextSummary(context);

      // Get conversation history
      const chatResult = await dbService.getChatConversation(userKey);
      const previousMessages = chatResult.conversation?.messages || [];

      // Detect crisis keywords
      const crisisKeywords = ['suicide', 'kill myself', 'end my life', 'self-harm', 'hurt myself', 'abuse', 'violence', 'hit me', 'scared'];
      const hasCrisisKeyword = crisisKeywords.some(kw => userMessage.toLowerCase().includes(kw));

      // Build Gemini contents array — enforce strict user/model alternation
      const rawMessages = previousMessages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }));

      // Deduplicate consecutive same-role messages (Gemini requires strict alternation)
      const dedupedMessages: { role: string; parts: { text: string }[] }[] = [];
      for (const msg of rawMessages) {
        if (dedupedMessages.length > 0 && dedupedMessages[dedupedMessages.length - 1].role === msg.role) {
          // Merge into previous message
          dedupedMessages[dedupedMessages.length - 1].parts[0].text += '\n' + msg.parts[0].text;
        } else {
          dedupedMessages.push(msg);
        }
      }

      // Ensure history starts with a user message
      while (dedupedMessages.length > 0 && dedupedMessages[0].role !== 'user') {
        dedupedMessages.shift();
      }

      // Keep last 10 messages to avoid token overflow
      const recentMessages = dedupedMessages.slice(-10);

      const contents = [
        ...recentMessages,
        { role: 'user', parts: [{ text: userMessage }] }
      ];

      // Call Gemini API
      const response = await fetch(
        `${this.geminiEndpoint}?key=${this.geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: SYSTEM_PROMPT + '\n\n' + contextSummary }]
            },
            contents,
            generationConfig: {
              temperature: 0.8,
              maxOutputTokens: 1500,
              topP: 0.95,
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API error:', errorData);
        return {
          success: false,
          error: `AI service error: ${errorData.error?.message || 'Unknown error'}`
        };
      }

      const data = await response.json();
      const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text
        || "Hmm, I lost my train of thought 😅 Try again?";
      const tokensUsed = data.usageMetadata?.totalTokenCount || 0;
      
      // Save user message to database
      await dbService.addChatMessage(userKey, {
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString(),
        tokens: 0
      });
      
      // Save AI response to database
      await dbService.addChatMessage(userKey, {
        role: 'assistant',
        content: aiMessage,
        timestamp: new Date().toISOString(),
        tokens: tokensUsed
      });
      
      return {
        success: true,
        message: aiMessage,
        tokens: tokensUsed,
        needsHelp: hasCrisisKeyword || context.surveyData.flags.hasAbuseWarning
      };
      
    } catch (error: any) {
      console.error('Error in chatbot service:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred'
      };
    }
  }
  
  /**
   * Get chat history for a user
   */
  async getChatHistory(userKey: string): Promise<{ success: boolean; messages?: ChatMessage[]; error?: string }> {
    try {
      const chatResult = await dbService.getChatConversation(userKey);
      if (!chatResult.success) {
        return { success: false, error: chatResult.error };
      }
      
      return {
        success: true,
        messages: chatResult.conversation?.messages || []
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Clear chat history (start new conversation)
   */
  async clearChatHistory(userKey: string): Promise<{ success: boolean; error?: string }> {
    try {
      // For now, we'll just note this - actual implementation would update the database
      // In a real system, you might want to archive old conversations rather than delete
      console.log(`Chat history clear requested for ${userKey}`);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
  
  // =====================================================
  // HELPER METHODS
  // =====================================================
  
  private formatCategory(category: string): string {
    const labels: Record<string, string> = {
      single: 'Dating / New Relationship',
      committed: 'Committed Relationship',
      engaged: 'Engaged',
      married: 'Married',
      recently_ended: 'Recently Ended Relationship'
    };
    return labels[category] || category;
  }
}

// Export singleton instance
export const chatbotService = new ChatbotService();

