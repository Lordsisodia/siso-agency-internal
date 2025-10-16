/**
 * 🤖 Auto-Timebox Service
 *
 * Automatically creates and manages timeboxes based on wake-up time:
 * - Morning Routine: Auto-creates when wake-up time is set
 * - Nightly Checkout: Auto-creates 16 hours after wake-up
 *
 * Features:
 * - Editable timeboxes (user can modify)
 * - Updates when wake-up time changes
 * - Conflict-aware creation
 * - Offline-first compatible
 */

import { format, parse, addHours, addMinutes } from 'date-fns';
import { TimeBlocksAPI, CreateTimeBlockInput, TimeBlock } from '@/api/timeblocksApi.offline';

export const AUTO_TIMEBOX_TYPES = {
  MORNING_ROUTINE: 'morning-routine',
  NIGHTLY_CHECKOUT: 'nightly-checkout'
} as const;

export const AUTO_TIMEBOX_CONFIG = {
  morningRoutine: {
    durationMinutes: 45,
    title: '🌅 Morning Routine',
    type: AUTO_TIMEBOX_TYPES.MORNING_ROUTINE,
    offsetMinutes: 0 // Start immediately at wake-up time
  },
  nightlyCheckout: {
    durationMinutes: 30,
    title: '🌙 Nightly Checkout',
    type: AUTO_TIMEBOX_TYPES.NIGHTLY_CHECKOUT,
    hoursAfterWakeup: 16
  }
} as const;

/**
 * Parse time string (e.g., "8:00 AM") to 24-hour format (e.g., "08:00")
 */
function parseTime12To24(time12h: string): string {
  try {
    const parsed = parse(time12h, 'h:mm a', new Date());
    return format(parsed, 'HH:mm');
  } catch (error) {
    console.error('Failed to parse time:', time12h, error);
    throw new Error(`Invalid time format: ${time12h}`);
  }
}

/**
 * Calculate end time from start time and duration
 */
function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const start = new Date();
  start.setHours(hours, minutes, 0, 0);
  const end = addMinutes(start, durationMinutes);
  return format(end, 'HH:mm:ss');
}

/**
 * Calculate nightly checkout time (16 hours after wake-up)
 */
function calculateNightlyCheckoutTime(wakeUpTime: string): string {
  const [hours, minutes] = wakeUpTime.split(':').map(Number);
  const start = new Date();
  start.setHours(hours, minutes, 0, 0);
  const checkout = addHours(start, AUTO_TIMEBOX_CONFIG.nightlyCheckout.hoursAfterWakeup);
  return format(checkout, 'HH:mm:ss');
}

/**
 * Check if an auto-timebox already exists
 */
async function findExistingAutoTimebox(
  userId: string,
  date: string,
  type: string
): Promise<TimeBlock | null> {
  const result = await TimeBlocksAPI.getTimeBlocks(userId, date);

  if (!result.success || !result.data) {
    return null;
  }

  return result.data.find(block => block.type === type) || null;
}

/**
 * Create or update Morning Routine timebox
 */
export async function createOrUpdateMorningRoutineTimebox(
  wakeUpTime: string,
  userId: string,
  date: string
): Promise<{ success: boolean; error?: string; timeBlock?: TimeBlock }> {
  try {
    // Parse wake-up time to 24-hour format
    const startTime24h = parseTime12To24(wakeUpTime);
    const endTime = calculateEndTime(
      startTime24h,
      AUTO_TIMEBOX_CONFIG.morningRoutine.durationMinutes
    );

    // Check if already exists
    const existing = await findExistingAutoTimebox(
      userId,
      date,
      AUTO_TIMEBOX_CONFIG.morningRoutine.type
    );

    if (existing) {
      // Update existing timebox
      const updateResult = await TimeBlocksAPI.updateTimeBlock(existing.id, {
        startTime: startTime24h,
        endTime: endTime
      });

      if (updateResult.success) {
        return {
          success: true,
          timeBlock: updateResult.data
        };
      } else {
        return {
          success: false,
          error: updateResult.error || 'Failed to update morning routine timebox'
        };
      }
    } else {
      // Create new timebox
      const createData: CreateTimeBlockInput = {
        userId,
        date,
        startTime: startTime24h,
        endTime: endTime,
        type: AUTO_TIMEBOX_CONFIG.morningRoutine.type,
        title: AUTO_TIMEBOX_CONFIG.morningRoutine.title,
        description: 'Auto-created from wake-up time. Complete your morning routine!',
        isFlexible: false
      };

      const createResult = await TimeBlocksAPI.createTimeBlock(createData);

      if (createResult.success) {
        return {
          success: true,
          timeBlock: createResult.data
        };
      } else {
        return {
          success: false,
          error: createResult.error || 'Failed to create morning routine timebox'
        };
      }
    }
  } catch (error) {
    console.error('Error creating/updating morning routine timebox:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Create or update Nightly Checkout timebox
 */
export async function createOrUpdateNightlyCheckoutTimebox(
  wakeUpTime: string,
  userId: string,
  date: string
): Promise<{ success: boolean; error?: string; timeBlock?: TimeBlock }> {
  try {
    // Parse wake-up time to 24-hour format
    const wakeUpTime24h = parseTime12To24(wakeUpTime);

    // Calculate checkout time (16 hours after wake-up)
    const startTime = calculateNightlyCheckoutTime(wakeUpTime24h);
    const endTime = calculateEndTime(
      startTime,
      AUTO_TIMEBOX_CONFIG.nightlyCheckout.durationMinutes
    );

    // Check if already exists
    const existing = await findExistingAutoTimebox(
      userId,
      date,
      AUTO_TIMEBOX_CONFIG.nightlyCheckout.type
    );

    if (existing) {
      // Update existing timebox
      const updateResult = await TimeBlocksAPI.updateTimeBlock(existing.id, {
        startTime,
        endTime
      });

      if (updateResult.success) {
        return {
          success: true,
          timeBlock: updateResult.data
        };
      } else {
        return {
          success: false,
          error: updateResult.error || 'Failed to update nightly checkout timebox'
        };
      }
    } else {
      // Create new timebox
      const createData: CreateTimeBlockInput = {
        userId,
        date,
        startTime,
        endTime,
        type: AUTO_TIMEBOX_CONFIG.nightlyCheckout.type,
        title: AUTO_TIMEBOX_CONFIG.nightlyCheckout.title,
        description: 'Auto-created 16 hours after wake-up. Reflect on your day!',
        isFlexible: false
      };

      const createResult = await TimeBlocksAPI.createTimeBlock(createData);

      if (createResult.success) {
        return {
          success: true,
          timeBlock: createResult.data
        };
      } else {
        return {
          success: false,
          error: createResult.error || 'Failed to create nightly checkout timebox'
        };
      }
    }
  } catch (error) {
    console.error('Error creating/updating nightly checkout timebox:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Create or update both auto-timeboxes
 */
export async function createOrUpdateAutoTimeboxes(
  wakeUpTime: string,
  userId: string,
  date: string
): Promise<{
  success: boolean;
  morningRoutineResult?: { success: boolean; error?: string };
  nightlyCheckoutResult?: { success: boolean; error?: string };
}> {
  const [morningResult, nightlyResult] = await Promise.all([
    createOrUpdateMorningRoutineTimebox(wakeUpTime, userId, date),
    createOrUpdateNightlyCheckoutTimebox(wakeUpTime, userId, date)
  ]);

  return {
    success: morningResult.success && nightlyResult.success,
    morningRoutineResult: {
      success: morningResult.success,
      error: morningResult.error
    },
    nightlyCheckoutResult: {
      success: nightlyResult.success,
      error: nightlyResult.error
    }
  };
}

/**
 * Delete auto-timeboxes for a given date
 */
export async function deleteAutoTimeboxes(
  userId: string,
  date: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await TimeBlocksAPI.getTimeBlocks(userId, date);

    if (!result.success || !result.data) {
      return { success: false, error: 'Failed to fetch timeboxes' };
    }

    const autoTimeboxes = result.data.filter(block =>
      block.type === AUTO_TIMEBOX_CONFIG.morningRoutine.type ||
      block.type === AUTO_TIMEBOX_CONFIG.nightlyCheckout.type
    );

    await Promise.all(
      autoTimeboxes.map(block => TimeBlocksAPI.deleteTimeBlock(block.id))
    );

    return { success: true };
  } catch (error) {
    console.error('Error deleting auto-timeboxes:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Check if a timebox is an auto-created one
 */
export function isAutoTimebox(timeBlock: TimeBlock): boolean {
  return (
    timeBlock.type === AUTO_TIMEBOX_CONFIG.morningRoutine.type ||
    timeBlock.type === AUTO_TIMEBOX_CONFIG.nightlyCheckout.type
  );
}
