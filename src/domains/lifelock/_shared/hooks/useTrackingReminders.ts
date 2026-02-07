/**
 * Tracking Reminders Hook
 * Manages browser notifications and in-app reminders for tracking items
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface ReminderConfig {
  id: string;
  title: string;
  message: string;
  icon?: string;
  frequency: 'once' | 'hourly' | 'daily';
  startTime?: string; // HH:mm format
  endTime?: string; // HH:mm format
  intervalMinutes?: number;
  enabled: boolean;
}

interface ReminderState {
  lastReminded: Record<string, number>;
  permission: NotificationPermission;
}

const DEFAULT_REMINDERS: ReminderConfig[] = [
  {
    id: 'water',
    title: '💧 Hydration Check',
    message: 'Have you logged your water intake?',
    frequency: 'hourly',
    startTime: '08:00',
    endTime: '22:00',
    intervalMinutes: 120,
    enabled: true,
  },
  {
    id: 'nutrition',
    title: '🍎 Meal Tracking',
    message: 'Don\'t forget to log your meals!',
    frequency: 'daily',
    startTime: '12:00',
    enabled: true,
  },
  {
    id: 'smoking',
    title: '🚭 Smoking Log',
    message: 'Track your smoking habits for better insights.',
    frequency: 'daily',
    startTime: '20:00',
    enabled: true,
  },
  {
    id: 'caffeine',
    title: '☕ Caffeine Tracker',
    message: 'Log your caffeine intake today.',
    frequency: 'daily',
    startTime: '16:00',
    enabled: true,
  },
  {
    id: 'cannabis',
    title: '🌿 Cannabis Log',
    message: 'Track your cannabis usage for the day.',
    frequency: 'daily',
    startTime: '21:00',
    enabled: true,
  },
  {
    id: 'alcohol',
    title: '🍺 Alcohol Tracker',
    message: 'Log any alcohol consumption today.',
    frequency: 'daily',
    startTime: '22:00',
    enabled: true,
  },
  {
    id: 'screen-time',
    title: '📱 Screen Time Check',
    message: 'How much screen time have you had today?',
    frequency: 'daily',
    startTime: '21:00',
    enabled: true,
  },
  {
    id: 'energy',
    title: '⚡ Energy Level',
    message: 'Track your energy levels for today.',
    frequency: 'daily',
    startTime: '18:00',
    enabled: true,
  },
];

const STORAGE_KEY = 'tracking-reminders-state';

export function useTrackingReminders() {
  const [reminders, setReminders] = useState<ReminderConfig[]>(DEFAULT_REMINDERS);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [inAppReminders, setInAppReminders] = useState<Array<{ id: string; config: ReminderConfig }>>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved state
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.reminders) {
          setReminders(prev =>
            prev.map(r => {
              const savedReminder = parsed.reminders.find((sr: ReminderConfig) => sr.id === r.id);
              return savedReminder ? { ...r, enabled: savedReminder.enabled } : r;
            })
          );
        }
      } catch (e) {
        console.error('Failed to load reminder state:', e);
      }
    }

    // Check notification permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Save state when reminders change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ reminders }));
  }, [reminders]);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('Browser notifications not supported');
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  }, []);

  // Show browser notification
  const showNotification = useCallback((config: ReminderConfig) => {
    if (permission !== 'granted') {
      // Fall back to in-app reminder
      setInAppReminders(prev => {
        if (prev.some(r => r.id === config.id)) return prev;
        return [...prev, { id: config.id, config }];
      });
      return;
    }

    try {
      new Notification(config.title, {
        body: config.message,
        icon: config.icon || '/favicon.ico',
        tag: config.id,
        requireInteraction: false,
      });
    } catch (e) {
      console.error('Failed to show notification:', e);
      // Fall back to in-app
      setInAppReminders(prev => {
        if (prev.some(r => r.id === config.id)) return prev;
        return [...prev, { id: config.id, config }];
      });
    }
  }, [permission]);

  // Check if it's time to show a reminder
  const shouldShowReminder = useCallback((config: ReminderConfig): boolean => {
    if (!config.enabled) return false;

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Check time window
    if (config.startTime && currentTime < config.startTime) return false;
    if (config.endTime && currentTime > config.endTime) return false;

    const lastReminded = parseInt(localStorage.getItem(`reminder-last-${config.id}`) || '0');
    const nowMs = Date.now();

    switch (config.frequency) {
      case 'once':
        // Only show once per day
        const lastDate = new Date(lastReminded).toDateString();
        return lastDate !== now.toDateString();

      case 'hourly':
        const interval = (config.intervalMinutes || 60) * 60 * 1000;
        return nowMs - lastReminded >= interval;

      case 'daily':
        // Show once per day at the specified time (within 1 minute window)
        if (currentTime !== config.startTime) return false;
        const lastDaily = new Date(lastReminded).toDateString();
        return lastDaily !== now.toDateString();

      default:
        return false;
    }
  }, []);

  // Check reminders periodically
  useEffect(() => {
    const checkReminders = () => {
      reminders.forEach(reminder => {
        if (shouldShowReminder(reminder)) {
          showNotification(reminder);
          localStorage.setItem(`reminder-last-${reminder.id}`, Date.now().toString());
        }
      });
    };

    // Check immediately and then every minute
    checkReminders();
    intervalRef.current = setInterval(checkReminders, 60000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [reminders, shouldShowReminder, showNotification]);

  // Toggle reminder enabled state
  const toggleReminder = useCallback((id: string) => {
    setReminders(prev =>
      prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r)
    );
  }, []);

  // Update reminder config
  const updateReminder = useCallback((id: string, updates: Partial<ReminderConfig>) => {
    setReminders(prev =>
      prev.map(r => r.id === id ? { ...r, ...updates } : r)
    );
  }, []);

  // Dismiss in-app reminder
  const dismissInAppReminder = useCallback((id: string) => {
    setInAppReminders(prev => prev.filter(r => r.id !== id));
    localStorage.setItem(`reminder-last-${id}`, Date.now().toString());
  }, []);

  // Snooze reminder (dismiss for 30 minutes)
  const snoozeReminder = useCallback((id: string) => {
    setInAppReminders(prev => prev.filter(r => r.id !== id));
    const snoozeTime = Date.now() + 30 * 60 * 1000;
    localStorage.setItem(`reminder-last-${id}`, snoozeTime.toString());
  }, []);

  return {
    reminders,
    permission,
    inAppReminders,
    requestPermission,
    toggleReminder,
    updateReminder,
    dismissInAppReminder,
    snoozeReminder,
    isSupported: 'Notification' in window,
  };
}

export default useTrackingReminders;
