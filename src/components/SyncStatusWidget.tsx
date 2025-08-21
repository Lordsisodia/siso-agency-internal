/**
 * Sync Status Widget - Shows cloud sync status and controls
 */

import React, { useState, useEffect } from 'react';
import { HybridTaskService, HybridUsageTracker } from '../services/hybridTaskService';

interface SyncStatus {
  lastSync: Date | null;
  pendingChanges: number;
  cloudAvailable: boolean;
  syncInProgress: boolean;
}

export const SyncStatusWidget: React.FC = () => {
  const [status, setStatus] = useState<SyncStatus>({
    lastSync: null,
    pendingChanges: 0,
    cloudAvailable: false,
    syncInProgress: false
  });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Initialize hybrid service
    HybridTaskService.initialize();
    
    // Subscribe to status changes
    const unsubscribe = HybridTaskService.onSyncStatusChange(setStatus);
    
    // Get initial status
    setStatus(HybridTaskService.getSyncStatus());
    
    return unsubscribe;
  }, []);

  const handleManualSync = async () => {
    const success = await HybridTaskService.syncWithCloud();
    if (success) {
      // Success feedback handled by status updates
    } else {
      alert('Sync failed. Check your internet connection and Neon configuration.');
    }
  };

  const handleEnableAI = async () => {
    const success = await HybridTaskService.enableAIFeatures('prisma');
    if (success) {
      alert('🤖 AI features enabled with Prisma! Zero cold starts + Eisenhower Matrix organization.');
    } else {
      alert('Failed to enable AI features. Ensure Prisma is configured properly.');
    }
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const getSyncStatusColor = () => {
    if (status.syncInProgress) return 'text-blue-500';
    if (!status.cloudAvailable) return 'text-gray-400';
    if (status.pendingChanges > 0) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getSyncStatusIcon = () => {
    if (status.syncInProgress) return '🔄';
    if (!status.cloudAvailable) return '🔌';
    if (status.pendingChanges > 0) return '⚠️';
    return '✅';
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-[200px]">
      {/* Status Bar */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getSyncStatusIcon()}</span>
          <div className="text-sm">
            <div className={`font-medium ${getSyncStatusColor()}`}>
              {status.syncInProgress ? 'Syncing...' : 
               !status.cloudAvailable ? 'Local only' :
               status.pendingChanges > 0 ? `${status.pendingChanges} pending` : 'Synced'}
            </div>
            <div className="text-gray-500 text-xs">
              {formatLastSync(status.lastSync)}
            </div>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          {showDetails ? '▼' : '▶'}
        </button>
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
          {/* Sync Controls */}
          <div className="space-y-2">
            <button
              onClick={handleManualSync}
              disabled={status.syncInProgress || !status.cloudAvailable}
              className="w-full px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {status.syncInProgress ? 'Syncing...' : 'Sync Now'}
            </button>
            
            <button
              onClick={handleEnableAI}
              disabled={status.syncInProgress}
              className="w-full px-3 py-1.5 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              ⚡ Enable AI (Prisma)
            </button>
          </div>

          {/* Status Details */}
          <div className="text-xs text-gray-500 space-y-1">
            <div>Cloud: {status.cloudAvailable ? '✅ Available' : '❌ Offline'}</div>
            <div>Pending: {status.pendingChanges} changes</div>
            {status.lastSync && (
              <div>Last sync: {status.lastSync.toLocaleString()}</div>
            )}
          </div>

          {/* Usage Stats */}
          <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
            <div className="flex justify-between">
              <span>Monthly usage:</span>
              <span className="text-green-600">~3-5 hours</span>
            </div>
            <div className="flex justify-between">
              <span>Free tier:</span>
              <span className="text-green-600">50 hours</span>
            </div>
          </div>

          {/* Configuration Hint */}
          {!status.cloudAvailable && (
            <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
              💡 Add Neon config to .env for cloud sync
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SyncStatusWidget;