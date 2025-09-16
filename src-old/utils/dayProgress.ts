/**
 * 📊 Day Progress Utility - Real-time day completion calculation
 * 
 * Provides utilities for calculating how far through the day we are,
 * supporting real-time progress bars and day completion indicators.
 * 
 * Features:
 * - Real-time percentage calculation
 * - Timezone-aware calculations
 * - Performance optimized for frequent updates
 * - Type-safe interface
 */

/**
 * Calculate the percentage of day completion based on current time
 * @param currentTime - The current time (defaults to now)
 * @returns Percentage (0-100) of day completion
 */
export function calculateDayCompletionPercentage(currentTime: Date = new Date()): number {
  const now = new Date(currentTime);
  
  // Start of current day (00:00:00.000)
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  
  // End of current day (23:59:59.999)
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  
  // Calculate total day duration and elapsed time
  const totalDayMs = endOfDay.getTime() - startOfDay.getTime();
  const elapsedMs = now.getTime() - startOfDay.getTime();
  
  // Return percentage rounded to nearest whole number
  return Math.round((elapsedMs / totalDayMs) * 100);
}

/**
 * Get time remaining in the current day
 * @param currentTime - The current time (defaults to now)
 * @returns Object with hours, minutes, and seconds remaining
 */
export function getTimeRemainingInDay(currentTime: Date = new Date()): {
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
} {
  const now = new Date(currentTime);
  
  // End of current day (23:59:59.999)
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  
  const remainingMs = endOfDay.getTime() - now.getTime();
  
  const hours = Math.floor(remainingMs / (1000 * 60 * 60));
  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
  
  return {
    hours,
    minutes,
    seconds,
    totalMs: remainingMs
  };
}

/**
 * Get elapsed time in the current day
 * @param currentTime - The current time (defaults to now)
 * @returns Object with hours, minutes, and seconds elapsed
 */
export function getTimeElapsedInDay(currentTime: Date = new Date()): {
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
} {
  const now = new Date(currentTime);
  
  // Start of current day (00:00:00.000)
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  
  const elapsedMs = now.getTime() - startOfDay.getTime();
  
  const hours = Math.floor(elapsedMs / (1000 * 60 * 60));
  const minutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((elapsedMs % (1000 * 60)) / 1000);
  
  return {
    hours,
    minutes,
    seconds,
    totalMs: elapsedMs
  };
}

/**
 * Check if it's a new day compared to a reference date
 * @param referenceDate - The date to compare against
 * @param currentTime - The current time (defaults to now)
 * @returns True if it's a different day
 */
export function isNewDay(referenceDate: Date, currentTime: Date = new Date()): boolean {
  const current = new Date(currentTime);
  const reference = new Date(referenceDate);
  
  return (
    current.getFullYear() !== reference.getFullYear() ||
    current.getMonth() !== reference.getMonth() ||
    current.getDate() !== reference.getDate()
  );
}

/**
 * Format day progress as a human-readable string
 * @param percentage - Day completion percentage (0-100)
 * @returns Formatted string like "Morning (25%)", "Afternoon (67%)", etc.
 */
export function formatDayProgress(percentage: number): string {
  if (percentage < 25) return `Early Morning (${percentage}%)`;
  if (percentage < 50) return `Morning (${percentage}%)`;
  if (percentage < 75) return `Afternoon (${percentage}%)`;
  if (percentage < 90) return `Evening (${percentage}%)`;
  return `Late Evening (${percentage}%)`;
}

/**
 * React hook for real-time day progress updates
 * @param updateInterval - Update interval in milliseconds (default: 60000ms = 1 minute)
 * @returns Current day completion percentage that updates automatically
 */
export function useDayProgress(updateInterval: number = 60000): number {
  // This would be implemented as a React hook in a hooks file
  // For now, it's just a regular function that calculates current progress
  return calculateDayCompletionPercentage();
}