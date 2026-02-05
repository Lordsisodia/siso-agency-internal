/**
 * useTotalXP Hook
 *
 * Fetches total lifetime XP from GamificationService
 * Keeps value in sync with real-time gamification updates.
 */

import { useEffect, useState } from 'react';
import { GamificationService } from '@/domains/lifelock/_shared/services/gamificationService';

const GAMIFICATION_EVENT = 'sisoGamificationProgressUpdated';

export function useTotalXP(): number {
  const [totalXP, setTotalXP] = useState<number>(() => {
    const progress = GamificationService.getUserProgress();
    return progress.totalXP;
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const updateFromService = () => {
      const progress = GamificationService.getUserProgress();
      setTotalXP(progress.totalXP);
    };

    const handleStorageUpdate = (event: StorageEvent) => {
      if (event.key === 'siso_gamification_data') {
        updateFromService();
      }
    };

    window.addEventListener(GAMIFICATION_EVENT, updateFromService);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      window.removeEventListener(GAMIFICATION_EVENT, updateFromService);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  return totalXP;
}
