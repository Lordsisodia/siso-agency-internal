/**
 * 🛡️ Loss Aversion Gamification Service
 * Implements 2024 research on loss aversion psychology for streak protection
 * and sustainable habit formation
 */

// =====================================================
// 🛡️ STREAK PROTECTION & LOSS AVERSION SYSTEM
// =====================================================

export interface StreakData {
  currentLength: number;
  longestEver: number;
  lastActivity: Date;
  streakType: 'daily' | 'weekly' | 'custom';
  valueInXP: number; // How much XP this streak is worth
  protectionLevel: number; // 0-3 levels of protection purchased
  freezesUsed: number; // Number of freeze days used this streak
  maxFreezes: number; // Maximum freezes allowed
}

export interface StreakProtection {
  type: 'insurance' | 'freeze' | 'grace' | 'recovery';
  name: string;
  description: string;
  costInXP: number;
  durationHours: number;
  effectiveness: number; // 0-1 how well it protects
  conditions: string[];
}

export interface RiskAssessment {
  riskLevel: 'safe' | 'warning' | 'critical' | 'lost';
  hoursUntilBreak: number;
  streakValue: number;
  lossAversionScore: number; // 0-1 how motivated user should be to protect
  emotionalImpact: 'minimal' | 'moderate' | 'significant' | 'devastating';
  protectionRecommendations: StreakProtection[];
}

export interface RecoveryPlan {
  isEligible: boolean;
  recoveryType: 'instant' | 'partial' | 'rebuild' | 'none';
  costInXP: number;
  recoveredLength: number;
  conditions: string[];
  motivationalMessage: string;
}

export class LossAversionEngine {
  
  /**
   * 💎 Calculate the psychological value of a streak
   * Based on 2024 research: loss aversion is 2x more powerful than gains
   */
  static calculateStreakValue(streak: StreakData): {
    currentValue: number;
    lossImpact: number;
    protectionWorth: number;
    emotionalWeight: string;
  } {
    const baseValue = streak.currentLength * 10; // 10 XP per day
    
    // Exponential value growth (longer streaks are disproportionately valuable)
    const exponentialBonus = Math.pow(streak.currentLength, 1.3) * 2;
    
    // Personal record bonus (losing your best streak is extra painful)
    const recordBonus = streak.currentLength === streak.longestEver ? streak.currentLength * 5 : 0;
    
    // Milestone proximity bonus (closer to round numbers = higher value)
    const nextMilestone = this.getNextMilestone(streak.currentLength);
    const proximityToMilestone = 1 - (nextMilestone - streak.currentLength) / nextMilestone;
    const milestoneBonus = proximityToMilestone * nextMilestone * 3;
    
    const currentValue = Math.round(baseValue + exponentialBonus + recordBonus + milestoneBonus);
    
    // Loss aversion: losing feels 2.25x worse than gaining (2024 research finding)
    const lossImpact = currentValue * 2.25;
    
    // Protection worth: users will pay up to 15% of streak value to protect it
    const protectionWorth = Math.round(currentValue * 0.15);
    
    // Emotional categorization
    let emotionalWeight = 'minimal';
    if (streak.currentLength >= 30) emotionalWeight = 'devastating';
    else if (streak.currentLength >= 14) emotionalWeight = 'significant';
    else if (streak.currentLength >= 7) emotionalWeight = 'moderate';
    
    return {
      currentValue,
      lossImpact,
      protectionWorth,
      emotionalWeight
    };
  }
  
  /**
   * 🚨 Assess streak risk and trigger loss aversion response
   */
  static assessStreakRisk(
    streak: StreakData,
    currentTime: Date = new Date()
  ): RiskAssessment {
    const timeSinceLastActivity = currentTime.getTime() - streak.lastActivity.getTime();
    const hoursInactive = timeSinceLastActivity / (1000 * 60 * 60);
    
    // Calculate hours until streak breaks (24 hours for daily streaks)
    const streakWindowHours = streak.streakType === 'daily' ? 24 : 
                             streak.streakType === 'weekly' ? 168 : 24;
    const hoursUntilBreak = Math.max(0, streakWindowHours - hoursInactive);
    
    // Determine risk level
    let riskLevel: RiskAssessment['riskLevel'];
    if (hoursUntilBreak <= 0) {
      riskLevel = 'lost';
    } else if (hoursUntilBreak <= 2) {
      riskLevel = 'critical';
    } else if (hoursUntilBreak <= 6) {
      riskLevel = 'warning';
    } else {
      riskLevel = 'safe';
    }
    
    // Calculate streak value and loss aversion score
    const { currentValue, lossImpact } = this.calculateStreakValue(streak);
    
    // Loss aversion score increases as risk increases and streak value increases
    const riskMultiplier = riskLevel === 'critical' ? 1.5 : 
                          riskLevel === 'warning' ? 1.2 : 1.0;
    const lossAversionScore = Math.min(1.0, (lossImpact / 1000) * riskMultiplier);
    
    // Emotional impact assessment
    let emotionalImpact: RiskAssessment['emotionalImpact'];
    if (streak.currentLength >= 30 && riskLevel === 'critical') {
      emotionalImpact = 'devastating';
    } else if (streak.currentLength >= 14 && riskLevel !== 'safe') {
      emotionalImpact = 'significant';
    } else if (streak.currentLength >= 7) {
      emotionalImpact = 'moderate';
    } else {
      emotionalImpact = 'minimal';
    }
    
    // Generate protection recommendations
    const protectionRecommendations = this.generateProtectionOptions(
      streak, 
      riskLevel, 
      currentValue
    );
    
    return {
      riskLevel,
      hoursUntilBreak,
      streakValue: currentValue,
      lossAversionScore,
      emotionalImpact,
      protectionRecommendations
    };
  }
  
  /**
   * 🛡️ Generate streak protection options
   */
  private static generateProtectionOptions(
    streak: StreakData,
    riskLevel: RiskAssessment['riskLevel'],
    streakValue: number
  ): StreakProtection[] {
    const protections: StreakProtection[] = [];
    
    // Streak Freeze (most popular protection)
    if (streak.freezesUsed < streak.maxFreezes) {
      protections.push({
        type: 'freeze',
        name: 'Streak Freeze',
        description: 'Pause your streak for 24 hours - no progress needed',
        costInXP: Math.max(5, Math.round(streakValue * 0.08)),
        durationHours: 24,
        effectiveness: 1.0,
        conditions: [`${streak.maxFreezes - streak.freezesUsed} freezes remaining`]
      });
    }
    
    // Grace Period (cheaper but partial protection)
    protections.push({
      type: 'grace',
      name: 'Grace Period',
      description: 'Get 6 extra hours to maintain your streak',
      costInXP: Math.max(3, Math.round(streakValue * 0.04)),
      durationHours: 6,
      effectiveness: 0.7,
      conditions: ['Must complete task within grace period']
    });
    
    // Streak Insurance (pre-purchase protection)
    if (riskLevel === 'safe' && streak.protectionLevel < 3) {
      protections.push({
        type: 'insurance',
        name: 'Streak Insurance',
        description: 'Pre-pay for automatic protection if you miss a day',
        costInXP: Math.max(8, Math.round(streakValue * 0.12)),
        durationHours: 168, // 1 week coverage
        effectiveness: 0.9,
        conditions: ['Automatically activates if streak at risk']
      });
    }
    
    // Emergency Recovery (post-break recovery option)
    if (riskLevel === 'lost') {
      const recoveryPlan = this.calculateRecoveryOptions(streak);
      if (recoveryPlan.isEligible) {
        protections.push({
          type: 'recovery',
          name: 'Streak Recovery',
          description: 'Restore part of your lost streak',
          costInXP: recoveryPlan.costInXP,
          durationHours: 0,
          effectiveness: recoveryPlan.recoveredLength / streak.currentLength,
          conditions: recoveryPlan.conditions
        });
      }
    }
    
    return protections.sort((a, b) => b.effectiveness - a.effectiveness);
  }
  
  /**
   * 🔄 Calculate recovery options for broken streaks
   * Implements "fresh start effect" psychology
   */
  static calculateRecoveryOptions(streak: StreakData): RecoveryPlan {
    const streakLength = streak.currentLength;
    
    // Recovery eligibility conditions
    const timeSinceBreak = Date.now() - streak.lastActivity.getTime();
    const hoursLate = timeSinceBreak / (1000 * 60 * 60) - 24; // Hours past deadline
    
    let isEligible = false;
    let recoveryType: RecoveryPlan['recoveryType'] = 'none';
    let costInXP = 0;
    let recoveredLength = 0;
    let conditions: string[] = [];
    let motivationalMessage = '';
    
    // Instant Recovery (within 4 hours of break)
    if (hoursLate <= 4 && streakLength >= 7) {
      isEligible = true;
      recoveryType = 'instant';
      costInXP = Math.round(streakLength * 8); // 8 XP per day of streak
      recoveredLength = streakLength;
      conditions = ['Must be used within 4 hours of streak break'];
      motivationalMessage = '⚡ Quick recovery! Your dedication deserves a second chance.';
    }
    // Partial Recovery (within 24 hours)
    else if (hoursLate <= 24 && streakLength >= 14) {
      isEligible = true;
      recoveryType = 'partial';
      costInXP = Math.round(streakLength * 12);
      recoveredLength = Math.floor(streakLength * 0.7); // Recover 70%
      conditions = ['Must be used within 24 hours', 'Complete 2 tasks to activate'];
      motivationalMessage = '🔄 Bounce back stronger! Recover most of your progress.';
    }
    // Rebuild Bonus (fresh start with bonus)
    else if (streakLength >= 5) {
      isEligible = true;
      recoveryType = 'rebuild';
      costInXP = Math.round(streakLength * 3);
      recoveredLength = Math.min(7, Math.floor(streakLength * 0.3));
      conditions = ['Start fresh with momentum bonus', '1.5x XP for first 7 days'];
      motivationalMessage = '🌱 Fresh start advantage! Begin with earned momentum.';
    }
    
    return {
      isEligible,
      recoveryType,
      costInXP,
      recoveredLength,
      conditions,
      motivationalMessage
    };
  }
  
  /**
   * 📊 Generate loss aversion notifications
   * Implement psychological triggers at optimal times
   */
  static generateLossAversionNotifications(
    riskAssessment: RiskAssessment,
    streak: StreakData
  ): {
    urgency: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    message: string;
    actionButtons: { text: string; action: string; cost?: number }[];
    psychologyTriggers: string[];
  } {
    const { riskLevel, hoursUntilBreak, streakValue, emotionalImpact } = riskAssessment;
    
    let urgency: 'low' | 'medium' | 'high' | 'critical';
    let title: string;
    let message: string;
    let actionButtons: { text: string; action: string; cost?: number }[] = [];
    let psychologyTriggers: string[] = [];
    
    switch (riskLevel) {
      case 'critical':
        urgency = 'critical';
        title = '🚨 STREAK ALERT: Immediate Action Required';
        message = `Your ${streak.currentLength}-day streak worth ${streakValue} XP will be lost in ${Math.round(hoursUntilBreak)} hours! ` +
                 `Don't let ${streak.currentLength} days of progress vanish.`;
        actionButtons = [
          { text: '🛡️ Use Streak Freeze', action: 'freeze', cost: Math.round(streakValue * 0.08) },
          { text: '⏰ Get Grace Period', action: 'grace', cost: Math.round(streakValue * 0.04) },
          { text: '⚡ Complete Task Now', action: 'task', cost: 0 }
        ];
        psychologyTriggers = [
          'SCARCITY: Limited time remaining',
          'LOSS_AVERSION: Emphasize what will be lost',
          'SUNK_COST: Highlight invested effort'
        ];
        break;
        
      case 'warning':
        urgency = 'high';
        title = '⚠️ Streak Protection Recommended';
        message = `Your ${streak.currentLength}-day streak has ${Math.round(hoursUntilBreak)} hours remaining. ` +
                 `Consider protecting your ${streakValue} XP investment.`;
        actionButtons = [
          { text: '🛡️ Protect Streak', action: 'freeze', cost: Math.round(streakValue * 0.08) },
          { text: '📋 Quick Task', action: 'quick_task', cost: 0 }
        ];
        psychologyTriggers = [
          'PREVENTION_FOCUS: Avoid loss',
          'INVESTMENT_PROTECTION: Safeguard progress'
        ];
        break;
        
      case 'safe':
        urgency = 'low';
        title = '💎 Streak Insurance Available';
        message = `Your ${streak.currentLength}-day streak is safe for now. ` +
                 `Consider streak insurance for peace of mind.`;
        actionButtons = [
          { text: '🛡️ Buy Insurance', action: 'insurance', cost: Math.round(streakValue * 0.12) }
        ];
        psychologyTriggers = [
          'PREPARATION: Future protection',
          'PEACE_OF_MIND: Reduce anxiety'
        ];
        break;
        
      case 'lost':
        urgency = 'medium';
        title = '💔 Streak Lost - Recovery Options';
        message = `Your ${streak.currentLength}-day streak is broken, but recovery is possible! ` +
                 `Don't let this setback end your momentum.`;
        const recovery = this.calculateRecoveryOptions(streak);
        if (recovery.isEligible) {
          actionButtons = [
            { text: '🔄 Recover Streak', action: 'recover', cost: recovery.costInXP },
            { text: '🌱 Fresh Start', action: 'restart', cost: 0 }
          ];
        }
        psychologyTriggers = [
          'FRESH_START_EFFECT: New beginning opportunity',
          'RESILIENCE: Bounce back stronger'
        ];
        break;
    }
    
    return {
      urgency,
      title,
      message,
      actionButtons,
      psychologyTriggers
    };
  }
  
  // Helper Methods
  
  private static getNextMilestone(currentStreak: number): number {
    const milestones = [7, 14, 30, 50, 100, 200, 365];
    return milestones.find(m => m > currentStreak) || currentStreak + 100;
  }
  
  /**
   * 🎯 Calculate optimal notification timing
   * Based on behavioral psychology research
   */
  static calculateOptimalNotificationTiming(
    streak: StreakData,
    userTimezone: string = 'UTC'
  ): {
    scheduleTime: Date;
    notificationType: 'reminder' | 'warning' | 'critical';
    message: string;
  } {
    const now = new Date();
    const lastActivity = new Date(streak.lastActivity);
    const hoursInactive = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
    
    let scheduleTime: Date;
    let notificationType: 'reminder' | 'warning' | 'critical';
    let message: string;
    
    if (hoursInactive < 12) {
      // Early reminder (evening of same day)
      scheduleTime = new Date(lastActivity.getTime() + 18 * 60 * 60 * 1000); // 18 hours after
      notificationType = 'reminder';
      message = '🌙 Evening reminder: Keep your streak alive with a quick task';
    } else if (hoursInactive < 20) {
      // Warning notification (4 hours before break)
      scheduleTime = new Date(lastActivity.getTime() + 20 * 60 * 60 * 1000); // 20 hours after
      notificationType = 'warning';
      message = '⚠️ 4 hours left: Your streak needs attention';
    } else {
      // Critical notification (1 hour before break)
      scheduleTime = new Date(lastActivity.getTime() + 23 * 60 * 60 * 1000); // 23 hours after
      notificationType = 'critical';
      message = '🚨 URGENT: 1 hour to save your streak!';
    }
    
    return {
      scheduleTime,
      notificationType,
      message
    };
  }
}

// =====================================================
// 🧠 BEHAVIORAL PSYCHOLOGY HELPERS
// =====================================================

export class BehavioralPsychologyHelpers {
  
  /**
   * 💫 Generate "near-miss" experiences
   * Creates excitement and maintains engagement through close calls
   */
  static generateNearMissExperience(
    achievementThreshold: number,
    currentProgress: number
  ): {
    isNearMiss: boolean;
    distanceFromGoal: number;
    motivationMessage: string;
    urgencyBonus: number;
  } {
    const distanceFromGoal = achievementThreshold - currentProgress;
    const progressPercentage = currentProgress / achievementThreshold;
    
    // Near-miss is when you're 85-95% of the way to goal
    const isNearMiss = progressPercentage >= 0.85 && progressPercentage < 1.0;
    
    let motivationMessage = '';
    let urgencyBonus = 0;
    
    if (isNearMiss) {
      if (distanceFromGoal <= 5) {
        motivationMessage = `🔥 SO CLOSE! Just ${distanceFromGoal} more to unlock!`;
        urgencyBonus = 1.5;
      } else if (distanceFromGoal <= 20) {
        motivationMessage = `⚡ Almost there! Only ${distanceFromGoal} away from your goal!`;
        urgencyBonus = 1.2;
      } else {
        motivationMessage = `🎯 You're in the final stretch - ${distanceFromGoal} to go!`;
        urgencyBonus = 1.1;
      }
    }
    
    return {
      isNearMiss,
      distanceFromGoal,
      motivationMessage,
      urgencyBonus
    };
  }
  
  /**
   * 🎰 Implement intermittent reinforcement schedules
   * Most addictive reward pattern from casino psychology
   */
  static calculateIntermittentReward(
    action: string,
    userHistory: { action: string; timestamp: Date; rewarded: boolean }[]
  ): {
    shouldReward: boolean;
    rewardType: 'none' | 'small' | 'medium' | 'jackpot';
    nextRewardProbability: number;
    streakSinceLastReward: number;
  } {
    const recentHistory = userHistory.slice(-20); // Last 20 actions
    const lastReward = recentHistory.find(h => h.rewarded);
    const streakSinceLastReward = lastReward ? 
      recentHistory.indexOf(lastReward) : recentHistory.length;
    
    // Variable ratio schedule: average 1 reward per 7 actions, but unpredictable
    const baseRewardProbability = 1/7;
    
    // Increase probability if user hasn't been rewarded in a while
    let adjustedProbability = baseRewardProbability;
    if (streakSinceLastReward > 10) {
      adjustedProbability = 0.3; // 30% chance after 10 actions
    } else if (streakSinceLastReward > 5) {
      adjustedProbability = 0.2; // 20% chance after 5 actions
    }
    
    const shouldReward = Math.random() < adjustedProbability;
    
    let rewardType: 'none' | 'small' | 'medium' | 'jackpot' = 'none';
    if (shouldReward) {
      // Determine reward magnitude
      const roll = Math.random();
      if (roll < 0.05) { // 5% chance
        rewardType = 'jackpot';
      } else if (roll < 0.25) { // 20% chance
        rewardType = 'medium';
      } else { // 75% chance
        rewardType = 'small';
      }
    }
    
    return {
      shouldReward,
      rewardType,
      nextRewardProbability: shouldReward ? baseRewardProbability : adjustedProbability,
      streakSinceLastReward
    };
  }
}

export default {
  LossAversionEngine,
  BehavioralPsychologyHelpers
};