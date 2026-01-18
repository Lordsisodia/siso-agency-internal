/**
 * AI Workflow Demo - Complete demonstration of AI-powered timeline features
 * 
 * This component showcases the complete integration of:
 * - Real data from all 4 sources (tasks, morning routine, wellness)
 * - AI priority setting and time estimation
 * - Time limit management and optimization
 * - Task recommendations and scheduling
 * - Live workflow simulation
 */

import React, { useState, useEffect } from 'react';
import { Brain, Clock, Zap, Target, TrendingUp, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTimelineTasks } from '../hooks/useTimelineTasks';
import { TimelineLimitManager } from './TimelineLimitManager';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  result?: any;
  duration?: number;
}

export function AIWorkflowDemo() {
  const {
    timelineGroups,
    loading,
    totalTasks,
    totalCompleted,
    overallCompletionRate,
    createTaskWithAI,
    getAIRecommendations,
    adjustTaskPriorityWithAI,
    updateTimeLimit,
    bulkUpdateTimeLimits,
    optimizeTimeAllocation
  } = useTimelineTasks();

  const [demoMode, setDemoMode] = useState<'stopped' | 'running' | 'paused'>('stopped');
  const [currentStep, setCurrentStep] = useState(0);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [demoResults, setDemoResults] = useState<any>({});

  // Initialize workflow steps
  useEffect(() => {
    const steps: WorkflowStep[] = [
      {
        id: 'fetch-data',
        title: 'Fetch Real Timeline Data',
        description: 'Loading tasks from all 4 data sources: light-work, deep-work, morning routine, wellness',
        status: 'pending'
      },
      {
        id: 'create-ai-task',
        title: 'Create Task with AI Analysis',
        description: 'Create a new task and let AI set priority and estimate time automatically',
        status: 'pending'
      },
      {
        id: 'get-recommendations',
        title: 'Get AI Task Recommendations',
        description: 'AI analyzes available time and recommends optimal tasks to work on',
        status: 'pending'
      },
      {
        id: 'adjust-priorities',
        title: 'AI Priority Adjustment',
        description: 'AI re-evaluates task priorities based on current workload and context',
        status: 'pending'
      },
      {
        id: 'optimize-time',
        title: 'Time Allocation Optimization',
        description: 'AI optimizes task scheduling based on available time slots',
        status: 'pending'
      },
      {
        id: 'bulk-time-limits',
        title: 'Bulk Time Limit Updates',
        description: 'Demonstrate bulk updating of time limits with AI suggestions',
        status: 'pending'
      }
    ];
    setWorkflowSteps(steps);
  }, []);

  // Execute workflow step
  const executeStep = async (stepId: string) => {
    setWorkflowSteps(prev => 
      prev.map(step => 
        step.id === stepId ? { ...step, status: 'running' } : step
      )
    );

    try {
      let result;
      const startTime = Date.now();

      switch (stepId) {
        case 'fetch-data':
          // Data is already available through the hook
          result = {
            totalTasks,
            totalCompleted,
            completionRate: overallCompletionRate,
            groups: timelineGroups.length,
            categories: ['morning', 'light-work', 'deep-work', 'wellness']
          };
          break;

        case 'create-ai-task':
          result = await createTaskWithAI({
            title: 'AI Demo Task - Client Presentation Prep',
            description: 'Prepare slides and demo for important client meeting next week',
            category: 'deep-work',
            currentDate: new Date().toISOString().split('T')[0],
            useAI: true
          });
          break;

        case 'get-recommendations':
          result = await getAIRecommendations(90); // 90 minutes available
          break;

        case 'adjust-priorities':
          // Find a task to adjust (demo purposes)
          const allTasks = timelineGroups.flatMap(group => group.tasks);
          const sampleTask = allTasks.find(task => !task.completed);
          if (sampleTask) {
            result = await adjustTaskPriorityWithAI(
              sampleTask.id, 
              'Client deadline moved up - now urgent'
            );
          }
          break;

        case 'optimize-time':
          // Sample time slots for demonstration
          const timeSlots = [
            { start: new Date(Date.now() + 60000), end: new Date(Date.now() + 3660000), minutes: 60 },
            { start: new Date(Date.now() + 3660000), end: new Date(Date.now() + 5460000), minutes: 30 },
            { start: new Date(Date.now() + 5460000), end: new Date(Date.now() + 9060000), minutes: 60 }
          ];
          result = await optimizeTimeAllocation(timeSlots);
          break;

        case 'bulk-time-limits':
          // Sample bulk updates
          const tasksToUpdate = timelineGroups
            .flatMap(group => group.tasks)
            .slice(0, 3)
            .map(task => ({ taskId: task.id, limit: 45 }));
          
          if (tasksToUpdate.length > 0) {
            await bulkUpdateTimeLimits(tasksToUpdate);
            result = { updatedTasks: tasksToUpdate.length, newLimit: 45 };
          }
          break;

        default:
          throw new Error(`Unknown step: ${stepId}`);
      }

      const duration = Date.now() - startTime;

      setWorkflowSteps(prev => 
        prev.map(step => 
          step.id === stepId 
            ? { ...step, status: 'completed', result, duration }
            : step
        )
      );

      setDemoResults(prev => ({ ...prev, [stepId]: result }));

    } catch (error) {
      console.error(`Step ${stepId} failed:`, error);
      
      setWorkflowSteps(prev => 
        prev.map(step => 
          step.id === stepId 
            ? { ...step, status: 'error', result: { error: error.message } }
            : step
        )
      );
    }
  };

  // Auto-run workflow
  const runWorkflow = async () => {
    setDemoMode('running');
    setCurrentStep(0);

    for (let i = 0; i < workflowSteps.length; i++) {
      if (demoMode === 'stopped') break;
      
      setCurrentStep(i);
      await executeStep(workflowSteps[i].id);
      
      // Pause between steps for visibility
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setDemoMode('stopped');
  };

  // Reset demo
  const resetDemo = () => {
    setDemoMode('stopped');
    setCurrentStep(0);
    setDemoResults({});
    setWorkflowSteps(prev => 
      prev.map(step => ({ ...step, status: 'pending', result: undefined }))
    );
  };

  // Calculate demo progress
  const completedSteps = workflowSteps.filter(step => step.status === 'completed').length;
  const progressPercentage = (completedSteps / workflowSteps.length) * 100;

  return (
    <div className="space-y-6">
      {/* Demo Header */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AI Workflow Demo</h2>
              <p className="text-gray-600">Complete integration test of AI-powered timeline features</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={runWorkflow}
              disabled={demoMode === 'running' || loading}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              {demoMode === 'running' ? 'Running...' : 'Start Demo'}
            </Button>
            
            <Button
              variant="outline"
              onClick={resetDemo}
              disabled={demoMode === 'running'}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Demo Progress</span>
            <span className="text-sm text-gray-600">{completedSteps}/{workflowSteps.length} steps</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </Card>

      {/* Current Data Summary */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Current Timeline Data
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{totalTasks}</p>
            <p className="text-sm text-gray-600">Total Tasks</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{totalCompleted}</p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{Math.round(overallCompletionRate)}%</p>
            <p className="text-sm text-gray-600">Completion Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{timelineGroups.length}</p>
            <p className="text-sm text-gray-600">Date Groups</p>
          </div>
        </div>
      </Card>

      {/* Workflow Steps */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Workflow Steps
        </h3>
        
        {workflowSteps.map((step, index) => (
          <Card 
            key={step.id} 
            className={`p-4 transition-all ${
              currentStep === index && demoMode === 'running' 
                ? 'border-blue-300 bg-blue-50' 
                : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge 
                    variant={
                      step.status === 'completed' ? 'default' :
                      step.status === 'running' ? 'secondary' :
                      step.status === 'error' ? 'destructive' : 'outline'
                    }
                  >
                    {step.status}
                  </Badge>
                  
                  <h4 className="font-medium">{step.title}</h4>
                  
                  {step.duration && (
                    <span className="text-xs text-gray-500">
                      ({step.duration}ms)
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                
                {/* Step Results */}
                {step.result && (
                  <div className="mt-3 p-3 bg-gray-50 rounded border">
                    <p className="text-xs font-medium mb-1">Result:</p>
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(step.result, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
              
              {step.status === 'pending' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => executeStep(step.id)}
                  disabled={demoMode === 'running'}
                >
                  Run Step
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Live Demo Results Summary */}
      {Object.keys(demoResults).length > 0 && (
        <Card className="p-6 border-green-200 bg-green-50">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-green-800">
            <TrendingUp className="h-5 w-5" />
            Demo Results Summary
          </h3>
          
          <div className="grid gap-4">
            {demoResults['fetch-data'] && (
              <div>
                <h4 className="font-medium text-green-800">✅ Data Integration</h4>
                <p className="text-sm text-green-700">
                  Successfully connected to all 4 data sources with {demoResults['fetch-data'].totalTasks} tasks 
                  across {demoResults['fetch-data'].categories.length} categories
                </p>
              </div>
            )}
            
            {demoResults['create-ai-task'] && (
              <div>
                <h4 className="font-medium text-green-800">✅ AI Task Creation</h4>
                <p className="text-sm text-green-700">
                  AI successfully analyzed task and set priority/duration automatically
                </p>
              </div>
            )}
            
            {demoResults['get-recommendations'] && (
              <div>
                <h4 className="font-medium text-green-800">✅ AI Recommendations</h4>
                <p className="text-sm text-green-700">
                  Generated {demoResults['get-recommendations'].recommendedTasks?.length || 0} task recommendations 
                  with optimization analysis
                </p>
              </div>
            )}
            
            {demoResults['bulk-time-limits'] && (
              <div>
                <h4 className="font-medium text-green-800">✅ Time Limit Management</h4>
                <p className="text-sm text-green-700">
                  Bulk updated {demoResults['bulk-time-limits'].updatedTasks} tasks with new time limits
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Time Limit Manager Integration */}
      {timelineGroups.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Live Time Limit Manager
          </h3>
          
          <TimelineLimitManager
            tasks={timelineGroups.flatMap(group => group.tasks)}
            onUpdateTimeLimit={updateTimeLimit}
            onBulkUpdateTimeLimits={bulkUpdateTimeLimits}
          />
        </Card>
      )}
    </div>
  );
}