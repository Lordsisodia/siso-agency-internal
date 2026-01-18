/**
 * Unit tests for Morning Routine XP Calculations
 */

import { describe, it, expect } from 'vitest';
import {
  calculateWakeUpXP,
  calculateFreshenUpXP,
  calculateGetBloodFlowingXP,
  calculatePowerUpBrainXP,
  calculatePlanDayXP,
  calculateMeditationXP,
  calculatePrioritiesXP
} from '../xp';

describe('Morning Routine XP Calculations', () => {
  describe('calculateWakeUpXP', () => {
    it('should give maximum XP for waking up at 6 AM', () => {
      const date = new Date('2024-01-15T06:00:00');
      expect(calculateWakeUpXP('6:00', date)).toBe(200); // 100 * 2.0
    });

    it('should give weekend bonus before 8 AM', () => {
      const saturday = new Date('2024-01-13T07:00:00'); // Saturday
      expect(calculateWakeUpXP('7:00', saturday)).toBe(270); // 100 * 1.35 * 1.2
    });

    it('should give minimum XP for waking up after 4 PM', () => {
      const date = new Date('2024-01-15T16:00:00');
      expect(calculateWakeUpXP('4:00 PM', date)).toBe(5); // 100 * 0.05
    });
  });

  describe('calculateFreshenUpXP', () => {
    it('should give 40 XP for completing all subtasks', () => {
      const result = calculateFreshenUpXP(
        { bathroom: true, brushTeeth: true, coldShower: true },
        '6:00',
        new Date('2024-01-15T06:25:00')
      );
      expect(result.total).toBe(40);
    });

    it('should give speed bonus for completing within 25 minutes', () => {
      const result = calculateFreshenUpXP(
        { bathroom: true, brushTeeth: true, coldShower: true },
        '6:00',
        new Date('2024-01-15T06:20:00')
      );
      expect(result.speedBonus).toBe(25);
    });
  });

  describe('calculateGetBloodFlowingXP', () => {
    it('should give base XP for push-ups', () => {
      const result = calculateGetBloodFlowingXP(20, 25, false);
      expect(result.total).toBe(20);
    });

    it('should give PB bonus for beating personal best', () => {
      const result = calculateGetBloodFlowingXP(30, 25, false);
      expect(result.pbBonus).toBe(50);
    });
  });

  describe('calculatePowerUpBrainXP', () => {
    it('should calculate XP for water intake', () => {
      const result = calculatePowerUpBrainXP(500, false);
      expect(result.waterXP).toBe(30);
      expect(result.total).toBe(30);
    });

    it('should add XP for supplements', () => {
      const result = calculatePowerUpBrainXP(500, true);
      expect(result.supplementsXP).toBe(15);
      expect(result.total).toBe(45);
    });
  });

  describe('calculatePlanDayXP', () => {
    it('should give XP for completing planning', () => {
      expect(calculatePlanDayXP(true)).toBe(20);
      expect(calculatePlanDayXP(false)).toBe(0);
    });
  });

  describe('calculateMeditationXP', () => {
    it('should give 5 XP per minute', () => {
      expect(calculateMeditationXP('5 min')).toBe(25);
      expect(calculateMeditationXP('10 min')).toBe(50);
    });

    it('should cap at 200 XP (40 minutes)', () => {
      expect(calculateMeditationXP('60 min')).toBe(200);
    });
  });

  describe('calculatePrioritiesXP', () => {
    it('should give XP for all priorities filled', () => {
      const priorities = ['Task 1', 'Task 2', 'Task 3'];
      expect(calculatePrioritiesXP(priorities)).toBe(25);
    });

    it('should give no XP for empty priorities', () => {
      const priorities = ['', '', ''];
      expect(calculatePrioritiesXP(priorities)).toBe(0);
    });
  });
});
