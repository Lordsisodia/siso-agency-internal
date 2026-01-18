import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Bot, 
  Zap, 
  Brain, 
  Activity,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Cpu,
  MessageSquare,
  FileText,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AIMetrics {
  activeWorkflows: number;
  completedTasks: number;
  tokensUsed: number;
  tokensLimit: number;
  aiResponses: number;
  automationSavings: number;
  successRate: number;
  avgResponseTime: number;
}

export function AIAutomationWidget() {
  const [metrics, setMetrics] = useState<AIMetrics>({
    activeWorkflows: 12,
    completedTasks: 247,
    tokensUsed: 45230,
    tokensLimit: 100000,
    aiResponses: 1834,
    automationSavings: 24.5,
    successRate: 96.8,
    avgResponseTime: 1.2
  });

  const [isLoading, setIsLoading] = useState(false);

  const refreshMetrics = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setMetrics(prev => ({
      ...prev,
      completedTasks: prev.completedTasks + Math.floor(Math.random() * 5),
      aiResponses: prev.aiResponses + Math.floor(Math.random() * 20),
      tokensUsed: prev.tokensUsed + Math.floor(Math.random() * 100)
    }));
    setIsLoading(false);
  };

  const tokenUsagePercentage = (metrics.tokensUsed / metrics.tokensLimit) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="bg-gradient-to-br from-purple-900/20 to-violet-700/10 border-purple-500/20 hover:border-purple-400/40 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-white">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Bot className="h-5 w-5 text-purple-400" />
            </div>
            AI & Automation
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={refreshMetrics}
            disabled={isLoading}
            className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
          >
            {isLoading ? 'Syncing...' : 'Refresh'}
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* AI Usage Overview */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Brain className="h-4 w-4 text-purple-400" />
                <span className="text-xs text-purple-300">AI Responses</span>
              </div>
              <p className="text-xl font-bold text-purple-400">{metrics.aiResponses.toLocaleString()}</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-400" />
                <span className="text-xs text-green-400">+12%</span>
              </div>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Zap className="h-4 w-4 text-blue-400" />
                <span className="text-xs text-blue-300">Workflows</span>
              </div>
              <p className="text-xl font-bold text-blue-400">{metrics.activeWorkflows}</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <CheckCircle className="h-3 w-3 text-green-400" />
                <span className="text-xs text-green-400">Active</span>
              </div>
            </div>
          </div>

          {/* Token Usage */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">Token Usage</span>
              <span className="text-sm text-purple-400">
                {metrics.tokensUsed.toLocaleString()} / {metrics.tokensLimit.toLocaleString()}
              </span>
            </div>
            <Progress value={tokenUsagePercentage} className="h-2 bg-gray-800" />
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">{tokenUsagePercentage.toFixed(1)}% used</span>
              <span className="text-gray-400">
                {(metrics.tokensLimit - metrics.tokensUsed).toLocaleString()} remaining
              </span>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 rounded-lg bg-gray-800/50">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Activity className="h-3 w-3 text-green-400" />
              </div>
              <p className="text-sm font-bold text-green-400">{metrics.successRate}%</p>
              <p className="text-xs text-gray-400">Success Rate</p>
            </div>
            
            <div className="text-center p-2 rounded-lg bg-gray-800/50">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="h-3 w-3 text-blue-400" />
              </div>
              <p className="text-sm font-bold text-blue-400">{metrics.avgResponseTime}s</p>
              <p className="text-xs text-gray-400">Avg Response</p>
            </div>
            
            <div className="text-center p-2 rounded-lg bg-gray-800/50">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle className="h-3 w-3 text-purple-400" />
              </div>
              <p className="text-sm font-bold text-purple-400">{metrics.completedTasks}</p>
              <p className="text-xs text-gray-400">Completed</p>
            </div>
          </div>

          {/* Automation Savings */}
          <div className="p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-300">Automation Savings</p>
                <p className="text-lg font-bold text-green-400">{metrics.automationSavings} hours/week</p>
              </div>
              <div className="p-2 rounded-lg bg-green-500/20">
                <Cpu className="h-5 w-5 text-green-400" />
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-300">Recent Activity</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/30">
                <MessageSquare className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-gray-300">Generated 15 email responses</span>
                <Badge variant="secondary" className="ml-auto bg-green-500/20 text-green-400 text-xs">
                  2m ago
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/30">
                <FileText className="h-4 w-4 text-purple-400" />
                <span className="text-sm text-gray-300">Created project summary</span>
                <Badge variant="secondary" className="ml-auto bg-blue-500/20 text-blue-400 text-xs">
                  5m ago
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/30">
                <Calendar className="h-4 w-4 text-orange-400" />
                <span className="text-sm text-gray-300">Scheduled 3 meetings</span>
                <Badge variant="secondary" className="ml-auto bg-orange-500/20 text-orange-400 text-xs">
                  8m ago
                </Badge>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button 
              size="sm" 
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Bot className="h-4 w-4 mr-1" />
              New Workflow
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
            >
              <Brain className="h-4 w-4 mr-1" />
              AI Chat
            </Button>
          </div>

          {/* Warning for high token usage */}
          {tokenUsagePercentage > 80 && (
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-yellow-300">
                  High token usage - {(100 - tokenUsagePercentage).toFixed(1)}% remaining
                </span>
              </div>
            </div>
          )}

          {/* Status Indicator */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-purple-400 animate-pulse"></div>
              <span className="text-xs text-gray-400">AI Systems Online</span>
            </div>
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              Active
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 