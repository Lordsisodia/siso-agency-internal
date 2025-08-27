/**
 * 🕐 TimeBlocks Client API
 * 
 * Frontend API service for time block management
 * Provides type-safe methods for CRUD operations with error handling
 */

import { TimeBlockCategory } from '../../generated/prisma/index.js';

// Types for API operations
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
  createdAt: string;
  updatedAt: string;
}

export interface CreateTimeBlockInput {
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD format
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  category: TimeBlockCategory;
  userId: string;
  notes?: string;
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

// Base API configuration
const API_BASE = '/api/timeblocks';

async function apiCall<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Request failed',
        details: data.details,
        conflicts: data.conflicts
      };
    }

    return {
      success: true,
      data: data.timeBlocks || data.timeBlock || data,
      conflicts: data.conflicts
    };
  } catch (error) {
    console.error('TimeBlocks API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}

/**
 * TimeBlocks API Service
 */
export class TimeBlocksAPI {
  /**
   * Fetch time blocks for a specific user and date
   */
  static async getTimeBlocks(
    userId: string,
    date: string
  ): Promise<ApiResponse<TimeBlock[]>> {
    const url = `${API_BASE}?userId=${userId}&date=${date}`;
    return apiCall<TimeBlock[]>(url);
  }

  /**
   * Create a new time block
   */
  static async createTimeBlock(
    data: CreateTimeBlockInput
  ): Promise<ApiResponse<TimeBlock>> {
    return apiCall<TimeBlock>(API_BASE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update an existing time block
   */
  static async updateTimeBlock(
    id: string,
    data: UpdateTimeBlockInput
  ): Promise<ApiResponse<TimeBlock>> {
    const url = `${API_BASE}?id=${id}`;
    return apiCall<TimeBlock>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a time block
   */
  static async deleteTimeBlock(
    id: string
  ): Promise<ApiResponse<{ message: string; deletedId: string }>> {
    const url = `${API_BASE}?id=${id}`;
    return apiCall(url, {
      method: 'DELETE',
    });
  }

  /**
   * Check for conflicts before creating/updating a time block
   */
  static async checkConflicts(
    userId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeId?: string
  ): Promise<ApiResponse<{ conflicts: TimeBlockConflict[] }>> {
    let url = `${API_BASE}?userId=${userId}&date=${date}&startTime=${startTime}&endTime=${endTime}&conflicts=true`;
    if (excludeId) {
      url += `&excludeId=${excludeId}`;
    }
    return apiCall<{ conflicts: TimeBlockConflict[] }>(url);
  }

  /**
   * Toggle completion status of a time block
   */
  static async toggleCompletion(
    id: string,
    completed: boolean,
    actualStart?: string,
    actualEnd?: string
  ): Promise<ApiResponse<TimeBlock>> {
    return this.updateTimeBlock(id, {
      completed,
      actualStart,
      actualEnd
    });
  }

  /**
   * Bulk create time blocks (for templates or batch operations)
   */
  static async createBulkTimeBlocks(
    timeBlocks: CreateTimeBlockInput[]
  ): Promise<ApiResponse<TimeBlock[]>> {
    // For now, create them sequentially
    // In the future, we could add a bulk endpoint for better performance
    const results: TimeBlock[] = [];
    const errors: string[] = [];

    for (const blockData of timeBlocks) {
      const result = await this.createTimeBlock(blockData);
      if (result.success && result.data) {
        results.push(result.data);
      } else {
        errors.push(`Failed to create "${blockData.title}": ${result.error}`);
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        error: 'Some time blocks failed to create',
        details: errors,
        data: results // Return partial results
      };
    }

    return {
      success: true,
      data: results
    };
  }
}

// Utility functions for time block manipulation
export class TimeBlockUtils {
  /**
   * Calculate duration in minutes between two times
   */
  static calculateDuration(startTime: string, endTime: string): number {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    return (endHour * 60 + endMin) - (startHour * 60 + startMin);
  }

  /**
   * Format duration for display (e.g., "1h 30m", "45m")
   */
  static formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes === 0 ? `${hours}h` : `${hours}h ${remainingMinutes}m`;
  }

  /**
   * Add minutes to a time string
   */
  static addMinutes(timeString: string, minutes: number): string {
    const [hour, min] = timeString.split(':').map(Number);
    const totalMinutes = hour * 60 + min + minutes;
    const newHour = Math.floor(totalMinutes / 60) % 24;
    const newMin = totalMinutes % 60;
    return `${newHour.toString().padStart(2, '0')}:${newMin.toString().padStart(2, '0')}`;
  }

  /**
   * Check if a time is within business hours (configurable)
   */
  static isBusinessHours(
    timeString: string,
    startHour = 6,
    endHour = 23
  ): boolean {
    const [hour] = timeString.split(':').map(Number);
    return hour >= startHour && hour < endHour;
  }

  /**
   * Get color for category (matches TimeboxSection styling)
   */
  static getCategoryColor(category: TimeBlockCategory): string {
    const categoryColors: Record<TimeBlockCategory, string> = {
      DEEP_WORK: 'from-blue-600/90 via-indigo-600/80 to-purple-600/80',
      LIGHT_WORK: 'from-emerald-500/90 via-green-500/80 to-teal-500/70',
      MEETING: 'from-orange-500/90 via-red-500/80 to-pink-500/70',
      BREAK: 'from-lime-500/80 via-green-400/70 to-emerald-400/60',
      PERSONAL: 'from-purple-600/90 via-pink-600/80 to-rose-600/70',
      HEALTH: 'from-teal-600/90 via-cyan-500/80 to-blue-500/70',
      LEARNING: 'from-cyan-600/80 via-blue-500/70 to-indigo-500/60',
      ADMIN: 'from-indigo-700/90 via-purple-700/80 to-violet-700/70'
    };
    return categoryColors[category] || categoryColors.ADMIN;
  }

  /**
   * Convert TimeBlockCategory to display label
   */
  static getCategoryLabel(category: TimeBlockCategory): string {
    const labels: Record<TimeBlockCategory, string> = {
      DEEP_WORK: 'Deep Work',
      LIGHT_WORK: 'Light Work',
      MEETING: 'Meeting',
      BREAK: 'Break',
      PERSONAL: 'Personal',
      HEALTH: 'Health & Wellness',
      LEARNING: 'Learning',
      ADMIN: 'Admin'
    };
    return labels[category] || 'Unknown';
  }
}

// Export all types for use in components
export type {
  TimeBlock,
  CreateTimeBlockInput,
  UpdateTimeBlockInput,
  TimeBlockConflict,
  ApiResponse
};