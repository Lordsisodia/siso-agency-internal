/**
 * Timeline Limit Manager - Time limit setting and management for tasks
 * 
 * Features:
 * - Set time limits for individual tasks
 * - Batch time limit updates
 * - AI-powered time estimation
 * - Time tracking and alerts
 * - Productivity analytics
 */

import React, { useState, useEffect } from 'react';
import { Clock, Timer, Zap, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Slider } from '@/shared/ui/slider';
import { aiTaskService } from '../services/aiTaskService';
import { TimelineTask } from '../hooks/useTimelineTasks';

interface TimelineLimitManagerProps {
  tasks: TimelineTask[];
  onUpdateTimeLimit: (taskId: string, newLimit: number) => Promise<void>;
  onBulkUpdateTimeLimits: (updates: Array<{ taskId: string; limit: number }>) => Promise<void>;
}

interface TimeLimitSettings {
  taskId: string;
  currentLimit: number;
  aiSuggestion?: number;
  aiReasoning?: string;
  isActive: boolean;
}

export function TimelineLimitManager({ 
  tasks, 
  onUpdateTimeLimit, 
  onBulkUpdateTimeLimits 
}: TimelineLimitManagerProps) {
  const [limitSettings, setLimitSettings] = useState<TimeLimitSettings[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());

  // Initialize limit settings from tasks
  useEffect(() => {
    const settings: TimeLimitSettings[] = tasks.map(task => ({
      taskId: task.id,
      currentLimit: task.estimatedDuration || 30,
      isActive: true
    }));
    setLimitSettings(settings);
  }, [tasks]);

  // Get AI suggestions for time limits
  const getAISuggestions = async () => {
    setIsLoadingAI(true);
    try {
      const updatedSettings = await Promise.all(
        limitSettings.map(async (setting) => {
          const task = tasks.find(t => t.id === setting.taskId);
          if (!task) return setting;

          try {
            const analysis = await aiTaskService.analyzePriority(
              task.title,
              task.description
            );
            
            return {
              ...setting,
              aiSuggestion: analysis.estimatedDuration,
              aiReasoning: analysis.reasoning
            };
          } catch (error) {
            console.warn(`AI analysis failed for task ${task.id}:`, error);
            return setting;
          }
        })
      );
      
      setLimitSettings(updatedSettings);
    } catch (error) {
      console.error('Failed to get AI suggestions:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Update individual time limit
  const updateTimeLimit = async (taskId: string, newLimit: number) => {
    setLimitSettings(prev => 
      prev.map(setting => 
        setting.taskId === taskId 
          ? { ...setting, currentLimit: newLimit }
          : setting
      )
    );
    
    await onUpdateTimeLimit(taskId, newLimit);
  };

  // Apply AI suggestions
  const applyAISuggestions = async () => {
    const updates = limitSettings
      .filter(setting => setting.aiSuggestion && setting.aiSuggestion !== setting.currentLimit)
      .map(setting => ({
        taskId: setting.taskId,
        limit: setting.aiSuggestion!
      }));
    
    if (updates.length > 0) {
      await onBulkUpdateTimeLimits(updates);
      
      // Update local state
      setLimitSettings(prev => 
        prev.map(setting => ({
          ...setting,
          currentLimit: setting.aiSuggestion || setting.currentLimit
        }))
      );
    }
  };

  // Bulk update selected tasks
  const applyBulkUpdate = async (minutes: number) => {
    const updates = Array.from(selectedTasks).map(taskId => ({
      taskId,
      limit: minutes
    }));
    
    await onBulkUpdateTimeLimits(updates);
    
    setLimitSettings(prev => 
      prev.map(setting => 
        selectedTasks.has(setting.taskId)
          ? { ...setting, currentLimit: minutes }
          : setting
      )
    );
    
    setSelectedTasks(new Set());
    setBulkMode(false);
  };

  // Time limit presets
  const timePresets = [
    { label: '5 min', value: 5 },
    { label: '15 min', value: 15 },
    { label: '30 min', value: 30 },
    { label: '1 hour', value: 60 },
    { label: '2 hours', value: 120 },
    { label: '4 hours', value: 240 }
  ];

  // Calculate analytics
  const totalEstimatedTime = limitSettings.reduce((sum, setting) => sum + setting.currentLimit, 0);
  const averageTaskTime = limitSettings.length > 0 ? totalEstimatedTime / limitSettings.length : 0;
  const hasAISuggestions = limitSettings.some(setting => setting.aiSuggestion);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Time Limit Manager</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBulkMode(!bulkMode)}
            className="flex items-center gap-1"
          >
            <CheckCircle className="h-4 w-4" />
            {bulkMode ? 'Exit Bulk' : 'Bulk Edit'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={getAISuggestions}
            disabled={isLoadingAI}
            className="flex items-center gap-1"
          >
            <Zap className="h-4 w-4" />
            {isLoadingAI ? 'Getting AI...' : 'AI Suggest'}
          </Button>
        </div>
      </div>

      {/* Analytics Summary */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">Total Time</p>
              <p className="font-semibold">{Math.floor(totalEstimatedTime / 60)}h {totalEstimatedTime % 60}m</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">Average Task</p>
              <p className="font-semibold">{Math.round(averageTaskTime)} minutes</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">AI Suggestions</p>
              <p className="font-semibold">{hasAISuggestions ? 'Available' : 'Generate'}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* AI Suggestions Panel */}
      {hasAISuggestions && (
        <Card className="p-4 border-blue-200 bg-blue-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-600" />
              <h4 className="font-medium text-blue-900">AI Time Suggestions</h4>
            </div>
            <Button
              size="sm"
              onClick={applyAISuggestions}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Apply All Suggestions
            </Button>
          </div>
          
          <div className="grid gap-2">
            {limitSettings
              .filter(setting => setting.aiSuggestion)
              .map(setting => {
                const task = tasks.find(t => t.id === setting.taskId);
                const difference = (setting.aiSuggestion! - setting.currentLimit);
                
                return (
                  <div key={setting.taskId} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{task?.title}</p>
                      <p className="text-xs text-gray-600">{setting.aiReasoning}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={difference > 0 ? "destructive" : "secondary"}>
                        {setting.currentLimit}m → {setting.aiSuggestion}m
                        {difference !== 0 && (
                          <span className="ml-1">
                            ({difference > 0 ? '+' : ''}{difference}m)
                          </span>
                        )}
                      </Badge>
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
      )}

      {/* Bulk Mode Panel */}
      {bulkMode && (
        <Card className="p-4 border-orange-200 bg-orange-50">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-4 w-4 text-orange-600" />
            <h4 className="font-medium text-orange-900">
              Bulk Edit Mode ({selectedTasks.size} selected)
            </h4>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-3">
            {timePresets.map(preset => (
              <Button
                key={preset.value}
                variant="outline"
                size="sm"
                onClick={() => applyBulkUpdate(preset.value)}
                disabled={selectedTasks.size === 0}
                className="text-xs"
              >
                {preset.label}
              </Button>
            ))}
          </div>
          
          <p className="text-sm text-gray-600">
            Select tasks below, then click a preset to apply the same time limit to all selected tasks.
          </p>
        </Card>
      )}

      {/* Task List with Time Limit Controls */}
      <div className="space-y-3">
        {limitSettings.map(setting => {
          const task = tasks.find(t => t.id === setting.taskId);
          if (!task) return null;
          
          const isSelected = selectedTasks.has(setting.taskId);
          const hasAISuggestion = setting.aiSuggestion && setting.aiSuggestion !== setting.currentLimit;
          
          return (
            <Card 
              key={setting.taskId} 
              className={`p-4 transition-colors ${
                isSelected ? 'border-orange-300 bg-orange-50' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Bulk Mode Checkbox */}
                {bulkMode && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      const newSelected = new Set(selectedTasks);
                      if (e.target.checked) {
                        newSelected.add(setting.taskId);
                      } else {
                        newSelected.delete(setting.taskId);
                      }
                      setSelectedTasks(newSelected);
                    }}
                    className="h-4 w-4 text-orange-600 rounded border-gray-300"
                  />
                )}
                
                {/* Task Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{task.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {task.category}
                    </Badge>
                    <Badge 
                      variant={task.priority === 'high' ? 'destructive' : 
                               task.priority === 'medium' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {task.priority}
                    </Badge>
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-gray-600 truncate">{task.description}</p>
                  )}
                </div>
                
                {/* Time Limit Controls */}
                <div className="flex items-center gap-3">
                  {/* AI Suggestion Indicator */}
                  {hasAISuggestion && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <Zap className="h-3 w-3" />
                      <span className="text-xs">{setting.aiSuggestion}m</span>
                    </div>
                  )}
                  
                  {/* Time Input */}
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`time-${setting.taskId}`} className="text-sm whitespace-nowrap">
                      Time:
                    </Label>
                    <Input
                      id={`time-${setting.taskId}`}
                      type="number"
                      min="5"
                      max="480"
                      step="5"
                      value={setting.currentLimit}
                      onChange={(e) => {
                        const newLimit = parseInt(e.target.value) || 30;
                        updateTimeLimit(setting.taskId, newLimit);
                      }}
                      className="w-20 text-center"
                    />
                    <span className="text-sm text-gray-500">min</span>
                  </div>
                  
                  {/* Quick Presets */}
                  <div className="flex gap-1">
                    {[15, 30, 60].map(minutes => (
                      <Button
                        key={minutes}
                        variant="ghost"
                        size="sm"
                        onClick={() => updateTimeLimit(setting.taskId, minutes)}
                        className="text-xs px-2 py-1 h-6"
                      >
                        {minutes}m
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}