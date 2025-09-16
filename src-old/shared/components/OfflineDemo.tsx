/**
 * Offline PWA Demo Component
 * Demonstrates offline-first functionality for LifeLock tasks
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, CheckCircle, Clock, Wifi, WifiOff, Download, Upload, Database, RotateCcw } from 'lucide-react';
import { hybridLifelockApi } from '@/api/hybridLifelockApi';
import { OfflineIndicator } from './OfflineIndicator';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';

export const OfflineDemo: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<any>(null);

  useEffect(() => {
    loadTasks();
    updateStatus();
  }, []);

  const updateStatus = async () => {
    try {
      const [taskStats, connStatus, syncStats] = await Promise.all([
        hybridLifelockApi.getTaskStatsForDate(),
        hybridLifelockApi.getConnectionStatus(),
        hybridLifelockApi.getSyncStats()
      ]);
      
      setStats({
        ...taskStats,
        ...syncStats
      });
      setConnectionStatus(connStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const loadTasks = async () => {
    setLoading(true);
    try {
      const { combined } = await hybridLifelockApi.getAllTasksForDate();
      setTasks(combined);
      updateStatus();
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSampleTask = async () => {
    setLoading(true);
    try {
      const sampleTask = {
        user_id: 'demo-user',
        title: `Demo Task ${Math.floor(Math.random() * 1000)}`,
        description: `Created at ${new Date().toLocaleTimeString()} ${navigator.onLine ? '(Online)' : '(Offline)'}`,
        priority: Math.random() > 0.5 ? 'HIGH' : 'MEDIUM' as const,
        completed: false,
        original_date: new Date().toISOString().split('T')[0],
        task_date: new Date().toISOString().split('T')[0],
        estimated_duration: Math.floor(Math.random() * 60) + 15,
        xp_reward: Math.floor(Math.random() * 50) + 10
      };

      await hybridLifelockApi.createLightWorkTask(sampleTask);
      await loadTasks();
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (taskId: string) => {
    setLoading(true);
    try {
      await hybridLifelockApi.toggleTaskCompletion(taskId, 'light');
      await loadTasks();
    } catch (error) {
      console.error('Failed to toggle task:', error);
    } finally {
      setLoading(false);
    }
  };

  const forceSync = async () => {
    setLoading(true);
    try {
      await hybridLifelockApi.forceSync();
      await loadTasks();
    } catch (error) {
      console.error('Failed to sync:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const data = await hybridLifelockApi.exportOfflineData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lifelock-offline-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const clearData = async () => {
    if (confirm('Are you sure you want to clear all offline data?')) {
      setLoading(true);
      try {
        await hybridLifelockApi.clearOfflineData();
        await loadTasks();
      } catch (error) {
        console.error('Failed to clear data:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Offline PWA Demo</h1>
          <p className="text-gray-400 mt-1">Test offline-first LifeLock functionality</p>
        </div>
        <OfflineIndicator />
      </div>

      {/* Connection Status Card */}
      {connectionStatus && (
        <motion.div
          className="bg-gray-800/50 border border-gray-700 rounded-lg p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Connection Status</h3>
            {connectionStatus.isOnline ? (
              <Badge className="bg-green-100 text-green-800">
                <Wifi className="h-3 w-3 mr-1" />
                Online
              </Badge>
            ) : (
              <Badge className="bg-red-100 text-red-800">
                <WifiOff className="h-3 w-3 mr-1" />
                Offline
              </Badge>
            )}
          </div>
          
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Local Tasks</p>
                <p className="text-white font-medium">{stats.localTasks || 0}</p>
              </div>
              <div>
                <p className="text-gray-400">Completed</p>
                <p className="text-white font-medium">{stats.completed || 0}</p>
              </div>
              <div>
                <p className="text-gray-400">Earned XP</p>
                <p className="text-white font-medium">{stats.earnedXP || 0}</p>
              </div>
              <div>
                <p className="text-gray-400">Pending Sync</p>
                <p className="text-white font-medium">{stats.pendingSync || 0}</p>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={createSampleTask} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Sample Task
        </Button>
        
        <Button 
          onClick={forceSync} 
          disabled={loading || !connectionStatus?.isOnline}
          variant="outline"
        >
          <Upload className="h-4 w-4 mr-2" />
          Force Sync
        </Button>
        
        <Button onClick={exportData} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
        
        <Button onClick={loadTasks} disabled={loading} variant="outline">
          <RotateCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
        
        <Button onClick={clearData} variant="outline" className="text-red-400 border-red-400">
          <Database className="h-4 w-4 mr-2" />
          Clear Data
        </Button>
      </div>

      {/* Tasks List */}
      <motion.div
        className="bg-gray-800/50 border border-gray-700 rounded-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Database className="h-5 w-5" />
            Local Tasks ({tasks.length})
          </h3>
        </div>
        
        <div className="p-4 space-y-3">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-400 mt-2">Loading...</p>
            </div>
          )}
          
          {!loading && tasks.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400">No tasks found. Create one to test offline functionality!</p>
            </div>
          )}
          
          {!loading && tasks.map((task) => (
            <motion.div
              key={task.id}
              className="flex items-center justify-between p-3 bg-gray-900/50 border border-gray-600 rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-center gap-3 flex-1">
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`p-1 rounded-full transition-colors ${
                    task.completed 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  <CheckCircle className="h-4 w-4" />
                </button>
                
                <div className="flex-1">
                  <p className={`font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-white'}`}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-sm text-gray-500">{task.description}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {task.xp_reward && (
                  <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                    {task.xp_reward} XP
                  </Badge>
                )}
                
                {task.priority === 'HIGH' && (
                  <Badge className="bg-red-100 text-red-800">HIGH</Badge>
                )}
                
                {task._needs_sync && (
                  <Badge variant="outline" className="text-blue-400 border-blue-400">
                    <Clock className="h-3 w-3 mr-1" />
                    Sync
                  </Badge>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Instructions */}
      <motion.div
        className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h4 className="text-amber-400 font-medium mb-2">💡 Testing Instructions</h4>
        <div className="text-sm text-amber-300 space-y-1">
          <p>• Create tasks while online - they'll sync immediately</p>
          <p>• Turn off your internet connection</p>
          <p>• Create more tasks while offline - they'll be saved locally</p>
          <p>• Toggle task completion while offline</p>
          <p>• Turn internet back on - tasks will auto-sync</p>
          <p>• Export data to see the full offline database</p>
        </div>
      </motion.div>
    </div>
  );
};

export default OfflineDemo;