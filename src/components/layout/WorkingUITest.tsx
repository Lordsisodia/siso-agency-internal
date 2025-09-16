/**
 * Working UI Test Component
 * 
 * Isolated testing environment for the working UI components.
 * Allows safe testing without affecting the main application.
 */

import React, { useState } from 'react';
import { MinimalWorkingUI } from './MinimalWorkingUI';
import { isFeatureEnabled, updateFlags } from '@/migration/feature-flags';

// Test data that matches the expected interface
const testTasks = [
  {
    id: 'test-1',
    title: 'Review morning routine optimization',
    completed: false,
    workType: 'LIGHT' as const,
    aiAnalyzed: true,
    xpReward: 25,
    difficulty: 'Easy'
  },
  {
    id: 'test-2', 
    title: 'Deep work session - Focus on product strategy',
    completed: false,
    workType: 'DEEP' as const,
    aiAnalyzed: false
  },
  {
    id: 'test-3',
    title: 'Completed task example',
    completed: true,
    workType: 'LIGHT' as const,
    aiAnalyzed: true,
    xpReward: 15,
    difficulty: 'Medium'
  }
];

export const WorkingUITest: React.FC = () => {
  const [tasks, setTasks] = useState(testTasks);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleAnalyzeWithAI = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    addLog(`AI Analysis triggered for: ${task?.title}`);
    
    // Simulate AI analysis
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, aiAnalyzed: true, xpReward: Math.floor(Math.random() * 50) + 10, difficulty: 'Medium' }
        : task
    ));
  };

  const handleStartThoughtDump = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    addLog(`Thought dump started for: ${task?.title}`);
  };

  const handlePushToAnotherDay = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    addLog(`Task pushed to another day: ${task?.title}`);
  };

  const handleViewTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    addLog(`View task details: ${task?.title}`);
  };

  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    addLog(`Delete task: ${task?.title}`);
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleToggleTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    addLog(`Toggle task completion: ${task?.title}`);
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed }
        : task
    ));
  };

  const toggleFeatureFlag = () => {
    const current = isFeatureEnabled('useWorkingUI');
    updateFlags({ useWorkingUI: !current });
    addLog(`Working UI feature flag ${!current ? 'enabled' : 'disabled'}`);
    // Force re-render
    window.location.reload();
  };

  return (
    <div>
      {/* Test Controls */}
      <div className="fixed top-4 left-4 z-50 bg-black/90 text-white p-4 rounded-lg border border-gray-600 max-w-md">
        <h3 className="text-orange-400 font-bold mb-2">Working UI Test</h3>
        
        <div className="space-y-2 text-xs">
          <div>
            <strong>Feature Flag Status:</strong>{' '}
            <span className={isFeatureEnabled('useWorkingUI') ? 'text-green-400' : 'text-red-400'}>
              {isFeatureEnabled('useWorkingUI') ? 'ENABLED' : 'DISABLED'}
            </span>
          </div>
          
          <button 
            onClick={toggleFeatureFlag}
            className="w-full px-2 py-1 bg-orange-600 hover:bg-orange-700 rounded text-xs font-medium"
          >
            Toggle Working UI
          </button>
          
          <div className="pt-2 border-t border-gray-600">
            <strong>Action Log:</strong>
            <div className="mt-1 space-y-1 text-xs text-gray-300 max-h-20 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500">Click any button to test...</div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="font-mono">{log}</div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main UI */}
      {isFeatureEnabled('useWorkingUI') ? (
        <MinimalWorkingUI
          workType="LIGHT"
          selectedDate={new Date()}
          tasks={tasks}
          onAnalyzeWithAI={handleAnalyzeWithAI}
          onStartThoughtDump={handleStartThoughtDump}
          onPushToAnotherDay={handlePushToAnotherDay}
          onViewTask={handleViewTask}
          onDeleteTask={handleDeleteTask}
          onToggleTask={handleToggleTask}
        />
      ) : (
        <div className="min-h-screen bg-white text-black p-6">
          <h1 className="text-2xl font-bold mb-4">Fallback UI (Working UI Disabled)</h1>
          <p className="text-gray-600 mb-4">
            This is what users see when the working UI feature flag is disabled.
            The app continues to work normally without any risk.
          </p>
          <div className="space-y-2">
            {tasks.map(task => (
              <div key={task.id} className="p-3 border rounded">
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={task.completed}
                    onChange={() => handleToggleTask(task.id)}
                    className="mr-3"
                  />
                  <span className={task.completed ? 'line-through text-gray-500' : ''}>
                    {task.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};