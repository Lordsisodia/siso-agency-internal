
import React, { createContext, useContext } from 'react';
import { ClientViewPreference } from '@/types/client.types';

interface ViewPreferenceContextType {
  viewPreference: ClientViewPreference;
  handleViewPreferenceChange: (updates: Partial<ClientViewPreference>) => void;
}

export const ViewPreferenceContext = createContext<ViewPreferenceContextType | undefined>(undefined);

export function useViewPreference() {
  const context = useContext(ViewPreferenceContext);
  if (!context) {
    throw new Error('useViewPreference must be used within a ViewPreferenceProvider');
  }
  return context;
}
