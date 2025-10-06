/**
 * ⚡ Energy Insights Dashboard
 *
 * Shows when you're most productive based on daily reflection data
 * REVOLUTIONARY: No other app does this!
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, Calendar, Brain, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { useEnergyScheduling } from '@/shared/services/energyScheduler';

export function EnergyInsightsDashboard() {
  const { getInsights, forecastDay } = useEnergyScheduling();
  const [insights, setInsights] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInsights = async () => {
      try {
        const [insightsData, forecastData] = await Promise.all([
          getInsights(),
          forecastDay(new Date())
        ]);
        setInsights(insightsData);
        setForecast(forecastData);
      } catch (error) {
        console.error('Failed to load energy insights:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, [getInsights, forecastDay]);

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border-purple-700/30">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-purple-700/30 rounded w-3/4" />
            <div className="h-4 bg-purple-700/30 rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insights) {
    return null;
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const energyPercentage = insights.averageEnergy * 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border-purple-700/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-300">
            <Brain className="h-5 w-5" />
            ⚡ Your Energy Patterns
            <Badge variant="outline" className="ml-auto text-xs border-purple-600">
              AI-Powered
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Average Energy */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-purple-300">Average Energy Level</span>
              <span className="text-lg font-bold text-purple-100">{energyPercentage.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-purple-900/30 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-purple-400 to-indigo-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${energyPercentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Peak Hours */}
          {insights.bestHoursOfDay && insights.bestHoursOfDay.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-300">Your Peak Hours</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {insights.bestHoursOfDay.map((hour: number) => (
                  <Badge
                    key={hour}
                    className="bg-purple-600/20 text-purple-200 border-purple-600/50"
                  >
                    {hour}:00 - {hour + 1}:00
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-purple-400/70 mt-2">
                💡 Schedule deep work during these hours for maximum productivity
              </p>
            </div>
          )}

          {/* Best Day */}
          {insights.bestDayOfWeek !== undefined && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-300">Most Productive Day</span>
              </div>
              <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-base px-4 py-1.5">
                {dayNames[insights.bestDayOfWeek]}
              </Badge>
              <p className="text-xs text-purple-400/70 mt-2">
                📊 Based on your historical performance
              </p>
            </div>
          )}

          {/* AI Recommendations */}
          {insights.recommendations && insights.recommendations.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-300">AI Recommendations</span>
              </div>
              <div className="space-y-2">
                {insights.recommendations.map((rec: string, index: number) => (
                  <div
                    key={index}
                    className="p-3 bg-purple-900/10 border border-purple-700/20 rounded-lg"
                  >
                    <p className="text-sm text-purple-100">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Energy Forecast for Today */}
          {forecast && forecast.peakHours && forecast.peakHours.length > 0 && (
            <div className="pt-4 border-t border-purple-700/20">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-purple-300">Today's Forecast</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {forecast.peakHours.slice(0, 3).map((hour: number) => (
                  <div
                    key={hour}
                    className="text-center p-2 bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-700/30 rounded-lg"
                  >
                    <div className="text-xs text-yellow-300">Peak</div>
                    <div className="text-lg font-bold text-yellow-100">{hour}:00</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * Compact version for sidebar/header
 */
export function EnergyBadge() {
  const { getInsights } = useEnergyScheduling();
  const [energy, setEnergy] = useState<number>(0);

  useEffect(() => {
    getInsights().then((insights) => {
      setEnergy(insights.averageEnergy * 10);
    });
  }, [getInsights]);

  const getColor = (level: number) => {
    if (level >= 80) return 'from-green-500 to-emerald-600';
    if (level >= 60) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  return (
    <Badge className={`bg-gradient-to-r ${getColor(energy)} text-white`}>
      <Zap className="h-3 w-3 mr-1" />
      {energy.toFixed(0)}% Energy
    </Badge>
  );
}
