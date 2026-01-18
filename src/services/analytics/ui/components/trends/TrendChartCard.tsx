/**
 * Trend Chart Card
 *
 * 30-day XP trend with sparkline chart and statistics
 */

import { motion } from 'framer-motion';
import { TrendingUp, Activity } from 'lucide-react';
import { TrendIndicator } from '../shared';
import type { TrendData } from '../../../types/xpAnalytics.types';
import { cn } from '@/lib/utils';

interface TrendChartCardProps {
  data: TrendData;
}

export function TrendChartCard({ data }: TrendChartCardProps) {
  if (data.points.length === 0) {
    return (
      <motion.div
        className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <p className="text-center text-gray-500">No trend data available yet</p>
      </motion.div>
    );
  }

  const maxXP = Math.max(...data.points.map(p => p.xp), 1);
  const minXP = Math.min(...data.points.map(p => p.xp));
  const range = maxXP - minXP || 1;

  // Generate SVG path for the trend line
  const chartWidth = 800;
  const chartHeight = 200;
  const padding = 20;

  const points = data.points.map((point, index) => {
    const x = padding + (index / (data.points.length - 1)) * (chartWidth - 2 * padding);
    const y = chartHeight - padding - ((point.xp - minXP) / range) * (chartHeight - 2 * padding);
    return `${x},${y}`;
  });

  const pathData = points.join(' ');

  // Generate area path (closed loop for fill)
  const areaPath = `${pathData} ${chartWidth - padding},${chartHeight - padding} ${padding},${chartHeight - padding} Z`;

  return (
    <motion.div
      className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg">
            <Activity className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">30-Day Trend</h3>
            <p className="text-sm text-gray-400">XP over time</p>
          </div>
        </div>
        <TrendIndicator trend={data.trend} percent={data.trendPercent} label="vs previous" />
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div>
          <p className="text-lg font-bold text-white">{data.average}</p>
          <p className="text-xs text-gray-400">Daily avg</p>
        </div>
        <div>
          <p className="text-lg font-bold text-green-400">{data.maximum}</p>
          <p className="text-xs text-gray-400">Best day</p>
        </div>
        <div>
          <p className="text-lg font-bold text-gray-400">{data.minimum}</p>
          <p className="text-xs text-gray-400">Lowest</p>
        </div>
        <div>
          <p className="text-lg font-bold text-orange-400">{data.bestStreakInPeriod}</p>
          <p className="text-xs text-gray-400">Best streak</p>
        </div>
      </div>

      {/* Chart */}
      <div className="relative w-full h-48 mb-4">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(percent => (
            <line
              key={percent}
              x1={padding}
              y1={padding + percent * (chartHeight - 2 * padding)}
              x2={chartWidth - padding}
              y2={padding + percent * (chartHeight - 2 * padding)}
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="1"
            />
          ))}

          {/* Area fill */}
          <motion.path
            d={areaPath}
            fill="url(#gradient)"
            opacity={0.3}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ duration: 1, delay: 0.8 }}
          />

          {/* Line */}
          <motion.path
            d={pathData}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.7, ease: 'easeInOut' }}
          />

          {/* Data points */}
          {data.points.map((point, index) => {
            const x = padding + (index / (data.points.length - 1)) * (chartWidth - 2 * padding);
            const y = chartHeight - padding - ((point.xp - minXP) / range) * (chartHeight - 2 * padding);

            return (
              <motion.circle
                key={point.date}
                cx={x}
                cy={y}
                r={point.xp === data.maximum ? 6 : 4}
                fill={point.xp === data.maximum ? '#22C55E' : '#8B5CF6'}
                opacity={point.xp === data.maximum ? 1 : 0.6}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8 + index * 0.01 }}
              />
            );
          })}

          {/* Gradients */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Comparison */}
      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
        <span className="text-sm text-gray-400">Previous 30 days</span>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-500">{data.comparisonWithPrevious.previous30Days.toLocaleString()} XP</p>
            <p className="text-xs text-gray-500">{data.comparisonWithPrevious.current30Days.toLocaleString()} XP</p>
          </div>
          <TrendIndicator
            trend={data.comparisonWithPrevious.difference > 0 ? 'up' : 'down'}
            percent={Math.abs(data.comparisonWithPrevious.percentChange)}
            size="sm"
          />
        </div>
      </div>
    </motion.div>
  );
}
