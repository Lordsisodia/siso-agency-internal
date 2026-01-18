/**
 * 🧘 Wellness Guardian & Anti-Addiction Service
 * Implements healthy boundaries and sustainable engagement patterns
 * Prevents gamification from becoming addictive or harmful
 */

// =====================================================
// 🛡️ WELLNESS MONITORING SYSTEM
// =====================================================

export interface WellnessMetrics {
  burnoutRisk: 'low' | 'moderate' | 'high' | 'critical';
  sustainabilityScore: number; // 0-1 how sustainable current usage is
  wellnessStreak: number; // Days of healthy usage patterns
  balanceIndex: number; // Work-rest balance (0-1, optimal ~0.6-0.8)
  engagementHealth: 'healthy' | 'concerning' | 'problematic' | 'addictive';
  interventionNeeded: boolean;
}

export interface UsagePattern {
  dailyActiveMinutes: number;
  sessionsPerDay: number;
  averageSessionLength: number;
  longestSession: number;
  timeDistribution: { [hour: number]: number }; // Usage by hour of day
  weeklyPattern: number[]; // Usage by day of week
  compulsiveIndicators: CompulsiveIndicator[];
}

export interface CompulsiveIndicator {
  type: 'excessive_checking' | 'late_night_usage' | 'neglecting_responsibilities' | 
        'emotional_dependence' | 'withdrawal_anxiety' | 'tolerance_buildup';
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  detectedAt: Date;
}

export interface WellnessBoundary {
  type: 'time_limit' | 'session_break' | 'daily_cutoff' | 'mandatory_rest' | 
        'social_reminder' | 'reality_check';
  name: string;
  description: string;
  threshold: number; // The limit or trigger point
  enforcement: 'soft' | 'medium' | 'hard'; // How strictly enforced
  userOverridable: boolean;
  gracePeriod?: number; // Minutes before enforcement
}

export interface WellnessIntervention {
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  interventionType: 'gentle_reminder' | 'break_suggestion' | 'limit_enforcement' | 
                    'professional_recommendation' | 'emergency_lockout';
  message: string;
  actions: WellnessAction[];
  followUpRequired: boolean;
  documentForUser: boolean;
}

export interface WellnessAction {
  type: 'take_break' | 'set_limit' | 'seek_help' | 'reflect' | 'contact_support';
  label: string;
  duration?: number; // Minutes for time-based actions
  required: boolean;
}

// =====================================================
// 🧘 WELLNESS GUARDIAN ENGINE
// =====================================================

export class WellnessGuardian {
  
  /**
   * 📊 Analyze usage patterns for addiction indicators
   * Based on digital wellness research and behavioral psychology
   */
  static analyzeUsagePatterns(
    recentUsage: {
      timestamp: Date;
      sessionDuration: number;
      activityType: string;
      compulsiveIndicators?: string[];
    }[],
    userProfile: {
      age?: number;
      hasAddictionHistory?: boolean;
      stressLevel?: number; // 0-1
      workLifeBalance?: number; // 0-1
    } = {}
  ): {
    patterns: UsagePattern;
    riskFactors: string[];
    healthScore: number; // 0-1 (1 = perfectly healthy)
    recommendations: string[];
  } {
    
    const last7Days = recentUsage.filter(
      u => u.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    
    // Calculate usage patterns
    const dailyMinutes = last7Days.reduce((sum, u) => sum + u.sessionDuration, 0) / 7;
    const sessionsPerDay = last7Days.length / 7;
    const averageSession = dailyMinutes / Math.max(1, sessionsPerDay);
    const longestSession = Math.max(...last7Days.map(u => u.sessionDuration), 0);
    
    // Time distribution analysis
    const timeDistribution: { [hour: number]: number } = {};
    const weeklyPattern: number[] = new Array(7).fill(0);
    
    last7Days.forEach(usage => {
      const hour = usage.timestamp.getHours();
      const dayOfWeek = usage.timestamp.getDay();
      timeDistribution[hour] = (timeDistribution[hour] || 0) + usage.sessionDuration;
      weeklyPattern[dayOfWeek] += usage.sessionDuration;
    });
    
    // Detect compulsive indicators
    const compulsiveIndicators = this.detectCompulsiveIndicators(
      last7Days, 
      dailyMinutes, 
      longestSession,
      timeDistribution
    );
    
    const patterns: UsagePattern = {
      dailyActiveMinutes: Math.round(dailyMinutes),
      sessionsPerDay: Math.round(sessionsPerDay * 10) / 10,
      averageSessionLength: Math.round(averageSession),
      longestSession,
      timeDistribution,
      weeklyPattern,
      compulsiveIndicators
    };
    
    // Assess risk factors
    const riskFactors = this.identifyRiskFactors(patterns, userProfile);
    
    // Calculate health score
    const healthScore = this.calculateHealthScore(patterns, riskFactors, userProfile);
    
    // Generate recommendations
    const recommendations = this.generateWellnessRecommendations(patterns, riskFactors, healthScore);
    
    return {
      patterns,
      riskFactors,
      healthScore,
      recommendations
    };
  }
  
  /**
   * 🚨 Detect compulsive usage indicators
   */
  private static detectCompulsiveIndicators(
    usageData: any[],
    dailyMinutes: number,
    longestSession: number,
    timeDistribution: { [hour: number]: number }
  ): CompulsiveIndicator[] {
    const indicators: CompulsiveIndicator[] = [];
    
    // Excessive total usage (>3 hours/day consistently)
    if (dailyMinutes > 180) {
      indicators.push({
        type: 'excessive_checking',
        severity: dailyMinutes > 300 ? 'severe' : dailyMinutes > 240 ? 'moderate' : 'mild',
        description: `Averaging ${Math.round(dailyMinutes)} minutes per day`,
        detectedAt: new Date()
      });
    }
    
    // Late night usage (11 PM - 6 AM)
    const lateNightUsage = Object.entries(timeDistribution)
      .filter(([hour]) => parseInt(hour) >= 23 || parseInt(hour) <= 6)
      .reduce((sum, [, minutes]) => sum + minutes, 0);
    
    if (lateNightUsage > 30) {
      indicators.push({
        type: 'late_night_usage',
        severity: lateNightUsage > 90 ? 'severe' : lateNightUsage > 60 ? 'moderate' : 'mild',
        description: `${Math.round(lateNightUsage)} minutes of late-night usage`,
        detectedAt: new Date()
      });
    }
    
    // Extremely long sessions (>2 hours)
    if (longestSession > 120) {
      indicators.push({
        type: 'tolerance_buildup',
        severity: longestSession > 240 ? 'severe' : longestSession > 180 ? 'moderate' : 'mild',
        description: `Longest session: ${longestSession} minutes`,
        detectedAt: new Date()
      });
    }
    
    // Compulsive checking pattern (many short sessions)
    const shortSessions = usageData.filter(u => u.sessionDuration < 5).length;
    if (shortSessions > 15) { // >15 micro-sessions per week
      indicators.push({
        type: 'excessive_checking',
        severity: shortSessions > 30 ? 'severe' : shortSessions > 20 ? 'moderate' : 'mild',
        description: `${shortSessions} micro-sessions (frequent checking)`,
        detectedAt: new Date()
      });
    }
    
    return indicators;
  }
  
  /**
   * ⚠️ Identify wellness risk factors
   */
  private static identifyRiskFactors(
    patterns: UsagePattern,
    userProfile: any
  ): string[] {
    const riskFactors: string[] = [];
    
    // Usage pattern risks
    if (patterns.dailyActiveMinutes > 180) {
      riskFactors.push('Excessive daily usage (>3 hours)');
    }
    
    if (patterns.longestSession > 120) {
      riskFactors.push('Marathon sessions detected');
    }
    
    if (patterns.sessionsPerDay > 8) {
      riskFactors.push('Compulsive checking behavior');
    }
    
    // Severe compulsive indicators
    const severeIndicators = patterns.compulsiveIndicators.filter(i => i.severity === 'severe');
    if (severeIndicators.length > 0) {
      riskFactors.push(`${severeIndicators.length} severe addiction indicators`);
    }
    
    // User profile risks
    if (userProfile.hasAddictionHistory) {
      riskFactors.push('History of addictive behaviors');
    }
    
    if (userProfile.stressLevel && userProfile.stressLevel > 0.7) {
      riskFactors.push('High stress levels (escape mechanism risk)');
    }
    
    if (userProfile.workLifeBalance && userProfile.workLifeBalance < 0.3) {
      riskFactors.push('Poor work-life balance');
    }
    
    // Time distribution risks
    const eveningUsage = Object.entries(patterns.timeDistribution)
      .filter(([hour]) => parseInt(hour) >= 18 && parseInt(hour) <= 23)
      .reduce((sum, [, minutes]) => sum + minutes, 0);
    
    if (eveningUsage > patterns.dailyActiveMinutes * 0.6) {
      riskFactors.push('Concentrated evening usage (relaxation dependency)');
    }
    
    return riskFactors;
  }
  
  /**
   * 💚 Calculate overall wellness health score
   */
  private static calculateHealthScore(
    patterns: UsagePattern,
    riskFactors: string[],
    userProfile: any
  ): number {
    let healthScore = 1.0; // Start with perfect health
    
    // Deduct for excessive usage
    if (patterns.dailyActiveMinutes > 120) {
      healthScore -= Math.min(0.4, (patterns.dailyActiveMinutes - 120) / 300);
    }
    
    // Deduct for compulsive indicators
    patterns.compulsiveIndicators.forEach(indicator => {
      switch (indicator.severity) {
        case 'severe': healthScore -= 0.3; break;
        case 'moderate': healthScore -= 0.15; break;
        case 'mild': healthScore -= 0.05; break;
      }
    });
    
    // Deduct for risk factors
    healthScore -= riskFactors.length * 0.1;
    
    // Bonus for healthy patterns
    if (patterns.dailyActiveMinutes > 30 && patterns.dailyActiveMinutes < 90) {
      healthScore += 0.1; // Healthy engagement level
    }
    
    if (patterns.averageSessionLength > 15 && patterns.averageSessionLength < 45) {
      healthScore += 0.05; // Good session length
    }
    
    return Math.max(0, Math.min(1, healthScore));
  }
  
  /**
   * 💡 Generate wellness recommendations
   */
  private static generateWellnessRecommendations(
    patterns: UsagePattern,
    riskFactors: string[],
    healthScore: number
  ): string[] {
    const recommendations: string[] = [];
    
    if (healthScore < 0.3) {
      recommendations.push('🚨 Consider seeking professional help for digital wellness');
      recommendations.push('🛑 Implement strict daily time limits (max 2 hours)');
    } else if (healthScore < 0.5) {
      recommendations.push('⚠️ Take regular breaks every 30 minutes');
      recommendations.push('🕕 Set mandatory daily cutoff time (e.g., 9 PM)');
    } else if (healthScore < 0.7) {
      recommendations.push('💚 Good balance! Consider minor adjustments');
      recommendations.push('⏰ Try shorter, more focused sessions');
    } else {
      recommendations.push('✨ Excellent digital wellness! Keep it up');
      recommendations.push('🎯 Your usage patterns are healthy and sustainable');
    }
    
    // Specific recommendations based on patterns
    if (patterns.longestSession > 90) {
      recommendations.push('🛑 Break up long sessions with 10-minute breaks');
    }
    
    if (patterns.compulsiveIndicators.some(i => i.type === 'late_night_usage')) {
      recommendations.push('🌙 Avoid usage after 10 PM for better sleep');
    }
    
    if (patterns.sessionsPerDay > 6) {
      recommendations.push('📱 Consider batching your productivity work');
    }
    
    return recommendations;
  }
  
  /**
   * 🛡️ Generate healthy boundaries for user
   */
  static createHealthyBoundaries(
    wellnessMetrics: WellnessMetrics,
    userPreferences: {
      strictness?: 'flexible' | 'balanced' | 'strict';
      workHours?: { start: number; end: number };
      sleepSchedule?: { bedtime: number; wakeup: number };
      personalLimits?: { dailyMinutes?: number; sessionLength?: number };
    } = {}
  ): WellnessBoundary[] {
    const boundaries: WellnessBoundary[] = [];
    const strictness = userPreferences.strictness || 'balanced';
    
    // Daily time limits
    let dailyLimit = 120; // Default 2 hours
    if (userPreferences.personalLimits?.dailyMinutes) {
      dailyLimit = userPreferences.personalLimits.dailyMinutes;
    } else if (wellnessMetrics.burnoutRisk === 'high') {
      dailyLimit = 90; // Stricter for high burnout risk
    } else if (wellnessMetrics.burnoutRisk === 'critical') {
      dailyLimit = 60; // Very strict for critical cases
    }
    
    boundaries.push({
      type: 'time_limit',
      name: 'Daily Usage Limit',
      description: `Maximum ${dailyLimit} minutes of productive work per day`,
      threshold: dailyLimit,
      enforcement: strictness === 'strict' ? 'hard' : strictness === 'flexible' ? 'soft' : 'medium',
      userOverridable: strictness !== 'strict',
      gracePeriod: strictness === 'flexible' ? 15 : 5
    });
    
    // Session length limits
    let sessionLimit = 45; // Default 45 minutes
    if (wellnessMetrics.burnoutRisk === 'high' || wellnessMetrics.burnoutRisk === 'critical') {
      sessionLimit = 30;
    }
    
    boundaries.push({
      type: 'session_break',
      name: 'Session Break Reminder',
      description: `Take a 5-minute break every ${sessionLimit} minutes`,
      threshold: sessionLimit,
      enforcement: 'soft',
      userOverridable: true,
      gracePeriod: 5
    });
    
    // Sleep protection
    if (userPreferences.sleepSchedule) {
      const bedtime = userPreferences.sleepSchedule.bedtime;
      boundaries.push({
        type: 'daily_cutoff',
        name: 'Sleep Protection',
        description: `No productivity work after ${bedtime}:00 PM`,
        threshold: bedtime,
        enforcement: strictness === 'strict' ? 'hard' : 'medium',
        userOverridable: strictness === 'flexible'
      });
    }
    
    // Mandatory rest periods
    if (wellnessMetrics.burnoutRisk === 'high' || wellnessMetrics.burnoutRisk === 'critical') {
      boundaries.push({
        type: 'mandatory_rest',
        name: 'Recovery Time',
        description: 'Mandatory 30-minute break every 2 hours',
        threshold: 120, // 2 hours
        enforcement: 'hard',
        userOverridable: false
      });
    }
    
    // Social reality checks
    if (wellnessMetrics.engagementHealth === 'concerning' || 
        wellnessMetrics.engagementHealth === 'problematic') {
      boundaries.push({
        type: 'reality_check',
        name: 'Mindfulness Check',
        description: 'Periodic reminders to check in with real-world priorities',
        threshold: 60, // Every hour
        enforcement: 'soft',
        userOverridable: true
      });
    }
    
    return boundaries;
  }
  
  /**
   * 🚨 Generate wellness interventions when boundaries are crossed
   */
  static generateIntervention(
    boundary: WellnessBoundary,
    currentUsage: {
      sessionLength: number;
      dailyTotal: number;
      recentPattern: string;
    },
    wellnessMetrics: WellnessMetrics
  ): WellnessIntervention {
    
    let urgency: WellnessIntervention['urgency'] = 'low';
    let interventionType: WellnessIntervention['interventionType'] = 'gentle_reminder';
    let message = '';
    let actions: WellnessAction[] = [];
    let followUpRequired = false;
    let documentForUser = false;
    
    // Determine intervention severity
    const exceedsBy = boundary.type === 'time_limit' 
      ? currentUsage.dailyTotal - boundary.threshold
      : currentUsage.sessionLength - boundary.threshold;
    
    const severityRatio = exceedsBy / boundary.threshold;
    
    if (severityRatio > 0.5 || wellnessMetrics.burnoutRisk === 'critical') {
      urgency = 'high';
      interventionType = wellnessMetrics.burnoutRisk === 'critical' ? 
        'emergency_lockout' : 'limit_enforcement';
    } else if (severityRatio > 0.2 || wellnessMetrics.burnoutRisk === 'high') {
      urgency = 'medium';
      interventionType = 'break_suggestion';
    }
    
    // Generate appropriate message
    switch (boundary.type) {
      case 'time_limit':
        if (urgency === 'high') {
          message = `🛑 Daily limit exceeded by ${exceedsBy} minutes. Time to rest and recharge!`;
          actions = [
            { type: 'take_break', label: 'Take 30-minute break', duration: 30, required: true },
            { type: 'reflect', label: 'Reflect on usage patterns', required: false }
          ];
        } else {
          message = `⏰ You're approaching your daily limit (${currentUsage.dailyTotal}/${boundary.threshold} minutes)`;
          actions = [
            { type: 'take_break', label: 'Take 10-minute break', duration: 10, required: false },
            { type: 'set_limit', label: 'Adjust daily limit', required: false }
          ];
        }
        break;
        
      case 'session_break':
        message = `🧘 You've been focused for ${currentUsage.sessionLength} minutes. Time for a mindful break!`;
        actions = [
          { type: 'take_break', label: 'Take 5-minute break', duration: 5, required: false },
          { type: 'reflect', label: 'Stretch and breathe', required: false }
        ];
        break;
        
      case 'daily_cutoff':
        message = `🌙 It's past your cutoff time. Your brain needs rest for tomorrow!`;
        actions = [
          { type: 'take_break', label: 'End session for today', required: true }
        ];
        urgency = 'medium';
        break;
        
      case 'mandatory_rest':
        message = `🚨 Mandatory break time! You've been working for ${Math.floor(currentUsage.sessionLength / 60)} hours straight.`;
        actions = [
          { type: 'take_break', label: 'Take 30-minute break', duration: 30, required: true },
          { type: 'contact_support', label: 'Talk to someone', required: false }
        ];
        urgency = 'high';
        interventionType = 'limit_enforcement';
        break;
        
      case 'reality_check':
        message = `💭 Quick check: How are you feeling? Are you taking care of yourself?`;
        actions = [
          { type: 'reflect', label: 'Mindfulness moment', required: false },
          { type: 'take_break', label: 'Connect with real world', duration: 15, required: false }
        ];
        break;
    }
    
    // Emergency interventions for critical wellness states
    if (wellnessMetrics.burnoutRisk === 'critical') {
      urgency = 'emergency';
      interventionType = 'emergency_lockout';
      message = '🚨 WELLNESS EMERGENCY: Your usage patterns suggest serious burnout risk. ' +
               'Productivity system will be limited for 24 hours while you recover.';
      actions = [
        { type: 'seek_help', label: 'Get professional support', required: true },
        { type: 'contact_support', label: 'Talk to trusted friend/family', required: true },
        { type: 'take_break', label: '24-hour recovery period', duration: 1440, required: true }
      ];
      followUpRequired = true;
      documentForUser = true;
    }
    
    return {
      urgency,
      interventionType,
      message,
      actions,
      followUpRequired,
      documentForUser
    };
  }
  
  /**
   * 🌱 Promote sustainable engagement patterns
   */
  static promoteSustainableEngagement(
    currentPatterns: UsagePattern,
    goals: {
      productivity?: boolean;
      wellbeing?: boolean;
      balance?: boolean;
    } = { productivity: true, wellbeing: true, balance: true }
  ): {
    recommendations: string[];
    targetPatterns: {
      idealDailyMinutes: number;
      idealSessionLength: number;
      idealBreakFrequency: number;
      idealWeeklyDistribution: number[];
    };
    motivationalFraming: string[];
  } {
    
    const recommendations: string[] = [];
    const motivationalFraming: string[] = [];
    
    // Calculate ideal patterns based on research
    const idealDailyMinutes = Math.max(30, Math.min(90, currentPatterns.dailyActiveMinutes * 0.8));
    const idealSessionLength = Math.max(15, Math.min(45, 30));
    const idealBreakFrequency = 45; // Break every 45 minutes
    
    // Ideal weekly distribution (more on weekdays, less on weekends)
    const idealWeeklyDistribution = [
      idealDailyMinutes * 0.6, // Sunday - lighter
      idealDailyMinutes * 1.0, // Monday
      idealDailyMinutes * 1.0, // Tuesday
      idealDailyMinutes * 1.0, // Wednesday
      idealDailyMinutes * 1.0, // Thursday
      idealDailyMinutes * 0.8, // Friday
      idealDailyMinutes * 0.4  // Saturday - lightest
    ];
    
    // Generate specific recommendations
    if (currentPatterns.dailyActiveMinutes > idealDailyMinutes * 1.3) {
      recommendations.push('🎯 Focus on quality over quantity - aim for shorter, more focused sessions');
      motivationalFraming.push('✨ Less time, better results - you\'ll be amazed by your efficiency!');
    }
    
    if (currentPatterns.averageSessionLength > idealSessionLength * 1.5) {
      recommendations.push('🧠 Break large tasks into 30-45 minute focused sprints');
      motivationalFraming.push('🚀 Sprint mentality - short bursts of excellence!');
    }
    
    if (currentPatterns.compulsiveIndicators.length > 0) {
      recommendations.push('🌱 Practice mindful engagement - quality attention over compulsive checking');
      motivationalFraming.push('💎 Become a mindful productivity master - intentional and powerful!');
    }
    
    // Weekend balance recommendations
    const weekendUsage = (currentPatterns.weeklyPattern[0] + currentPatterns.weeklyPattern[6]) / 2;
    const weekdayAverage = currentPatterns.weeklyPattern.slice(1, 6).reduce((a, b) => a + b, 0) / 5;
    
    if (weekendUsage > weekdayAverage * 0.8) {
      recommendations.push('🏝️ Embrace weekend recovery - reduce productivity work on Sat/Sun');
      motivationalFraming.push('⚡ Weekend recharge = Monday superpower!');
    }
    
    // Add positive reframing
    motivationalFraming.push('🎯 Sustainable productivity = Long-term success');
    motivationalFraming.push('💪 Building healthy habits that last a lifetime');
    motivationalFraming.push('🌟 You\'re investing in your future self');
    
    return {
      recommendations,
      targetPatterns: {
        idealDailyMinutes,
        idealSessionLength,
        idealBreakFrequency,
        idealWeeklyDistribution
      },
      motivationalFraming
    };
  }
  
  /**
   * 📊 Monitor wellness metrics over time
   */
  static assessWellnessMetrics(
    usageAnalysis: ReturnType<typeof WellnessGuardian.analyzeUsagePatterns>,
    historicalData: {
      wellnessScores: { date: Date; score: number }[];
      interventionHistory: WellnessIntervention[];
      boundaryViolations: { date: Date; boundary: string; severity: number }[];
    }
  ): WellnessMetrics {
    
    const { patterns, healthScore, riskFactors } = usageAnalysis;
    
    // Assess burnout risk
    let burnoutRisk: WellnessMetrics['burnoutRisk'] = 'low';
    if (healthScore < 0.3 || riskFactors.length > 5) {
      burnoutRisk = 'critical';
    } else if (healthScore < 0.5 || riskFactors.length > 3) {
      burnoutRisk = 'high';
    } else if (healthScore < 0.7 || riskFactors.length > 1) {
      burnoutRisk = 'moderate';
    }
    
    // Calculate sustainability score
    const sustainabilityScore = Math.max(0, Math.min(1, 
      (healthScore * 0.6) + 
      (Math.max(0, 1 - riskFactors.length / 5) * 0.4)
    ));
    
    // Calculate wellness streak
    const recentScores = historicalData.wellnessScores
      .filter(s => s.date > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .map(s => s.score);
    
    const wellnessStreak = recentScores.reverse()
      .findIndex(score => score < 0.6) || recentScores.length;
    
    // Calculate work-rest balance
    const totalMinutes = patterns.dailyActiveMinutes;
    const restMinutes = Math.max(0, 480 - totalMinutes); // 8 hours available - work time
    const balanceIndex = restMinutes / (restMinutes + totalMinutes);
    
    // Assess engagement health
    let engagementHealth: WellnessMetrics['engagementHealth'] = 'healthy';
    const severeIndicators = patterns.compulsiveIndicators.filter(i => i.severity === 'severe').length;
    
    if (severeIndicators > 2 || burnoutRisk === 'critical') {
      engagementHealth = 'addictive';
    } else if (severeIndicators > 0 || burnoutRisk === 'high') {
      engagementHealth = 'problematic';
    } else if (burnoutRisk === 'moderate' || healthScore < 0.6) {
      engagementHealth = 'concerning';
    }
    
    // Determine if intervention is needed
    const interventionNeeded = burnoutRisk === 'critical' || 
                              engagementHealth === 'addictive' ||
                              sustainabilityScore < 0.3;
    
    return {
      burnoutRisk,
      sustainabilityScore: Math.round(sustainabilityScore * 100) / 100,
      wellnessStreak,
      balanceIndex: Math.round(balanceIndex * 100) / 100,
      engagementHealth,
      interventionNeeded
    };
  }
}

// =====================================================
// 🎯 MINDFUL PRODUCTIVITY FEATURES
// =====================================================

export class MindfulProductivityEngine {
  
  /**
   * 🧘 Generate mindfulness prompts for productivity sessions
   */
  static generateMindfulnessPrompts(
    sessionType: 'start' | 'break' | 'end',
    sessionLength: number,
    userStress: number = 0.5 // 0-1 scale
  ): {
    prompt: string;
    duration: number; // seconds
    technique: 'breathing' | 'body_scan' | 'gratitude' | 'intention_setting';
  } {
    
    let prompt = '';
    let duration = 30;
    let technique: 'breathing' | 'body_scan' | 'gratitude' | 'intention_setting' = 'breathing';
    
    switch (sessionType) {
      case 'start':
        technique = 'intention_setting';
        duration = 60;
        prompt = '🎯 Take a moment to set your intention. What would make this session meaningful?';
        break;
        
      case 'break':
        if (userStress > 0.7) {
          technique = 'breathing';
          duration = 120; // 2 minutes for high stress
          prompt = '🫁 High stress detected. Take 3 deep breaths. Inhale calm, exhale tension.';
        } else if (sessionLength > 60) {
          technique = 'body_scan';
          duration = 90;
          prompt = '🧘 Quick body scan: Notice any tension in your shoulders, neck, or back. Gently release.';
        } else {
          technique = 'gratitude';
          duration = 30;
          prompt = '✨ Appreciate your progress so far. What\'s going well right now?';
        }
        break;
        
      case 'end':
        technique = 'gratitude';
        duration = 45;
        prompt = '🙏 Session complete! Acknowledge what you accomplished and how you feel.';
        break;
    }
    
    return { prompt, duration, technique };
  }
  
  /**
   * 🌱 Create healthy habit formation cues
   * Integrate wellness into productivity routines
   */
  static createWellnessIntegration(
    productivityGoals: string[],
    currentHabits: string[]
  ): {
    wellnessHabits: { habit: string; anchor: string; benefit: string }[];
    routineIntegration: string[];
    balanceMetrics: { name: string; target: number; unit: string }[];
  } {
    
    const wellnessHabits = [
      {
        habit: 'Take 3 conscious breaths',
        anchor: 'Before starting any productive work',
        benefit: 'Centers focus and reduces reactive stress'
      },
      {
        habit: 'Stand and stretch for 1 minute',
        anchor: 'Every 45 minutes of focused work',
        benefit: 'Prevents physical tension and mental fatigue'
      },
      {
        habit: 'Check in with your energy level',
        anchor: 'At the top of each hour',
        benefit: 'Maintains awareness of your needs and limits'
      },
      {
        habit: 'End with gratitude',
        anchor: 'After completing any task',
        benefit: 'Builds positive associations with productive work'
      }
    ];
    
    const routineIntegration = [
      '🌅 Morning: Set intention before diving into tasks',
      '⏰ During work: Regular wellness check-ins',
      '🌅 Breaks: Mindful transitions between activities',
      '🌙 Evening: Reflect and appreciate progress'
    ];
    
    const balanceMetrics = [
      { name: 'Daily mindful moments', target: 5, unit: 'occasions' },
      { name: 'Stress level awareness', target: 8, unit: 'check-ins' },
      { name: 'Physical movement breaks', target: 6, unit: 'per day' },
      { name: 'Gratitude acknowledgments', target: 3, unit: 'per day' }
    ];
    
    return {
      wellnessHabits,
      routineIntegration,
      balanceMetrics
    };
  }
}

export default {
  WellnessGuardian,
  MindfulProductivityEngine
};