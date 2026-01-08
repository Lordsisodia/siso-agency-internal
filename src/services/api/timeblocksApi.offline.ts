/**
 * 🕐 TimeBlocks Offline-First API
 *
 * PWA-compatible API that works offline using IndexedDB
 * Syncs to Supabase when online
 *
 * NO PRISMA - Browser-native only!
 */

import { unifiedDataService } from '@/services/shared/unified-data.service';

// Types (no Prisma dependency)
export type TimeBlockCategory =
  | 'DEEP_WORK'
  | 'LIGHT_WORK'
  | 'MEETING'
  | 'BREAK'
  | 'PERSONAL'
  | 'HEALTH'
  | 'LEARNING'
  | 'ADMIN'
  | 'AVAILABILITY';

export interface TimeBlock {
  id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  description?: string;
  category: TimeBlockCategory;
  completed: boolean;
  actualStart?: string;
  actualEnd?: string;
  notes?: string;
  taskId?: string; // Link to original task
  createdAt: string;
  updatedAt: string;
}

export interface CreateTimeBlockInput {
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  category: TimeBlockCategory;
  userId: string;
  notes?: string;
  taskId?: string; // Link to original task
}

export interface UpdateTimeBlockInput {
  title?: string;
  description?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  category?: TimeBlockCategory;
  completed?: boolean;
  actualStart?: string;
  actualEnd?: string;
  notes?: string;
  userId?: string; // Need this to fetch the existing block
  taskId?: string;
}

export interface TimeBlockConflict {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  conflictType: 'overlap' | 'adjacent';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string[];
  conflicts?: TimeBlockConflict[];
}

// Utility functions for time blocks
export class TimeBlockUtils {
  static calculateDuration(startTime: string, endTime: string): number {
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    return Math.round((end.getTime() - start.getTime()) / 60000); // minutes
  }

  static formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  }

  static getCategoryLabel(category: TimeBlockCategory): string {
    const labels: Record<TimeBlockCategory, string> = {
      'DEEP_WORK': 'Deep Work',
      'LIGHT_WORK': 'Light Work',
      'BREAK': 'Break',
      'MEETING': 'Meeting',
      'PERSONAL': 'Personal',
      'HEALTH': 'Health',
      'LEARNING': 'Learning',
      'ADMIN': 'Admin',
      'AVAILABILITY': 'Availability'
    };
    return labels[category] || category;
  }
}

const normalizeTimeString = (time: string): string => {
  if (!time) return '';

  const parts = time.trim().split(':');
  const hours = parts[0] ?? '00';
  const minutes = parts[1] ?? '00';

  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
};

// Offline-First Time Blocks API
export class TimeBlocksAPI {
  /**
   * Get all time blocks for a specific date
   */
  static async getTimeBlocks(
    userId: string,
    date: string
  ): Promise<ApiResponse<TimeBlock[]>> {
    try {
      const blocks = await unifiedDataService.getTimeBlocks(userId, date);

      // Map database types to API categories
      const typeToCategory: Record<string, TimeBlockCategory> = {
        'deep_focus': 'DEEP_WORK',
        'light_focus': 'LIGHT_WORK',
        'meeting': 'MEETING',
        'break': 'BREAK',
        'personal': 'PERSONAL',
        'health': 'HEALTH',
        'learning': 'LEARNING',
        'admin': 'ADMIN',
        'availability': 'AVAILABILITY',
        'work': 'LIGHT_WORK' // Default fallback
      };

      return {
        success: true,
        data: blocks.map(block => ({
          id: block.id || '',
          userId: block.user_id,
          date: block.date,
          startTime: normalizeTimeString(block.start_time),
          endTime: normalizeTimeString(block.end_time),
          title: block.title,
          description: block.description,
          category: typeToCategory[block.type || ''] || 'LIGHT_WORK', // Map database 'type' to API 'category'
          completed: block.completed || false,
          taskId: Array.isArray(block.task_ids) && block.task_ids.length > 0 ? block.task_ids[0] : undefined, // Extract first task_id from array
          createdAt: block.created_at || new Date().toISOString(),
          updatedAt: block.updated_at || new Date().toISOString()
        }))
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load time blocks'
      };
    }
  }

  /**
   * Create a new time block
   */
  static async createTimeBlock(
    input: CreateTimeBlockInput
  ): Promise<ApiResponse<TimeBlock>> {
    try {
      const newBlock = {
        id: crypto.randomUUID(),
        user_id: input.userId,
        date: input.date,
        start_time: normalizeTimeString(input.startTime),
        end_time: normalizeTimeString(input.endTime),
        title: input.title,
        description: input.description,
        category: input.category,  // Will be mapped to 'type' in unified service
        task_id: input.taskId,  // Will be mapped to 'task_ids' array in unified service
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await unifiedDataService.saveTimeBlock(newBlock);

      return {
        success: true,
        data: {
          ...newBlock,
          userId: newBlock.user_id,
          startTime: newBlock.start_time,
          endTime: newBlock.end_time,
          category: newBlock.category,
          completed: false,
          taskId: newBlock.task_id,
          createdAt: newBlock.created_at,
          updatedAt: newBlock.updated_at
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create time block'
      };
    }
  }

  /**
   * Update an existing time block
   */
  static async updateTimeBlock(
    id: string,
    input: UpdateTimeBlockInput
  ): Promise<ApiResponse<TimeBlock>> {
    try {
      // We need userId and date to fetch the existing block
      if (!input.userId || !input.date) {
        return {
          success: false,
          error: 'userId and date are required for updates'
        };
      }

      // Fetch existing blocks for this date
      const existingBlocks = await unifiedDataService.getTimeBlocks(input.userId, input.date);
      const existingBlock = existingBlocks.find(b => b.id === id);
      
      if (!existingBlock) {
        return {
          success: false,
          error: 'Time block not found'
        };
      }

      // Prepare update data
      const updateData = {
        start_time: input.startTime ? normalizeTimeString(input.startTime) : undefined,
        end_time: input.endTime ? normalizeTimeString(input.endTime) : undefined,
        title: input.title,
        description: input.description,
        category: input.category,
        task_id: input.taskId
      };

      await unifiedDataService.updateTimeBlock(input.userId, input.date, id, updateData);

      // Return updated block
      return {
        success: true,
        data: {
          id,
          userId: input.userId,
          date: input.date,
          startTime: normalizeTimeString(input.startTime || existingBlock.start_time),
          endTime: normalizeTimeString(input.endTime || existingBlock.end_time),
          title: input.title || existingBlock.title,
          description: input.description !== undefined ? input.description : existingBlock.description,
          category: (input.category || existingBlock.type) as TimeBlockCategory,
          completed: input.completed || false,
          actualStart: input.actualStart,
          actualEnd: input.actualEnd,
          notes: input.notes,
          taskId: input.taskId || (Array.isArray(existingBlock.task_ids) && existingBlock.task_ids.length > 0 ? existingBlock.task_ids[0] : undefined),
          createdAt: existingBlock.created_at || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update time block'
      };
    }
  }

  /**
   * Delete a time block
   */
  static async deleteTimeBlock(id: string): Promise<ApiResponse<void>> {
    try {
      await unifiedDataService.deleteTimeBlock(id);

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete time block'
      };
    }
  }

  /**
   * Check for scheduling conflicts
   */
  static async checkConflicts(
    userId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeId?: string
  ): Promise<ApiResponse<{ conflicts: TimeBlockConflict[] }>> {
    try {
      const blocks = await unifiedDataService.getTimeBlocks(userId, date);

      const conflicts: TimeBlockConflict[] = [];

      blocks.forEach(block => {
        if (block.id === excludeId) return;

        const blockStart = block.start_time;
        const blockEnd = block.end_time;

        // Check for overlap
        if (
          (startTime >= blockStart && startTime < blockEnd) ||
          (endTime > blockStart && endTime <= blockEnd) ||
          (startTime <= blockStart && endTime >= blockEnd)
        ) {
          conflicts.push({
            id: block.id || '',
            title: block.title,
            startTime: blockStart,
            endTime: blockEnd,
            conflictType: 'overlap'
          });
        }
      });

      return {
        success: true,
        data: { conflicts }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check conflicts',
        data: { conflicts: [] }
      };
    }
  }
}
