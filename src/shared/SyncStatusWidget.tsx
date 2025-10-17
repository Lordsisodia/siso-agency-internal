/**
 * Sync Status Widget - Supabase + IndexedDB status indicator
 */

import React, { useMemo, useState } from 'react';
import { syncService } from '@/shared/offline/syncService';
import { useSyncStatus } from '@/shared/offline/useSyncStatus';

const formatLastSync = (isoDate?: string) => {
  if (!isoDate) return 'Never';

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 'Unknown';

  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
};

const statusToAccent = (opts: {
  isSyncing: boolean;
  isOnline: boolean;
  pending: number;
  lastError?: string;
}) => {
  if (opts.isSyncing) return { icon: '🔄', tone: 'text-blue-400', label: 'Syncing…' };
  if (!opts.isOnline) return { icon: '🔌', tone: 'text-slate-500', label: 'Offline' };
  if (opts.lastError) return { icon: '⚠️', tone: 'text-red-400', label: 'Retry needed' };
  if (opts.pending > 0) return { icon: '⚠️', tone: 'text-amber-400', label: `${opts.pending} queued` };
  return { icon: '✅', tone: 'text-emerald-400', label: 'All synced' };
};

export const SyncStatusWidget: React.FC = () => {
  const status = useSyncStatus();
  const [showDetails, setShowDetails] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);

  const accent = useMemo(
    () =>
      statusToAccent({
        isSyncing: status.isSyncing,
        isOnline: status.isOnline,
        pending: status.pendingActions,
        lastError: status.lastError,
      }),
    [status.isSyncing, status.isOnline, status.pendingActions, status.lastError],
  );

  const handleManualSync = async () => {
    if (status.isSyncing) return;

    setIsTriggering(true);
    try {
      await syncService.forceSync();
    } catch (error) {
      console.error('[SyncStatusWidget] Manual sync failed', error);
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 min-w-[220px] rounded-lg border border-slate-800/60 bg-slate-950/90 p-3 text-slate-200 shadow-lg backdrop-blur-sm">
      <button
        type="button"
        className="flex w-full items-center justify-between text-left"
        onClick={() => setShowDetails(prev => !prev)}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{accent.icon}</span>
          <div className="text-sm">
            <div className={`font-medium ${accent.tone}`}>
              {accent.label}
            </div>
            <div className="text-xs text-slate-400">
              {formatLastSync(status.lastSyncedAt)}
            </div>
          </div>
        </div>
        <span className="text-slate-500">{showDetails ? '▼' : '▶'}</span>
      </button>

      {showDetails && (
        <div className="mt-3 space-y-3 border-t border-slate-800/70 pt-3 text-xs text-slate-300">
          <div className="flex items-center justify-between">
            <span>Status</span>
            <span className={accent.tone}>
              {status.isSyncing ? 'Syncing…' : status.isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span>Queued changes</span>
            <span>{status.pendingActions}</span>
          </div>

          {status.lastError && (
            <div className="rounded border border-red-500/40 bg-red-500/10 p-2 text-[11px] text-red-200">
              {status.lastError}
            </div>
          )}

          <button
            type="button"
            onClick={handleManualSync}
            disabled={!status.isOnline || status.isSyncing || isTriggering}
            className="w-full rounded-md bg-blue-500/80 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-600"
          >
            {status.isSyncing || isTriggering ? 'Syncing…' : 'Sync Now'}
          </button>

          <div className="text-[11px] text-slate-500">
            Tip: DevTools → <code className="rounded bg-slate-800 px-1">window.__lifelockSyncService.getStatus()</code>
          </div>
        </div>
      )}
    </div>
  );
};

export default SyncStatusWidget;
