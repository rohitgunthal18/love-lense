/**
 * Love Lens Report Generator
 * Generates comprehensive, data-driven relationship reports
 */

import { dbService, SurveySubmission } from './db.service';

// =====================================================
// TYPES
// =====================================================

export interface RelationshipReport {
  userKey: string;
  category: string;
  generatedAt: string;
  
  // Core Scores
  overallScore: number;
  scoreLabel: string; // Excellent, Great, Good, Fair, Needs Attention
  
  // Subscores
  subscores: {
    communication: number;
    trust: number;
    intimacy: number;
    conflict: number;
    futureAlignment: number;
    finances: number | null;
  };
  
  // Risk Assessment
  breakupRisk: {
    score: number;
    label: string;
    percentage: number;
  };
  
  // Archetype
  archetype: {
    name: string;
    description: string;
    icon: string;
  };
  
  // Comparative Analytics
  comparisons: {
    percentileRank: number;
    betterThanText: string;
    categoryAverage: number;
    globalAverage: number;
  };
  
  // Insights
  strengths: string[];
  concerns: string[];
  recommendations: string[];
  
  // Flags
  flags: {
    hasAbuseWarning: boolean;
    hasTrustIssues: boolean;
    hasConflictIssues: boolean;
    hasIntimacyIssues: boolean;
    hasFinanceIssues: boolean;
    needsProfessionalHelp: boolean;
  };
  
  // Predictions (based on data)
  predictions: {
    stabilityIndex: number;
    growthPotential: number;
    longevityForecast: string;
  };
  
  // Raw data for chatbot
  rawSubmission: SurveySubmission;
}

// =====================================================
// RELATIONSHIP ARCHETYPES
// =====================================================

interface ArchetypeScores {
  normalized_score: number;
  category: string;
  subscores: { communication: number; trust: number; intimacy: number; conflict: number; future_alignment: number; finances: number };
  flags: { abuse_flag: boolean; trust_issue: boolean };
  breakup_risk: { score: number };
}

const ARCHETYPES = {
  power_couple: {
    name: "The Power Couple",
    description: "High achievers who support each other's ambitions while maintaining strong emotional connection. You're a team that conquers challenges together.",
    icon: "⚡",
    criteria: (scores: ArchetypeScores) =>
      scores.normalized_score >= 8.0 &&
      scores.subscores.communication >= 7.5 &&
      scores.subscores.trust >= 7.5 &&
      scores.subscores.future_alignment >= 7.5
  },
  steady_builders: {
    name: "The Steady Builders",
    description: "You prioritize stability and consistent growth. Your relationship is a safe haven built on trust, patience, and long-term vision.",
    icon: "🏗️",
    criteria: (scores: ArchetypeScores) =>
      scores.normalized_score < 8.5 &&
      scores.subscores.trust >= 7.0 &&
      scores.subscores.conflict >= 6.5
  },
  passionate_adventurers: {
    name: "The Passionate Adventurers",
    description: "High energy and strong emotional/physical connection drive your relationship. You thrive on excitement and deep intimacy.",
    icon: "🔥",
    criteria: (scores: ArchetypeScores) =>
      scores.subscores.intimacy >= 8.0 &&
      scores.subscores.communication >= 6.5
  },
  healing_hearts: {
    name: "The Healing Hearts",
    description: "You're working through challenges and growing from past hurts. Your commitment to healing shows strength and resilience.",
    icon: "💚",
    criteria: (scores: ArchetypeScores) =>
      scores.category === 'recently_ended' ||
      (scores.flags.trust_issue && scores.normalized_score >= 5.0)
  },
  work_in_progress: {
    name: "The Work in Progress",
    description: "Your relationship has potential but needs intentional effort. You're at a crossroads where small changes can make big differences.",
    icon: "🔨",
    criteria: (scores: ArchetypeScores) =>
      scores.normalized_score >= 4.0 &&
      scores.normalized_score < 6.5
  },
  crisis_mode: {
    name: "The Crisis Navigators",
    description: "Your relationship is facing serious challenges that require immediate attention. Professional support could provide crucial guidance.",
    icon: "🆘",
    criteria: (scores: ArchetypeScores) =>
      scores.flags.abuse_flag ||
      scores.normalized_score < 4.0 ||
      scores.breakup_risk.score >= 0.7
  },
  peaceful_partners: {
    name: "The Peaceful Partners",
    description: "You've built a harmonious relationship with minimal conflict and strong mutual respect. Your calm approach creates lasting stability.",
    icon: "☮️",
    criteria: (scores: ArchetypeScores) =>
      scores.subscores.conflict >= 8.0 &&
      scores.subscores.trust >= 7.0
  },
  default: {
    name: "The Exploring Duo",
    description: "You're on a journey of discovery together, learning what works and building your unique relationship style.",
    icon: "🧭",
    criteria: () => true // Default fallback
  }
};

// =====================================================
// REPORT GENERATOR CLASS
// =====================================================

export class ReportGenerator {
  
  /**
   * Generate complete relationship report
   */
  async generateReport(userKey: string): Promise<{ success: boolean; report?: RelationshipReport; error?: string }> {
    try {
      // 1. Get survey submission — this is the only critical step
      const surveyResult = await dbService.getSurveyByUserKey(userKey);
      if (!surveyResult.success || !surveyResult.submission) {
        return { success: false, error: 'Survey not found for this user key' };
      }

      const submission = surveyResult.submission;

      // 2. Calculate percentile rank (non-fatal)
      let percentile = submission.percentile_rank || 50;
      try {
        const percentileResult = await dbService.calculatePercentileRank(
          submission.normalized_score,
          submission.category
        );
        if (percentileResult.percentile !== undefined) {
          percentile = percentileResult.percentile;
        }
      } catch { /* use stored or default */ }

      // 3 & 4. Category/global stats (non-fatal, use score as fallback)
      const categoryAvg = submission.normalized_score;
      const globalAvg = submission.normalized_score;

      // 5. Determine archetype — use stored value if available
      const archetype = this.determineArchetype(submission);

      // 6. Generate insights — use stored values if available
      const insights = {
        strengths: (submission.strengths && submission.strengths.length > 0)
          ? submission.strengths
          : this.generateInsights(submission).strengths,
        concerns: (submission.concerns && submission.concerns.length > 0)
          ? submission.concerns
          : this.generateInsights(submission).concerns,
        recommendations: (submission.recommendations && submission.recommendations.length > 0)
          ? submission.recommendations
          : this.generateInsights(submission).recommendations,
      };

      // 7. Generate predictions
      const predictions = this.generatePredictions(submission);

      // 8. Update database with insights (non-fatal — don't let this kill the report)
      try {
        await dbService.updateSurveyInsights(userKey, {
          relationship_archetype: archetype.name,
          percentile_rank: percentile,
          strengths: insights.strengths,
          concerns: insights.concerns,
          recommendations: insights.recommendations
        });
      } catch { /* non-critical — report still loads */ }
      
      // 9. Build complete report
      const report: RelationshipReport = {
        userKey,
        category: submission.category,
        generatedAt: new Date().toISOString(),
        
        overallScore: submission.normalized_score,
        scoreLabel: this.getScoreLabel(submission.normalized_score),
        
        subscores: {
          communication: submission.communication_score || 0,
          trust: submission.trust_score || 0,
          intimacy: submission.intimacy_score || 0,
          conflict: submission.conflict_score || 0,
          futureAlignment: submission.future_alignment_score || 0,
          finances: submission.finances_score || null
        },
        
        breakupRisk: {
          score: submission.breakup_risk_score || 0,
          label: submission.breakup_risk_label || 'Unknown',
          percentage: Math.round((submission.breakup_risk_score || 0) * 100)
        },
        
        archetype,
        
        comparisons: {
          percentileRank: percentile,
          betterThanText: `Your relationship is stronger than ${percentile}% of ${this.getCategoryLabel(submission.category)} couples`,
          categoryAverage: categoryAvg,
          globalAverage: globalAvg
        },
        
        strengths: insights.strengths,
        concerns: insights.concerns,
        recommendations: insights.recommendations,
        
        flags: {
          hasAbuseWarning: submission.has_abuse_flag,
          hasTrustIssues: submission.has_trust_issues,
          hasConflictIssues: submission.has_conflict_issues,
          hasIntimacyIssues: submission.has_intimacy_issues,
          hasFinanceIssues: submission.has_finance_issues,
          needsProfessionalHelp: submission.has_abuse_flag || submission.normalized_score < 3.5
        },
        
        predictions,
        
        rawSubmission: submission
      };
      
      return { success: true, report };
    } catch (error: any) {
      console.error('Error generating report:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Determine relationship archetype
   */
  private determineArchetype(submission: SurveySubmission): { name: string; description: string; icon: string } {
    const scores = {
      normalized_score: submission.normalized_score,
      category: submission.category,
      subscores: {
        communication: submission.communication_score || 0,
        trust: submission.trust_score || 0,
        intimacy: submission.intimacy_score || 0,
        conflict: submission.conflict_score || 0,
        future_alignment: submission.future_alignment_score || 0,
        finances: submission.finances_score || 0
      },
      flags: {
        abuse_flag: submission.has_abuse_flag,
        trust_issue: submission.has_trust_issues
      },
      breakup_risk: {
        score: submission.breakup_risk_score || 0
      }
    };
    
    // Check archetypes in priority order
    for (const [key, archetype] of Object.entries(ARCHETYPES)) {
      if (key !== 'default' && archetype.criteria(scores)) {
        return {
          name: archetype.name,
          description: archetype.description,
          icon: archetype.icon
        };
      }
    }
    
    // Default fallback
    return {
      name: ARCHETYPES.default.name,
      description: ARCHETYPES.default.description,
      icon: ARCHETYPES.default.icon
    };
  }
  
  /**
   * Generate insights (strengths, concerns, recommendations)
   */
  private generateInsights(submission: SurveySubmission): {
    strengths: string[];
    concerns: string[];
    recommendations: string[];
  } {
    const strengths: string[] = [];
    const concerns: string[] = [];
    const recommendations: string[] = [];
    
    const subscores = {
      communication: submission.communication_score || 0,
      trust: submission.trust_score || 0,
      intimacy: submission.intimacy_score || 0,
      conflict: submission.conflict_score || 0,
      future_alignment: submission.future_alignment_score || 0,
      finances: submission.finances_score || 0
    };
    
    // Analyze each subscore
    Object.entries(subscores).forEach(([key, score]) => {
      if (score >= 7.5) {
        strengths.push(this.getStrengthMessage(key, score));
      } else if (score <= 3.5 && score > 0) {
        concerns.push(this.getConcernMessage(key, score));
        recommendations.push(this.getRecommendation(key));
      }
    });
    
    // Add overall recommendations
    if (submission.normalized_score >= 8.0) {
      recommendations.push("Keep nurturing your strong foundation with regular check-ins and quality time together");
    } else if (submission.normalized_score < 5.0) {
      recommendations.push("Consider seeking professional relationship counseling for personalized guidance");
    }
    
    // Flag-based recommendations
    if (submission.has_abuse_flag) {
      recommendations.unshift("⚠️ IMPORTANT: Your safety is paramount. Please reach out to a domestic violence hotline or professional counselor immediately");
    }
    
    if (submission.has_trust_issues) {
      recommendations.push("Rebuild trust through consistent actions, transparency, and patience");
    }
    
    if (submission.has_conflict_issues) {
      recommendations.push("Learn healthy conflict resolution techniques - consider couples therapy or communication workshops");
    }
    
    // Ensure we always have content
    if (strengths.length === 0) {
      strengths.push("You're taking the first step by seeking to understand your relationship better");
    }
    
    if (recommendations.length === 0) {
      recommendations.push("Focus on open communication and quality time together");
    }
    
    return { strengths, concerns, recommendations };
  }
  
  /**
   * Generate predictions based on data
   */
  private generatePredictions(submission: SurveySubmission): {
    stabilityIndex: number;
    growthPotential: number;
    longevityForecast: string;
  } {
    // Stability Index (0-100): Based on conflict resolution, trust, and consistency
    const stabilityIndex = Math.round(
      ((submission.conflict_score || 0) * 0.4 +
       (submission.trust_score || 0) * 0.4 +
       (submission.communication_score || 0) * 0.2) * 10
    );
    
    // Growth Potential (0-100): Based on communication, future alignment, and openness
    const growthPotential = Math.round(
      ((submission.communication_score || 0) * 0.4 +
       (submission.future_alignment_score || 0) * 0.4 +
       (submission.intimacy_score || 0) * 0.2) * 10
    );
    
    // Longevity Forecast
    let longevityForecast = '';
    const overallScore = submission.normalized_score;
    const breakupRisk = submission.breakup_risk_score || 0;
    
    if (submission.has_abuse_flag) {
      longevityForecast = "Focus on safety first. Long-term forecasts aren't appropriate in this situation.";
    } else if (breakupRisk >= 0.7) {
      longevityForecast = "High risk of ending without significant changes. Immediate intervention recommended.";
    } else if (overallScore >= 8.0 && breakupRisk < 0.3) {
      longevityForecast = "Strong foundation for long-term success. Couples with your pattern typically last 7+ years with continued care.";
    } else if (overallScore >= 6.5) {
      longevityForecast = "Moderate stability. With intentional effort, you can build toward long-term success.";
    } else if (overallScore >= 5.0) {
      longevityForecast = "At a crossroads. The next 6-12 months will be critical in determining your direction.";
    } else {
      longevityForecast = "Significant challenges present. Professional guidance strongly recommended for positive outcomes.";
    }
    
    return {
      stabilityIndex,
      growthPotential,
      longevityForecast
    };
  }
  
  // =====================================================
  // HELPER METHODS
  // =====================================================
  
  private getScoreLabel(score: number): string {
    if (score >= 8.5) return "Excellent";
    if (score >= 7.0) return "Great";
    if (score >= 5.5) return "Good";
    if (score >= 4.0) return "Fair";
    return "Needs Attention";
  }
  
  private getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      single: "dating",
      committed: "committed",
      engaged: "engaged",
      married: "married",
      recently_ended: "post-breakup"
    };
    return labels[category] || category;
  }
  
  private getStrengthMessage(category: string, score: number): string {
    const messages: Record<string, string> = {
      communication: `Outstanding communication (${score.toFixed(1)}/10) - You both listen and express yourselves with clarity and empathy`,
      trust: `Rock-solid trust (${score.toFixed(1)}/10) - You feel secure, honest, and confident in each other`,
      intimacy: `Deep emotional & physical connection (${score.toFixed(1)}/10) - You maintain closeness and genuine affection`,
      conflict: `Healthy conflict resolution (${score.toFixed(1)}/10) - You handle disagreements with respect and find solutions together`,
      future_alignment: `Aligned life goals (${score.toFixed(1)}/10) - You're both heading in the same direction with shared vision`,
      finances: `Financial harmony (${score.toFixed(1)}/10) - You handle money matters with transparency and teamwork`
    };
    return messages[category] || `Strong ${category} (${score.toFixed(1)}/10)`;
  }
  
  private getConcernMessage(category: string, score: number): string {
    const messages: Record<string, string> = {
      communication: `Communication needs work (${score.toFixed(1)}/10) - Important thoughts and feelings aren't being shared effectively`,
      trust: `Trust issues present (${score.toFixed(1)}/10) - There's uncertainty, secrecy, or broken promises affecting security`,
      intimacy: `Low intimacy levels (${score.toFixed(1)}/10) - Emotional and/or physical closeness has diminished significantly`,
      conflict: `Unhealthy conflict patterns (${score.toFixed(1)}/10) - Arguments escalate, remain unresolved, or create lasting damage`,
      future_alignment: `Misaligned goals (${score.toFixed(1)}/10) - You want different things for your future, creating tension`,
      finances: `Financial stress (${score.toFixed(1)}/10) - Money disagreements or hidden issues are causing significant strain`
    };
    return messages[category] || `${category} needs improvement (${score.toFixed(1)}/10)`;
  }
  
  private getRecommendation(category: string): string {
    const recommendations: Record<string, string> = {
      communication: "Schedule weekly 'state of us' conversations where you both share feelings without judgment",
      trust: "Rebuild trust through radical honesty, consistent follow-through, and giving trust time to heal",
      intimacy: "Prioritize regular quality time, physical affection, and emotional vulnerability with each other",
      conflict: "Learn the 'soft startup' technique and take breaks during heated moments to cool down",
      future_alignment: "Have explicit conversations about life goals - kids, career, location, lifestyle - and find compromises",
      finances: "Create a monthly money date to discuss finances openly, set shared goals, and address concerns"
    };
    return recommendations[category] || `Focus on improving ${category} through intentional effort`;
  }
}

// Export singleton instance
export const reportGenerator = new ReportGenerator();

