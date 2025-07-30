
import React from 'react';
import { ViewPreferenceContext } from '../context/ViewPreferenceContext';
import { useClientViewPreference } from '../hooks/useClientViewPreference';

interface ClientViewPreferenceProviderProps {
  children: React.ReactNode;
}

export function ClientViewPreferenceProvider({ children }: ClientViewPreferenceProviderProps) {
  const { viewPreference, handleViewPreferenceChange } = useClientViewPreference();

  return (
    <ViewPreferenceContext.Provider value={{ viewPreference, handleViewPreferenceChange }}>
      {children}
    </ViewPreferenceContext.Provider>
  );
}
