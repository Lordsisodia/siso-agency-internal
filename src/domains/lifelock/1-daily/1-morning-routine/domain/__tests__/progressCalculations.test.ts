/**
 * Unit tests for Morning Routine Progress Calculations
 */

import { describe, it, expect } from 'vitest';
import {
  calculateMorningRoutineProgress,
  getTotalProgressItems,
  getTaskStatus,
  isMorningRoutineComplete
} from '../utils';
import { DEFAULT_MORNING_ROUTINE_TASKS } from '../config';
import type { MorningRoutineData } from '../types';

describe('Morning Routine Progress Calculations', () => {
  const mockRoutineData: MorningRoutineData = {
    id: '1',
    userId: 'user1',
    date: '2024-01-15',
    wakeUp: true,
    freshenUp: false,
    getBloodFlowing: false,
    powerUpBrain: false,
    planDay: false,
    meditation: false,
    bathroom: false,
    brushTeeth: false,
    coldShower: false,
    pushups: false,
    situps: false,
    pullups: false,
    water: false,
    supplements: false,
    preworkout: false,
    thoughtDump: false,
    planDeepWork: false,
    planLightWork: false,
    setTimebox: false
  };

  describe('calculateMorningRoutineProgress', () => {
    it('should return 0% for null data', () => {
      const progress = calculateMorningRoutineProgress(null);
      expect(progress.percentage).toBe(0);
    });

    it('should calculate progress correctly', () => {
      const progress = calculateMorningRoutineProgress(mockRoutineData);
      expect(progress.completed).toBe(1); // Only wakeUp is true
      expect(progress.total).toBeGreaterThan(0);
    });
  });

  describe('getTotalProgressItems', () => {
    it('should return total number of trackable items', () => {
      const total = getTotalProgressItems();
      expect(total).toBeGreaterThan(0);
    });
  });

  describe('getTaskStatus', () => {
    it('should return true for completed tasks', () => {
      expect(getTaskStatus(mockRoutineData, 'wakeUp')).toBe(true);
    });

    it('should return false for incomplete tasks', () => {
      expect(getTaskStatus(mockRoutineData, 'freshenUp')).toBe(false);
    });
  });

  describe('isMorningRoutineComplete', () => {
    it('should return false for incomplete routine', () => {
      expect(isMorningRoutineComplete(mockRoutineData)).toBe(false);
    });
  });
});
