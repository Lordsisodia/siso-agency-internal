import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  Square, 
  BarChart3, 
  Zap, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Cpu,
  Activity
} from 'lucide-react';
import { automationEngine, AutomationTask, AutomationJob } from '@/services/automation/AutomationEngine';
import { TokenUsageChart } from './TokenUsageChart';
import { RateLimitStatus } from './RateLimitStatus';
import { TaskQueue } from './TaskQueue';
import { TaskCreator } from './TaskCreator';

export function AutomationDashboard() {
  const [status, setStatus] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [tasks, setTasks] = useState<AutomationTask[]>([]);
  const [activeJobs, setActiveJobs] = useState<AutomationJob[]>([]);
  const [showTaskCreator, setShowTaskCreator] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadDashboardData();
    
    // Set up auto-refresh every 5 seconds
    const interval = setInterval(loadDashboardData, 5000);
    setRefreshInterval(interval);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get current automation status
      const automationStatus = automationEngine.getAutomationStatus();
      setStatus(automationStatus);
      setActiveJobs(automationStatus.activeJobs);
      
      // Get analytics
      const analyticsData = await automationEngine.getAnalytics('week');
      setAnalytics(analyticsData);
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const handleCreateTask = async (taskData: any) => {
    try {
      await automationEngine.submitTask({
        ...taskData,
        createdBy: 'current-user' // Replace with actual user ID
      });
      setShowTaskCreator(false);
      loadDashboardData();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleCancelTask = async (taskId: string) => {
    try {
      await automationEngine.cancelTask(taskId);
      loadDashboardData();
    } catch (error) {
      console.error('Failed to cancel task:', error);
    }
  };

  if (!status) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Activity className="w-6 h-6 text-orange-500 animate-spin" />
          <span className="text-gray-400">Loading automation dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Automation Center</h1>
          <p className="text-gray-400 mt-1">
            Manage Claude Code automation tasks and monitor system performance
          </p>
        </div>
        <Button 
          onClick={() => setShowTaskCreator(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          <Play className="w-4 h-4 mr-2" />
          Create Task
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Queue Length</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{status.queueLength}</div>
            <p className="text-xs text-gray-400">
              {status.isProcessing ? 'Processing' : 'Idle'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Active Jobs</CardTitle>
            <Cpu className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{activeJobs.length}</div>
            <p className="text-xs text-gray-400">
              Currently running
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {analytics?.completedTasks || 0}
            </div>
            <p className="text-xs text-gray-400">
              {analytics?.failedTasks || 0} failed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Tokens Used</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {analytics?.totalTokensUsed?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-gray-400">
              This week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Jobs */}
      {activeJobs.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Activity className="w-5 h-5 mr-2 text-orange-500" />
              Active Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeJobs.map((job) => (
                <div key={job.id} className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white">Task {job.taskId.slice(0, 8)}</h4>
                      <Badge 
                        variant={job.status === 'running' ? 'default' : 'secondary'}
                        className={
                          job.status === 'running' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-600 text-gray-300'
                        }
                      >
                        {job.status}
                      </Badge>
                    </div>
                    <Progress value={job.progress} className="w-full mb-2" />
                    <p className="text-sm text-gray-400">
                      {job.progress}% complete • Started {job.startTime?.toLocaleTimeString()}
                    </p>
                    {job.logs.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Latest: {job.logs[job.logs.length - 1]}
                      </p>
                    )}
                  </div>
                  {job.status === 'running' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancelTask(job.taskId)}
                      className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                    >
                      <Square className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rate Limits and Token Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RateLimitStatus rateLimits={status.rateLimits} />
        <TokenUsageChart tokenUsage={status.tokenUsage} />
      </div>

      {/* Task Queue */}
      <TaskQueue 
        queueLength={status.queueLength}
        onRefresh={loadDashboardData}
      />

      {/* Analytics Overview */}
      {analytics && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-orange-500" />
              Weekly Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{analytics.totalTasks}</div>
                <div className="text-sm text-gray-400">Total Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{analytics.completedTasks}</div>
                <div className="text-sm text-gray-400">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{analytics.failedTasks}</div>
                <div className="text-sm text-gray-400">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {Math.round(analytics.averageExecutionTime / 1000)}s
                </div>
                <div className="text-sm text-gray-400">Avg Time</div>
              </div>
            </div>
            
            {/* Category Breakdown */}
            <div className="mt-6">
              <h4 className="text-white font-medium mb-3">Tasks by Category</h4>
              <div className="space-y-2">
                {Object.entries(analytics.tasksByCategory).map(([category, count]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-gray-300 capitalize">{category}</span>
                    <span className="text-white font-medium">{count as number}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task Creator Modal */}
      {showTaskCreator && (
        <TaskCreator
          onSubmit={handleCreateTask}
          onCancel={() => setShowTaskCreator(false)}
        />
      )}
    </div>
  );
}