import { differenceInMinutes, set } from 'date-fns';

interface StepXpMultiplierParams {
  minutesSinceWake: number | null;
  minutesSincePrevious: number | null;
  wakeUpMultiplier?: number;
}

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Convert a HH:mm formatted string into minutes from midnight.
 */
export const parseTimeToMinutes = (time: string): number | null => {
  if (!time || typeof time !== 'string') {
    return null;
  }

  const parts = time.split(':');
  if (parts.length < 2) {
    return null;
  }

  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
};

/**
 * Get the exact wake-up timestamp for the selected date.
 */
export const getWakeUpTimestamp = (date: Date, wakeUpTime: string): number | null => {
  const minutes = parseTimeToMinutes(wakeUpTime);
  if (minutes === null || Number.isNaN(date.getTime())) {
    return null;
  }

  const wakeDate = set(date, {
    hours: Math.floor(minutes / 60),
    minutes: minutes % 60,
    seconds: 0,
    milliseconds: 0
  });

  return wakeDate.getTime();
};

/**
 * Calculate how many minutes have passed since the wake-up time.
 */
export const calculateMinutesSinceWake = (
  wakeUpTime: string,
  selectedDate: Date,
  completionTimestamp: number
): number | null => {
  const wakeTimestamp = getWakeUpTimestamp(selectedDate, wakeUpTime);
  if (wakeTimestamp === null) {
    return null;
  }

  const completionDate = new Date(completionTimestamp);
  if (Number.isNaN(completionDate.getTime())) {
    return null;
  }

  const difference = differenceInMinutes(completionDate, new Date(wakeTimestamp));
  return Math.max(0, difference);
};

/**
 * Earlier wake-up times award higher multipliers.
 * 6-7 AM is the sweet spot, with gradual decreases for later wake-ups.
 */
export const calculateWakeUpXpMultiplier = (wakeUpTime: string): number => {
  const minutes = parseTimeToMinutes(wakeUpTime);
  if (minutes === null) {
    return 1;
  }

  if (minutes <= 360) return 1.5;        // 6:00 AM or earlier
  if (minutes <= 390) return 1.45;       // 6:30 AM
  if (minutes <= 420) return 1.35;       // 7:00 AM
  if (minutes <= 450) return 1.25;       // 7:30 AM
  if (minutes <= 480) return 1.15;       // 8:00 AM
  if (minutes <= 540) return 1.0;        // 9:00 AM
  if (minutes <= 600) return 0.85;       // 10:00 AM
  if (minutes <= 660) return 0.7;        // 11:00 AM
  return 0.6;                            // After 11:00 AM
};

/**
 * Calculate XP multiplier for morning routine steps based on timing discipline.
 * - Rewards doing tasks shortly after waking up
 * - Adds extra bonus when tasks are done consecutively
 * - Applies wake-up multiplier as the base XP driver
 */
export const calculateStepXpMultiplier = ({
  minutesSinceWake,
  minutesSincePrevious,
  wakeUpMultiplier = 1
}: StepXpMultiplierParams): number => {
  let multiplier = 1;

  if (typeof minutesSinceWake === 'number') {
    if (minutesSinceWake <= 30) multiplier += 0.35;
    else if (minutesSinceWake <= 60) multiplier += 0.2;
    else if (minutesSinceWake <= 90) multiplier += 0.1;
    else if (minutesSinceWake <= 120) multiplier += 0;
    else if (minutesSinceWake <= 150) multiplier -= 0.05;
    else if (minutesSinceWake <= 180) multiplier -= 0.1;
    else multiplier -= 0.2;
  }

  if (typeof minutesSincePrevious === 'number') {
    if (minutesSincePrevious <= 10) multiplier += 0.1;
    else if (minutesSincePrevious <= 20) multiplier += 0.05;
    else if (minutesSincePrevious >= 90) multiplier -= 0.1;
    else if (minutesSincePrevious >= 45) multiplier -= 0.05;
  }

  const combined = multiplier * wakeUpMultiplier;
  return clamp(Number(combined.toFixed(2)), 0.5, 2);
};
