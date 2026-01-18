import { createContext, ReactNode, useContext } from 'react';
import { useXPStore } from '@/domains/xp-store/_shared/core/useXPStore';

type XPStoreContextValue = ReturnType<typeof useXPStore>;

const XPStoreContext = createContext<XPStoreContextValue | null>(null);

interface XPStoreProviderProps {
  userId: string;
  children: ReactNode;
}

export const XPStoreProvider = ({ userId, children }: XPStoreProviderProps) => {
  const store = useXPStore(userId);

  return (
    <XPStoreContext.Provider value={store}>
      {children}
    </XPStoreContext.Provider>
  );
};

export const useXPStoreContext = () => {
  const context = useContext(XPStoreContext);

  if (!context) {
    throw new Error('useXPStoreContext must be used within an XPStoreProvider');
  }

  return context;
};
