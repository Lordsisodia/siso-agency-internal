import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { useVoiceProcessing } from '@/hooks/useVoiceProcessing';
import type { ThoughtDumpResult } from '@/services/lifeLockVoiceTaskProcessor';

const voiceMocks = vi.hoisted(() => ({
  mockProcessVoiceInput: vi.fn(),
}));

vi.mock('@/services/lifeLockVoiceTaskProcessor', () => ({
  lifeLockVoiceTaskProcessor: {
    processVoiceInput: voiceMocks.mockProcessVoiceInput,
  },
}));

const { mockProcessVoiceInput } = voiceMocks;

const setNavigatorOnline = (value: boolean) => {
  Object.defineProperty(window.navigator, 'onLine', {
    configurable: true,
    value,
  });
};

describe('useVoiceProcessing', () => {
  const selectedDate = new Date('2025-01-15T12:00:00.000Z');
  let consoleErrorSpy: ReturnType<typeof vi.spyOn> | undefined;
  let consoleLogSpy: ReturnType<typeof vi.spyOn> | undefined;

  beforeEach(() => {
    mockProcessVoiceInput.mockReset();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    setNavigatorOnline(true);
  });

  afterEach(() => {
    consoleErrorSpy?.mockRestore();
    consoleLogSpy?.mockRestore();
  });

  it('processes voice commands successfully and triggers task refresh', async () => {
    const resultPayload: ThoughtDumpResult & { tasksAdded: number; tasksModified: number } = {
      success: true,
      message: 'Created tasks',
      deepTasks: [],
      lightTasks: [],
      totalTasks: 0,
      processingNotes: 'notes',
      tasksAdded: 2,
      tasksModified: 0,
    };
    mockProcessVoiceInput.mockResolvedValue(resultPayload);
    const onTaskChange = vi.fn();

    const { result } = renderHook(() => useVoiceProcessing(selectedDate, onTaskChange));

    await act(async () => {
      await result.current.handleVoiceCommand('Add a deep work session');
    });

    expect(mockProcessVoiceInput).toHaveBeenCalledWith('Add a deep work session', selectedDate);
    expect(result.current.lastThoughtDumpResult).toEqual(resultPayload);
    expect(result.current.voiceError).toBeNull();
    expect(result.current.isProcessingVoice).toBe(false);
    expect(onTaskChange).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.clearThoughtDumpResult();
    });

    expect(result.current.lastThoughtDumpResult).toBeNull();
  });

  it('captures processor errors and exposes them to the UI', async () => {
    mockProcessVoiceInput.mockRejectedValue(new Error('Processor failure'));
    const onTaskChange = vi.fn();

    const { result } = renderHook(() => useVoiceProcessing(selectedDate, onTaskChange));

    await act(async () => {
      await result.current.handleVoiceCommand('Generate quick tasks');
    });

    expect(mockProcessVoiceInput).toHaveBeenCalled();
    expect(onTaskChange).not.toHaveBeenCalled();
    expect(result.current.voiceError).toBe('Processor failure');
    expect(result.current.isProcessingVoice).toBe(false);

    act(() => {
      result.current.clearVoiceError();
    });

    expect(result.current.voiceError).toBeNull();
  });

  it('surfaces offline failures gracefully without triggering refreshes', async () => {
    setNavigatorOnline(false);
    mockProcessVoiceInput.mockRejectedValue(new Error('Offline - voice commands unavailable'));
    const onTaskChange = vi.fn();

    const { result } = renderHook(() => useVoiceProcessing(selectedDate, onTaskChange));

    await act(async () => {
      await result.current.handleVoiceCommand('Plan my day');
    });

    expect(mockProcessVoiceInput).toHaveBeenCalled();
    expect(onTaskChange).not.toHaveBeenCalled();
    expect(result.current.voiceError).toBe('Offline - voice commands unavailable');
    expect(result.current.isProcessingVoice).toBe(false);
  });
});
