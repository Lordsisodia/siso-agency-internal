import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface XPToast {
  id: string;
  amount: number;
  source: string;
  timestamp: number;
}

interface XPContextValue {
  toasts: XPToast[];
  addToast: (amount: number, source: string) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

const XPContext = createContext<XPContextValue | undefined>(undefined);

export const XPProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<XPToast[]>([]);

  const addToast = useCallback((amount: number, source: string) => {
    const newToast: XPToast = {
      id: `toast-${Date.now()}-${Math.random()}`,
      amount,
      source,
      timestamp: Date.now()
    };

    setToasts(prev => [...prev, newToast]);

    // Haptic feedback on mobile
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <XPContext.Provider value={{ toasts, addToast, removeToast, clearAll }}>
      {children}
    </XPContext.Provider>
  );
};

export const useXPContext = () => {
  const context = useContext(XPContext);
  if (!context) {
    throw new Error('useXPContext must be used within XPProvider');
  }
  return context;
};

// Helper function to award XP with a toast
export const useAwardXP = () => {
  const { addToast } = useXPContext();

  const awardXP = useCallback((amount: number, source: string) => {
    addToast(amount, source);

    // In a real implementation, this would also:
    // 1. Call an API to persist the XP gain
    // 2. Update a global XP state
    // 3. Trigger level-up animations if applicable
    // 4. Update user progress in the database

    return amount;
  }, [addToast]);

  return { awardXP };
};
