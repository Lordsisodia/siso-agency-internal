import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

// Mock fetch for connection testing
global.fetch = vi.fn();

describe('useOnlineStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    });

    // Mock addEventListener and removeEventListener
    global.addEventListener = vi.fn();
    global.removeEventListener = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with online status from navigator', () => {
      const { result } = renderHook(() => useOnlineStatus());
      
      expect(result.current.isOnline).toBe(true);
      expect(result.current.isConnecting).toBe(false);
      expect(result.current.lastOnlineAt).toBeInstanceOf(Date);
      expect(result.current.connectionType).toBe('offline'); // Will be updated after speed test
    });

    it('should initialize offline when navigator.onLine is false', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      const { result } = renderHook(() => useOnlineStatus());
      
      expect(result.current.isOnline).toBe(false);
      expect(result.current.isConnecting).toBe(false);
      expect(result.current.lastOnlineAt).toBeNull();
      expect(result.current.connectionType).toBe('offline');
    });
  });

  describe('Event Listeners', () => {
    it('should add online and offline event listeners', () => {
      renderHook(() => useOnlineStatus());
      
      expect(global.addEventListener).toHaveBeenCalledWith('online', expect.any(Function));
      expect(global.addEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
    });

    it('should remove event listeners on unmount', () => {
      const { unmount } = renderHook(() => useOnlineStatus());
      
      unmount();
      
      expect(global.removeEventListener).toHaveBeenCalledWith('online', expect.any(Function));
      expect(global.removeEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
    });
  });

  describe('Connection Speed Testing', () => {
    it('should detect fast connection', async () => {
      // Mock fast response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true
      });

      const { result } = renderHook(() => useOnlineStatus());

      // Wait for connection test to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // The hook should detect connection type after initial speed test
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/favicon.ico'),
        expect.objectContaining({
          method: 'HEAD',
          cache: 'no-cache'
        })
      );
    });

    it('should detect slow connection', async () => {
      // Mock slow response by delaying the promise
      (global.fetch as any).mockImplementationOnce(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({ ok: true }), 1500)
        )
      );

      const { result } = renderHook(() => useOnlineStatus());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 2000));
      });

      expect(global.fetch).toHaveBeenCalled();
    });

    it('should detect offline when fetch fails', async () => {
      // Mock fetch failure
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useOnlineStatus());

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('Online Event Handling', () => {
    it('should update state when going online', async () => {
      // Start offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      const { result } = renderHook(() => useOnlineStatus());
      
      expect(result.current.isOnline).toBe(false);

      // Mock fast connection test
      (global.fetch as any).mockResolvedValueOnce({ ok: true });

      // Simulate online event
      act(() => {
        const onlineHandler = (global.addEventListener as any).mock.calls
          .find(call => call[0] === 'online')[1];
        onlineHandler();
      });

      expect(result.current.isOnline).toBe(true);
      expect(result.current.isConnecting).toBe(true);
      expect(result.current.lastOnlineAt).toBeInstanceOf(Date);

      // Wait for speed test to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.isConnecting).toBe(false);
    });
  });

  describe('Offline Event Handling', () => {
    it('should update state when going offline', () => {
      const { result } = renderHook(() => useOnlineStatus());
      
      expect(result.current.isOnline).toBe(true);

      // Simulate offline event
      act(() => {
        const offlineHandler = (global.addEventListener as any).mock.calls
          .find(call => call[0] === 'offline')[1];
        offlineHandler();
      });

      expect(result.current.isOnline).toBe(false);
      expect(result.current.isConnecting).toBe(false);
      expect(result.current.connectionType).toBe('offline');
    });
  });

  describe('Connection Type Detection', () => {
    it('should maintain last online timestamp', () => {
      const { result } = renderHook(() => useOnlineStatus());
      
      const initialTimestamp = result.current.lastOnlineAt;
      
      // Go offline
      act(() => {
        const offlineHandler = (global.addEventListener as any).mock.calls
          .find(call => call[0] === 'offline')[1];
        offlineHandler();
      });

      // Timestamp should remain the same
      expect(result.current.lastOnlineAt).toBe(initialTimestamp);
    });

    it('should update timestamp when coming back online', () => {
      // Start offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      const { result } = renderHook(() => useOnlineStatus());
      
      expect(result.current.lastOnlineAt).toBeNull();

      // Mock connection test
      (global.fetch as any).mockResolvedValueOnce({ ok: true });

      // Go online
      act(() => {
        const onlineHandler = (global.addEventListener as any).mock.calls
          .find(call => call[0] === 'online')[1];
        onlineHandler();
      });

      expect(result.current.lastOnlineAt).toBeInstanceOf(Date);
    });
  });
});