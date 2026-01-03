/**
 * 🚫 TimeBlock Overlap Prevention Utilities
 *
 * Utilities for detecting and resolving timeblock conflicts
 */

import { EnhancedTimeBlock } from '@/types/timeblock.types';

export interface TimeConflict {
  conflictingBlock: EnhancedTimeBlock;
  overlapMinutes: number;
  conflictType: 'full-overlap' | 'partial-overlap' | 'adjacent';
}

export interface TimeSlot {
  start: string;  // "HH:MM"
  end: string;    // "HH:MM"
}

export class TimeBlockOverlapUtils {
  /**
   * Check if two time blocks overlap
   */
  static hasOverlap(block1: TimeSlot, block2: TimeSlot): boolean {
    const start1 = this.timeToMinutes(block1.start);
    const end1 = this.timeToMinutes(block1.end);
    const start2 = this.timeToMinutes(block2.start);
    const end2 = this.timeToMinutes(block2.end);

    return (
      (start1 >= start2 && start1 < end2) ||
      (end1 > start2 && end1 <= end2) ||
      (start1 <= start2 && end1 >= end2)
    );
  }

  /**
   * Find all conflicts for a new block
   */
  static findConflicts(
    newBlock: TimeSlot,
    existingBlocks: EnhancedTimeBlock[],
    excludeId?: string
  ): TimeConflict[] {
    const conflicts: TimeConflict[] = [];

    for (const block of existingBlocks) {
      if (block.id === excludeId) continue;

      const blockSlot = {
        start: block.startTime,
        end: block.endTime
      };

      if (this.hasOverlap(newBlock, blockSlot)) {
        const overlapMinutes = this.calculateOverlap(newBlock, blockSlot);
        const conflictType = this.getConflictType(newBlock, blockSlot);

        conflicts.push({
          conflictingBlock: block,
          overlapMinutes,
          conflictType
        });
      }
    }

    return conflicts;
  }

  /**
   * Find next available time slot
   */
  static findNextAvailableSlot(
    desiredStart: string,
    duration: number,
    existingBlocks: EnhancedTimeBlock[],
    dayStartTime: string = '06:00',
    dayEndTime: string = '23:00'
  ): TimeSlot | null {
    const desiredStartMinutes = this.timeToMinutes(desiredStart);
    const dayStart = this.timeToMinutes(dayStartTime);
    const dayEnd = this.timeToMinutes(dayEndTime);

    // Try the desired time first
    const desiredSlot = {
      start: desiredStart,
      end: this.minutesToTime(desiredStartMinutes + duration)
    };

    if (!this.findConflicts(desiredSlot, existingBlocks).length) {
      return desiredSlot;
    }

    // Sort existing blocks by start time
    const sortedBlocks = [...existingBlocks].sort((a, b) =>
      this.timeToMinutes(a.startTime) - this.timeToMinutes(b.startTime)
    );

    // Try to find a gap between blocks
    for (let i = 0; i < sortedBlocks.length - 1; i++) {
      const currentBlockEnd = this.timeToMinutes(sortedBlocks[i].endTime);
      const nextBlockStart = this.timeToMinutes(sortedBlocks[i + 1].startTime);
      const gapDuration = nextBlockStart - currentBlockEnd;

      if (gapDuration >= duration) {
        return {
          start: this.minutesToTime(currentBlockEnd),
          end: this.minutesToTime(currentBlockEnd + duration)
        };
      }
    }

    // Try after the last block
    if (sortedBlocks.length > 0) {
      const lastBlockEnd = this.timeToMinutes(sortedBlocks[sortedBlocks.length - 1].endTime);
      const proposedEnd = lastBlockEnd + duration;

      if (proposedEnd <= dayEnd) {
        return {
          start: this.minutesToTime(lastBlockEnd),
          end: this.minutesToTime(proposedEnd)
        };
      }
    }

    // Try before the first block
    if (sortedBlocks.length > 0) {
      const firstBlockStart = this.timeToMinutes(sortedBlocks[0].startTime);
      const proposedStart = firstBlockStart - duration;

      if (proposedStart >= dayStart) {
        return {
          start: this.minutesToTime(proposedStart),
          end: this.minutesToTime(firstBlockStart)
        };
      }
    }

    // No available slot found
    return null;
  }

  /**
   * Auto-adjust a block to prevent overlap
   */
  static autoAdjustBlock(
    block: TimeSlot,
    duration: number,
    existingBlocks: EnhancedTimeBlock[],
    strategy: 'push-back' | 'push-forward' | 'find-gap' = 'find-gap'
  ): TimeSlot | null {
    const conflicts = this.findConflicts(block, existingBlocks);

    if (conflicts.length === 0) {
      return block; // No adjustment needed
    }

    switch (strategy) {
      case 'find-gap':
        return this.findNextAvailableSlot(block.start, duration, existingBlocks);

      case 'push-back':
        // Find the latest conflicting block and place after it
        const latestConflict = conflicts.reduce((latest, conflict) =>
          this.timeToMinutes(conflict.conflictingBlock.endTime) >
          this.timeToMinutes(latest.conflictingBlock.endTime)
            ? conflict : latest
        );
        const newStart = this.minutesToTime(
          this.timeToMinutes(latestConflict.conflictingBlock.endTime)
        );
        return {
          start: newStart,
          end: this.minutesToTime(this.timeToMinutes(newStart) + duration)
        };

      case 'push-forward':
        // Find the earliest conflicting block and place before it
        const earliestConflict = conflicts.reduce((earliest, conflict) =>
          this.timeToMinutes(conflict.conflictingBlock.startTime) <
          this.timeToMinutes(earliest.conflictingBlock.startTime)
            ? conflict : earliest
        );
        const proposedEnd = this.timeToMinutes(earliestConflict.conflictingBlock.startTime);
        const proposedStart = proposedEnd - duration;
        return {
          start: this.minutesToTime(proposedStart),
          end: this.minutesToTime(proposedEnd)
        };

      default:
        return null;
    }
  }

  /**
   * Calculate overlap duration in minutes
   */
  private static calculateOverlap(slot1: TimeSlot, slot2: TimeSlot): number {
    const start1 = this.timeToMinutes(slot1.start);
    const end1 = this.timeToMinutes(slot1.end);
    const start2 = this.timeToMinutes(slot2.start);
    const end2 = this.timeToMinutes(slot2.end);

    const overlapStart = Math.max(start1, start2);
    const overlapEnd = Math.min(end1, end2);

    return Math.max(0, overlapEnd - overlapStart);
  }

  /**
   * Determine conflict type
   */
  private static getConflictType(
    slot1: TimeSlot,
    slot2: TimeSlot
  ): 'full-overlap' | 'partial-overlap' | 'adjacent' {
    const start1 = this.timeToMinutes(slot1.start);
    const end1 = this.timeToMinutes(slot1.end);
    const start2 = this.timeToMinutes(slot2.start);
    const end2 = this.timeToMinutes(slot2.end);

    // Full overlap: one block completely contains the other
    if ((start1 <= start2 && end1 >= end2) || (start2 <= start1 && end2 >= end1)) {
      return 'full-overlap';
    }

    // Adjacent: blocks touch but don't overlap
    if (end1 === start2 || end2 === start1) {
      return 'adjacent';
    }

    // Partial overlap
    return 'partial-overlap';
  }

  /**
   * Convert time string to minutes since midnight
   */
  static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Convert minutes since midnight to time string
   */
  static minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Validate if a time slot is within day bounds
   */
  static isWithinDayBounds(
    slot: TimeSlot,
    dayStart: string = '06:00',
    dayEnd: string = '23:00'
  ): boolean {
    const slotStart = this.timeToMinutes(slot.start);
    const slotEnd = this.timeToMinutes(slot.end);
    const start = this.timeToMinutes(dayStart);
    const end = this.timeToMinutes(dayEnd);

    return slotStart >= start && slotEnd <= end;
  }

  /**
   * Get human-readable conflict message
   */
  static getConflictMessage(conflicts: TimeConflict[]): string {
    if (conflicts.length === 0) return '';

    if (conflicts.length === 1) {
      const conflict = conflicts[0];
      return `Overlaps with "${conflict.conflictingBlock.title}" by ${conflict.overlapMinutes} minutes`;
    }

    return `Conflicts with ${conflicts.length} time blocks`;
  }
}
