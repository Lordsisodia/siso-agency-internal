/**
 * XP Economy Balance Tests
 * Validates that the earning vs spending rates create a sustainable economy
 */

import { describe, it, expect } from 'vitest';
import { XPEarningService } from '@/services/xpEarningService';

describe('XP Economy Balance', () => {
  describe('XP Earning Rates', () => {
    it('should provide appropriate XP for different task types', () => {
      const quickTask = XPEarningService.calculateTaskXP({ taskType: 'quick' });
      const focusTask = XPEarningService.calculateTaskXP({ taskType: 'focus' });
      const deepTask = XPEarningService.calculateTaskXP({ taskType: 'deep' });
      const adminTask = XPEarningService.calculateTaskXP({ taskType: 'admin' });

      // Verify task progression makes sense
      expect(quickTask.finalXP).toBeLessThan(focusTask.finalXP);
      expect(focusTask.finalXP).toBeLessThan(deepTask.finalXP);
      expect(adminTask.finalXP).toBeLessThan(focusTask.finalXP);

      console.log('Task XP Rates:');
      console.log(`Quick: ${quickTask.finalXP} XP`);
      console.log(`Focus: ${focusTask.finalXP} XP`);
      console.log(`Deep: ${deepTask.finalXP} XP`);
      console.log(`Admin: ${adminTask.finalXP} XP`);
    });

    it('should reward difficulty appropriately', () => {
      const easyTask = XPEarningService.calculateTaskXP({ 
        taskType: 'focus', 
        difficulty: 'easy' 
      });
      const mediumTask = XPEarningService.calculateTaskXP({ 
        taskType: 'focus', 
        difficulty: 'medium' 
      });
      const expertTask = XPEarningService.calculateTaskXP({ 
        taskType: 'focus', 
        difficulty: 'expert' 
      });

      expect(easyTask.finalXP).toBeLessThan(mediumTask.finalXP);
      expect(mediumTask.finalXP).toBeLessThan(expertTask.finalXP);

      console.log('Difficulty XP Progression:');
      console.log(`Easy: ${easyTask.finalXP} XP`);
      console.log(`Medium: ${mediumTask.finalXP} XP`);
      console.log(`Expert: ${expertTask.finalXP} XP`);
    });

    it('should provide streak bonuses that encourage consistency', () => {
      const day1 = XPEarningService.calculateTaskXP({ streakDays: 1 });
      const day3 = XPEarningService.calculateTaskXP({ streakDays: 3 });
      const day7 = XPEarningService.calculateTaskXP({ streakDays: 7 });
      const day14 = XPEarningService.calculateTaskXP({ streakDays: 14 });

      expect(day1.streakBonus).toBeGreaterThan(0);
      expect(day3.streakBonus).toBeGreaterThan(day1.streakBonus);
      expect(day7.streakBonus).toBeGreaterThan(day3.streakBonus);
      expect(day14.streakBonus).toBeGreaterThan(day7.streakBonus);

      console.log('Streak Bonus Progression:');
      console.log(`Day 1: +${day1.streakBonus} XP`);
      console.log(`Day 3: +${day3.streakBonus} XP`);
      console.log(`Day 7: +${day7.streakBonus} XP`);
      console.log(`Day 14: +${day14.streakBonus} XP`);
    });

    it('should provide time-based bonuses for psychology', () => {
      const morningTask = XPEarningService.calculateTaskXP({ 
        timeOfDay: 'morning',
        completedInSession: true
      });
      const weekendTask = XPEarningService.calculateTaskXP({ 
        isWeekend: true,
        completedInSession: true
      });

      expect(morningTask.timeBonus).toBeGreaterThan(0);
      expect(weekendTask.timeBonus).toBeGreaterThan(morningTask.timeBonus);

      console.log('Time Bonuses:');
      console.log(`Morning + Session: +${morningTask.timeBonus} XP`);
      console.log(`Weekend + Session: +${weekendTask.timeBonus} XP`);
    });
  });

  describe('Reward Economy Balance', () => {
    it('should make basic rewards easily accessible', () => {
      // 30min downtime (25 XP) should be earned quickly
      const quickTask = XPEarningService.calculateTaskXP({ taskType: 'quick' });
      const focusTask = XPEarningService.calculateTaskXP({ taskType: 'focus' });

      expect(quickTask.finalXP).toBeGreaterThanOrEqual(15); // One quick task gets you most of the way
      expect(focusTask.finalXP).toBeGreaterThanOrEqual(25); // One focus task earns 30min downtime

      console.log('Basic Reward Accessibility:');
      console.log(`30min downtime (25 XP): ${Math.ceil(25 / focusTask.finalXP)} focus task(s)`);
      console.log(`1hr downtime (50 XP): ${Math.ceil(50 / focusTask.finalXP)} focus task(s)`);
    });

    it('should require reasonable effort for medium rewards', () => {
      const focusTask = XPEarningService.calculateTaskXP({ taskType: 'focus' });
      
      const tasksFor2Hours = Math.ceil(100 / focusTask.finalXP); // 2hr session
      const tasksForSmoke = Math.ceil(75 / focusTask.finalXP);   // Quick smoke
      const tasksForMovie = Math.ceil(120 / focusTask.finalXP);  // Movie experience

      expect(tasksFor2Hours).toBeLessThanOrEqual(4); // Max 4 tasks for 2hr reward
      expect(tasksForSmoke).toBeLessThanOrEqual(3);  // Max 3 tasks for smoke
      expect(tasksForMovie).toBeLessThanOrEqual(4);  // Max 4 tasks for movie

      console.log('Medium Reward Balance:');
      console.log(`2hr session (100 XP): ${tasksFor2Hours} tasks`);
      console.log(`Quick smoke (75 XP): ${tasksForSmoke} tasks`);
      console.log(`Movie (120 XP): ${tasksForMovie} tasks`);
    });

    it('should make premium rewards require sustained effort', () => {
      const focusTask = XPEarningService.calculateTaskXP({ taskType: 'focus' });
      const deepTask = XPEarningService.calculateTaskXP({ taskType: 'deep' });
      
      const tasksForFullDay = Math.ceil(500 / focusTask.finalXP);    // Full day off
      const tasksForWeekend = Math.ceil(400 / focusTask.finalXP);    // Weekend smoke
      const tasksForGetaway = Math.ceil(800 / focusTask.finalXP);    // Weekend getaway

      expect(tasksForFullDay).toBeGreaterThan(8);  // Should require significant work
      expect(tasksForWeekend).toBeGreaterThan(6);  // Premium cannabis reward
      expect(tasksForGetaway).toBeGreaterThan(12); // Major experience reward

      console.log('Premium Reward Effort Required:');
      console.log(`Full day off (500 XP): ${tasksForFullDay} focus tasks`);
      console.log(`Weekend smoke (400 XP): ${tasksForWeekend} focus tasks`);
      console.log(`Weekend getaway (800 XP): ${tasksForGetaway} focus tasks`);
    });

    it('should create balanced daily earning potential', () => {
      // Simulate a productive day
      const morningDeepTask = XPEarningService.calculateTaskXP({
        taskType: 'deep',
        difficulty: 'medium',
        timeOfDay: 'morning',
        completedInSession: true,
        streakDays: 3
      });

      const afternoonFocusTasks = Array(2).fill(null).map(() => 
        XPEarningService.calculateTaskXP({
          taskType: 'focus',
          difficulty: 'medium',
          completedInSession: true,
          streakDays: 3
        })
      );

      const quickTasks = Array(3).fill(null).map(() =>
        XPEarningService.calculateTaskXP({
          taskType: 'quick',
          difficulty: 'easy',
          streakDays: 3
        })
      );

      const dailyTotal = morningDeepTask.finalXP + 
                        afternoonFocusTasks.reduce((sum, t) => sum + t.finalXP, 0) +
                        quickTasks.reduce((sum, t) => sum + t.finalXP, 0);

      // A productive day should earn 200-350 XP
      expect(dailyTotal).toBeGreaterThan(200);
      expect(dailyTotal).toBeLessThan(400);

      console.log('Daily Earning Potential:');
      console.log(`1 deep + 2 focus + 3 quick tasks = ${dailyTotal} XP`);
      console.log(`Can afford: 2hr session (100) + movie (120) + extras`);
    });
  });

  describe('Earning Guide Validation', () => {
    it('should provide accurate earning guidance', () => {
      const guide = XPEarningService.getRewardEarningGuide();
      
      // Verify guide exists for key rewards
      expect(guide['30min downtime (25 XP)']).toBeDefined();
      expect(guide['1 hour downtime (50 XP)']).toBeDefined();
      expect(guide['Quick smoke (75 XP)']).toBeDefined();
      expect(guide['Full day off (500 XP)']).toBeDefined();

      // Verify the suggestions make sense
      const thirtyMinGuide = guide['30min downtime (25 XP)'];
      expect(thirtyMinGuide.tasks).toBe(1);
      expect(thirtyMinGuide.timeEstimate).toContain('15-20 minutes');

      const fullDayGuide = guide['Full day off (500 XP)'];
      expect(fullDayGuide.tasks).toBe(10);
      expect(fullDayGuide.timeEstimate).toContain('6-8 hours');

      console.log('Earning Guide Sample:');
      Object.entries(guide).forEach(([reward, info]) => {
        console.log(`${reward}: ${info.tasks} tasks, ${info.timeEstimate}`);
      });
    });
  });

  describe('Psychology Features', () => {
    it('should identify near-earned rewards for motivation', () => {
      const currentXP = 45;
      const targetRewards = [
        { name: '30min downtime', price: 25 },
        { name: '1hr downtime', price: 50 },
        { name: 'Quick smoke', price: 75 },
        { name: '2hr session', price: 100 },
        { name: 'Movie night', price: 120 }
      ];

      const nearEarned = XPEarningService.getNearEarnedRewards(currentXP, targetRewards);
      
      console.log('Near-earned rewards found:', nearEarned.map(r => `${r.reward} (${r.price} XP, need ${r.xpNeeded})`));
      
      // Should identify rewards within 100 XP
      expect(nearEarned).toHaveLength(4); // 50, 75, 100, 120 XP rewards (all within 100 XP of 45)
      expect(nearEarned[0].reward).toBe('1hr downtime');
      expect(nearEarned[0].xpNeeded).toBe(5);
      expect(nearEarned[0].tasksNeeded).toBe(1);

      console.log('Near-Earned Motivation:');
      nearEarned.forEach(reward => {
        console.log(`${reward.reward}: ${reward.xpNeeded} XP (${reward.tasksNeeded} tasks, ${reward.timeEstimate})`);
      });
    });

    it('should create compelling progression', () => {
      // Test the progression from earning to spending
      const scenarios = [
        { currentXP: 20, target: 'Almost to 30min break' },
        { currentXP: 45, target: 'Almost to 1hr break' },
        { currentXP: 90, target: 'Almost to 2hr session' },
        { currentXP: 180, target: 'Building toward major rewards' },
        { currentXP: 450, target: 'Close to full day off' }
      ];

      scenarios.forEach(scenario => {
        const focusTaskXP = XPEarningService.calculateTaskXP({ taskType: 'focus' }).finalXP;
        const tasksToNext25 = Math.ceil((Math.ceil(scenario.currentXP / 25) * 25 + 25 - scenario.currentXP) / focusTaskXP);
        
        console.log(`${scenario.target}: ${tasksToNext25} task(s) away`);
        expect(tasksToNext25).toBeLessThanOrEqual(3); // Never more than 3 tasks to next tier
      });
    });
  });

  describe('Balance Validation', () => {
    it('should prevent XP inflation while maintaining motivation', () => {
      // Test that streak bonuses don't break the economy
      const extremeStreak = XPEarningService.calculateTaskXP({
        taskType: 'focus',
        streakDays: 100 // Extreme streak
      });

      // Even with extreme streak, shouldn't earn more than 2x normal
      const normalTask = XPEarningService.calculateTaskXP({ taskType: 'focus' });
      expect(extremeStreak.finalXP).toBeLessThan(normalTask.finalXP * 2);

      console.log('Inflation Protection:');
      console.log(`Normal focus task: ${normalTask.finalXP} XP`);
      console.log(`100-day streak task: ${extremeStreak.finalXP} XP`);
      console.log(`Max multiplier: ${(extremeStreak.finalXP / normalTask.finalXP).toFixed(2)}x`);
    });

    it('should maintain reward accessibility across different skill levels', () => {
      // Test that even easy tasks can eventually earn good rewards
      const easyTasks = Array(10).fill(null).map(() =>
        XPEarningService.calculateTaskXP({
          taskType: 'quick',
          difficulty: 'easy'
        })
      );

      const totalFromEasyTasks = easyTasks.reduce((sum, task) => sum + task.finalXP, 0);
      
      // 10 easy tasks should earn at least a 2hr session
      expect(totalFromEasyTasks).toBeGreaterThanOrEqual(100);

      console.log('Accessibility Validation:');
      console.log(`10 easy tasks: ${totalFromEasyTasks} XP (can afford 2hr session)`);
    });
  });
});