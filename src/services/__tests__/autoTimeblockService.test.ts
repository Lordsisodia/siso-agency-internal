import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  createOrUpdateMorningRoutineTimebox,
  createOrUpdateNightlyCheckoutTimebox,
  AUTO_TIMEBOX_CONFIG
} from '@/domains/lifelock/_shared/services/autoTimeblockService';
import { TimeBlocksAPI } from '@/services/api/timeblocksApi.offline';
import type { TimeBlock } from '@/services/api/timeblocksApi.offline';

const baseTimeBlock: TimeBlock = {
  id: 'block-id',
  userId: 'user-1',
  date: '2025-01-01',
  startTime: '07:00',
  endTime: '07:45:00',
  title: AUTO_TIMEBOX_CONFIG.morningRoutine.title,
  description: `${AUTO_TIMEBOX_CONFIG.morningRoutine.description} ${AUTO_TIMEBOX_CONFIG.morningRoutine.metadataTag}`,
  category: 'PERSONAL',
  completed: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('autoTimeblockService', () => {
  it('creates a morning routine block when wake-up time is provided in 24-hour format', async () => {
    const getSpy = vi
      .spyOn(TimeBlocksAPI, 'getTimeBlocks')
      .mockResolvedValue({ success: true, data: [] });

    const createSpy = vi
      .spyOn(TimeBlocksAPI, 'createTimeBlock')
      .mockResolvedValue({ success: true, data: baseTimeBlock });

    vi.spyOn(TimeBlocksAPI, 'updateTimeBlock').mockResolvedValue({ success: true, data: baseTimeBlock });

    const result = await createOrUpdateMorningRoutineTimebox('07:30', 'user-1', '2025-01-01');

    expect(result.success).toBe(true);
    expect(getSpy).toHaveBeenCalledWith('user-1', '2025-01-01');
    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        startTime: '07:30',
        category: 'PERSONAL',
        description: expect.stringContaining(AUTO_TIMEBOX_CONFIG.morningRoutine.metadataTag)
      })
    );
  });

  it('updates an existing morning routine block when it already exists', async () => {
    const existingBlock: TimeBlock = {
      ...baseTimeBlock,
      id: 'existing-block',
      startTime: '06:00',
      endTime: '06:45:00'
    };

    vi.spyOn(TimeBlocksAPI, 'getTimeBlocks').mockResolvedValue({ success: true, data: [existingBlock] });

    const updateSpy = vi
      .spyOn(TimeBlocksAPI, 'updateTimeBlock')
      .mockResolvedValue({ success: true, data: existingBlock });

    const createSpy = vi
      .spyOn(TimeBlocksAPI, 'createTimeBlock')
      .mockResolvedValue({ success: true, data: existingBlock });

    const result = await createOrUpdateMorningRoutineTimebox('06:15 AM', 'user-2', '2025-01-02');

    expect(result.success).toBe(true);
    expect(updateSpy).toHaveBeenCalledWith(
      'existing-block',
      expect.objectContaining({
        userId: 'user-2',
        date: '2025-01-02',
        startTime: '06:15',
        endTime: expect.stringContaining(':')
      })
    );
    expect(createSpy).not.toHaveBeenCalled();
  });

  it('creates a nightly checkout block 16 hours after wake-up time', async () => {
    vi.spyOn(TimeBlocksAPI, 'getTimeBlocks').mockResolvedValue({ success: true, data: [] });

    const nightlyBlock: TimeBlock = {
      ...baseTimeBlock,
      id: 'nightly-block',
      title: AUTO_TIMEBOX_CONFIG.nightlyCheckout.title,
      description: `${AUTO_TIMEBOX_CONFIG.nightlyCheckout.description} ${AUTO_TIMEBOX_CONFIG.nightlyCheckout.metadataTag}`,
      startTime: '00:00:00',
      endTime: '00:30:00'
    };

    const createSpy = vi
      .spyOn(TimeBlocksAPI, 'createTimeBlock')
      .mockResolvedValue({ success: true, data: nightlyBlock });

    vi.spyOn(TimeBlocksAPI, 'updateTimeBlock').mockResolvedValue({ success: true, data: nightlyBlock });

    const result = await createOrUpdateNightlyCheckoutTimebox('07:58', 'user-3', '2025-01-03');

    expect(result.success).toBe(true);
    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        startTime: '23:58:00',
        endTime: '00:28:00',
        description: expect.stringContaining(AUTO_TIMEBOX_CONFIG.nightlyCheckout.metadataTag)
      })
    );
  });
});
