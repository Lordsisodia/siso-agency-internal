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

  const getSyncButtonStyle = () => {
    const baseStyle = "w-full py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer";

    if (!isOnline) return `${baseStyle} bg-red-500 text-white`;
    if (pendingCount > 0) return `${baseStyle} bg-orange-500 text-white`;
    return `${baseStyle} bg-green-500 text-white`;
  };

  const getSyncIcon = () => {
    if (!isOnline) return <WifiOff className="w-4 h-4" />;
    if (pendingCount > 0) return <RefreshCw className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      <div className="max-w-7xl mx-auto px-4 pb-20 space-y-2 pointer-events-auto">
        {/* Feedback Bar */}
        <div className="w-full">
          <SimpleFeedbackButton variant="bar" className="w-full" />
        </div>

        {/* Sync Status Bar */}
        <div className="w-full">
          <button
            onClick={() => setShowSyncDetails(!showSyncDetails)}
            className={getSyncButtonStyle()}
          >
            {getSyncIcon()}
            {getSyncButtonText()}
          </button>

          {/* Expandable Sync Details */}
          {showSyncDetails && (
            <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">Sync Status</h3>
                <button
                  onClick={() => setShowSyncDetails(false)}
                  className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                >
                  ×
                </button>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Connection:</span>
                  <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Pending:</span>
                  <span>{pendingCount} changes</span>
                </div>

                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={isOnline ? 'text-green-600' : 'text-orange-600'}>
                    {isOnline ? 'All synced' : 'Working offline'}
                  </span>
                </div>
              </div>

              {isOnline && pendingCount > 0 && (
                <button
                  onClick={() => setShowSyncDetails(false)}
                  className="mt-3 w-full bg-blue-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-600 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Sync Now
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
