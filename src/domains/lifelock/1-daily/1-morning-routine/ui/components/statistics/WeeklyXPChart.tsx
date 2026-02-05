/**
 * WeeklyXPChart - Bar chart showing XP earned each day of the week
 */

import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { GamificationService } from '@/domains/lifelock/_shared/services/gamificationService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface WeeklyXPChartProps {
  selectedDate: Date;
}

interface DayData {
  day: string;
  fullDate: Date;
  xp: number;
  isToday: boolean;
}

export const WeeklyXPChart: React.FC<WeeklyXPChartProps> = ({ selectedDate }) => {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday start
  const today = new Date();

  // Generate data for the week
  const data: DayData[] = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    const dayLabel = format(date, 'EEE'); // Mon, Tue, etc.
    const dailyStats = GamificationService.getDailyXPBreakdown(date);

    return {
      day: dayLabel,
      fullDate: date,
      xp: dailyStats?.totalXP || 0,
      isToday: isSameDay(date, today),
    };
  });

  const totalXP = data.reduce((sum, d) => sum + d.xp, 0);
  const averageXP = Math.round(totalXP / 7);
  const bestDay = data.reduce((max, d) => (d.xp > max.xp ? d : max), data[0]);

  return (
    <Card className="bg-orange-900/20 border-orange-700/40">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="flex items-center justify-between text-orange-300 text-base">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Weekly XP
          </div>
          <span className="text-sm text-orange-400/70">{totalXP} total</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 5, bottom: 5, left: -20 }}>
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: '#fb923c' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as DayData;
                    return (
                      <div className="bg-gray-900 border border-orange-500/30 rounded-lg px-3 py-2 shadow-lg">
                        <p className="text-orange-300 text-sm font-medium">
                          {format(data.fullDate, 'EEEE, MMM d')}
                        </p>
                        <p className="text-white text-lg font-bold">{data.xp} XP</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="xp" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isToday ? '#f97316' : 'url(#xpGradient)'}
                    stroke={entry.isToday ? '#fb923c' : 'none'}
                    strokeWidth={entry.isToday ? 2 : 0}
                  />
                ))}
                <defs>
                  <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-orange-700/30">
          <div className="text-center">
            <p className="text-xs text-orange-400/70 uppercase tracking-wide">Daily Average</p>
            <p className="text-xl font-bold text-orange-300">{averageXP}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-orange-400/70 uppercase tracking-wide">Best Day</p>
            <p className="text-xl font-bold text-orange-300">
              {bestDay?.xp > 0 ? `${bestDay.day} (${bestDay.xp})` : '-'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
