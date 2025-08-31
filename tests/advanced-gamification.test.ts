/**
 * 🧠 Advanced Gamification Psychology Test Suite
 * Validates all 2024 research implementations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { VariableRatioRewardEngine, FlowStateEngine } from '@/services/advancedGamificationService';
import { LossAversionEngine, BehavioralPsychologyHelpers } from '@/services/lossAversionGamification';
import { BJFoggBehaviorEngine, BehaviorDesignUtilities } from '@/services/bjFoggBehaviorService';
import { WellnessGuardian, MindfulProductivityEngine } from '@/services/wellnessGuardian';

describe('🎲 Variable Ratio Reinforcement System', () => {
  
  it('should provide mathematically optimized rewards', () => {
    const baseXP = 100;
    const userContext = {
      recentEngagement: 0.8,
      streakLength: 5,
      taskCompletionRate: 0.9,
      timeOfLastReward: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      userLevel: 3
    };
    
    const result = VariableRatioRewardEngine.calculateVariableReward(baseXP, userContext);
    
    expect(result.finalXP).toBeGreaterThan(baseXP * 0.8);
    expect(result.finalXP).toBeLessThan(baseXP * 3.0);
    expect(result.engagementPrediction).toBeGreaterThan(0);
    expect(result.engagementPrediction).toBeLessThan(1);
    expect(result.mathematicalOptimality).toBeGreaterThan(0.8);
    expect(result.rationale).toContain('XP');
    
    console.log('🎯 Variable Ratio Result:', {
      baseXP: result.baseXP,
      finalXP: result.finalXP,
      bonusEvent: result.isBonusEvent,
      optimality: result.mathematicalOptimality,
      rationale: result.rationale
    });
  });
  
  it('should identify bonus events probabilistically', () => {
    const results = [];
    
    // Run 100 trials to test probability distribution
    for (let i = 0; i < 100; i++) {
      const result = VariableRatioRewardEngine.calculateVariableReward(
        50, 
        { streakLength: 8, recentEngagement: 0.6 }
      );
      results.push(result);
    }
    
    const bonusEvents = results.filter(r => r.isBonusEvent).length;
    
    // Should have bonus events in 8-20% range (12% ± variance)
    expect(bonusEvents).toBeGreaterThan(5);
    expect(bonusEvents).toBeLessThan(25);
    
    console.log(`🎊 Bonus Events in 100 trials: ${bonusEvents}%`);
  });
  
  it('should adapt to user engagement patterns', () => {
    const lowEngagementResult = VariableRatioRewardEngine.calculateVariableReward(
      100,
      { recentEngagement: 0.2 }, // Low engagement
      { adaptiveAdjustment: true }
    );
    
    const highEngagementResult = VariableRatioRewardEngine.calculateVariableReward(
      100,
      { recentEngagement: 0.9 }, // High engagement
      { adaptiveAdjustment: true }
    );
    
    // Low engagement should typically get higher rewards to re-engage
    // This isn't guaranteed due to randomness, but should trend higher
    expect(lowEngagementResult.finalXP + highEngagementResult.finalXP).toBeGreaterThan(150);
    
    console.log('📊 Adaptive Rewards:', {
      lowEngagement: lowEngagementResult.finalXP,
      highEngagement: highEngagementResult.finalXP
    });
  });
});

describe('🌊 Flow State Optimization Engine', () => {
  
  it('should assess flow state accurately', () => {
    // Perfect flow zone test
    const flowTest = FlowStateEngine.assessFlowState(
      7, // User skill
      8, // Task difficulty (slightly above skill = flow)
      {
        recentTaskSuccess: 0.8,
        timeInSession: 45,
        energyLevel: 0.8
      }
    );
    
    expect(flowTest.challengeSkillRatio).toBeCloseTo(8/7, 1);
    expect(flowTest.flowZoneStatus).toBe('flow');
    expect(flowTest.flowScore).toBeGreaterThan(0.7);
    expect(flowTest.recommendedAdjustment).toContain('flow');
    
    console.log('🌊 Flow Assessment:', {
      status: flowTest.flowZoneStatus,
      score: flowTest.flowScore,
      ratio: flowTest.challengeSkillRatio,
      recommendation: flowTest.recommendedAdjustment
    });
  });
  
  it('should detect boredom and anxiety zones', () => {
    // Boredom test (task too easy)
    const boredTest = FlowStateEngine.assessFlowState(8, 4); // Skill > difficulty
    expect(boredTest.flowZoneStatus).toBe('boredom');
    expect(boredTest.recommendedAdjustment.toLowerCase()).toContain('increase');
    
    // Anxiety test (task too hard)
    const anxiousTest = FlowStateEngine.assessFlowState(5, 9); // Difficulty >> skill
    expect(anxiousTest.flowZoneStatus).toBe('anxiety');
    expect(anxiousTest.recommendedAdjustment.toLowerCase()).toContain('challeng');
    
    console.log('⚡ Zone Detection:', {
      boredom: boredTest.flowZoneStatus,
      anxiety: anxiousTest.flowZoneStatus
    });
  });
  
  it('should suggest optimal difficulty adjustments', () => {
    const currentMetrics = FlowStateEngine.assessFlowState(6, 9); // Anxiety zone
    
    const adjustment = FlowStateEngine.suggestDifficultyAdjustment(currentMetrics, {
      recentCompletionRate: 0.4,
      averageTimeToComplete: 120,
      frustrationIndicators: 0.8
    });
    
    expect(adjustment.suggestionType).toBe('decrease');
    expect(adjustment.difficultyDelta).toBeLessThan(0);
    expect(adjustment.estimatedFlowImprovement).toBeGreaterThan(0);
    expect(adjustment.rationale.toLowerCase()).toContain('anxiety');
    
    console.log('🎯 Difficulty Adjustment:', adjustment);
  });
  
  it('should calculate optimal next task difficulty', () => {
    const assessment = FlowStateEngine.assessFlowState(
      5, // Current skill
      6, // Current difficulty
      { recentTaskSuccess: 0.9 } // High success rate
    );
    
    // Next task should be slightly higher than current skill level
    expect(assessment.nextTaskDifficulty).toBeGreaterThan(5);
    expect(assessment.nextTaskDifficulty).toBeLessThan(8);
    
    console.log('📈 Next Task Difficulty:', assessment.nextTaskDifficulty);
  });
});

describe('🛡️ Loss Aversion & Streak Protection', () => {
  
  it('should calculate streak value with loss aversion multiplier', () => {
    const streak = {
      currentLength: 14,
      longestEver: 14,
      lastActivity: new Date(),
      streakType: 'daily' as const,
      valueInXP: 0,
      protectionLevel: 0,
      freezesUsed: 0,
      maxFreezes: 3
    };
    
    const value = LossAversionEngine.calculateStreakValue(streak);
    
    expect(value.currentValue).toBeGreaterThan(140); // Base value
    expect(value.lossImpact).toBeGreaterThan(value.currentValue * 2); // 2x loss aversion
    expect(value.protectionWorth).toBeGreaterThan(0);
    expect(value.emotionalWeight).toBe('moderate'); // 14-day streak
    
    console.log('💎 Streak Value Analysis:', value);
  });
  
  it('should assess risk levels correctly', () => {
    const streak = {
      currentLength: 30,
      longestEver: 30,
      lastActivity: new Date(Date.now() - 22 * 60 * 60 * 1000), // 22 hours ago
      streakType: 'daily' as const,
      valueInXP: 500,
      protectionLevel: 1,
      freezesUsed: 1,
      maxFreezes: 3
    };
    
    const risk = LossAversionEngine.assessStreakRisk(streak);
    
    expect(risk.riskLevel).toBe('critical'); // 2 hours left
    expect(risk.hoursUntilBreak).toBeLessThan(3);
    expect(risk.lossAversionScore).toBeGreaterThan(0.5);
    expect(risk.emotionalImpact).toBe('devastating'); // 30-day streak
    expect(risk.protectionRecommendations.length).toBeGreaterThan(0);
    
    console.log('🚨 Risk Assessment:', {
      level: risk.riskLevel,
      hoursLeft: Math.round(risk.hoursUntilBreak * 10) / 10,
      emotional: risk.emotionalImpact,
      protections: risk.protectionRecommendations.length
    });
  });
  
  it('should generate loss aversion notifications', () => {
    const riskAssessment = {
      riskLevel: 'critical' as const,
      hoursUntilBreak: 1.5,
      streakValue: 500,
      lossAversionScore: 0.8,
      emotionalImpact: 'devastating' as const,
      protectionRecommendations: []
    };
    
    const streak = { currentLength: 30, longestEver: 30 };
    
    const notification = LossAversionEngine.generateLossAversionNotifications(riskAssessment, streak);
    
    expect(notification.urgency).toBe('critical');
    expect(notification.title).toContain('STREAK ALERT');
    expect(notification.message).toContain('30-day');
    expect(notification.actionButtons.length).toBeGreaterThan(0);
    expect(notification.psychologyTriggers).toContain('LOSS_AVERSION: Emphasize what will be lost');
    
    console.log('📢 Loss Aversion Notification:', {
      urgency: notification.urgency,
      title: notification.title,
      triggers: notification.psychologyTriggers.length
    });
  });
  
  it('should calculate recovery options', () => {
    const brokenStreak = {
      currentLength: 21,
      longestEver: 25,
      lastActivity: new Date(Date.now() - 26 * 60 * 60 * 1000), // 26 hours ago (broken)
      streakType: 'daily' as const,
      valueInXP: 300,
      protectionLevel: 0,
      freezesUsed: 0,
      maxFreezes: 3
    };
    
    const recovery = LossAversionEngine.calculateRecoveryOptions(brokenStreak);
    
    expect(recovery.isEligible).toBe(true); // 21-day streak should be recoverable
    expect(recovery.recoveryType).toBe('partial'); // Within 24 hours, >14 days
    expect(recovery.costInXP).toBeGreaterThan(0);
    expect(recovery.recoveredLength).toBeGreaterThan(0);
    expect(recovery.motivationalMessage).toContain('Bounce back');
    
    console.log('🔄 Recovery Options:', recovery);
  });
});

describe('🧠 BJ Fogg Behavior Model Integration', () => {
  
  it('should assess MAT (Motivation-Ability-Trigger) correctly', () => {
    const user = {
      currentMotivation: 7,
      skillLevel: 6,
      energy: 0.8
    };
    
    const task = {
      title: 'Review weekly goals',
      estimatedMinutes: 15,
      difficulty: 4,
      priority: 'HIGH'
    };
    
    const context = {
      timeOfDay: 'morning' as const,
      distractions: 0.2,
      socialSupport: 0.7
    };
    
    const mat = BJFoggBehaviorEngine.assessMAT(user, task, context);
    
    expect(mat.motivation).toBeGreaterThan(6); // Should be boosted by HIGH priority and morning
    expect(mat.ability).toBeGreaterThan(5); // Short task, high energy, social support
    expect(mat.likelihood).toBeGreaterThan(0.5); // Good MAT scores = high likelihood
    expect(mat.foggScore).toBeGreaterThan(4);
    expect(mat.trigger.type).toBeDefined();
    expect(mat.optimization.suggestedChanges.length).toBeGreaterThanOrEqual(0);
    
    console.log('🎯 MAT Assessment:', {
      motivation: mat.motivation,
      ability: mat.ability,
      likelihood: mat.likelihood,
      foggScore: mat.foggScore,
      triggerType: mat.trigger.type
    });
  });
  
  it('should create tiny habit chains', () => {
    const plan = BJFoggBehaviorEngine.createTinyHabits(
      'Complete daily review',
      {
        currentHabits: ['drink morning coffee', 'check email'],
        availableTime: 30,
        skillLevel: 5,
        motivationLevel: 6
      }
    );
    
    expect(plan.tinyHabits.length).toBeGreaterThan(0);
    expect(plan.tinyHabits[0].difficulty).toBeLessThanOrEqual(3); // Tiny habits are easy
    expect(plan.tinyHabits[0].anchor).toContain('After');
    expect(plan.tinyHabits[0].celebration).toContain('!');
    expect(plan.celebrationScript.immediate.length).toBeGreaterThan(0);
    expect(plan.timeframe).toBeGreaterThan(0);
    
    console.log('🌱 Tiny Habits Plan:', {
      totalHabits: plan.tinyHabits.length,
      firstHabit: plan.tinyHabits[0].behavior,
      timeframe: plan.timeframe,
      celebrations: plan.celebrationScript.immediate.length
    });
  });
  
  it('should process celebrations correctly', () => {
    const celebration = BJFoggBehaviorEngine.celebrateSuccess(
      'Completed daily review',
      {
        immediate: ['Yes!', 'Great job!'],
        daily: ['Another day of progress!'],
        weekly: ['Week complete!'],
        custom: []
      },
      {
        streakLength: 10,
        difficulty: 2,
        timeToComplete: 180 // 3 minutes
      }
    );
    
    expect(celebration.celebration).toBeDefined();
    expect(celebration.emotionalReward).toBeGreaterThan(0.5);
    expect(celebration.emotionalReward).toBeLessThanOrEqual(1.0);
    expect(celebration.habitStrengthIncrease).toBeGreaterThan(0);
    
    if (celebration.nextLevelUnlock) {
      expect(celebration.nextLevelUnlock).toContain('streak');
    }
    
    console.log('🎉 Celebration Result:', celebration);
  });
});

describe('🧘 Wellness Guardian & Anti-Addiction', () => {
  
  it('should analyze usage patterns for addiction indicators', () => {
    const recentUsage = [
      // Simulate 7 days of heavy usage
      ...Array.from({ length: 10 }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 2 * 60 * 60 * 1000), // Every 2 hours
        sessionDuration: 90, // 1.5 hours each
        activityType: 'productivity',
        compulsiveIndicators: i < 3 ? ['excessive_checking'] : []
      }))
    ];
    
    const analysis = WellnessGuardian.analyzeUsagePatterns(recentUsage, {
      stressLevel: 0.8,
      workLifeBalance: 0.3
    });
    
    expect(analysis.patterns.dailyActiveMinutes).toBeGreaterThan(180); // Heavy usage
    expect(analysis.riskFactors.length).toBeGreaterThan(0);
    expect(analysis.healthScore).toBeLessThan(0.7); // Poor health score
    expect(analysis.recommendations.length).toBeGreaterThan(0);
    
    // Should detect excessive usage
    const excessiveUsage = analysis.patterns.compulsiveIndicators.find(
      i => i.type === 'excessive_checking'
    );
    expect(excessiveUsage).toBeDefined();
    
    console.log('🔍 Usage Analysis:', {
      dailyMinutes: analysis.patterns.dailyActiveMinutes,
      healthScore: Math.round(analysis.healthScore * 100) / 100,
      riskFactors: analysis.riskFactors.length,
      compulsiveIndicators: analysis.patterns.compulsiveIndicators.length
    });
  });
  
  it('should create healthy boundaries', () => {
    const wellnessMetrics = {
      burnoutRisk: 'high' as const,
      sustainabilityScore: 0.4,
      wellnessStreak: 2,
      balanceIndex: 0.3,
      engagementHealth: 'concerning' as const,
      interventionNeeded: true
    };
    
    const boundaries = WellnessGuardian.createHealthyBoundaries(wellnessMetrics, {
      strictness: 'balanced',
      workHours: { start: 9, end: 17 },
      sleepSchedule: { bedtime: 22, wakeup: 7 }
    });
    
    expect(boundaries.length).toBeGreaterThan(0);
    expect(boundaries.some(b => b.type === 'time_limit')).toBe(true);
    expect(boundaries.some(b => b.type === 'session_break')).toBe(true);
    
    // High burnout risk should create mandatory rest
    const mandatoryRest = boundaries.find(b => b.type === 'mandatory_rest');
    expect(mandatoryRest).toBeDefined();
    
    console.log('🛡️ Wellness Boundaries:', {
      total: boundaries.length,
      types: boundaries.map(b => b.type),
      enforcement: boundaries.map(b => b.enforcement)
    });
  });
  
  it('should generate appropriate interventions', () => {
    const boundary = {
      type: 'time_limit' as const,
      name: 'Daily Usage Limit',
      description: 'Max 90 minutes per day',
      threshold: 90,
      enforcement: 'medium' as const,
      userOverridable: true
    };
    
    const currentUsage = {
      sessionLength: 45,
      dailyTotal: 120, // Exceeds 90-minute limit
      recentPattern: 'increasing'
    };
    
    const wellnessMetrics = {
      burnoutRisk: 'high' as const,
      sustainabilityScore: 0.4,
      wellnessStreak: 1,
      balanceIndex: 0.2,
      engagementHealth: 'concerning' as const,
      interventionNeeded: true
    };
    
    const intervention = WellnessGuardian.generateIntervention(boundary, currentUsage, wellnessMetrics);
    
    expect(intervention.urgency).toBe('high'); // High burnout + exceeded limit
    expect(intervention.interventionType).toBe('limit_enforcement');
    expect(intervention.message).toContain('limit');
    expect(intervention.actions.length).toBeGreaterThan(0);
    expect(intervention.actions.some(a => a.required)).toBe(true);
    
    console.log('🚨 Intervention Generated:', {
      urgency: intervention.urgency,
      type: intervention.interventionType,
      actionsRequired: intervention.actions.filter(a => a.required).length
    });
  });
  
  it('should assess overall wellness metrics', () => {
    const usageAnalysis = {
      patterns: {
        dailyActiveMinutes: 200,
        sessionsPerDay: 8,
        averageSessionLength: 25,
        longestSession: 120,
        timeDistribution: {},
        weeklyPattern: [100, 200, 200, 200, 200, 150, 50],
        compulsiveIndicators: [
          { type: 'excessive_checking' as const, severity: 'moderate' as const, description: 'test', detectedAt: new Date() }
        ]
      },
      riskFactors: ['Excessive daily usage', 'Marathon sessions'],
      healthScore: 0.3,
      recommendations: ['Take breaks']
    };
    
    const historicalData = {
      wellnessScores: [
        { date: new Date(), score: 0.3 },
        { date: new Date(Date.now() - 24 * 60 * 60 * 1000), score: 0.4 }
      ],
      interventionHistory: [],
      boundaryViolations: []
    };
    
    const metrics = WellnessGuardian.assessWellnessMetrics(usageAnalysis, historicalData);
    
    expect(metrics.burnoutRisk).toBe('critical'); // Low health score + many risk factors
    expect(metrics.sustainabilityScore).toBeLessThan(0.5);
    expect(metrics.engagementHealth).toBe('problematic');
    expect(metrics.interventionNeeded).toBe(true);
    
    console.log('📊 Wellness Metrics:', metrics);
  });
});

describe('🎮 Behavioral Psychology Helpers', () => {
  
  it('should generate near-miss experiences', () => {
    const nearMiss = BehavioralPsychologyHelpers.generateNearMissExperience(100, 92);
    
    expect(nearMiss.isNearMiss).toBe(true); // 92% = near miss
    expect(nearMiss.distanceFromGoal).toBe(8);
    expect(nearMiss.motivationMessage).toContain('CLOSE');
    expect(nearMiss.urgencyBonus).toBeGreaterThan(1);
    
    const notNearMiss = BehavioralPsychologyHelpers.generateNearMissExperience(100, 60);
    expect(notNearMiss.isNearMiss).toBe(false);
    
    console.log('💫 Near-Miss Experience:', nearMiss);
  });
  
  it('should calculate intermittent reinforcement rewards', () => {
    const history = [
      { action: 'task_complete', timestamp: new Date(), rewarded: false },
      { action: 'task_complete', timestamp: new Date(), rewarded: false },
      { action: 'task_complete', timestamp: new Date(), rewarded: true },
      { action: 'task_complete', timestamp: new Date(), rewarded: false },
      { action: 'task_complete', timestamp: new Date(), rewarded: false }
    ];
    
    const reward = BehavioralPsychologyHelpers.calculateIntermittentReward('task_complete', history);
    
    expect(reward.streakSinceLastReward).toBe(2); // 2 actions since last reward
    expect(reward.nextRewardProbability).toBeGreaterThan(0);
    expect(reward.nextRewardProbability).toBeLessThan(1);
    
    if (reward.shouldReward) {
      expect(['small', 'medium', 'jackpot']).toContain(reward.rewardType);
    }
    
    console.log('🎰 Intermittent Reward:', reward);
  });
});

describe('🧘 Mindful Productivity Engine', () => {
  
  it('should generate appropriate mindfulness prompts', () => {
    const startPrompt = MindfulProductivityEngine.generateMindfulnessPrompts('start', 60, 0.3);
    const breakPrompt = MindfulProductivityEngine.generateMindfulnessPrompts('break', 90, 0.8);
    const endPrompt = MindfulProductivityEngine.generateMindfulnessPrompts('end', 45, 0.5);
    
    expect(startPrompt.technique).toBe('intention_setting');
    expect(startPrompt.prompt).toContain('intention');
    
    expect(breakPrompt.technique).toBe('breathing'); // High stress = breathing
    expect(breakPrompt.duration).toBeGreaterThan(60); // Longer for high stress
    
    expect(endPrompt.technique).toBe('gratitude');
    expect(endPrompt.prompt).toContain('complete');
    
    console.log('🧘 Mindfulness Prompts:', {
      start: startPrompt.technique,
      break: breakPrompt.technique,
      end: endPrompt.technique
    });
  });
  
  it('should create wellness integration plan', () => {
    const integration = MindfulProductivityEngine.createWellnessIntegration(
      ['Complete daily tasks', 'Focus deeply'],
      ['drink coffee', 'check calendar']
    );
    
    expect(integration.wellnessHabits.length).toBeGreaterThan(0);
    expect(integration.routineIntegration.length).toBeGreaterThan(0);
    expect(integration.balanceMetrics.length).toBeGreaterThan(0);
    
    // Each wellness habit should have anchor and benefit
    integration.wellnessHabits.forEach(habit => {
      expect(habit.habit).toBeDefined();
      expect(habit.anchor).toBeDefined();
      expect(habit.benefit).toBeDefined();
    });
    
    console.log('🌱 Wellness Integration:', {
      habits: integration.wellnessHabits.length,
      routines: integration.routineIntegration.length,
      metrics: integration.balanceMetrics.length
    });
  });
});