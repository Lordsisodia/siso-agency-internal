import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Zap, 
  Clock, 
  Target, 
  AlertTriangle,
  Calendar,
  Award,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
// // import { FlowStatsService } from '@/services/flowStatsService' // TODO: Recreate this import // TODO: Recreate this import;
import { FlowStats, FlowSession } from '@/domains/tasks/components-from-shared/FlowStateTimer';

interface FlowStatsDashboardProps {
  className?: string;
  showDetailed?: boolean;
}

export const FlowStatsDashboard: React.FC<FlowStatsDashboardProps> = ({
  className,
  showDetailed = false
}) => {
  const stats = FlowStatsService.getFlowStats();
  const recentSessions = FlowStatsService.getAllSessions()
    .slice(-7)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStreakColor = (streak: number): string => {
    if (streak >= 7) return 'text-green-400 bg-green-500/20 border-green-500/30';
    if (streak >= 3) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
  };

  const getContextSwitchColor = (penalty: number): string => {
    if (penalty <= 5) return 'text-green-400 bg-green-500/20 border-green-500/30';
    if (penalty <= 15) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    return 'text-red-400 bg-red-500/20 border-red-500/30';
  };

  return (
    <Card className={cn('bg-gray-900/50 border-gray-700/50', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-white">
          <Activity className="w-5 h-5 text-purple-400" />
          Flow State Analytics
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          {/* Current Streak */}
          <div className="text-center p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="w-4 h-4 text-orange-400" />
              <Badge className={cn('text-xs', getStreakColor(stats.currentStreak))}>
                {stats.currentStreak} days
              </Badge>
            </div>
            <div className="text-xs text-gray-400">Current Streak</div>
          </div>
          
          {/* Total Flow Time */}
          <div className="text-center p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-bold text-white">
                {formatTime(stats.totalFlowTime)}
              </span>
            </div>
            <div className="text-xs text-gray-400">Total Flow Time</div>
          </div>
        </div>
        
        {showDetailed && (
          <>
            {/* Additional Stats */}
            <div className="grid grid-cols-2 gap-3">
              {/* Longest Streak */}
              <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Award className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-bold text-white">
                    {stats.longestStreak}
                  </span>
                </div>
                <div className="text-xs text-gray-400">Best Streak</div>
              </div>
              
              {/* Average Session */}
              <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Target className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-bold text-white">
                    {formatTime(Math.round(stats.averageSessionLength))}
                  </span>
                </div>
                <div className="text-xs text-gray-400">Avg Session</div>
              </div>
            </div>
            
            {/* Context Switch Penalty */}
            <div className="p-3 bg-gray-800/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-gray-300">Context Switch Penalty</span>
                </div>
                <Badge className={cn('text-xs', getContextSwitchColor(stats.contextSwitchPenalty))}>
                  {stats.contextSwitchPenalty.toFixed(1)}%
                </Badge>
              </div>
              <div className="text-xs text-gray-500">
                Productivity loss from task switching
              </div>
            </div>
            
            {/* Best Flow Day */}
            {stats.bestFlowDay && (
              <div className="p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-300">Best Flow Day</span>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(stats.bestFlowDay).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            )}
            
            {/* Recent Sessions */}
            {recentSessions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Recent Sessions
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {recentSessions.slice(0, 5).map((session) => (
                    <div 
                      key={session.id} 
                      className="flex items-center justify-between p-2 bg-gray-800/30 rounded text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'w-2 h-2 rounded-full',
                          session.flowState === 'in-flow' ? 'bg-green-500' :
                          session.flowState === 'disrupted' ? 'bg-orange-500' :
                          session.flowState === 'broken' ? 'bg-red-500' : 'bg-gray-500'
                        )} />
                        <span className="text-gray-300 truncate max-w-24">
                          {session.taskTitle}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <span>{formatTime(session.duration)}</span>
                        <Badge className="text-xs bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                          {session.context}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Quick Tips */}
        <div className="text-xs text-gray-500 bg-blue-500/10 border border-blue-500/30 rounded p-2">
          💡 <strong>Pro Tip:</strong> Group similar tasks together to minimize context switching penalty!
        </div>
      </CardContent>
    </Card>
  );
};

export default FlowStatsDashboard;