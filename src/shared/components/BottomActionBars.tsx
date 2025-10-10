/**
 * 🎯 Bottom Action Bars Component
 * Unified bottom bar with feedback and sync status
 */

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle, MessageSquare } from 'lucide-react';
import { SimpleFeedbackButton } from '@/ecosystem/internal/feedback/SimpleFeedbackButton';

export function BottomActionBars() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showSyncDetails, setShowSyncDetails] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Simple online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Simulate pending count (in real app, this would come from offline manager)
  useEffect(() => {
    const interval = setInterval(() => {
      // Mock some pending changes when offline
      setPendingCount(isOnline ? 0 : Math.floor(Math.random() * 5));
    }, 3000);

    return () => clearInterval(interval);
  }, [isOnline]);

  const getSyncButtonText = () => {
    if (!isOnline) return 'Offline';
    if (pendingCount > 0) return `${pendingCount} pending`;
    return 'Synced';
  };

  const getSyncIcon = () => {
    if (!isOnline) return <WifiOff className="w-4 h-4" />;
    if (pendingCount > 0) return <RefreshCw className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  return (
    <div className="w-full mt-4 mb-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Side-by-side buttons with half-transparent backgrounds */}
        <div className="flex gap-3 justify-center">
          {/* Feedback Button */}
          <SimpleFeedbackButton
            variant="bar"
            className="flex-1 max-w-xs h-12 bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-all duration-200 text-white"
          />

          {/* Sync Status Button */}
          <button
            onClick={() => setShowSyncDetails(!showSyncDetails)}
            className={`flex-1 max-w-xs h-12 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer border text-white ${
              !isOnline
                ? 'bg-gray-800 border-red-400/50 hover:bg-gray-700'
                : pendingCount > 0
                  ? 'bg-gray-800 border-orange-400/50 hover:bg-gray-700'
                  : 'bg-gray-800 border-green-400/50 hover:bg-gray-700'
            }`}
          >
            {getSyncIcon()}
            {getSyncButtonText()}
          </button>
        </div>

        {/* Expandable Sync Details */}
        {showSyncDetails && (
          <div className="mt-3 max-w-md mx-auto bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-100">Sync Status</h3>
              <button
                onClick={() => setShowSyncDetails(false)}
                className="text-gray-400 hover:text-gray-200 text-lg leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>Connection:</span>
                <span className={isOnline ? 'text-green-400' : 'text-red-400'}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Pending:</span>
                <span>{pendingCount} changes</span>
              </div>

              <div className="flex justify-between">
                <span>Status:</span>
                <span className={isOnline ? 'text-green-400' : 'text-orange-400'}>
                  {isOnline ? 'All synced' : 'Working offline'}
                </span>
              </div>
            </div>

            {isOnline && pendingCount > 0 && (
              <button
                onClick={() => setShowSyncDetails(false)}
                className="mt-3 w-full bg-gray-800 border border-gray-700 text-gray-200 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-700 flex items-center justify-center gap-2 transition-all duration-200"
              >
                <RefreshCw className="w-4 h-4" />
                Sync Now
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
