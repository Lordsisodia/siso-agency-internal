import { useEffect, useState } from 'react';
import { syncService, type SyncStatus } from './syncService';

export function useSyncStatus(): SyncStatus {
  const [status, setStatus] = useState<SyncStatus>(() => syncService.getStatus());

  useEffect(() => {
    const unsubscribe = syncService.subscribe(setStatus);
    return unsubscribe;
  }, []);

  return status;
}
