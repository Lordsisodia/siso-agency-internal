import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Scroll, RefreshCw, Play, Pause, X, Clock, Zap } from 'lucide-react';

interface TaskQueueProps {
  queueLength: number;
  onRefresh: () => void;
}

export function TaskQueue({ queueLength, onRefresh }: TaskQueueProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Mock queue data - in reality this would come from the automation engine
  const mockQueueItems = [
    {
      id: 'task-1',
      name: 'Update user authentication flow',
      category: 'development',
      priority: 'high',
      estimatedTokens: 8500,
      createdAt: new Date(Date.now() - 300000), // 5 minutes ago
      status: 'pending'
    },
    {
      id: 'task-2', 
      name: 'Run integration tests',
      category: 'testing',
      priority: 'medium',
      estimatedTokens: 3200,
      createdAt: new Date(Date.now() - 180000), // 3 minutes ago
      status: 'pending'
    },
    {
      id: 'task-3',
      name: 'Analyze performance metrics',
      category: 'analysis',
      priority: 'low',
      estimatedTokens: 5500,
      createdAt: new Date(Date.now() - 120000), // 2 minutes ago
      status: 'pending'
    }
  ].slice(0, queueLength); // Show only as many items as queue length

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: 'bg-red-600',
      high: 'bg-orange-600',
      medium: 'bg-blue-600',
      low: 'bg-gray-600'
    };
    return colors[priority] || 'bg-gray-600';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      development: 'bg-blue-600',
      testing: 'bg-green-600',
      deployment: 'bg-purple-600',
      analysis: 'bg-yellow-600',
      maintenance: 'bg-red-600'
    };
    return colors[category] || 'bg-gray-600';
  };

  const formatTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    return `${minutes} minutes ago`;
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white flex items-center">
          <Scroll className="w-5 h-5 mr-2 text-orange-500" />
          Task Queue ({queueLength})
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      
      <CardContent>
        {queueLength === 0 ? (
          <div className="text-center py-8">
            <Scroll className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No tasks in queue</p>
            <p className="text-sm text-gray-500 mt-1">
              Create a new automation task to get started
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {mockQueueItems.map((task, index) => (
              <div 
                key={task.id} 
                className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg hover:bg-gray-650 transition-colors"
              >
                {/* Position in queue */}
                <div className="flex items-center justify-center w-8 h-8 bg-orange-600 text-white rounded-full text-sm font-bold">
                  {index + 1}
                </div>
                
                {/* Task info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-white truncate">{task.name}</h4>
                    <Badge className={`${getPriorityColor(task.priority)} text-white text-xs`}>
                      {task.priority}
                    </Badge>
                    <Badge className={`${getCategoryColor(task.category)} text-white text-xs`}>
                      {task.category}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center">
                      <Zap className="w-3 h-3 mr-1" />
                      {task.estimatedTokens.toLocaleString()} tokens
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTimeAgo(task.createdAt)}
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center space-x-2">
                  {index === 0 && (
                    <Badge className="bg-blue-600 text-white">
                      <Play className="w-3 h-3 mr-1" />
                      Next
                    </Badge>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {/* Queue stats */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-white">
                    {mockQueueItems.reduce((sum, task) => sum + task.estimatedTokens, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Total Tokens</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">
                    ~{Math.round(mockQueueItems.reduce((sum, task) => sum + task.estimatedTokens, 0) / 1000 * 5)}m
                  </div>
                  <div className="text-sm text-gray-400">Est. Time</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">
                    ${(mockQueueItems.reduce((sum, task) => sum + task.estimatedTokens, 0) / 1000 * 0.008).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-400">Est. Cost</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}