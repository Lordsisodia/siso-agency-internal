/**
 * 🧠 Intelligent XP Service
 * AI-powered XP allocation based on comprehensive task analysis
 */

export interface IntelligentXPCalculation {
  // Base components
  baseXP: number;
  priorityMultiplier: number;
  complexityBonus: number;
  learningBonus: number;
  strategicBonus: number;
  durationMultiplier: number;
  
  // Psychology bonuses
  streakBonus: number;
  perfectDayBonus: number;
  consecutiveBonus: number;
  timeOfDayBonus: number;
  
  // Gamification
  levelMultiplier: number;
  achievementBonus: number;
  comboMultiplier: number;
  
  // Final calculation
  finalXP: number;
  breakdown: string[];
  confidenceScore: number;
}

export interface TaskXPContext {
  // Task properties
  title: string;
  description?: string;
  priority: 'CRITICAL' | 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  workType: 'DEEP' | 'LIGHT' | 'MORNING';
  difficulty?: 'TRIVIAL' | 'EASY' | 'MODERATE' | 'HARD' | 'EXPERT';
  estimatedDuration?: number; // minutes
  
  // AI analysis scores (0-10)
  complexity?: number;
  learningValue?: number;
  strategicImportance?: number;
  
  // User context
  currentStreak?: number;
  tasksCompletedToday?: number;
  consecutiveDays?: number;
  userLevel?: number;
  activeAchievements?: string[];
  recentCompletion?: boolean; // Within last hour
  
  // Time context
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
  isWeekend?: boolean;
  completedInFocusSession?: boolean;
}

/**
 * 🎮 Gamification Service  
 * Levels, achievements, combos, and progression
 */
export class GamificationService {
  
  /**
   * Calculate user level from total XP
   */
  static calculateLevel(totalXP: number): { level: number, xpInLevel: number, xpForNextLevel: number } {
    // Progressive level requirements: 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500...
    // Formula: level_n_xp = 100 + (level-1) * 200 + (level-1)^2 * 50
    
    let level = 1;
    let totalRequired = 0;
    
    while (true) {
      const levelRequired = 100 + (level - 1) * 200 + Math.pow(level - 1, 2) * 50;
      if (totalXP < totalRequired + levelRequired) {
        break;
      }
      totalRequired += levelRequired;
      level++;
    }
    
    const currentLevelRequired = 100 + (level - 1) * 200 + Math.pow(level - 1, 2) * 50;
    const xpInLevel = totalXP - totalRequired;
    const xpForNextLevel = currentLevelRequired - xpInLevel;
    
    return { level, xpInLevel, xpForNextLevel };
  }
  
  /**
   * Check for achievements based on task completion
   */
  static checkAchievements(context: TaskXPContext, userStats: any): string[] {
    const newAchievements: string[] = [];
    
    // Streak achievements
    if (context.currentStreak === 3) newAchievements.push('🔥 Hot Streak');
    if (context.currentStreak === 7) newAchievements.push('⚡ Weekly Warrior');
    if (context.currentStreak === 30) newAchievements.push('💎 Diamond Streak');
    
    // Daily achievements  
    if (context.tasksCompletedToday === 5) newAchievements.push('📈 Daily Grind');
    if (context.tasksCompletedToday === 10) newAchievements.push('🚀 Productivity Beast');
    
    // Difficulty achievements
    if (context.difficulty === 'EXPERT') newAchievements.push('🧠 Expert Crusher');
    if (context.priority === 'CRITICAL') newAchievements.push('🎯 Critical Success');
    
    // Work type achievements
    if (context.workType === 'DEEP' && context.estimatedDuration && context.estimatedDuration >= 120) {
      newAchievements.push('🧘 Deep Work Master');
    }
    
    // Learning achievements
    if (context.learningValue && context.learningValue >= 8) {
      newAchievements.push('📚 Knowledge Hunter');
    }
    
    return newAchievements;
  }
  
  /**
   * Calculate combo multiplier for consecutive task completions
   */
  static calculateComboMultiplier(recentCompletions: number): number {
    if (recentCompletions <= 1) return 1.0;
    if (recentCompletions === 2) return 1.1; // +10%
    if (recentCompletions === 3) return 1.25; // +25%
    if (recentCompletions === 4) return 1.4; // +40%
    return Math.min(1.5, 1 + (recentCompletions * 0.1)); // Cap at +50%
  }
}

/**
 * 🎯 Intelligent XP Allocation System
 * Uses AI analysis and gamification for optimal motivation
 */
export class IntelligentXPService {
  
  /**
   * Main XP calculation with full intelligence
   */
  static calculateIntelligentXP(context: TaskXPContext): IntelligentXPCalculation {
    
    // 1. BASE XP from work type and duration
    const baseXP = this.calculateBaseXP(context);
    
    // 2. PRIORITY MULTIPLIER (most important factor)
    const priorityMultiplier = this.getPriorityMultiplier(context.priority);
    
    // 3. AI ANALYSIS BONUSES
    const complexityBonus = this.calculateComplexityBonus(context.complexity || 5);
    const learningBonus = this.calculateLearningBonus(context.learningValue || 5);
    const strategicBonus = this.calculateStrategicBonus(context.strategicImportance || 5);
    
    // 4. DURATION MULTIPLIER
    const durationMultiplier = this.getDurationMultiplier(context.estimatedDuration || 30);
    
    // 5. PSYCHOLOGY BONUSES
    const streakBonus = this.calculateStreakBonus(context.currentStreak || 0);
    const perfectDayBonus = this.calculatePerfectDayBonus(context.tasksCompletedToday || 0);
    const consecutiveBonus = this.calculateConsecutiveBonus(context.consecutiveDays || 0);
    const timeOfDayBonus = this.calculateTimeBonus(context);
    
    // 6. GAMIFICATION MULTIPLIERS
    const levelMultiplier = this.getLevelMultiplier(context.userLevel || 1);
    const achievementBonus = this.calculateAchievementBonus(context.activeAchievements || []);
    const comboMultiplier = context.recentCompletion ? 
      GamificationService.calculateComboMultiplier(2) : 1.0;
    
    // 7. CALCULATE FINAL XP
    const coreXP = Math.round(
      baseXP * priorityMultiplier * durationMultiplier * levelMultiplier * comboMultiplier
    );
    
    const bonusXP = complexityBonus + learningBonus + strategicBonus + 
                   streakBonus + perfectDayBonus + consecutiveBonus + 
                   timeOfDayBonus + achievementBonus;
    
    const finalXP = Math.max(5, coreXP + bonusXP); // Minimum 5 XP
    
    // 8. CONFIDENCE SCORE (how sure we are about this XP amount)
    const confidenceScore = this.calculateConfidence(context);
    
    // 9. BREAKDOWN FOR USER UNDERSTANDING
    const breakdown = this.generateBreakdown({
      baseXP, priorityMultiplier, complexityBonus, learningBonus, 
      strategicBonus, durationMultiplier, streakBonus, perfectDayBonus,
      consecutiveBonus, timeOfDayBonus, levelMultiplier, achievementBonus,
      comboMultiplier, finalXP, context
    });
    
    return {
      baseXP,
      priorityMultiplier,
      complexityBonus,
      learningBonus,
      strategicBonus,
      durationMultiplier,
      streakBonus,
      perfectDayBonus,
      consecutiveBonus,
      timeOfDayBonus,
      levelMultiplier,
      achievementBonus,
      comboMultiplier,
      finalXP,
      breakdown,
      confidenceScore
    };
  }
  
  // PRIVATE CALCULATION METHODS
  
  private static calculateBaseXP(context: TaskXPContext): number {
    const workTypeBase = {
      'DEEP': 50,      // Deep work gets premium XP
      'LIGHT': 25,     // Light tasks get standard XP
      'MORNING': 35    // Morning tasks get bonus for good habits
    };
    
    const difficultyMultiplier = {
      'TRIVIAL': 0.7,
      'EASY': 0.85,
      'MODERATE': 1.0,
      'HARD': 1.3,
      'EXPERT': 1.6
    };
    
    const base = workTypeBase[context.workType] || 25;
    const difficulty = difficultyMultiplier[context.difficulty || 'MODERATE'] || 1.0;
    
    return Math.round(base * difficulty);
  }
  
  private static getPriorityMultiplier(priority: string): number {
    const multipliers = {
      'CRITICAL': 2.0,   // Double XP for critical tasks
      'URGENT': 1.6,     // 60% bonus for urgent
      'HIGH': 1.3,       // 30% bonus for high
      'MEDIUM': 1.0,     // Standard rate
      'LOW': 0.8         // 20% less for low priority
    };
    return multipliers[priority as keyof typeof multipliers] || 1.0;
  }
  
  private static calculateComplexityBonus(complexity: number): number {
    // 0-10 scale, bonus ranges from 0-25 XP
    return Math.round((complexity / 10) * 25);
  }
  
  private static calculateLearningBonus(learningValue: number): number {
    // Learning is valuable - 0-30 XP bonus
    return Math.round((learningValue / 10) * 30);
  }
  
  private static calculateStrategicBonus(strategicImportance: number): number {
    // Strategic tasks get big bonuses - 0-35 XP
    return Math.round((strategicImportance / 10) * 35);
  }
  
  private static getDurationMultiplier(minutes: number): number {
    // Longer tasks get diminishing returns to encourage breaking things down
    if (minutes <= 15) return 0.8;   // Quick tasks get less
    if (minutes <= 30) return 1.0;   // Sweet spot
    if (minutes <= 60) return 1.2;   // Good duration
    if (minutes <= 120) return 1.3;  // Long task bonus
    return 1.2; // Very long tasks don't get massive bonuses
  }
  
  private static calculateStreakBonus(streak: number): number {
    if (streak === 0) return 0;
    // Logarithmic growth: 3, 8, 12, 15, 18, 20... caps at 25
    return Math.min(25, Math.round(Math.log(streak + 1) * 6));
  }
  
  private static calculatePerfectDayBonus(tasksToday: number): number {
    if (tasksToday >= 10) return 20; // Perfect day bonus
    if (tasksToday >= 7) return 15;  // Great day
    if (tasksToday >= 5) return 10;  // Good day
    return 0;
  }
  
  private static calculateConsecutiveBonus(consecutiveDays: number): number {
    if (consecutiveDays >= 7) return 15; // Week of productivity
    if (consecutiveDays >= 3) return 8;  // Few days running
    return 0;
  }
  
  private static calculateTimeBonus(context: TaskXPContext): number {
    let bonus = 0;
    if (context.timeOfDay === 'morning') bonus += 8; // Morning bonus
    if (context.isWeekend) bonus += 12; // Weekend work bonus
    if (context.completedInFocusSession) bonus += 10; // Focus session bonus
    return bonus;
  }
  
  private static getLevelMultiplier(level: number): number {
    // Higher levels get small multipliers to maintain progression
    return 1.0 + (level - 1) * 0.02; // +2% per level above 1
  }
  
  private static calculateAchievementBonus(achievements: string[]): number {
    return achievements.length * 5; // 5 XP per active achievement
  }
  
  private static calculateConfidence(context: TaskXPContext): number {
    let confidence = 50; // Base confidence
    
    // More data = higher confidence
    if (context.complexity !== undefined) confidence += 15;
    if (context.learningValue !== undefined) confidence += 15;
    if (context.strategicImportance !== undefined) confidence += 15;
    if (context.estimatedDuration) confidence += 10;
    if (context.description) confidence += 5;
    
    return Math.min(100, confidence);
  }
  
  private static generateBreakdown(params: any): string[] {
    const { baseXP, priorityMultiplier, complexityBonus, learningBonus, 
            strategicBonus, streakBonus, finalXP, context } = params;
    
    const breakdown = [];
    breakdown.push(`🎯 Base XP: ${baseXP} (${context.workType} ${context.difficulty || 'moderate'})`);
    
    if (priorityMultiplier !== 1.0) {
      const bonus = Math.round(baseXP * (priorityMultiplier - 1));
      breakdown.push(`⚡ Priority: +${bonus} (${context.priority})`);
    }
    
    if (complexityBonus > 0) {
      breakdown.push(`🧠 Complexity: +${complexityBonus}`);
    }
    
    if (learningBonus > 0) {
      breakdown.push(`📚 Learning: +${learningBonus}`);
    }
    
    if (strategicBonus > 0) {
      breakdown.push(`🎯 Strategic: +${strategicBonus}`);
    }
    
    if (streakBonus > 0) {
      breakdown.push(`🔥 Streak: +${streakBonus} (${context.currentStreak} days)`);
    }
    
    breakdown.push(`💎 Total: ${finalXP} XP`);
    return breakdown;
  }
}

/**
 * 🤖 Auto Task Importance Detection
 * AI-powered analysis of task importance from content
 */
export class TaskImportanceDetector {
  
  /**
   * Analyze task importance from text content
   */
  static analyzeImportance(title: string, description?: string): {
    priority: 'CRITICAL' | 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
    complexity: number;
    learningValue: number;
    strategicImportance: number;
    reasoning: string[];
  } {
    const text = `${title} ${description || ''}`.toLowerCase();
    const reasoning: string[] = [];
    
    let priority: 'CRITICAL' | 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
    let complexity = 5;
    let learningValue = 5;
    let strategicImportance = 5;
    
    // PRIORITY DETECTION (check low priority first to catch "low priority" phrases)
    if (this.containsWords(text, ['minor', 'low priority', 'low', 'whenever', 'optional', 'routine', 'maintenance'])) {
      priority = 'LOW';
      reasoning.push('Contains low-priority indicators');
    } else if (this.containsWords(text, ['critical', 'emergency', 'urgent', 'asap', 'immediate'])) {
      priority = 'CRITICAL';
      reasoning.push('Contains urgency keywords');
    } else if (this.containsWords(text, ['important', 'high priority', 'deadline', 'due'])) {
      priority = 'HIGH';
      reasoning.push('Contains importance indicators');
    }
    
    // COMPLEXITY DETECTION
    if (this.containsWords(text, ['complex', 'difficult', 'challenging', 'research', 'analyze', 'outage', 'server', 'bug', 'fix'])) {
      complexity += 3;
      reasoning.push('Indicates high complexity');
    } else if (this.containsWords(text, ['simple', 'quick', 'easy', 'basic', 'minor', 'routine', 'update'])) {
      complexity -= 3;
      reasoning.push('Indicates low complexity');
    }
    
    // LEARNING VALUE DETECTION
    if (this.containsWords(text, ['learn', 'study', 'research', 'explore', 'understand', 'master'])) {
      learningValue += 3;
      reasoning.push('High learning opportunity');
    } else if (this.containsWords(text, ['routine', 'repeat', 'maintenance', 'admin'])) {
      learningValue -= 2;
      reasoning.push('Routine task with limited learning');
    }
    
    // STRATEGIC IMPORTANCE
    if (this.containsWords(text, ['strategy', 'growth', 'revenue', 'client', 'launch', 'project'])) {
      strategicImportance += 3;
      reasoning.push('Strategic business impact');
    } else if (this.containsWords(text, ['personal', 'hobby', 'fun', 'entertainment'])) {
      strategicImportance -= 1;
      reasoning.push('Personal/non-strategic task');
    }
    
    // Normalize to 0-10 scale
    complexity = Math.max(1, Math.min(10, complexity));
    learningValue = Math.max(1, Math.min(10, learningValue));
    strategicImportance = Math.max(1, Math.min(10, strategicImportance));
    
    return { priority, complexity, learningValue, strategicImportance, reasoning };
  }
  
  private static containsWords(text: string, words: string[]): boolean {
    return words.some(word => text.includes(word));
  }
}