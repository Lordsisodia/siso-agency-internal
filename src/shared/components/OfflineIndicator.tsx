/**
 * Offline Status Indicator
 * Shows connection status and sync progress for PWA offline functionality
 */

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle, Cloud, CloudOff } from 'lucide-react';
import { offlineLifelockApi } from '@/api/offlineLifelockApi';

interface ConnectionStatus {
  isOnline: boolean;
  isSyncing: boolean;
}

interface SyncStats {
  localTasks: number;
  pendingSync: number;
  lastSync?: string;
}

export const OfflineIndicator: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({ isOnline: true, isSyncing: false });
  const [syncStats, setSyncStats] = useState<SyncStats>({ localTasks: 0, pendingSync: 0 });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Initial status check
    updateStatus();

    // Set up periodic status updates
    const statusInterval = setInterval(updateStatus, 2000);

    // Listen for network changes
    const handleOnline = () => updateStatus();
    const handleOffline = () => updateStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(statusInterval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateStatus = async () => {
    try {
      const status = offlineLifelockApi.getConnectionStatus();
      const stats = await offlineLifelockApi.getSyncStats();
      
      setConnectionStatus(status);
      setSyncStats(stats);
    } catch (error) {
      console.error('Failed to update offline status:', error);
    }
  };

  const handleForceSync = async () => {
    if (connectionStatus.isOnline && !connectionStatus.isSyncing) {
      try {
        await offlineLifelockApi.forceSync();
        updateStatus();
      } catch (error) {
        console.error('Force sync failed:', error);
      }
    }
  };

  const formatLastSync = (lastSync?: string) => {
    if (!lastSync) return 'Never';
    
    const date = new Date(lastSync);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getStatusIcon = () => {
    if (connectionStatus.isSyncing) {
      return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
    }
    
    if (!connectionStatus.isOnline) {
      return <WifiOff className="h-4 w-4 text-red-500" />;
    }

    if (syncStats.pendingSync > 0) {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }

    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (connectionStatus.isSyncing) return 'Syncing...';
    if (!connectionStatus.isOnline) return 'Offline';
    if (syncStats.pendingSync > 0) return `${syncStats.pendingSync} pending`;
    return 'Synced';
  };

  const getStatusColor = () => {
    if (connectionStatus.isSyncing) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (!connectionStatus.isOnline) return 'text-red-600 bg-red-50 border-red-200';
    if (syncStats.pendingSync > 0) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  return (
    <div className="relative">
      {/* Main Status Button */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all hover:shadow-sm ${getStatusColor()}`}
        title="Click for sync details"
      >
        {getStatusIcon()}
        <span className="hidden sm:inline">{getStatusText()}</span>
        {connectionStatus.isOnline ? (
          <Cloud className="h-3 w-3 opacity-60" />
        ) : (
          <CloudOff className="h-3 w-3 opacity-60" />
        )}
      </button>

      {/* Detailed Status Panel */}
      {showDetails && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg border shadow-lg p-4 z-50">
          <div className="space-y-3">
            {/* Connection Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Connection</span>
              <div className="flex items-center gap-2">
                {connectionStatus.isOnline ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">Offline</span>
                  </>
                )}
              </div>
            </div>

            {/* Sync Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Sync Status</span>
              <div className="flex items-center gap-2">
                {connectionStatus.isSyncing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                    <span className="text-sm text-blue-600">Syncing</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">Ready</span>
                  </>
                )}
              </div>
            </div>

            {/* Statistics */}
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Local Tasks</span>
                <span className="font-medium">{syncStats.localTasks}</span>
              </div>
              
              {syncStats.pendingSync > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pending Sync</span>
                  <span className="font-medium text-yellow-600">{syncStats.pendingSync}</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Last Sync</span>
                <span className="font-medium">{formatLastSync(syncStats.lastSync)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t pt-3">
              <button
                onClick={handleForceSync}
                disabled={!connectionStatus.isOnline || connectionStatus.isSyncing}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${connectionStatus.isSyncing ? 'animate-spin' : ''}`} />
                {connectionStatus.isSyncing ? 'Syncing...' : 'Force Sync'}
              </button>
            </div>

            {/* Offline Notice */}
            {!connectionStatus.isOnline && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                  <div className="text-sm text-amber-700">
                    <p className="font-medium">Working Offline</p>
                    <p className="text-xs mt-1">Changes will sync when connection is restored.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineIndicator;