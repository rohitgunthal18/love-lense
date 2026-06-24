/**
 * Love Lens Survey Scoring System
 * Based on GPT-5 Thinking mini logic with 0-4 scoring and normalized 1-10 output
 */

export class SurveyScorer {
  constructor() {
    this.tagGroups = {
      communication: ['communication', 'listening', 'openness'],
      trust: ['trust', 'trust_history', 'respect', 'honesty'],
      intimacy: ['emotional_intimacy', 'sexual_intimacy', 'physical_closeness', 'romance'],
      conflict: ['conflict', 'conflict_resolution', 'stability'],
      future_alignment: ['future_alignment', 'goals_alignment', 'kids_alignment', 'long_term_commitment'],
      finances: ['financial_conflict', 'financial_transparency', 'finance_planning']
    };
  }

  /**
   * Calculate comprehensive relationship score from survey responses
   * @param {Array} responses - Array of {questionId, selectedOptionId, question, selectedOption}
   * @param {Object} surveyData - Survey metadata from surveys.json
   * @returns {Object} Complete scoring results
   */
  calculateScore(responses, surveyData) {
    const results = {
      raw_score: 0,
      max_possible: 0,
      normalized_score: 0,
      subscores: {},
      flags: {
        abuse_flag: false,
        trust_issue: false,
        conflict_high_freq: false,
        intimacy_low: false,
        finance_conflict: false,
        breakup_risk_flag: false
      },
      breakup_risk: {
        score: 0,
        label: 'Low'
      },
      question_count: responses.length,
      completion_percentage: 0
    };

    // Calculate raw scores
    let tagScores = {};
    let tagMaxScores = {};

    responses.forEach(response => {
      const question = this.findQuestion(response.questionId, surveyData);
      if (!question) return;

      const option = question.options.find(opt => opt.id === response.selectedOptionId);
      if (!option) return;

      let score = option.score;
      const weight = question.weight || 1;

      // Handle inverted scoring
      if (question.inverted || option.inverted) {
        score = 4 - score;
      }

      // Apply weight
      const weightedScore = score * weight;
      const maxWeightedScore = 4 * weight;

      results.raw_score += weightedScore;
      results.max_possible += maxWeightedScore;

      // Handle crisis flags
      if (option.crisis || question.crisis) {
        results.flags.abuse_flag = true;
      }

      // Handle trust issues
      if (option.trust_issue) {
        results.flags.trust_issue = true;
      }

      // Accumulate tag scores for subscores
      option.tags?.forEach(tag => {
        if (!tagScores[tag]) {
          tagScores[tag] = 0;
          tagMaxScores[tag] = 0;
        }
        tagScores[tag] += weightedScore;
        tagMaxScores[tag] += maxWeightedScore;
      });
    });

    // Calculate normalized score (1-10 scale)
    if (results.max_possible > 0) {
      results.normalized_score = Math.round((1 + 9 * (results.raw_score / results.max_possible)) * 10) / 10;
    } else {
      results.normalized_score = 1.0;
    }

    // Calculate subscores for each category
    Object.entries(this.tagGroups).forEach(([category, tags]) => {
      let categoryScore = 0;
      let categoryMax = 0;

      tags.forEach(tag => {
        if (tagScores[tag]) {
          categoryScore += tagScores[tag];
          categoryMax += tagMaxScores[tag];
        }
      });

      if (categoryMax > 0) {
        results.subscores[category] = Math.round((1 + 9 * (categoryScore / categoryMax)) * 10) / 10;
      } else {
        results.subscores[category] = null; // No questions in this category
      }
    });

    // Set additional flags based on subscores
    this.setAdditionalFlags(results);

    // Calculate breakup risk heuristic
    this.calculateBreakupRisk(results);

    // Calculate completion percentage
    const totalQuestions = this.getTotalQuestions(surveyData);
    results.completion_percentage = Math.round((responses.length / totalQuestions) * 100);

    return results;
  }

  /**
   * Set additional flags based on subscore thresholds
   */
  setAdditionalFlags(results) {
    const { subscores, flags } = results;

    // Trust issue flag
    if (subscores.trust && subscores.trust <= 2.0) {
      flags.trust_issue = true;
    }

    // Conflict frequency flag
    if (subscores.conflict && subscores.conflict <= 2.0) {
      flags.conflict_high_freq = true;
    }

    // Low intimacy flag
    if (subscores.intimacy && subscores.intimacy <= 2.0) {
      flags.intimacy_low = true;
    }

    // Financial conflict flag
    if (subscores.finances && subscores.finances <= 2.0) {
      flags.finance_conflict = true;
    }
  }

  /**
   * Calculate breakup risk using GPT-5 heuristic
   * risk_score = clamp((1 - normalized/10) * 0.6 + (num_major_flags / 5) * 0.4, 0, 1)
   */
  calculateBreakupRisk(results) {
    const { normalized_score, flags } = results;

    // Count major flags (excluding abuse_flag as it's handled separately)
    const majorFlags = [
      flags.trust_issue,
      flags.conflict_high_freq,
      flags.intimacy_low,
      flags.finance_conflict
    ];
    const numMajorFlags = majorFlags.filter(flag => flag).length;

    // Calculate risk score
    const riskScore = Math.max(0, Math.min(1, 
      (1 - normalized_score / 10) * 0.6 + (numMajorFlags / 5) * 0.4
    ));

    results.breakup_risk.score = Math.round(riskScore * 100) / 100;

    // Set risk label
    if (riskScore >= 0.7) {
      results.breakup_risk.label = 'High';
      results.flags.breakup_risk_flag = true;
    } else if (riskScore >= 0.4) {
      results.breakup_risk.label = 'Moderate';
    } else {
      results.breakup_risk.label = 'Low';
    }
  }

  /**
   * Find question in survey data by ID
   */
  findQuestion(questionId, surveyData) {
    // Check detection questions
    const detectionQuestion = surveyData.detection_questions?.find(q => q.id === questionId);
    if (detectionQuestion) return detectionQuestion;

    // Check category surveys
    for (const [category, questions] of Object.entries(surveyData.surveys || {})) {
      const question = questions.find(q => q.id === questionId);
      if (question) return question;
    }

    return null;
  }

  /**
   * Get total number of questions for a survey category
   */
  getTotalQuestions(surveyData) {
    const detectionCount = surveyData.detection_questions?.length || 0;
    // Assuming one category survey is taken at a time
    const categoryCount = 20; // Each category has 20 questions
    return detectionCount + categoryCount;
  }

  /**
   * Generate insights based on scores and flags
   */
  generateInsights(results) {
    const insights = {
      strengths: [],
      concerns: [],
      recommendations: [],
      safety_alert: results.flags.abuse_flag
    };

    // Analyze strengths
    Object.entries(results.subscores).forEach(([category, score]) => {
      if (score && score >= 7.0) {
        insights.strengths.push(this.getStrengthMessage(category, score));
      } else if (score && score <= 3.0) {
        insights.concerns.push(this.getConcernMessage(category, score));
      }
    });

    // Generate recommendations based on flags
    if (results.flags.trust_issue) {
      insights.recommendations.push("Focus on rebuilding trust through consistent actions and open communication");
    }
    
    if (results.flags.conflict_high_freq) {
      insights.recommendations.push("Consider learning conflict resolution techniques or couples counseling");
    }
    
    if (results.flags.intimacy_low) {
      insights.recommendations.push("Work on emotional and physical connection through quality time and affection");
    }
    
    if (results.flags.finance_conflict) {
      insights.recommendations.push("Have regular money conversations and create a shared financial plan");
    }

    // Overall recommendation based on score
    if (results.normalized_score >= 8.0) {
      insights.recommendations.push("Keep nurturing your strong relationship foundation");
    } else if (results.normalized_score <= 4.0) {
      insights.recommendations.push("Consider professional relationship counseling for personalized guidance");
    }

    return insights;
  }

  /**
   * Helper methods for insight messages
   */
  getStrengthMessage(category, score) {
    const messages = {
      communication: `Excellent communication (${score}/10) - you both listen and express yourselves well`,
      trust: `Strong trust foundation (${score}/10) - you feel secure and honest with each other`,
      intimacy: `Great emotional/physical connection (${score}/10) - you maintain closeness and affection`,
      conflict: `Healthy conflict resolution (${score}/10) - you work through disagreements constructively`,
      future_alignment: `Aligned future goals (${score}/10) - you're on the same page about your direction`,
      finances: `Good financial harmony (${score}/10) - you handle money matters well together`
    };
    return messages[category] || `Strong ${category} (${score}/10)`;
  }

  getConcernMessage(category, score) {
    const messages = {
      communication: `Communication needs attention (${score}/10) - work on listening and expressing needs`,
      trust: `Trust issues present (${score}/10) - focus on honesty and rebuilding confidence`,
      intimacy: `Low intimacy levels (${score}/10) - prioritize emotional and physical connection`,
      conflict: `Conflict resolution struggles (${score}/10) - learn healthier ways to handle disagreements`,
      future_alignment: `Misaligned goals (${score}/10) - discuss and align your future plans`,
      finances: `Financial stress detected (${score}/10) - address money concerns together`
    };
    return messages[category] || `${category} needs improvement (${score}/10)`;
  }

  /**
   * Export results for storage/analysis
   */
  exportResults(results, userKey, category) {
    return {
      user_key: userKey,
      survey_category: category,
      timestamp: new Date().toISOString(),
      raw_score: results.raw_score,
      max_possible: results.max_possible,
      normalized_score: results.normalized_score,
      subscores: results.subscores,
      flags: results.flags,
      breakup_risk: results.breakup_risk,
      completion_percentage: results.completion_percentage,
      question_count: results.question_count
    };
  }
}

// Export singleton instance
export const surveyScorer = new SurveyScorer();

// Export utility functions for direct use
export const calculateSurveyScore = (responses, surveyData) => {
  return surveyScorer.calculateScore(responses, surveyData);
};

export const generateInsights = (results) => {
  return surveyScorer.generateInsights(results);
};

export const exportResults = (results, userKey, category) => {
  return surveyScorer.exportResults(results, userKey, category);
};
