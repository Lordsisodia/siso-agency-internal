/**
 * TasksAI Component
 * AI-powered task insights and assistance
 */

import React, { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { Separator } from '@/shared/ui/separator';
import {
  Brain,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  Clock,
  Target,
  Send,
  Sparkles,
  BarChart3,
  Zap,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useTasks } from '../providers/TasksProvider';

interface TasksAIProps {
  className?: string;
  compact?: boolean;
}

// AI Insight types
interface AIInsight {
  id: string;
  type: 'suggestion' | 'warning' | 'optimization' | 'trend';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  action?: string;
}

// Mock AI insights based on task data
const generateInsights = (tasks: any[]): AIInsight[] => {
  const insights: AIInsight[] = [];
  
  // Analyze overdue tasks
  const overdueTasks = tasks.filter(task => 
    task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
  );
  
  if (overdueTasks.length > 0) {
    insights.push({
      id: 'overdue-alert',
      type: 'warning',
      title: `${overdueTasks.length} Overdue Tasks`,
      description: 'Focus on completing overdue tasks to maintain project momentum.',
      priority: 'high',
      actionable: true,
      action: 'View overdue tasks'
    });
  }
  
  // Analyze task distribution
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress');
  if (inProgressTasks.length > 5) {
    insights.push({
      id: 'focus-suggestion',
      type: 'suggestion',
      title: 'Too Many Active Tasks',
      description: 'Consider focusing on fewer tasks to improve completion rate.',
      priority: 'medium',
      actionable: true,
      action: 'Prioritize tasks'
    });
  }
  
  // Analyze completion trends
  const completedToday = tasks.filter(task => 
    task.status === 'completed' && 
    new Date(task.updated_at).toDateString() === new Date().toDateString()
  );
  
  if (completedToday.length > 0) {
    insights.push({
      id: 'productivity-trend',
      type: 'trend',
      title: `${completedToday.length} Tasks Completed Today`,
      description: 'Great productivity! Keep up the momentum.',
      priority: 'low',
      actionable: false
    });
  }
  
  // Suggest optimizations
  const unestimatedTasks = tasks.filter(task => !task.estimated_hours);
  if (unestimatedTasks.length > 3) {
    insights.push({
      id: 'estimation-suggestion',
      type: 'optimization',
      title: 'Add Time Estimates',
      description: 'Adding time estimates helps with better planning and scheduling.',
      priority: 'medium',
      actionable: true,
      action: 'Add estimates'
    });
  }
  
  return insights;
};

export const TasksAI: React.FC<TasksAIProps> = ({
  className,
  compact = false
}) => {
  const { tasks } = useTasks();
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    role: 'user' | 'ai';
    content: string;
    timestamp: Date;
  }>>([
    {
      id: '1',
      role: 'ai',
      content: 'Hi! I\'m your AI assistant. I can help you analyze your tasks, suggest optimizations, and answer questions about your workflow.',
      timestamp: new Date()
    }
  ]);

  const insights = generateInsights(tasks);

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'suggestion':
        return <Lightbulb className="w-4 h-4 text-yellow-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'optimization':
        return <Target className="w-4 h-4 text-blue-500" />;
      case 'trend':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      default:
        return <Brain className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: AIInsight['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'low':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        role: 'ai' as const,
        content: 'I understand you\'re asking about your tasks. Based on your current workload, I suggest focusing on high-priority items first. Would you like me to help you reorganize your task list?',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <div className={cn(
      'tasks-ai bg-white border-l border-gray-200',
      compact ? 'p-3' : 'p-4',
      className
    )}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-lg">
            <Brain className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <h3 className={cn(
              'font-medium text-gray-900',
              compact ? 'text-sm' : 'text-base'
            )}>
              AI Assistant
            </h3>
            <p className="text-xs text-gray-500">
              Smart insights & help
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Card className="p-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-3 h-3 text-blue-500" />
              <div>
                <p className="text-xs text-gray-600">Tasks</p>
                <p className="text-sm font-medium">{tasks.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-2">
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-green-500" />
              <div>
                <p className="text-xs text-gray-600">Active</p>
                <p className="text-sm font-medium">
                  {tasks.filter(t => t.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* AI Insights */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <h4 className="text-sm font-medium text-gray-700">Insights</h4>
          </div>
          
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {insights.map((insight) => (
                <Card 
                  key={insight.id}
                  className={cn(
                    'p-3 border',
                    getPriorityColor(insight.priority)
                  )}
                >
                  <div className="flex items-start gap-2">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 mb-1">
                        {insight.title}
                      </p>
                      <p className="text-xs text-gray-600 mb-2">
                        {insight.description}
                      </p>
                      {insight.actionable && insight.action && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-6 px-2"
                        >
                          <Zap className="w-3 h-3 mr-1" />
                          {insight.action}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              
              {insights.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <Lightbulb className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-xs">No insights available</p>
                  <p className="text-xs">Complete more tasks to see AI suggestions</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <Separator className="my-3" />

        {/* AI Chat */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-blue-500" />
            <h4 className="text-sm font-medium text-gray-700">Ask AI</h4>
          </div>
          
          {/* Chat Messages */}
          <ScrollArea className="flex-1 mb-3">
            <div className="space-y-2">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'p-2 rounded-lg text-xs',
                    message.role === 'user'
                      ? 'bg-orange-100 text-gray-800 ml-4'
                      : 'bg-gray-100 text-gray-700 mr-4'
                  )}
                >
                  <p>{message.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          {/* Chat Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Ask about your tasks..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
              className="text-xs"
            />
            <Button
              size="sm"
              onClick={handleSendMessage}
              disabled={!chatInput.trim()}
              className="px-2"
            >
              <Send className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasksAI;