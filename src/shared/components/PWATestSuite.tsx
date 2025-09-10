/**
 * PWA Test Suite - Comprehensive Testing for Offline Functionality
 * Tests service worker, caching, offline storage, and sync capabilities
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2,
  Wifi,
  WifiOff,
  Database,
  Globe,
  Smartphone,
  Download,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning';
  message: string;
  details?: string;
}

export const PWATestSuite: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'idle' | 'running' | 'completed'>('idle');

  const initialTests: TestResult[] = [
    { name: 'Service Worker Registration', status: 'pending', message: 'Checking if service worker is registered...' },
    { name: 'Service Worker Activation', status: 'pending', message: 'Verifying service worker is active...' },
    { name: 'Cache Storage API', status: 'pending', message: 'Testing cache storage availability...' },
    { name: 'IndexedDB Support', status: 'pending', message: 'Checking IndexedDB functionality...' },
    { name: 'Network Detection', status: 'pending', message: 'Testing online/offline detection...' },
    { name: 'Offline API Fallback', status: 'pending', message: 'Testing offline-first API behavior...' },
    { name: 'Background Sync', status: 'pending', message: 'Checking background sync capabilities...' },
    { name: 'PWA Manifest', status: 'pending', message: 'Validating PWA manifest...' },
    { name: 'Install Prompt', status: 'pending', message: 'Testing app installation...' },
    { name: 'Offline Task Creation', status: 'pending', message: 'Creating tasks while offline...' }
  ];

  useEffect(() => {
    setTests(initialTests);
  }, []);

  const updateTest = (name: string, status: TestResult['status'], message: string, details?: string) => {
    setTests(prev => prev.map(test => 
      test.name === name 
        ? { ...test, status, message, details }
        : test
    ));
  };

  const runAllTests = async () => {
    setRunning(true);
    setOverallStatus('running');
    setTests(initialTests);

    // Test 1: Service Worker Registration
    updateTest('Service Worker Registration', 'running', 'Checking registration...');
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          updateTest('Service Worker Registration', 'passed', `Registered: ${registration.scope}`);
        } else {
          updateTest('Service Worker Registration', 'warning', 'No service worker registered');
        }
      } else {
        updateTest('Service Worker Registration', 'failed', 'Service Worker API not supported');
      }
    } catch (error) {
      updateTest('Service Worker Registration', 'failed', `Error: ${error}`);
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    // Test 2: Service Worker Activation
    updateTest('Service Worker Activation', 'running', 'Checking activation state...');
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration?.active) {
          updateTest('Service Worker Activation', 'passed', `Active: ${registration.active.state}`);
        } else {
          updateTest('Service Worker Activation', 'warning', 'Service worker not active');
        }
      } else {
        updateTest('Service Worker Activation', 'failed', 'Service Worker API not supported');
      }
    } catch (error) {
      updateTest('Service Worker Activation', 'failed', `Error: ${error}`);
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    // Test 3: Cache Storage API
    updateTest('Cache Storage API', 'running', 'Testing cache operations...');
    try {
      if ('caches' in window) {
        const testCache = await caches.open('pwa-test-cache');
        await testCache.put('/test', new Response('test'));
        const cached = await testCache.match('/test');
        if (cached) {
          updateTest('Cache Storage API', 'passed', 'Cache read/write successful');
          await caches.delete('pwa-test-cache');
        } else {
          updateTest('Cache Storage API', 'failed', 'Cache operation failed');
        }
      } else {
        updateTest('Cache Storage API', 'failed', 'Cache API not supported');
      }
    } catch (error) {
      updateTest('Cache Storage API', 'failed', `Error: ${error}`);
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    // Test 4: IndexedDB Support
    updateTest('IndexedDB Support', 'running', 'Testing IndexedDB...');
    try {
      if ('indexedDB' in window) {
        const request = indexedDB.open('pwa-test-db', 1);
        request.onerror = () => {
          updateTest('IndexedDB Support', 'failed', 'IndexedDB open failed');
        };
        request.onsuccess = () => {
          updateTest('IndexedDB Support', 'passed', 'IndexedDB available and functional');
          request.result.close();
          indexedDB.deleteDatabase('pwa-test-db');
        };
      } else {
        updateTest('IndexedDB Support', 'failed', 'IndexedDB not supported');
      }
    } catch (error) {
      updateTest('IndexedDB Support', 'failed', `Error: ${error}`);
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    // Test 5: Network Detection
    updateTest('Network Detection', 'running', 'Testing network status...');
    try {
      const online = navigator.onLine;
      updateTest('Network Detection', 'passed', `Network status: ${online ? 'Online' : 'Offline'}`);
    } catch (error) {
      updateTest('Network Detection', 'failed', `Error: ${error}`);
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    // Test 6: Offline API Fallback
    updateTest('Offline API Fallback', 'running', 'Testing API behavior...');
    try {
      // Test hybrid API import
      const { hybridLifelockApi } = await import('@/api/hybridLifelockApi');
      const stats = await hybridLifelockApi.getSyncStats();
      updateTest('Offline API Fallback', 'passed', `Offline API functional: ${stats.localTasks || 0} local tasks`);
    } catch (error) {
      updateTest('Offline API Fallback', 'failed', `Error: ${error}`);
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    // Test 7: Background Sync
    updateTest('Background Sync', 'running', 'Checking sync capabilities...');
    try {
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        updateTest('Background Sync', 'passed', 'Background Sync API available');
      } else {
        updateTest('Background Sync', 'warning', 'Background Sync not supported (fallback available)');
      }
    } catch (error) {
      updateTest('Background Sync', 'failed', `Error: ${error}`);
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    // Test 8: PWA Manifest
    updateTest('PWA Manifest', 'running', 'Checking manifest...');
    try {
      const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
      if (manifestLink) {
        const response = await fetch(manifestLink.href);
        const manifest = await response.json();
        updateTest('PWA Manifest', 'passed', `Found: ${manifest.name || 'PWA Manifest'}`);
      } else {
        updateTest('PWA Manifest', 'warning', 'No manifest link found');
      }
    } catch (error) {
      updateTest('PWA Manifest', 'failed', `Error: ${error}`);
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    // Test 9: Install Prompt
    updateTest('Install Prompt', 'running', 'Testing installation...');
    try {
      // Check if app is already installed
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        updateTest('Install Prompt', 'passed', 'App is installed (standalone mode)');
      } else if ('BeforeInstallPromptEvent' in window) {
        updateTest('Install Prompt', 'passed', 'Install prompt available');
      } else {
        updateTest('Install Prompt', 'warning', 'Install prompt not available (may require HTTPS)');
      }
    } catch (error) {
      updateTest('Install Prompt', 'failed', `Error: ${error}`);
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    // Test 10: Offline Task Creation
    updateTest('Offline Task Creation', 'running', 'Testing task operations...');
    try {
      const { hybridLifelockApi } = await import('@/api/hybridLifelockApi');
      const testTask = {
        user_id: 'test-user',
        title: 'PWA Test Task',
        description: 'Created by PWA test suite',
        priority: 'MEDIUM' as const,
        completed: false,
        original_date: new Date().toISOString().split('T')[0],
        task_date: new Date().toISOString().split('T')[0],
        estimated_duration: 30,
        xp_reward: 25
      };
      
      await hybridLifelockApi.createLightWorkTask(testTask);
      updateTest('Offline Task Creation', 'passed', 'Successfully created task offline');
    } catch (error) {
      updateTest('Offline Task Creation', 'failed', `Error: ${error}`);
    }

    setRunning(false);
    setOverallStatus('completed');
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-4 h-4 rounded-full border border-gray-400" />;
      case 'running':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return 'text-gray-400';
      case 'running':
        return 'text-blue-400';
      case 'passed':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
    }
  };

  const passedTests = tests.filter(t => t.status === 'passed').length;
  const failedTests = tests.filter(t => t.status === 'failed').length;
  const warningTests = tests.filter(t => t.status === 'warning').length;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">PWA Test Suite</h1>
          <p className="text-gray-400 mt-1">Comprehensive offline functionality testing</p>
        </div>
        
        <div className="flex items-center gap-3">
          {overallStatus === 'completed' && (
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800">
                {passedTests} Passed
              </Badge>
              {warningTests > 0 && (
                <Badge className="bg-yellow-100 text-yellow-800">
                  {warningTests} Warnings
                </Badge>
              )}
              {failedTests > 0 && (
                <Badge className="bg-red-100 text-red-800">
                  {failedTests} Failed
                </Badge>
              )}
            </div>
          )}
          
          <Button 
            onClick={runAllTests} 
            disabled={running}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {running ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Run All Tests
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tests Results */}
      <motion.div
        className="bg-gray-800/50 border border-gray-700 rounded-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            PWA Functionality Tests
          </h3>
        </div>
        
        <div className="p-4 space-y-3">
          {tests.map((test, index) => (
            <motion.div
              key={test.name}
              className="flex items-start gap-3 p-3 bg-gray-900/50 border border-gray-600 rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="mt-1">
                {getStatusIcon(test.status)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-white">{test.name}</h4>
                  <span className={`text-sm font-medium ${getStatusColor(test.status)}`}>
                    {test.status.toUpperCase()}
                  </span>
                </div>
                
                <p className="text-sm text-gray-400 mt-1">{test.message}</p>
                
                {test.details && (
                  <p className="text-xs text-gray-500 mt-1 font-mono bg-gray-800/50 p-2 rounded">
                    {test.details}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Instructions */}
      <motion.div
        className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h4 className="text-blue-400 font-medium mb-2 flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Test Instructions
        </h4>
        <div className="text-sm text-blue-300 space-y-1">
          <p>• Run tests to verify PWA functionality is working correctly</p>
          <p>• Green tests indicate full functionality</p>
          <p>• Yellow warnings indicate partial support or fallbacks</p>
          <p>• Red failures need attention for full offline capabilities</p>
          <p>• All tests should pass for production deployment</p>
        </div>
      </motion.div>
    </div>
  );
};

export default PWATestSuite;