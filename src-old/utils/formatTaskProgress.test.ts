import { describe, it, expect } from 'vitest';
import { formatTaskProgress, type TaskProgressInput } from './formatTaskProgress';

describe('formatTaskProgress', () => {
  describe('basic functionality', () => {
    it('should format progress correctly for normal cases', () => {
      expect(formatTaskProgress(3, 4)).toBe('75% (3/4)');
      expect(formatTaskProgress(1, 2)).toBe('50% (1/2)');
      expect(formatTaskProgress(0, 5)).toBe('0% (0/5)');
      expect(formatTaskProgress(10, 10)).toBe('100% (10/10)');
    });

    it('should handle object input format', () => {
      const input: TaskProgressInput = { completed: 3, total: 4 };
      expect(formatTaskProgress(input)).toBe('75% (3/4)');
    });

    it('should round percentages correctly', () => {
      expect(formatTaskProgress(1, 3)).toBe('33% (1/3)');
      expect(formatTaskProgress(2, 3)).toBe('67% (2/3)');
      expect(formatTaskProgress(1, 6)).toBe('17% (1/6)');
      expect(formatTaskProgress(5, 6)).toBe('83% (5/6)');
    });
  });

  describe('edge cases', () => {
    it('should handle zero total tasks', () => {
      expect(formatTaskProgress(0, 0)).toBe('0%');
      expect(formatTaskProgress(5, 0)).toBe('0%');
    });

    it('should handle invalid input', () => {
      expect(formatTaskProgress(-1, 4)).toBe('0%');
      expect(formatTaskProgress(3, -1)).toBe('0%');
      expect(formatTaskProgress(5, 3)).toBe('0%'); // completed > total
    });

    it('should handle non-integer input', () => {
      expect(formatTaskProgress(1.5, 4)).toBe('0%');
      expect(formatTaskProgress(3, 4.2)).toBe('0%');
    });
  });

  describe('boundary conditions', () => {
    it('should handle large numbers', () => {
      expect(formatTaskProgress(999, 1000)).toBe('100% (999/1000)');
      expect(formatTaskProgress(1, 1000)).toBe('0% (1/1000)');
    });

    it('should handle single task scenarios', () => {
      expect(formatTaskProgress(0, 1)).toBe('0% (0/1)');
      expect(formatTaskProgress(1, 1)).toBe('100% (1/1)');
    });
  });
});