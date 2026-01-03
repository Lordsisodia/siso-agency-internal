/**
 * Daily Planning Page - Complete time boxing system
 * 
 * This is the main daily planning interface that provides:
 * 1. Date selection for planning any day
 * 2. Task browsing and selection from all sources
 * 3. Time estimation for tasks without durations
 * 4. Drag and drop time boxing into specific time slots
 * 5. Real-time conflict detection and validation
 * 6. Save/load daily plans
 * 7. Analytics and time utilization insights
 * 
 * Workflow:
 * - Morning: Open this page, select today's date
 * - Browse all available tasks (morning, light-work, deep-work, wellness)
 * - Select which tasks you want to do today
 * - Drag tasks into time slots to create your schedule
 * - Validate no conflicts, save plan
 * - Throughout day: Update task completions
 */

import React, { useState } from 'react';
import { Calendar, Save, RotateCcw, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, addDays, subDays } from 'date-fns';

import { useDailyPlanning } from '../hooks/useDailyPlanning';
import { TaskSelector } from '../components/TaskSelector';
import { DragDropTimeSlotGrid } from '../components/DragDropTimeSlotGrid';

export function DailyPlanningPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'select' | 'schedule'>('select');

  // Initialize daily planning hook
  const {
    dailyPlan,
    availableTasks,
    loading,
    selectTask,
    deselectTask,
    assignTaskToSlot,
    removeTaskFromSlot,
    updateTaskEstimation,
    getValidation,
    getTasksByCategory,
    getSelectedTasks,
    getUnscheduledTasks,
    saveDailyPlan
  } = useDailyPlanning({ selectedDate });

  // Get computed data
  const validation = getValidation();
  const selectedTasks = getSelectedTasks();
  const unscheduledTasks = getUnscheduledTasks();
  const tasksByCategory = getTasksByCategory();

  // Date navigation
  const goToPreviousDay = () => setSelectedDate(prev => subDays(prev, 1));
  const goToNextDay = () => setSelectedDate(prev => addDays(prev, 1));
  const goToToday = () => setSelectedDate(new Date());

  // Auto-advance to schedule tab when tasks are selected
  React.useEffect(() => {
    if (selectedTasks.length > 0 && activeTab === 'select') {
      // Optional: auto-advance after a delay
      // setTimeout(() => setActiveTab('schedule'), 1000);
    }
  }, [selectedTasks.length, activeTab]);

  // Calculate planning progress
  const planningProgress = {
    tasksSelected: selectedTasks.length,
    tasksScheduled: selectedTasks.length - unscheduledTasks.length,
    schedulingComplete: unscheduledTasks.length === 0 && selectedTasks.length > 0,
    hasConflicts: !validation.isValid
  };

  const totalTasks = Object.values(tasksByCategory).flat().filter(t => !t.completed).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            {/* Date Navigation */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h1 className="text-2xl font-bold">Daily Planning</h1>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousDay}
                  className="h-8 w-8 p-0"
                >
                  ←
                </Button>
                
                <div className="text-center min-w-[140px]">
                  <p className="font-semibold">{format(selectedDate, 'EEEE')}</p>
                  <p className="text-sm text-gray-600">{format(selectedDate, 'MMM d, yyyy')}</p>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextDay}
                  className="h-8 w-8 p-0"
                >
                  →
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToToday}
                  className="ml-2"
                >
                  Today
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={saveDailyPlan}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Plan
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>

          {/* Planning Progress */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{totalTasks}</p>
              <p className="text-sm text-gray-600">Available Tasks</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{planningProgress.tasksSelected}</p>
              <p className="text-sm text-gray-600">Selected</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{planningProgress.tasksScheduled}</p>
              <p className="text-sm text-gray-600">Scheduled</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                {planningProgress.schedulingComplete ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                ) : planningProgress.hasConflicts ? (
                  <AlertCircle className="h-6 w-6 text-red-500" />
                ) : (
                  <TrendingUp className="h-6 w-6 text-blue-500" />
                )}
                <p className="text-sm font-medium">
                  {planningProgress.schedulingComplete 
                    ? 'Complete' 
                    : planningProgress.hasConflicts 
                      ? 'Conflicts' 
                      : 'In Progress'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Status */}
          {planningProgress.schedulingComplete && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <p className="text-sm text-green-800 font-medium">
                  Your day is fully planned! 🎯 {selectedTasks.length} tasks scheduled
                </p>
              </div>
            </div>
          )}

          {validation.warnings.length > 0 && (
            <div className="mt-4 space-y-2">
              {validation.warnings.map((warning, index) => (
                <div key={index} className="flex items-center gap-2 text-yellow-700 text-sm bg-yellow-50 p-2 rounded">
                  <AlertCircle className="h-4 w-4" />
                  {warning}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Main Planning Interface */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'select' | 'schedule')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="select" className="flex items-center gap-2">
              <span>📋</span>
              Step 1: Select Tasks
              {selectedTasks.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedTasks.length}
                </Badge>
              )}
            </TabsTrigger>
            
            <TabsTrigger 
              value="schedule" 
              disabled={selectedTasks.length === 0}
              className="flex items-center gap-2"
            >
              <span>⏰</span>
              Step 2: Schedule Time
              {unscheduledTasks.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unscheduledTasks.length} unscheduled
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Task Selection Tab */}
          <TabsContent value="select" className="mt-6">
            <TaskSelector
              availableTasks={availableTasks}
              selectedTaskIds={selectedTasks.map(t => t.id)}
              onSelectTask={selectTask}
              onDeselectTask={deselectTask}
              onUpdateEstimation={updateTaskEstimation}
            />

            {/* Continue Button */}
            {selectedTasks.length > 0 && (
              <Card className="p-4 mt-6 border-blue-200 bg-blue-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-900">Ready to schedule!</p>
                    <p className="text-sm text-blue-700">
                      {selectedTasks.length} tasks selected • Continue to time boxing
                    </p>
                  </div>
                  
                  <Button
                    onClick={() => setActiveTab('schedule')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Continue to Scheduling →
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Time Scheduling Tab */}
          <TabsContent value="schedule" className="mt-6">
            {dailyPlan && (
              <DragDropTimeSlotGrid
                dailyPlan={dailyPlan}
                availableTasks={availableTasks}
                unscheduledTasks={unscheduledTasks}
                onAssignTaskToSlot={assignTaskToSlot}
                onRemoveTaskFromSlot={removeTaskFromSlot}
                validation={validation}
              />
            )}

            {/* Back Button */}
            <Card className="p-4 mt-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('select')}
                >
                  ← Back to Task Selection
                </Button>
                
                {planningProgress.schedulingComplete && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Day planning complete!</span>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Daily Plan Summary */}
        {dailyPlan && selectedTasks.length > 0 && (
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Daily Plan Summary
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Time Breakdown */}
              <div>
                <h4 className="font-medium mb-2">Time Allocation</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Available:</span>
                    <span className="font-medium">
                      {Math.floor(dailyPlan.totalAvailableTime / 60)}h {dailyPlan.totalAvailableTime % 60}m
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Planned:</span>
                    <span className="font-medium">
                      {Math.floor(dailyPlan.totalPlannedTime / 60)}h {dailyPlan.totalPlannedTime % 60}m
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Free Time:</span>
                    <span className="font-medium text-green-600">
                      {Math.floor((dailyPlan.totalAvailableTime - dailyPlan.totalPlannedTime) / 60)}h {(dailyPlan.totalAvailableTime - dailyPlan.totalPlannedTime) % 60}m
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Task Breakdown */}
              <div>
                <h4 className="font-medium mb-2">Task Breakdown</h4>
                <div className="space-y-2 text-sm">
                  {Object.entries(tasksByCategory).map(([category, tasks]) => {
                    const selectedInCategory = tasks.filter(t => selectedTasks.some(st => st.id === t.id)).length;
                    if (selectedInCategory === 0) return null;
                    
                    return (
                      <div key={category} className="flex justify-between">
                        <span className="capitalize">{category.replace('-', ' ')}:</span>
                        <span className="font-medium">{selectedInCategory}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Status */}
              <div>
                <h4 className="font-medium mb-2">Planning Status</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    {planningProgress.schedulingComplete ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                    )}
                    <span>All tasks scheduled</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {validation.isValid ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span>No time conflicts</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Plan saved locally</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}