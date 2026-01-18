import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Mail, 
  Send, 
  Eye, 
  MousePointer, 
  TrendingUp, 
  TrendingDown,
  Inbox,
  Calendar,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';

interface EmailMetrics {
  openRate: number;
  clickRate: number;
  sentToday: number;
  unreadCount: number;
  scheduledCampaigns: number;
  subscribers: number;
}

export function EmailIntegrationWidget() {
  const [metrics, setMetrics] = useState<EmailMetrics>({
    openRate: 94.2,
    clickRate: 12.8,
    sentToday: 1247,
    unreadCount: 23,
    scheduledCampaigns: 5,
    subscribers: 8432
  });

  const [isLoading, setIsLoading] = useState(false);

  const refreshMetrics = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setMetrics(prev => ({
      ...prev,
      sentToday: prev.sentToday + Math.floor(Math.random() * 10),
      unreadCount: Math.max(0, prev.unreadCount + Math.floor(Math.random() * 5) - 2)
    }));
    setIsLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-blue-900/20 to-blue-700/10 border-blue-500/20 hover:border-blue-400/40 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-white">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Mail className="h-5 w-5 text-blue-400" />
            </div>
            Email Performance
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={refreshMetrics}
            disabled={isLoading}
            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
          >
            {isLoading ? 'Syncing...' : 'Refresh'}
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Main Metrics Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Eye className="h-4 w-4 text-blue-400" />
                <span className="text-xs text-blue-300">Open Rate</span>
              </div>
              <p className="text-xl font-bold text-blue-400">{metrics.openRate}%</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-400" />
                <span className="text-xs text-green-400">+2.3%</span>
              </div>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center justify-center gap-1 mb-1">
                <MousePointer className="h-4 w-4 text-green-400" />
                <span className="text-xs text-green-300">Click Rate</span>
              </div>
              <p className="text-xl font-bold text-green-400">{metrics.clickRate}%</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-400" />
                <span className="text-xs text-green-400">+0.8%</span>
              </div>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Send className="h-4 w-4 text-orange-400" />
                <span className="text-xs text-orange-300">Sent Today</span>
              </div>
              <p className="text-xl font-bold text-orange-400">{metrics.sentToday.toLocaleString()}</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-400" />
                <span className="text-xs text-green-400">+15%</span>
              </div>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/50">
              <Inbox className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-white">{metrics.unreadCount}</p>
                <p className="text-xs text-gray-400">Unread</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/50">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-white">{metrics.scheduledCampaigns}</p>
                <p className="text-xs text-gray-400">Scheduled</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/50">
              <Users className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-white">{metrics.subscribers.toLocaleString()}</p>
                <p className="text-xs text-gray-400">Subscribers</p>
              </div>
            </div>
          </div>

          {/* Progress Indicators */}
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-300">Campaign Performance</span>
                <span className="text-sm text-blue-400">87%</span>
              </div>
              <Progress value={87} className="h-2 bg-gray-800" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-300">Deliverability Score</span>
                <span className="text-sm text-green-400">96%</span>
              </div>
              <Progress value={96} className="h-2 bg-gray-800" />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 pt-2">
            <Button 
              size="sm" 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send className="h-4 w-4 mr-1" />
              New Campaign
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1 border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
            >
              <Eye className="h-4 w-4 mr-1" />
              View Inbox
            </Button>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-xs text-gray-400">Connected to Gmail</span>
            </div>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              Live
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 