
import { useState } from 'react';
import { ClientViewPreference } from '@/types/client.types';
import { defaultViewPreference } from '../constants/defaultViewPreference';

export function useClientViewPreference() {
  const [viewPreference, setViewPreference] = useState<ClientViewPreference>(defaultViewPreference);

  const handleViewPreferenceChange = (updates: Partial<ClientViewPreference>) => {
    setViewPreference({ ...viewPreference, ...updates });
  };

  return {
    viewPreference,
    setViewPreference,
    handleViewPreferenceChange
  };
}
