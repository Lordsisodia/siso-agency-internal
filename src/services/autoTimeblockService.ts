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

import { format, parse, addHours, addMinutes, isValid } from 'date-fns';
import { TimeBlocksAPI, CreateTimeBlockInput, TimeBlock } from '@/api/timeblocksApi.offline';

export const AUTO_TIMEBOX_TYPES = {
  MORNING_ROUTINE: 'morning-routine',
  NIGHTLY_CHECKOUT: 'nightly-checkout'
} as const;

export const AUTO_TIMEBOX_CONFIG = {
  morningRoutine: {
    durationMinutes: 45,
    title: '🌅 Morning Routine',
    description: 'Auto-created from wake-up time. Complete your morning routine!',
    metadataTag: `[auto:${AUTO_TIMEBOX_TYPES.MORNING_ROUTINE}]`,
    type: AUTO_TIMEBOX_TYPES.MORNING_ROUTINE,
    offsetMinutes: 0 // Start immediately at wake-up time
  },
  nightlyCheckout: {
    durationMinutes: 30,
    title: '🌙 Nightly Checkout',
    description: 'Auto-created 16 hours after wake-up. Reflect on your day!',
    metadataTag: `[auto:${AUTO_TIMEBOX_TYPES.NIGHTLY_CHECKOUT}]`,
    type: AUTO_TIMEBOX_TYPES.NIGHTLY_CHECKOUT,
    hoursAfterWakeup: 16
  }
} as const;

/**
 * Parse time string (e.g., "8:00 AM") to 24-hour format (e.g., "08:00")
 */
function parseTime12To24(time12h: string): string {
  const trimmed = time12h.trim();
  const hasMeridiem = /[ap]\.?m\.?/i.test(trimmed);
  const formats: string[] = [];

  if (hasMeridiem) {
    formats.push('h:mm a', 'h a', 'hh:mm a', 'hh a');
  }

  formats.push('HH:mm', 'H:mm', 'HH:mm:ss', 'H:mm:ss');

  for (const pattern of formats) {
    const parsed = parse(trimmed, pattern, new Date());
    if (isValid(parsed)) {
      return format(parsed, 'HH:mm');
    }
  }

  const isoCandidate = new Date(`1970-01-01T${trimmed}`);
  if (isValid(isoCandidate)) {
    return format(isoCandidate, 'HH:mm');
  }

  console.error('Failed to parse time:', time12h);
  throw new Error(`Invalid time format: ${time12h}`);
}

function getAutoTimeboxConfig(type: string) {
  return Object.values(AUTO_TIMEBOX_CONFIG).find(config => config.type === type);
}

function buildAutoDescription(config: typeof AUTO_TIMEBOX_CONFIG[keyof typeof AUTO_TIMEBOX_CONFIG]): string {
  return `${config.description} ${config.metadataTag}`.trim();
}

function matchesAutoTimebox(
  block: TimeBlock,
  config: typeof AUTO_TIMEBOX_CONFIG[keyof typeof AUTO_TIMEBOX_CONFIG]
): boolean {
  const blockWithType = block as TimeBlock & { type?: string };
  const matchesType = blockWithType.type === config.type;
  const matchesTitle = block.title === config.title;
  const matchesDescription = !!block.description && block.description.includes(config.metadataTag);

  return matchesType || matchesTitle || matchesDescription;
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

  const config = getAutoTimeboxConfig(type);

  return (
    result.data.find(block => (config ? matchesAutoTimebox(block, config) : (block as TimeBlock & { type?: string }).type === type)) ||
    null
  );
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
    const config = AUTO_TIMEBOX_CONFIG.morningRoutine;
    const endTime = calculateEndTime(
      startTime24h,
      config.durationMinutes
    );

    // Check if already exists
    const existing = await findExistingAutoTimebox(
      userId,
      date,
      config.type
    );

    if (existing) {
      // Update existing timebox
      const updateResult = await TimeBlocksAPI.updateTimeBlock(existing.id, {
        userId,
        date,
        startTime: startTime24h,
        endTime: endTime,
        description:
          existing.description && existing.description.includes(config.metadataTag)
            ? existing.description
            : buildAutoDescription(config)
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
        category: 'PERSONAL',
        title: AUTO_TIMEBOX_CONFIG.morningRoutine.title,
        description: buildAutoDescription(config)
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
    const config = AUTO_TIMEBOX_CONFIG.nightlyCheckout;

    // Calculate checkout time (16 hours after wake-up)
    const startTime = calculateNightlyCheckoutTime(wakeUpTime24h);
    const endTime = calculateEndTime(
      startTime,
      config.durationMinutes
    );

    // Check if already exists
    const existing = await findExistingAutoTimebox(
      userId,
      date,
      config.type
    );

    if (existing) {
      // Update existing timebox
      const updateResult = await TimeBlocksAPI.updateTimeBlock(existing.id, {
        userId,
        date,
        startTime,
        endTime,
        description:
          existing.description && existing.description.includes(config.metadataTag)
            ? existing.description
            : buildAutoDescription(config)
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
        category: 'PERSONAL',
        title: AUTO_TIMEBOX_CONFIG.nightlyCheckout.title,
        description: buildAutoDescription(config)
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
      matchesAutoTimebox(block, AUTO_TIMEBOX_CONFIG.morningRoutine) ||
      matchesAutoTimebox(block, AUTO_TIMEBOX_CONFIG.nightlyCheckout)
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
    matchesAutoTimebox(timeBlock, AUTO_TIMEBOX_CONFIG.morningRoutine) ||
    matchesAutoTimebox(timeBlock, AUTO_TIMEBOX_CONFIG.nightlyCheckout)
  );
}
