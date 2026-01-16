import { describe, it, expect } from 'vitest';
import {
  calculateBedTimeXP,
  calculateWinOfDayXP,
  calculateMoodXP,
  calculateWentWellXP,
  calculateEvenBetterIfXP,
  calculateDailyAnalysisXP,
  calculateKeyLearningsXP,
  calculateTomorrowTasksXP,
  calculateOverallRatingXP,
  calculateEnergyLevelXP,
  calculateStreakBonus,
  calculatePerfectCompletionBonus,
  calculateTotalCheckoutXP
} from '@/domains/lifelock/1-daily/7-checkout/domain/xpCalculations';

describe('XP Calculations', () => {
  describe('calculateBedTimeXP', () => {
    it('should return 0 for empty bed time', () => {
      expect(calculateBedTimeXP('')).toBe(0);
    });

    it('should give 100 XP for 10:00 PM or earlier', () => {
      expect(calculateBedTimeXP('10:00 PM')).toBe(100);
      expect(calculateBedTimeXP('9:30 PM')).toBe(100);
    });

    it('should give 75 XP for 11:00 PM', () => {
      expect(calculateBedTimeXP('11:00 PM')).toBe(75);
    });

    it('should give 50 XP for 11:01 PM - 12:00 AM', () => {
      expect(calculateBedTimeXP('11:30 PM')).toBe(50);
    });

    it('should give 50 XP for 12:00 AM - 1:00 AM', () => {
      expect(calculateBedTimeXP('12:00 AM')).toBe(50);
      expect(calculateBedTimeXP('12:30 AM')).toBe(50);
    });

    it('should give 35 XP for 1:01 AM - 2:00 AM', () => {
      // 50 * 0.7 = 35 (1:01 AM to 2:00 AM, so 1:30 AM gets this)
      expect(calculateBedTimeXP('1:30 AM')).toBe(35);
    });

    it('should give 20 XP for 2:01 AM - 3:00 AM', () => {
      // 50 * 0.4 = 20 (2:01 AM to 3:00 AM)
      expect(calculateBedTimeXP('2:30 AM')).toBe(20);
    });

    it('should give 10 XP for after 3:00 AM', () => {
      expect(calculateBedTimeXP('3:00 AM')).toBe(10);
      expect(calculateBedTimeXP('5:00 AM')).toBe(10);
    });
  });

  describe('calculateWinOfDayXP', () => {
    it('should return 25 XP for non-empty win of day', () => {
      expect(calculateWinOfDayXP('Completed my project')).toBe(25);
    });

    it('should return 0 XP for empty win of day', () => {
      expect(calculateWinOfDayXP('')).toBe(0);
      expect(calculateWinOfDayXP('   ')).toBe(0);
    });
  });

  describe('calculateMoodXP', () => {
    it('should return 15 XP for any mood value', () => {
      expect(calculateMoodXP('happy')).toBe(15);
      expect(calculateMoodXP('5')).toBe(15);
    });

    it('should return 0 XP for empty mood', () => {
      expect(calculateMoodXP('')).toBe(0);
    });
  });

  describe('calculateWentWellXP', () => {
    it('should return 10 XP per item', () => {
      expect(calculateWentWellXP(['Item 1', '', ''])).toBe(10);
      expect(calculateWentWellXP(['Item 1', 'Item 2', ''])).toBe(20);
      expect(calculateWentWellXP(['Item 1', 'Item 2', 'Item 3'])).toBe(30);
    });

    it('should cap at 50 XP (5 items)', () => {
      const items = ['1', '2', '3', '4', '5', '6'];
      expect(calculateWentWellXP(items)).toBe(50);
    });

    it('should ignore empty items', () => {
      expect(calculateWentWellXP(['Valid', '', '  '])).toBe(10);
    });
  });

  describe('calculateEvenBetterIfXP', () => {
    it('should return 10 XP per item', () => {
      expect(calculateEvenBetterIfXP(['Improve 1', '', ''])).toBe(10);
      expect(calculateEvenBetterIfXP(['Improve 1', 'Improve 2', ''])).toBe(20);
    });

    it('should cap at 50 XP (5 items)', () => {
      const items = ['1', '2', '3', '4', '5', '6'];
      expect(calculateEvenBetterIfXP(items)).toBe(50);
    });

    it('should ignore empty items', () => {
      expect(calculateEvenBetterIfXP(['Valid', '', '  '])).toBe(10);
    });
  });

  describe('calculateDailyAnalysisXP', () => {
    it('should return 30 XP for 50+ characters', () => {
      const longText = 'a'.repeat(50);
      expect(calculateDailyAnalysisXP(longText)).toBe(30);
      expect(calculateDailyAnalysisXP('a'.repeat(100))).toBe(30);
    });

    it('should return 0 XP for less than 50 characters', () => {
      expect(calculateDailyAnalysisXP('a'.repeat(49))).toBe(0);
      expect(calculateDailyAnalysisXP('Short')).toBe(0);
    });
  });

  describe('calculateKeyLearningsXP', () => {
    it('should return 25 XP for non-empty learnings', () => {
      expect(calculateKeyLearningsXP('Learned something new')).toBe(25);
    });

    it('should return 0 XP for empty learnings', () => {
      expect(calculateKeyLearningsXP('')).toBe(0);
      expect(calculateKeyLearningsXP('   ')).toBe(0);
    });
  });

  describe('calculateTomorrowTasksXP', () => {
    it('should return 30 XP if all 3 tasks are filled', () => {
      const tasks = ['Task 1', 'Task 2', 'Task 3'];
      expect(calculateTomorrowTasksXP(tasks)).toBe(30);
    });

    it('should return 0 XP if any task is empty', () => {
      expect(calculateTomorrowTasksXP(['Task 1', 'Task 2', ''])).toBe(0);
      expect(calculateTomorrowTasksXP(['Task 1', '', ''])).toBe(0);
    });
  });

  describe('calculateOverallRatingXP', () => {
    it('should return 15 XP for any rating', () => {
      expect(calculateOverallRatingXP(5)).toBe(15);
      expect(calculateOverallRatingXP(10)).toBe(15);
      expect(calculateOverallRatingXP(1)).toBe(15);
    });

    it('should return 0 XP for undefined rating', () => {
      expect(calculateOverallRatingXP(undefined)).toBe(0);
    });
  });

  describe('calculateEnergyLevelXP', () => {
    it('should return 15 XP for any energy level', () => {
      expect(calculateEnergyLevelXP(5)).toBe(15);
      expect(calculateEnergyLevelXP(10)).toBe(15);
      expect(calculateEnergyLevelXP(1)).toBe(15);
    });

    it('should return 0 XP for undefined energy level', () => {
      expect(calculateEnergyLevelXP(undefined)).toBe(0);
    });
  });

  describe('calculateStreakBonus', () => {
    it('should give 2 XP per day', () => {
      expect(calculateStreakBonus(1)).toBe(2);
      expect(calculateStreakBonus(5)).toBe(10);
      expect(calculateStreakBonus(10)).toBe(20);
    });

    it('should cap at 50 XP (25 days)', () => {
      expect(calculateStreakBonus(25)).toBe(50);
      expect(calculateStreakBonus(50)).toBe(50);
      expect(calculateStreakBonus(100)).toBe(50);
    });
  });

  describe('calculatePerfectCompletionBonus', () => {
    it('should give 50 XP for complete checkout', () => {
      expect(calculatePerfectCompletionBonus(true)).toBe(50);
    });

    it('should give 0 XP for incomplete checkout', () => {
      expect(calculatePerfectCompletionBonus(false)).toBe(0);
    });
  });

  describe('calculateTotalCheckoutXP', () => {
    const completeCheckout = {
      bedTime: '10:00 PM',
      winOfDay: 'Finished the project',
      mood: 'great',
      wentWell: ['Win 1', 'Win 2', 'Win 3'],
      evenBetterIf: ['Improve 1', 'Improve 2'],
      dailyAnalysis: 'a'.repeat(50),
      keyLearnings: 'Learned a lot',
      tomorrowTopTasks: ['Task 1', 'Task 2', 'Task 3'],
      overallRating: 8,
      energyLevel: 7
    };

    it('should calculate total XP correctly', () => {
      const result = calculateTotalCheckoutXP(completeCheckout, 5);

      // Bed time: 100, Win: 25, Mood: 15, Went well: 30, Even better: 20
      // Analysis: 30, Learnings: 25, Tomorrow: 30, Rating: 15, Energy: 15
      // Subtotal: 305, Streak: 10, Perfect: 50, Total: 365
      expect(result.total).toBeGreaterThan(0);
      expect(result.breakdown).toHaveProperty('bedTime');
      expect(result.breakdown).toHaveProperty('streakBonus');
      expect(result.breakdown).toHaveProperty('perfectBonus');
    });

    it('should include streak bonus', () => {
      const result = calculateTotalCheckoutXP(completeCheckout, 10);
      expect(result.breakdown.streakBonus).toBe(20);
    });

    it('should give perfect bonus for complete checkout', () => {
      const result = calculateTotalCheckoutXP(completeCheckout, 0);
      expect(result.breakdown.perfectBonus).toBe(50);
    });

    it('should not give perfect bonus for incomplete checkout', () => {
      const incompleteCheckout = {
        ...completeCheckout,
        bedTime: '',
        tomorrowTopTasks: ['', '', '']
      };
      const result = calculateTotalCheckoutXP(incompleteCheckout, 0);
      expect(result.breakdown.perfectBonus).toBe(0);
    });

    it('should provide detailed breakdown', () => {
      const result = calculateTotalCheckoutXP(completeCheckout, 5);

      expect(result.breakdown).toMatchObject({
        bedTime: expect.any(Number),
        winOfDay: expect.any(Number),
        mood: expect.any(Number),
        wentWell: expect.any(Number),
        evenBetterIf: expect.any(Number),
        dailyAnalysis: expect.any(Number),
        keyLearnings: expect.any(Number),
        tomorrowTasks: expect.any(Number),
        overallRating: expect.any(Number),
        energyLevel: expect.any(Number),
        streakBonus: expect.any(Number),
        perfectBonus: expect.any(Number)
      });
    });
  });
});
