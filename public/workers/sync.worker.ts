/**
 * 🔄 Background Sync Worker
 *
 * Runs sync operations in background thread
 * ZERO UI blocking - maintains 60fps animations during sync!
 *
 * This is a GAME-CHANGER for performance!
 */

// Web Worker context (no window/document access)
declare const self: DedicatedWorkerGlobalScope;

interface SyncMessage {
  type: 'sync' | 'syncTask' | 'getStatus';
  payload?: any;
}

interface SyncResponse {
  success: boolean;
  syncedCount?: number;
  error?: string;
  bytesSaved?: number;
}

// Worker state
let isSyncing = false;
const syncQueue: any[] = [];

// Message handler
self.onmessage = async (event: MessageEvent<SyncMessage>) => {
  const { type, payload } = event.data;

  try {
    switch (type) {
      case 'sync':
        await handleFullSync();
        break;

      case 'syncTask':
        await handleTaskSync(payload);
        break;

      case 'getStatus':
        self.postMessage({
          success: true,
          isSyncing,
          queueLength: syncQueue.length
        });
        break;

      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    self.postMessage({
      success: false,
      error: error instanceof Error ? error.message : 'Sync failed'
    });
  }
};

/**
 * Handle full sync (all pending changes)
 */
async function handleFullSync(): Promise<void> {
  if (isSyncing) {
    console.log('[Worker] Sync already in progress');
    return;
  }

  isSyncing = true;
  let syncedCount = 0;
  let totalBytesSaved = 0;

  try {
    console.log('[Worker] Starting background sync...');

    // Get pending actions from IndexedDB
    // Note: We'll use fetch to call a sync endpoint rather than direct Supabase
    // (Web Workers can't import all the Supabase deps easily)

    const response = await fetch('/api/sync/pending', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'sync_all' })
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }

    const result = await response.json();
    syncedCount = result.syncedCount || 0;
    totalBytesSaved = result.bytesSaved || 0;

    console.log(`[Worker] ✅ Synced ${syncedCount} items, saved ${totalBytesSaved} bytes`);

    self.postMessage({
      success: true,
      syncedCount,
      bytesSaved: totalBytesSaved
    } as SyncResponse);

  } catch (error) {
    console.error('[Worker] Sync error:', error);
    self.postMessage({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    } as SyncResponse);
  } finally {
    isSyncing = false;
  }
}

/**
 * Handle single task sync
 */
async function handleTaskSync(task: any): Promise<void> {
  console.log('[Worker] Syncing task:', task.id);

  try {
    const response = await fetch('/api/sync/task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });

    if (!response.ok) {
      throw new Error(`Task sync failed: ${response.statusText}`);
    }

    self.postMessage({
      success: true,
      syncedCount: 1
    } as SyncResponse);

  } catch (error) {
    // Add to queue for retry
    syncQueue.push(task);
    throw error;
  }
}

// Periodic sync (every 30 seconds)
setInterval(() => {
  if (!isSyncing && syncQueue.length > 0) {
    console.log(`[Worker] Processing ${syncQueue.length} queued items`);
    handleFullSync();
  }
}, 30000);

console.log('[Worker] Background sync worker initialized');
