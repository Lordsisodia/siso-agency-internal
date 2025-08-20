import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Target,
  Activity,
  AlertTriangle 
} from 'lucide-react';

const DailySpendingTracker = () => {
  const [dailyData, setDailyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState({});

  useEffect(() => {
    fetchDailySpending();
  }, []);

  const fetchDailySpending = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/usage/daily-spending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDailyData(data.daily_spending);
        setInsights(calculateInsights(data.daily_spending));
      }
    } catch (error) {
      console.error('Failed to fetch daily spending:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateInsights = (data) => {
    if (data.length < 2) return {};
    
    const recent7Days = data.slice(-7);
    const previous7Days = data.slice(-14, -7);
    
    const recent7DaysSpend = recent7Days.reduce((sum, day) => sum + day.daily_cost, 0);
    const previous7DaysSpend = previous7Days.reduce((sum, day) => sum + day.daily_cost, 0);
    
    const weeklyTrend = ((recent7DaysSpend - previous7DaysSpend) / previous7DaysSpend) * 100;
    
    const avgDailySpend = data.reduce((sum, day) => sum + day.daily_cost, 0) / data.length;
    const maxDailySpend = Math.max(...data.map(day => day.daily_cost));
    const minDailySpend = Math.min(...data.map(day => day.daily_cost));
    
    // Detect anomalies (days with >3x average spend)
    const anomalies = data.filter(day => day.daily_cost > avgDailySpend * 3);
    
    // Efficiency trends (cost per API call)
    const avgEfficiency = data.reduce((sum, day) => sum + day.avg_cost_per_call, 0) / data.length;
    const recentEfficiency = recent7Days.reduce((sum, day) => sum + day.avg_cost_per_call, 0) / recent7Days.length;
    const efficiencyTrend = ((recentEfficiency - avgEfficiency) / avgEfficiency) * 100;
    
    return {
      weeklyTrend,
      avgDailySpend,
      maxDailySpend,
      minDailySpend,
      anomalies: anomalies.length,
      efficiencyTrend,
      avgEfficiency,
      recentEfficiency,
      totalDays: data.length
    };
  };

  const formatCurrency = (amount) => `$${amount.toFixed(2)}`;
  
  const getTrendIcon = (trend) => {
    if (trend > 5) return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (trend < -5) return <TrendingDown className="w-4 h-4 text-green-500" />;
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  const getTrendColor = (trend) => {
    if (trend > 5) return 'text-red-600 bg-red-50 border-red-200';
    if (trend < -5) return 'text-green-600 bg-green-50 border-green-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-sm text-gray-500">Loading spending analysis...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Spending Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Daily</p>
                <p className="text-2xl font-bold">{formatCurrency(insights.avgDailySpend)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3">
                <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Weekly Trend</p>
                <div className="flex items-center gap-1">
                  <p className="text-2xl font-bold">{Math.abs(insights.weeklyTrend || 0).toFixed(1)}%</p>
                  {getTrendIcon(insights.weeklyTrend || 0)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mr-3">
                <Activity className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Peak Day</p>
                <p className="text-2xl font-bold">{formatCurrency(insights.maxDailySpend)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3">
                <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Days Tracked</p>
                <p className="text-2xl font-bold">{insights.totalDays}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights and Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Spending Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-sm font-medium">Daily Range</span>
              <span className="text-sm">
                {formatCurrency(insights.minDailySpend)} - {formatCurrency(insights.maxDailySpend)}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-sm font-medium">Cost Efficiency</span>
              <Badge className={getTrendColor(insights.efficiencyTrend)}>
                {insights.efficiencyTrend > 0 ? '+' : ''}{insights.efficiencyTrend?.toFixed(1)}%
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-sm font-medium">Avg Cost/Call</span>
              <span className="text-sm font-mono">
                ${insights.recentEfficiency?.toFixed(4)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Usage Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.anomalies > 0 && (
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  High Spend Days Detected
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  {insights.anomalies} days with 3x+ average spending
                </p>
              </div>
            )}

            {Math.abs(insights.weeklyTrend) > 20 && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Significant Trend Change
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Weekly spending {insights.weeklyTrend > 0 ? 'increased' : 'decreased'} by {Math.abs(insights.weeklyTrend).toFixed(1)}%
                </p>
              </div>
            )}

            {Math.abs(insights.weeklyTrend) <= 10 && insights.anomalies === 0 && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Stable Usage Pattern
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Your spending patterns look consistent and predictable
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Daily Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Daily Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {dailyData.slice(-7).reverse().map((day, index) => (
              <div key={day.date} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div>
                    <p className="font-medium">{day.date}</p>
                    <p className="text-xs text-gray-500">{day.api_calls} API calls • {day.unique_sessions} sessions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(day.daily_cost)}</p>
                  <p className="text-xs text-gray-500">${day.avg_cost_per_call?.toFixed(4)}/call</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailySpendingTracker;