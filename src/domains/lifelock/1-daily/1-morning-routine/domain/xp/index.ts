/**
 * Morning Routine XP Calculations
 * Central export point for all XP-related calculations
 */

// Core XP calculations
export {
  calculateWakeUpXP,
  calculateFreshenUpXP,
  calculateGetBloodFlowingXP,
  calculatePowerUpBrainXP,
  calculatePlanDayXP,
  calculateMeditationXP,
  calculatePrioritiesXP,
  calculateTotalMorningXP
} from './calculations';

// XP multipliers and time-based calculations
export {
  parseTimeToMinutes,
  getWakeUpTimestamp,
  calculateMinutesSinceWake,
  calculateWakeUpXpMultiplier,
  calculateStepXpMultiplier
} from './multipliers';
