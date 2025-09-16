/**
 * XP Psychology Utilities - Safe Calculation Functions
 * 
 * Pure utility functions for psychological gamification features.
 * These don't touch the database and are safe to develop independently.
 */

export interface VariableBonusResult {
  hasBonus: boolean;
  multiplier: number;
  bonusType: 'consistency' | 'productivity' | 'health' | 'mega';
  celebrationMessage: string;
  bonusXP?: number;
}

export interface NearMissNotification {
  rewardName: string;
  rewardEmoji: string;
  xpNeeded: number;
  urgencyLevel: 'low' | 'medium' | 'high';
  psychologyMessage: string;
  estimatedEarnTime: string;
}

export interface SpendingPsychologyResult {
  shouldShowConfirmation: boolean;
  frictionLevel: 'low' | 'medium' | 'high';
  justificationMessage: string;
  consequenceWarning?: string;
  encouragementMessage: string;
}

export interface LifeBonusCalculation {
  sleepBonus: number;
  energyBonus: number;
  moodBonus: number;
  habitStreakBonus: number;
  workoutBonus: number;
  totalMultiplier: number;
  bonusBreakdown: string[];
}

/**
 * Psychology Utilities Class
 * All functions are pure and safe to use
 */
export class XPPsychologyUtils {

  /**
   * Variable Ratio Bonus System - Addiction Psychology
   * Creates unpredictable rewards for maximum dopamine response
   */
  static calculateVariableBonus(
    recentTaskCount: number,
    consecutiveDays: number,
    hasHealthFocus: boolean = false
  ): VariableBonusResult {
    
    // 15% base chance for bonus (optimal for slot machine effect)
    const bonusChance = 0.15;
    
    if (Math.random() > bonusChance) {
      return {
        hasBonus: false,
        multiplier: 1.0,
        bonusType: 'productivity',
        celebrationMessage: ''
      };
    }

    // Determine bonus type and multiplier based on patterns
    let bonusType: 'consistency' | 'productivity' | 'health' | 'mega' = 'productivity';
    let multiplier = 1.5 + Math.random() * 1.5; // 1.5x to 3x base bonus

    // 5% chance for MEGA bonus (maximum psychological impact)
    if (Math.random() < 0.05) {
      bonusType = 'mega';
      multiplier = 4.0 + Math.random() * 2.0; // 4x to 6x
    }
    // Consistency bonus for streak patterns
    else if (consecutiveDays >= 3) {
      bonusType = 'consistency';
      multiplier = 2.0 + (consecutiveDays * 0.1); // Up to 3x for long streaks
    }
    // Health bonus for wellness focus
    else if (hasHealthFocus) {
      bonusType = 'health';
      multiplier = 2.5 + Math.random() * 0.5; // 2.5x to 3x
    }

    const celebrationMessages = {
      productivity: `🚀 PRODUCTIVITY STREAK! ${multiplier.toFixed(1)}x XP BONUS!`,
      consistency: `🔥 CONSISTENCY MASTER! ${multiplier.toFixed(1)}x XP for ${consecutiveDays} days!`,
      health: `💪 WELLNESS WARRIOR! ${multiplier.toFixed(1)}x XP for health focus!`,
      mega: `⚡ LEGENDARY BONUS! ${multiplier.toFixed(1)}x XP - YOU'RE UNSTOPPABLE! ⚡`
    };

    return {
      hasBonus: true,
      multiplier: Math.min(multiplier, 6.0), // Cap at 6x for sanity
      bonusType,
      celebrationMessage: celebrationMessages[bonusType]
    };
  }

  /**
   * Near-Miss Psychology - Creates urgency and motivation
   * Triggers when user is close to affording rewards
   */
  static generateNearMissNotifications(
    userXP: number,
    availableRewards: Array<{ name: string; emoji: string; price: number }>,
    averageXPPerTask: number = 50
  ): NearMissNotification[] {
    
    const nearMissRewards: NearMissNotification[] = [];

    for (const reward of availableRewards) {
      const xpNeeded = reward.price - userXP;
      
      // Near miss: within 20-200 XP of affordability (psychological sweet spot)
      if (xpNeeded > 0 && xpNeeded <= 200) {
        const tasksNeeded = Math.ceil(xpNeeded / averageXPPerTask);
        
        let urgencyLevel: 'low' | 'medium' | 'high' = 'low';
        let psychologyMessage = '';
        
        if (xpNeeded <= 50) {
          urgencyLevel = 'high';
          psychologyMessage = `🔥 SO CLOSE! Just ${xpNeeded} XP more for ${reward.emoji} ${reward.name}!`;
        } else if (xpNeeded <= 100) {
          urgencyLevel = 'medium';
          psychologyMessage = `🎯 Almost there! ${xpNeeded} XP away from ${reward.emoji} ${reward.name}`;
        } else {
          urgencyLevel = 'low';
          psychologyMessage = `💪 ${reward.emoji} ${reward.name} is within reach - ${xpNeeded} more XP!`;
        }
        
        nearMissRewards.push({
          rewardName: reward.name,
          rewardEmoji: reward.emoji,
          xpNeeded,
          urgencyLevel,
          psychologyMessage,
          estimatedEarnTime: `${tasksNeeded} more task${tasksNeeded > 1 ? 's' : ''}`
        });
      }
    }

    // Return sorted by urgency (closest first)
    return nearMissRewards.sort((a, b) => a.xpNeeded - b.xpNeeded);
  }

  /**
   * Spending Psychology - Loss Aversion and Conscious Decision Making
   * Creates friction to make spending feel valuable
   */
  static calculateSpendingPsychology(
    rewardPrice: number,
    userXP: number,
    hoursToReEarn: number,
    rewardName: string
  ): SpendingPsychologyResult {
    
    const remainingXP = userXP - rewardPrice;
    const percentageOfBalance = (rewardPrice / userXP) * 100;
    
    // Determine friction level based on cost
    let frictionLevel: 'low' | 'medium' | 'high' = 'low';
    const shouldShowConfirmation = true;
    
    if (percentageOfBalance >= 50) {
      frictionLevel = 'high';
    } else if (percentageOfBalance >= 25) {
      frictionLevel = 'medium';
    }

    // Justification message (removes guilt)
    const justificationMessage = `You EARNED this ${rewardName} through productive work! You deserve this reward.`;
    
    // Consequence warning (loss aversion)
    let consequenceWarning: string | undefined;
    if (remainingXP < 200) {
      consequenceWarning = `⚠️ This will leave you with only ${remainingXP} XP. You'll need ${hoursToReEarn} hours to re-earn this amount.`;
    }
    
    // Encouragement (positive reinforcement)
    const encouragementMessage = remainingXP >= 500 
      ? `💰 Great XP management! You'll still have ${remainingXP} XP after this purchase.`
      : `🎯 Perfect timing for a reward! You've been consistently productive.`;

    return {
      shouldShowConfirmation,
      frictionLevel,
      justificationMessage,
      consequenceWarning,
      encouragementMessage
    };
  }

  /**
   * Life Tracking Bonus Calculator
   * Integrates health/habit data with XP multipliers
   */
  static calculateLifeBonus(healthData: {
    sleepHours?: number;
    energyLevel?: number; // 1-10
    moodLevel?: number; // 1-10
    workoutCompleted?: boolean;
    noWeedStreak?: number;
    noScrollingStreak?: number;
  }): LifeBonusCalculation {
    
    const bonusBreakdown: string[] = [];
    
    // Sleep bonus (1.0x - 1.3x)
    let sleepBonus = 1.0;
    if (healthData.sleepHours) {
      if (healthData.sleepHours >= 8) {
        sleepBonus = 1.3;
        bonusBreakdown.push('🛏️ Perfect sleep: +30% XP');
      } else if (healthData.sleepHours >= 7) {
        sleepBonus = 1.2;
        bonusBreakdown.push('😴 Good sleep: +20% XP');
      } else if (healthData.sleepHours >= 6) {
        sleepBonus = 1.1;
        bonusBreakdown.push('🌙 Decent sleep: +10% XP');
      }
    }
    
    // Energy bonus (1.0x - 1.2x)
    let energyBonus = 1.0;
    if (healthData.energyLevel) {
      if (healthData.energyLevel >= 8) {
        energyBonus = 1.2;
        bonusBreakdown.push('⚡ High energy: +20% XP');
      } else if (healthData.energyLevel >= 6) {
        energyBonus = 1.1;
        bonusBreakdown.push('🔋 Good energy: +10% XP');
      }
    }
    
    // Mood bonus (1.0x - 1.2x)
    let moodBonus = 1.0;
    if (healthData.moodLevel) {
      if (healthData.moodLevel >= 8) {
        moodBonus = 1.2;
        bonusBreakdown.push('😊 Great mood: +20% XP');
      } else if (healthData.moodLevel >= 6) {
        moodBonus = 1.1;
        bonusBreakdown.push('🙂 Good mood: +10% XP');
      }
    }
    
    // Habit streak bonus (1.0x - 1.5x)
    let habitStreakBonus = 1.0;
    const totalStreakDays = (healthData.noWeedStreak || 0) + (healthData.noScrollingStreak || 0);
    if (totalStreakDays >= 14) {
      habitStreakBonus = 1.5;
      bonusBreakdown.push('🔥 Strong habits: +50% XP');
    } else if (totalStreakDays >= 7) {
      habitStreakBonus = 1.3;
      bonusBreakdown.push('💪 Building habits: +30% XP');
    } else if (totalStreakDays >= 3) {
      habitStreakBonus = 1.2;
      bonusBreakdown.push('🌱 Starting habits: +20% XP');
    }
    
    // Workout bonus (1.0x - 1.3x)
    let workoutBonus = 1.0;
    if (healthData.workoutCompleted) {
      workoutBonus = 1.3;
      bonusBreakdown.push('🏋️ Workout complete: +30% XP');
    }
    
    // Calculate total multiplier (capped at 3.0x for sanity)
    const totalMultiplier = Math.min(
      sleepBonus * energyBonus * moodBonus * habitStreakBonus * workoutBonus,
      3.0
    );
    
    if (bonusBreakdown.length === 0) {
      bonusBreakdown.push('📊 Base XP rate - improve health metrics for bonuses!');
    }
    
    return {
      sleepBonus,
      energyBonus,
      moodBonus,
      habitStreakBonus,
      workoutBonus,
      totalMultiplier,
      bonusBreakdown
    };
  }

  /**
   * Dynamic Pricing Calculator
   * Adjusts reward prices based on usage patterns and psychology
   */
  static calculateDynamicPrice(
    basePrice: number,
    recentUsageCount: number,
    userStreak: number,
    isWeekend: boolean = false,
    rewardCategory: string = 'GENERAL'
  ): { 
    currentPrice: number; 
    discountPercent: number; 
    priceFactors: string[] 
  } {
    
    let currentPrice = basePrice;
    const priceFactors: string[] = [];
    
    // Demand multiplier (prevents overuse of same rewards)
    if (recentUsageCount >= 3) {
      currentPrice *= 1.5;
      priceFactors.push(`⬆️ High demand: +50% (used ${recentUsageCount} times recently)`);
    } else if (recentUsageCount >= 2) {
      currentPrice *= 1.25;
      priceFactors.push(`📈 Popular choice: +25% (moderate recent use)`);
    }
    
    // Streak discount (rewards consistency)
    if (userStreak >= 15) {
      currentPrice *= 0.7; // 30% discount
      priceFactors.push(`🔥 Streak master: -30% (${userStreak} day streak)`);
    } else if (userStreak >= 7) {
      currentPrice *= 0.8; // 20% discount
      priceFactors.push(`💪 Good streak: -20% (${userStreak} day streak)`);
    } else if (userStreak >= 3) {
      currentPrice *= 0.9; // 10% discount
      priceFactors.push(`🌱 Building streak: -10% (${userStreak} day streak)`);
    }
    
    // Weekend pricing for certain categories
    if (isWeekend && ['TIME_OFF', 'ENTERTAINMENT'].includes(rewardCategory)) {
      currentPrice *= 0.9; // 10% weekend discount
      priceFactors.push('🎉 Weekend special: -10%');
    }
    
    const finalPrice = Math.round(currentPrice);
    const discountPercent = finalPrice < basePrice 
      ? Math.round((1 - finalPrice / basePrice) * 100)
      : 0;
    
    return {
      currentPrice: finalPrice,
      discountPercent,
      priceFactors
    };
  }

  /**
   * Celebration Level Calculator
   * Determines appropriate celebration intensity
   */
  static calculateCelebrationLevel(
    xpEarned: number,
    hasBonus: boolean,
    bonusMultiplier: number = 1.0
  ): {
    level: 'normal' | 'good' | 'great' | 'amazing' | 'legendary';
    message: string;
    duration: number; // milliseconds
  } {
    
    const totalXP = xpEarned * bonusMultiplier;
    
    let level: 'normal' | 'good' | 'great' | 'amazing' | 'legendary' = 'normal';
    let message = '';
    let duration = 2000; // Default 2 seconds
    
    if (bonusMultiplier >= 5.0) {
      level = 'legendary';
      message = `⚡ LEGENDARY! ${Math.round(totalXP)} XP! ⚡`;
      duration = 5000;
    } else if (bonusMultiplier >= 3.0 || totalXP >= 300) {
      level = 'amazing';
      message = `🚀 AMAZING! ${Math.round(totalXP)} XP earned! 🚀`;
      duration = 4000;
    } else if (bonusMultiplier >= 2.0 || totalXP >= 200) {
      level = 'great';
      message = `🎉 GREAT WORK! ${Math.round(totalXP)} XP! 🎉`;
      duration = 3000;
    } else if (hasBonus || totalXP >= 100) {
      level = 'good';
      message = `👏 Nice! ${Math.round(totalXP)} XP earned!`;
      duration = 2500;
    } else {
      level = 'normal';
      message = `+${Math.round(totalXP)} XP`;
      duration = 2000;
    }
    
    return { level, message, duration };
  }

  /**
   * Habit Formation Progress Calculator
   * Tracks psychological habit strength development
   */
  static calculateHabitStrength(
    streakDays: number,
    consistency: number, // 0-1 (percentage of days completed)
    averageEffort: number // 1-10 scale
  ): {
    strengthLevel: 'forming' | 'developing' | 'strong' | 'automatic';
    progressPercent: number;
    nextMilestone: { days: number; description: string };
    psychologyStage: string;
  } {
    
    // Habit formation stages based on research
    let strengthLevel: 'forming' | 'developing' | 'strong' | 'automatic' = 'forming';
    let psychologyStage = '';
    
    if (streakDays >= 66 && consistency >= 0.9) {
      strengthLevel = 'automatic';
      psychologyStage = 'Habit is now automatic - part of your identity!';
    } else if (streakDays >= 30 && consistency >= 0.8) {
      strengthLevel = 'strong';
      psychologyStage = 'Strong habit formation - becoming part of who you are';
    } else if (streakDays >= 14 && consistency >= 0.7) {
      strengthLevel = 'developing';
      psychologyStage = 'Habit is developing - neural pathways strengthening';
    } else {
      strengthLevel = 'forming';
      psychologyStage = 'Early habit formation - be patient and consistent';
    }
    
    // Progress calculation (66 days = 100% habit formation)
    const progressPercent = Math.min((streakDays / 66) * 100, 100);
    
    // Next milestone
    const milestones = [
      { days: 3, description: 'Initial momentum' },
      { days: 7, description: 'First week milestone' },
      { days: 14, description: 'Habit visibility increases' },
      { days: 21, description: 'Classic habit formation point' },
      { days: 30, description: 'One month - strong foundation' },
      { days: 66, description: 'Automatic habit - research validated' }
    ];
    
    const nextMilestone = milestones.find(m => m.days > streakDays) || 
                         { days: 100, description: 'Habit mastery' };
    
    return {
      strengthLevel,
      progressPercent: Math.round(progressPercent),
      nextMilestone,
      psychologyStage
    };
  }
}

// Export utility functions for easy use
export const {
  calculateVariableBonus,
  generateNearMissNotifications,
  calculateSpendingPsychology,
  calculateLifeBonus,
  calculateDynamicPrice,
  calculateCelebrationLevel,
  calculateHabitStrength
} = XPPsychologyUtils;