import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import { workTypeApiClient } from '../workTypeApiClient';

const originalFetch = globalThis.fetch;

describe('workTypeApiClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterAll(() => {
    globalThis.fetch = originalFetch;
  });

  it('merges light and deep work results with workType metadata', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            success: true,
            data: [
              {
                id: 'light-1',
                title: 'Light task',
                completed: false
              }
            ]
          })
      })
      .mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            success: true,
            data: [
              {
                id: 'deep-1',
                title: 'Deep task',
                completed: true
              }
            ]
          })
      });

    globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch;

    const tasks = await workTypeApiClient.getTasksForDate('user-123', new Date('2025-10-15'));

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      '/api/light-work/tasks?userId=user-123&date=2025-10-15'
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/deep-work/tasks?userId=user-123&date=2025-10-15'
    );

    const lightTask = tasks.find(task => task.id === 'light-1');
    const deepTask = tasks.find(task => task.id === 'deep-1');

    expect(lightTask).toMatchObject({ workType: 'LIGHT', priority: 'MEDIUM' });
    expect(deepTask).toMatchObject({ workType: 'DEEP', completed: true });
  });

  it('posts correctly shaped payloads when adding tasks', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true })
    });

    globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch;

    const targetDate = new Date('2025-10-15');
    await workTypeApiClient.addTask('Deep Focus', targetDate, 'HIGH', 'DEEP', 'user-123');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [endpoint, init] = fetchMock.mock.calls[0] as [string, RequestInit];

    expect(endpoint).toBe('/api/deep-work/tasks');
    expect(init?.method).toBe('POST');

    const parsedBody = JSON.parse((init?.body as string) ?? '{}');
    expect(parsedBody).toMatchObject({
      userId: 'user-123',
      date: '2025-10-15',
      title: 'Deep Focus',
      priority: 'HIGH',
      estimatedMinutes: 30
    });
  });

  it('sends toggle updates with task id and inverted completion state', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true })
    });

    globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch;

    await workTypeApiClient.toggleTask('task-456', 'LIGHT', true);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [endpoint, init] = fetchMock.mock.calls[0] as [string, RequestInit];

    expect(endpoint).toBe('/api/light-work/tasks');
    expect(init?.method).toBe('PUT');

    const parsedBody = JSON.parse((init?.body as string) ?? '{}');
    expect(parsedBody).toMatchObject({
      taskId: 'task-456',
      completed: false
    });
  });

  it('sends delete request with task id in payload', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true })
    });

    globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch;

    await workTypeApiClient.deleteTask('task-789', 'DEEP');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [endpoint, init] = fetchMock.mock.calls[0] as [string, RequestInit];

    expect(endpoint).toBe('/api/deep-work/tasks');
    expect(init?.method).toBe('DELETE');

    const parsedBody = JSON.parse((init?.body as string) ?? '{}');
    expect(parsedBody).toMatchObject({
      taskId: 'task-789'
    });
  });
});
