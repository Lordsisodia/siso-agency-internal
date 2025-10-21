/**
 * Sync Monitor - Runtime Health Monitoring
 *
 * Detects sync failures in real-time and alerts developers.
 * Prevents silent sync failures from going unnoticed.
 */

interface SyncFailure {
  table: string;
  action: string;
  error: string;
  timestamp: string;
  retryCount: number;
}

class SyncMonitor {
  private failures: SyncFailure[] = [];
  private readonly MAX_FAILURES_BEFORE_ALERT = 3;
  private readonly ALERT_WINDOW_MS = 60000; // 1 minute
  private alertShown = false;

  /**
   * Record a sync failure
   */
  recordFailure(table: string, action: string, error: string, retryCount: number) {
    const failure: SyncFailure = {
      table,
      action,
      error,
      timestamp: new Date().toISOString(),
      retryCount
    };

    this.failures.push(failure);

    // Keep only recent failures
    const oneMinuteAgo = Date.now() - this.ALERT_WINDOW_MS;
    this.failures = this.failures.filter(
      f => new Date(f.timestamp).getTime() > oneMinuteAgo
    );

    this.checkAndAlert();
  }

  /**
   * Check if we should alert the developer
   */
  private checkAndAlert() {
    if (this.alertShown) return;

    const recentFailures = this.failures.length;

    if (recentFailures >= this.MAX_FAILURES_BEFORE_ALERT) {
      this.showAlert();
      this.alertShown = true;

      // Reset after 5 minutes
      setTimeout(() => {
        this.alertShown = false;
      }, 300000);
    }
  }

  /**
   * Show developer alert
   */
  private showAlert() {
    const errorSummary = this.failures
      .map(f => `${f.table}: ${f.error}`)
      .join('\n');

    console.error(`
🚨 SYNC MONITOR ALERT 🚨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Multiple sync failures detected (${this.failures.length} in last minute)

This means data is NOT syncing to Supabase!
Changes are saved locally but won't appear on other devices.

Recent failures:
${errorSummary}

Common causes:
1. Database constraint mismatch (check onConflict keys)
2. Missing RLS bypass policies
3. Missing table permissions
4. Schema changes not reflected in types

Action required:
1. Check browser console for full errors
2. Run: npm run validate:sync
3. Review database migrations
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);

    // Show browser notification if possible
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('SISO Sync Error', {
          body: `${this.failures.length} sync failures detected. Check console.`,
          icon: '/icons/warning.png',
          tag: 'sync-error'
        });
      }
    }
  }

  /**
   * Get current failure stats
   */
  getStats() {
    const byTable = this.failures.reduce((acc, f) => {
      acc[f.table] = (acc[f.table] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalFailures: this.failures.length,
      byTable,
      oldestFailure: this.failures[0]?.timestamp,
      newestFailure: this.failures[this.failures.length - 1]?.timestamp
    };
  }

  /**
   * Clear all recorded failures
   */
  reset() {
    this.failures = [];
    this.alertShown = false;
  }
}

// Singleton instance
export const syncMonitor = new SyncMonitor();

// Expose to window for debugging
if (typeof window !== 'undefined') {
  (window as any).syncMonitor = syncMonitor;
}
