import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface RateLimitStatusProps {
  rateLimits: Record<string, any>;
}

export function RateLimitStatus({ rateLimits }: RateLimitStatusProps) {
  if (!rateLimits) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Shield className="w-5 h-5 mr-2 text-orange-500" />
            Rate Limits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">No rate limit data available</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-400';
    if (percentage >= 75) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 90) return <AlertTriangle className="w-4 h-4 text-red-400" />;
    if (percentage >= 75) return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
    return <CheckCircle className="w-4 h-4 text-green-400" />;
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Shield className="w-5 h-5 mr-2 text-orange-500" />
          Rate Limits
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(rateLimits).map(([category, data]: [string, any]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-medium capitalize">{category}</h4>
                {getStatusIcon(Math.max(
                  data.percentUsed?.tokensPerMinute || 0,
                  data.percentUsed?.tokensPerHour || 0,
                  data.percentUsed?.requestsPerMinute || 0
                ))}
              </div>
              
              <div className="space-y-2">
                {/* Tokens per minute */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Tokens/Minute</span>
                    <span className={getStatusColor(data.percentUsed?.tokensPerMinute || 0)}>
                      {data.usage?.tokensThisMinute || 0} / {data.limits?.tokensPerMinute || 0}
                    </span>
                  </div>
                  <Progress 
                    value={data.percentUsed?.tokensPerMinute || 0} 
                    className="h-2"
                  />
                </div>

                {/* Tokens per hour */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Tokens/Hour</span>
                    <span className={getStatusColor(data.percentUsed?.tokensPerHour || 0)}>
                      {data.usage?.tokensThisHour || 0} / {data.limits?.tokensPerHour || 0}
                    </span>
                  </div>
                  <Progress 
                    value={data.percentUsed?.tokensPerHour || 0} 
                    className="h-2"
                  />
                </div>

                {/* Tokens per day */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Tokens/Day</span>
                    <span className={getStatusColor(data.percentUsed?.tokensPerDay || 0)}>
                      {data.usage?.tokensThisDay || 0} / {data.limits?.tokensPerDay || 0}
                    </span>
                  </div>
                  <Progress 
                    value={data.percentUsed?.tokensPerDay || 0} 
                    className="h-2"
                  />
                </div>

                {/* Requests per minute */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Requests/Minute</span>
                    <span className={getStatusColor(data.percentUsed?.requestsPerMinute || 0)}>
                      {data.usage?.requestsThisMinute || 0} / {data.limits?.requestsPerMinute || 0}
                    </span>
                  </div>
                  <Progress 
                    value={data.percentUsed?.requestsPerMinute || 0} 
                    className="h-2"
                  />
                </div>
              </div>

              {/* Time to reset */}
              <div className="flex justify-between text-xs text-gray-500">
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Next reset in:
                </div>
                <div>
                  {data.timeToReset?.minute || 0}s (min) • {data.timeToReset?.hour || 0}m (hour)
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Overall Status */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">System Status</span>
            <Badge className="bg-green-600 text-white">
              <CheckCircle className="w-3 h-3 mr-1" />
              Healthy
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}