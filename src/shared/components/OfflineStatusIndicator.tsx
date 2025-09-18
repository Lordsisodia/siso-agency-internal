/**
 * 🚀 Offline Status Indicator
 * Beautiful status indicator for offline functionality
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wifi, 
  WifiOff, 
  Cloud, 
  CloudOff, 
  RotateCcw as Sync, 
  Database,
  CheckCircle,
  AlertCircle,
  Clock,
  Settings
} from 'lucide-react';
import { useOfflineManager } from '../hooks/useOfflineManager';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/shared/ui/popover';

interface OfflineStatusIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export function OfflineStatusIndicator({ 
  className = '', 
  showDetails = true 
}: OfflineStatusIndicatorProps) {
  const { status, isOnline, canSync, sync, getStats } = useOfflineManager();
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await sync();
    } finally {
      setSyncing(false);
    }
  };

  const loadStats = async () => {
    if (isOpen && !stats) {
      const offlineStats = await getStats();
      setStats(offlineStats);
    }
  };

  React.useEffect(() => {
    loadStats();
  }, [isOpen]);

  // Status indicator styles
  const getIndicatorColor = () => {
    if (!isOnline) return 'bg-red-500';
    if (!status.isSupabaseConnected) return 'bg-yellow-500';
    if (status.pendingSyncCount > 0) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (!status.isSupabaseConnected) return 'Database Disconnected';
    if (status.syncInProgress) return 'Syncing...';
    if (status.pendingSyncCount > 0) return `${status.pendingSyncCount} Pending`;
    return 'Online';
  };

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-3 w-3" />;
    if (!status.isSupabaseConnected) return <CloudOff className="h-3 w-3" />;
    if (status.syncInProgress) return <Sync className="h-3 w-3 animate-spin" />;
    if (status.pendingSyncCount > 0) return <Clock className="h-3 w-3" />;
    return <CheckCircle className="h-3 w-3" />;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 px-2 ${className}`}
          onClick={loadStats}
        >
          <div className="flex items-center space-x-2">
            {/* Status Indicator Dot */}
            <motion.div
              className={`w-2 h-2 rounded-full ${getIndicatorColor()}`}
              animate={{ 
                scale: status.syncInProgress ? [1, 1.2, 1] : 1,
                opacity: status.syncInProgress ? [1, 0.6, 1] : 1 
              }}
              transition={{ 
                duration: 1, 
                repeat: status.syncInProgress ? Infinity : 0 
              }}
            />
            
            {/* Status Icon */}
            {getStatusIcon()}
            
            {/* Status Text */}
            {showDetails && (
              <span className="text-xs font-medium text-gray-300">
                {getStatusText()}
              </span>
            )}
            
            {/* Pending Count Badge */}
            <AnimatePresence>
              {status.pendingSyncCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Badge 
                    variant="secondary" 
                    className="bg-blue-500/20 text-blue-300 text-xs px-1.5 py-0.5"
                  >
                    {status.pendingSyncCount}
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-4 bg-gray-900 border-gray-700">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>Offline Status</span>
            </h3>
            
            {canSync && status.pendingSyncCount > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleSync}
                disabled={syncing}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                {syncing ? (
                  <Sync className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <Sync className="h-3 w-3 mr-1" />
                )}
                Sync Now
              </Button>
            )}
          </div>

          {/* Status Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Network Status */}
            <div className="flex items-center space-x-2 p-2 rounded-lg bg-gray-800/50">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-400" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-400" />
              )}
              <div>
                <div className="text-xs font-medium text-gray-300">Network</div>
                <div className={`text-xs ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                  {isOnline ? 'Connected' : 'Offline'}
                </div>
              </div>
            </div>

            {/* Database Status */}
            <div className="flex items-center space-x-2 p-2 rounded-lg bg-gray-800/50">
              {status.isSupabaseConnected ? (
                <Cloud className="h-4 w-4 text-green-400" />
              ) : (
                <CloudOff className="h-4 w-4 text-yellow-400" />
              )}
              <div>
                <div className="text-xs font-medium text-gray-300">Database</div>
                <div className={`text-xs ${
                  status.isSupabaseConnected ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {status.isSupabaseConnected ? 'Connected' : 'Disconnected'}
                </div>
              </div>
            </div>
          </div>

          {/* Sync Status */}
          {status.pendingSyncCount > 0 && (
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-300">
                  Pending Sync
                </span>
              </div>
              <div className="text-xs text-gray-300">
                {status.pendingSyncCount} actions waiting to sync when online
              </div>
            </div>
          )}

          {/* Last Sync */}
          {status.lastSyncTime && (
            <div className="text-xs text-gray-400">
              Last sync: {new Date(status.lastSyncTime).toLocaleTimeString()}
            </div>
          )}

          {/* Offline Stats */}
          {stats && (
            <div className="space-y-2 pt-2 border-t border-gray-700">
              <div className="text-xs font-medium text-gray-300">Local Storage</div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                <div>Light Work: {stats.database.lightWorkTasks}</div>
                <div>Deep Work: {stats.database.deepWorkTasks}</div>
                <div>Cache Size: {(stats.cacheSize / 1024).toFixed(1)}KB</div>
                <div>Actions: {stats.database.pendingActions}</div>
              </div>
            </div>
          )}

          {/* Offline Mode Info */}
          {!isOnline && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-center space-x-2 mb-1">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <span className="text-sm font-medium text-red-300">
                  Offline Mode Active
                </span>
              </div>
              <div className="text-xs text-gray-300">
                Your work is being saved locally and will sync when you're back online
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}