import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, AlertCircle, Info } from 'lucide-react';

interface TokenUsageChartProps {
  tokenUsage: any;
}

export function TokenUsageChart({ tokenUsage }: TokenUsageChartProps) {
  // Mock data since we don't have real token usage yet
  const mockUsage = {
    totalTokens: 45230,
    totalCost: 36.18,
    serviceBreakdown: {
      'claude-code': { tokens: 30150, cost: 24.12, count: 15 },
      'anthropic-api': { tokens: 12080, cost: 9.66, count: 8 },
      'openai': { tokens: 3000, cost: 2.40, count: 5 }
    },
    dailyUsage: [
      { date: '2025-01-20', tokens: 8500, cost: 6.80 },
      { date: '2025-01-21', tokens: 12300, cost: 9.84 },
      { date: '2025-01-22', tokens: 9800, cost: 7.84 },
      { date: '2025-01-23', tokens: 6200, cost: 4.96 },
      { date: '2025-01-24', tokens: 8430, cost: 6.74 }
    ],
    alerts: [
      { type: 'warning', message: 'Daily usage at 85% of limit' }
    ]
  };

  const usage = tokenUsage || mockUsage;

  const getServiceColor = (service: string) => {
    const colors: Record<string, string> = {
      'claude-code': 'bg-orange-600',
      'anthropic-api': 'bg-blue-600',
      'openai': 'bg-green-600',
      'custom': 'bg-purple-600'
    };
    return colors[service] || 'bg-gray-600';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-orange-500" />
          Token Usage & Costs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {formatNumber(usage.totalTokens)}
              </div>
              <div className="text-sm text-gray-400">Total Tokens</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {formatCurrency(usage.totalCost)}
              </div>
              <div className="text-sm text-gray-400">Total Cost</div>
            </div>
          </div>

          {/* Service Breakdown */}
          <div>
            <h4 className="text-white font-medium mb-3">Service Breakdown</h4>
            <div className="space-y-3">
              {Object.entries(usage.serviceBreakdown).map(([service, data]: [string, any]) => (
                <div key={service} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <Badge className={`${getServiceColor(service)} text-white mr-3`}>
                      {service}
                    </Badge>
                    <div>
                      <div className="text-white font-medium">
                        {formatNumber(data.tokens)} tokens
                      </div>
                      <div className="text-sm text-gray-400">
                        {data.count} operations
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">
                      {formatCurrency(data.cost)}
                    </div>
                    <div className="text-sm text-gray-400">
                      ${(data.cost / data.tokens * 1000).toFixed(4)}/1K
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Usage Trend */}
          <div>
            <h4 className="text-white font-medium mb-3 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Daily Usage (Last 5 Days)
            </h4>
            <div className="space-y-2">
              {usage.dailyUsage.map((day: any, index: number) => {
                const maxTokens = Math.max(...usage.dailyUsage.map((d: any) => d.tokens));
                const percentage = (day.tokens / maxTokens) * 100;
                
                return (
                  <div key={day.date} className="flex items-center space-x-3">
                    <div className="w-16 text-sm text-gray-400">
                      {new Date(day.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-white">
                          {formatNumber(day.tokens)} tokens
                        </span>
                        <span className="text-sm text-gray-400">
                          {formatCurrency(day.cost)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Alerts */}
          {usage.alerts && usage.alerts.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-700">
              <h4 className="text-white font-medium mb-3 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 text-yellow-500" />
                Usage Alerts
              </h4>
              <div className="space-y-2">
                {usage.alerts.map((alert: any, index: number) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg flex items-center ${
                      alert.type === 'warning' 
                        ? 'bg-yellow-900/20 border border-yellow-600' 
                        : alert.type === 'danger'
                        ? 'bg-red-900/20 border border-red-600'
                        : 'bg-blue-900/20 border border-blue-600'
                    }`}
                  >
                    {alert.type === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-500 mr-2" />}
                    {alert.type === 'danger' && <AlertCircle className="w-4 h-4 text-red-500 mr-2" />}
                    {alert.type === 'info' && <Info className="w-4 h-4 text-blue-500 mr-2" />}
                    <span className="text-white text-sm">{alert.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Budget Status */}
          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Monthly Budget Status</span>
              <div className="text-right">
                <div className="text-white font-medium">
                  {formatCurrency(usage.totalCost * 4.3)} / $1,000
                </div>
                <div className="text-sm text-gray-400">
                  {Math.round((usage.totalCost * 4.3 / 1000) * 100)}% used
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((usage.totalCost * 4.3 / 1000) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}