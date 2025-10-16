import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { useTaskActions } from '../useTaskActions';

const actionMocks = vi.hoisted(() => ({
  mockToggleTask: vi.fn(),
  mockAddTask: vi.fn(),
  mockDeleteTask: vi.fn(),
  mockUpdateTask: vi.fn(),
}));

vi.mock('@/services/workTypeApiClient', () => ({
  personalTaskService: {
    toggleTask: actionMocks.mockToggleTask,
    addTask: actionMocks.mockAddTask,
    deleteTask: actionMocks.mockDeleteTask,
    updateTask: actionMocks.mockUpdateTask,
  },
}));

const { mockToggleTask, mockAddTask, mockDeleteTask, mockUpdateTask } = actionMocks;

const clerkUserMock = {
  user: { id: 'test-user-id' },
  isSignedIn: true,
  isLoaded: true,
};

vi.mock('@/shared/hooks/useClerkUser', () => ({
  useClerkUser: () => clerkUserMock,
}));

const setNavigatorOnline = (value: boolean) => {
  Object.defineProperty(window.navigator, 'onLine', {
    configurable: true,
    value,
  });
};

describe('useTaskActions', () => {
  const selectedDate = new Date('2025-01-15T12:00:00.000Z');
  let consoleErrorSpy: ReturnType<typeof vi.spyOn> | undefined;

  beforeEach(() => {
    mockToggleTask.mockReset();
    mockAddTask.mockReset();
    mockDeleteTask.mockReset();
    mockUpdateTask.mockReset();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    setNavigatorOnline(true);
  });

  afterEach(() => {
    consoleErrorSpy?.mockRestore();
  });

  it('performs task toggle successfully and reports feedback', async () => {
    mockToggleTask.mockResolvedValue(undefined);
    const onTaskChange = vi.fn();

    const { result } = renderHook(() => useTaskActions(selectedDate, onTaskChange));

    await act(async () => {
      await result.current.handleTaskToggle({ id: 'task-1', workType: 'LIGHT', completed: false });
    });

    expect(mockToggleTask).toHaveBeenCalledWith('task-1', 'LIGHT', false);
    expect(onTaskChange).toHaveBeenCalledTimes(1);
    expect(result.current.lastAction).toBe('Task toggled successfully');
    expect(result.current.actionError).toBeNull();

    act(() => {
      result.current.clearLastAction();
    });

    expect(result.current.lastAction).toBeNull();
  });

  it('captures errors when a delete action fails', async () => {
    mockDeleteTask.mockRejectedValue(new Error('Failed to delete task'));
    const onTaskChange = vi.fn();

    const { result } = renderHook(() => useTaskActions(selectedDate, onTaskChange));

    await act(async () => {
      await result.current.handleTaskDelete({ id: 'task-2', workType: 'DEEP' });
    });

    expect(mockDeleteTask).toHaveBeenCalledWith('task-2', 'DEEP');
    expect(onTaskChange).not.toHaveBeenCalled();
    expect(result.current.actionError).toBe('Failed to delete task');
    expect(result.current.lastAction).toBeNull();
  });

  it('surfaces offline errors when add requests cannot reach the API', async () => {
    setNavigatorOnline(false);
    mockAddTask.mockRejectedValue(new Error('Offline - task will sync later'));
    const onTaskChange = vi.fn();

    const { result } = renderHook(() => useTaskActions(selectedDate, onTaskChange));

    await act(async () => {
      await result.current.handleTaskAdd({ title: 'Offline task', priority: 'high', workType: 'LIGHT' });
    });

    expect(mockAddTask).toHaveBeenCalledWith('Offline task', selectedDate, 'high', 'LIGHT', 'test-user-id');
    expect(onTaskChange).not.toHaveBeenCalled();
    expect(result.current.actionError).toBe('Offline - task will sync later');
    expect(result.current.lastAction).toBeNull();
    expect(result.current.isAddingTask).toBe(false);
  });
});
