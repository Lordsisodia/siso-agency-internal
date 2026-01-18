import { useState, useEffect } from 'react';

/**
 * Custom hook for localStorage persistence
 * Automatically saves and loads data from localStorage
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}

/**
 * Hook for persisting user preferences
 */
export function useUserPreferences() {
  const [preferences, setPreferences] = useLocalStorage('user-preferences', {
    taskViewMode: 'horizontal' as 'horizontal' | 'vertical' | 'kanban' | 'legacy',
    taskFilter: 'all' as 'all' | 'active' | 'completed',
    taskCategory: 'main' as string,
    compactTaskColumns: 2,
    showTaskQuotes: true
  });

  const updatePreference = <K extends keyof typeof preferences>(
    key: K, 
    value: typeof preferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  return { preferences, updatePreference };
}
