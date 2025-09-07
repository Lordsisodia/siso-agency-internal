/**
 * 🧠 Intelligent XP System Tests
 * Validates AI-powered XP allocation and gamification
 */

import { describe, it, expect } from 'vitest';
import { IntelligentXPService, TaskImportanceDetector } from '@/services/intelligentXPService';
import { AchievementSystem, GamificationEngine, DailyChallengeSystem } from '@/services/gamificationSystem';

describe('Intelligent XP System', () => {
  
  describe('Task Importance Detection', () => {
    it('should detect critical tasks from keywords', () => {
      const result = TaskImportanceDetector.analyzeImportance(
        'URGENT: Fix critical server outage affecting all users',
        'This is an emergency issue that needs immediate attention ASAP'
      );
      
      expect(result.priority).toBe('CRITICAL');
      expect(result.complexity).toBeGreaterThan(5);
      expect(result.reasoning).toContain('Contains urgency keywords');
      
      console.log('🚨 Critical Task Analysis:');
      console.log(`Priority: ${result.priority}`);
      console.log(`Complexity: ${result.complexity}/10`);
      console.log(`Reasoning: ${result.reasoning.join(', ')}`);
    });
    
    it('should detect learning tasks appropriately', () => {
      const result = TaskImportanceDetector.analyzeImportance(
        'Research and learn new React framework patterns',
        'Study advanced concepts and master the implementation'
      );
      
      expect(result.learningValue).toBeGreaterThan(7);
      expect(result.reasoning).toContain('High learning opportunity');
      
      console.log('📚 Learning Task Analysis:');
      console.log(`Learning Value: ${result.learningValue}/10`);
    });
    
    it('should detect low priority routine tasks', () => {
      const result = TaskImportanceDetector.analyzeImportance(
        'Minor admin work - update routine documentation',
        'Simple maintenance task, low priority, do whenever you have time'
      );
      
      expect(result.priority).toBe('LOW');
      expect(result.complexity).toBeLessThan(5);
      
      console.log('📝 Routine Task Analysis:');
      console.log(`Priority: ${result.priority}`);
      console.log(`Complexity: ${result.complexity}/10`);
    });
  });
  
  describe('Intelligent XP Calculation', () => {
    it('should award high XP for critical complex tasks', () => {
      const xp = IntelligentXPService.calculateIntelligentXP({
        title: 'Fix critical production bug',
        priority: 'CRITICAL',
        workType: 'DEEP',
        difficulty: 'EXPERT',
        estimatedDuration: 120,
        complexity: 9,
        learningValue: 8,
        strategicImportance: 10,
        currentStreak: 5,
        userLevel: 3,
        timeOfDay: 'morning',
        completedInFocusSession: true
      });
      
      expect(xp.finalXP).toBeGreaterThan(150); // Should be high XP
      expect(xp.priorityMultiplier).toBe(2.0); // Critical = 2x
      expect(xp.confidenceScore).toBeGreaterThan(80); // High confidence
      
      console.log('🎯 Critical Task XP Breakdown:');
      console.log(xp.breakdown.join('\n'));
      console.log(`Final XP: ${xp.finalXP} (${xp.confidenceScore}% confidence)`);
    });
    
    it('should award moderate XP for routine tasks', () => {
      const xp = IntelligentXPService.calculateIntelligentXP({
        title: 'Update documentation',
        priority: 'LOW',
        workType: 'LIGHT',
        difficulty: 'EASY',
        estimatedDuration: 30,
        complexity: 3,
        learningValue: 2,
        strategicImportance: 4,
        currentStreak: 0,
        userLevel: 1
      });
      
      expect(xp.finalXP).toBeLessThan(60); // Should be lower XP
      expect(xp.priorityMultiplier).toBe(0.8); // Low = 0.8x
      
      console.log('📝 Routine Task XP Breakdown:');
      console.log(xp.breakdown.join('\n'));
      console.log(`Final XP: ${xp.finalXP}`);
    });
    
    it('should properly reward learning tasks', () => {
      const xp = IntelligentXPService.calculateIntelligentXP({
        title: 'Learn advanced React patterns',
        priority: 'MEDIUM',
        workType: 'DEEP',
        difficulty: 'HARD',
        estimatedDuration: 90,
        complexity: 7,
        learningValue: 10,
        strategicImportance: 8,
        currentStreak: 3,
        userLevel: 2,
        timeOfDay: 'morning'
      });
      
      expect(xp.learningBonus).toBe(30); // Max learning bonus
      expect(xp.finalXP).toBeGreaterThan(80);
      
      console.log('📚 Learning Task XP Breakdown:');
      console.log(xp.breakdown.join('\n'));
      console.log(`Learning bonus: ${xp.learningBonus} XP`);
    });
    
    it('should apply streak and combo bonuses correctly', () => {
      const xp = IntelligentXPService.calculateIntelligentXP({
        title: 'Daily coding practice',
        priority: 'MEDIUM',
        workType: 'DEEP',
        difficulty: 'MEDIUM',
        estimatedDuration: 60,
        complexity: 6,
        learningValue: 7,
        strategicImportance: 6,
        currentStreak: 14, // 2 week streak
        tasksCompletedToday: 5,
        consecutiveDays: 10,
        userLevel: 4,
        recentCompletion: true // Combo multiplier
      });
      
      expect(xp.streakBonus).toBeGreaterThan(10);
      expect(xp.comboMultiplier).toBeGreaterThan(1.0);
      
      console.log('🔥 Streak & Combo XP Breakdown:');
      console.log(xp.breakdown.join('\n'));
      console.log(`Streak bonus: ${xp.streakBonus} XP`);
      console.log(`Combo multiplier: ${xp.comboMultiplier}x`);
    });
  });
  
  describe('Level System', () => {
    it('should calculate levels correctly', () => {
      // Test various XP amounts
      const testCases = [
        { xp: 50, expectedLevel: 1 },
        { xp: 150, expectedLevel: 2 },
        { xp: 500, expectedLevel: 3 },
        { xp: 1200, expectedLevel: 4 },
        { xp: 2500, expectedLevel: 5 }
      ];
      
      testCases.forEach(({ xp, expectedLevel }) => {
        const result = GamificationEngine['calculateLevel'](xp);
        expect(result.level).toBe(expectedLevel);
      });
      
      console.log('📈 Level Progression:');
      testCases.forEach(({ xp, expectedLevel }) => {
        const result = GamificationEngine['calculateLevel'](xp);
        console.log(`${xp} XP = Level ${result.level} (${result.xpInLevel}/${result.xpInLevel + result.xpForNextLevel} in level)`);
      });
    });
  });
  
  describe('Achievement System', () => {
    it('should unlock achievements based on stats', () => {
      const userStats = {
        totalXP: 500,
        level: 3,
        xpInCurrentLevel: 100,
        xpForNextLevel: 200,
        currentStreak: 7, // Should unlock "Weekly Warrior"
        longestStreak: 7,
        totalTasksCompleted: 15,
        tasksCompletedToday: 3,
        xpEarnedToday: 100,
        perfectDays: 2,
        unlockedAchievements: [
          { id: 'first-steps', name: 'First Steps', description: '', emoji: '👶', 
            category: 'STREAK' as const, points: 10, rarity: 'COMMON' as const, unlockedAt: new Date() }
        ],
        totalAchievementPoints: 10,
        averageTaskDifficulty: 6,
        productiveHours: 50,
        weeklyGoalProgress: 80,
        activeBoosts: [],
        comboCount: 1
      };
      
      const newAchievements = AchievementSystem.checkAchievements(userStats);
      
      expect(newAchievements.length).toBeGreaterThan(0);
      const weeklyWarrior = newAchievements.find(a => a.id === 'weekly-warrior');
      expect(weeklyWarrior).toBeDefined();
      
      console.log('🏆 Unlocked Achievements:');
      newAchievements.forEach(achievement => {
        console.log(`${achievement.emoji} ${achievement.name} - ${achievement.points} points`);
      });
    });
    
    it('should track achievement progress', () => {
      const userStats = {
        currentStreak: 5,
        totalTasksCompleted: 75,
        tasksCompletedToday: 8,
        perfectDays: 7
      } as any;
      
      const progress = AchievementSystem.getAchievementProgress('weekly-warrior', userStats);
      expect(progress.current).toBe(5);
      expect(progress.max).toBe(7);
      expect(progress.percentage).toBe(Math.round((5/7) * 100));
      
      console.log('📊 Achievement Progress:');
      console.log(`Weekly Warrior: ${progress.current}/${progress.max} (${progress.percentage}%)`);
    });
  });
  
  describe('Daily Challenge System', () => {
    it('should generate appropriate daily challenges', () => {
      const userStats = {
        totalXP: 1000,
        level: 4,
        currentStreak: 10,
        averageTaskDifficulty: 6
      } as any;
      
      const challenge = DailyChallengeSystem.generateDailyChallenge(userStats, new Date());
      
      expect(challenge.name).toBeDefined();
      expect(challenge.targetValue).toBeGreaterThan(0);
      expect(challenge.xpReward).toBeGreaterThan(0);
      expect(challenge.completed).toBe(false);
      
      console.log('🎯 Daily Challenge:');
      console.log(`${challenge.emoji} ${challenge.name}`);
      console.log(`${challenge.description}`);
      console.log(`Target: ${challenge.targetValue}, Reward: ${challenge.xpReward} XP`);
      if (challenge.bonusReward) {
        console.log(`Bonus: ${challenge.bonusReward}`);
      }
    });
    
    it('should update challenge progress correctly', () => {
      const challenge = {
        id: 'test-challenge',
        name: 'Deep Focus',
        description: 'Complete 2 deep work tasks',
        emoji: '🧘',
        targetValue: 2,
        currentProgress: 1,
        xpReward: 75,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        completed: false
      };
      
      const taskCompleted = { workType: 'DEEP' };
      
      const result = DailyChallengeSystem.updateChallengeProgress(challenge, taskCompleted);
      
      expect(result.updatedChallenge.currentProgress).toBe(2);
      expect(result.updatedChallenge.completed).toBe(true);
      expect(result.bonusXP).toBe(75);
      
      console.log('🎯 Challenge Progress Update:');
      console.log(`Progress: ${result.updatedChallenge.currentProgress}/${challenge.targetValue}`);
      console.log(`Completed: ${result.updatedChallenge.completed}`);
      console.log(`Bonus XP: ${result.bonusXP}`);
    });
  });
  
  describe('Complete Gamification Flow', () => {
    it('should process a full task completion with all systems', () => {
      const userStats = {
        totalXP: 800,
        level: 3,
        xpInCurrentLevel: 200,
        xpForNextLevel: 100,
        currentStreak: 6,
        longestStreak: 10,
        totalTasksCompleted: 45,
        tasksCompletedToday: 4,
        xpEarnedToday: 200,
        perfectDays: 3,
        unlockedAchievements: [],
        totalAchievementPoints: 0,
        averageTaskDifficulty: 6,
        productiveHours: 80,
        weeklyGoalProgress: 90,
        activeBoosts: [],
        comboCount: 2,
        lastCompletionTime: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      };
      
      const taskContext = {
        workType: 'DEEP',
        difficulty: 'HARD',
        priority: 'HIGH'
      };
      
      const xpEarned = 85;
      
      const result = GamificationEngine.processTaskCompletion(userStats, taskContext, xpEarned);
      
      expect(result.updatedStats.totalXP).toBeGreaterThan(userStats.totalXP);
      expect(result.updatedStats.totalTasksCompleted).toBe(userStats.totalTasksCompleted + 1);
      expect(result.updatedStats.tasksCompletedToday).toBe(userStats.tasksCompletedToday + 1);
      expect(result.updatedStats.comboCount).toBe(userStats.comboCount + 1);
      
      console.log('🎮 Full Gamification Processing:');
      console.log(`XP: ${userStats.totalXP} → ${result.updatedStats.totalXP} (+${result.bonusXP} bonus)`);
      console.log(`Level: ${userStats.level} → ${result.updatedStats.level} ${result.levelUp ? '(LEVEL UP!)' : ''}`);
      console.log(`Combo: ${userStats.comboCount} → ${result.updatedStats.comboCount}`);
      console.log(`New achievements: ${result.newAchievements.length}`);
      console.log('Notifications:');
      result.notifications.forEach(notification => console.log(`  ${notification}`));
    });
  });
  
  describe('XP Balance Validation', () => {
    it('should maintain balanced XP ranges across difficulty levels', () => {
      const testScenarios = [
        { name: 'Easy Admin Task', priority: 'LOW' as const, workType: 'LIGHT' as const, difficulty: 'EASY' as const, expectedRange: [15, 80] },
        { name: 'Medium Focus Task', priority: 'MEDIUM' as const, workType: 'DEEP' as const, difficulty: 'MODERATE' as const, expectedRange: [50, 120] },
        { name: 'Critical Expert Task', priority: 'CRITICAL' as const, workType: 'DEEP' as const, difficulty: 'EXPERT' as const, expectedRange: [120, 400] }
      ];
      
      testScenarios.forEach(scenario => {
        const xp = IntelligentXPService.calculateIntelligentXP({
          title: scenario.name,
          priority: scenario.priority,
          workType: scenario.workType,
          difficulty: scenario.difficulty,
          estimatedDuration: 60,
          complexity: 6,
          learningValue: 5,
          strategicImportance: 5,
          currentStreak: 3,
          userLevel: 2
        });
        
        expect(xp.finalXP).toBeGreaterThanOrEqual(scenario.expectedRange[0]);
        expect(xp.finalXP).toBeLessThanOrEqual(scenario.expectedRange[1]);
        
        console.log(`${scenario.name}: ${xp.finalXP} XP (range: ${scenario.expectedRange[0]}-${scenario.expectedRange[1]})`);
      });
    });
  });
});