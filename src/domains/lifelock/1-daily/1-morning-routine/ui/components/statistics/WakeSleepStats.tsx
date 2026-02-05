/**
 * WakeSleepStats - Line chart showing wake times and sleep hours
 */

import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format, startOfWeek, addDays, parse } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Moon, Sun } from 'lucide-react';

interface WakeSleepStatsProps {
  selectedDate: Date;
}

interface DaySleepData {
  day: string;
  wakeTime: number | null; // Stored as decimal hours (e.g., 6.5 = 6:30 AM)
  sleepHours: number | null;
}

// Mock data generator - in production this would come from actual sleep tracking
const generateMockSleepData = (weekStart: Date): DaySleepData[] => {
  const mockData = [
    { wakeTime: 6.5, sleepHours: 7.5 },  // Mon: 6:30 AM, 7.5h
    { wakeTime: 7.0, sleepHours: 7.0 },  // Tue: 7:00 AM, 7h
    { wakeTime: 7.5, sleepHours: 6.5 },  // Wed: 7:30 AM, 6.5h
    { wakeTime: 6.0, sleepHours: 8.0 },  // Thu: 6:00 AM, 8h
    { wakeTime: 8.0, sleepHours: 6.0 },  // Fri: 8:00 AM, 6h
    { wakeTime: 6.75, sleepHours: 7.0 }, // Sat: 6:45 AM, 7h
    { wakeTime: 7.0, sleepHours: 8.0 },  // Sun: 7:00 AM, 8h
  ];

  return Array.from({ length: 7 }, (_, i) => ({
    day: format(addDays(weekStart, i), 'EEE'),
    wakeTime: mockData[i]?.wakeTime ?? null,
    sleepHours: mockData[i]?.sleepHours ?? null,
  }));
};

const formatWakeTime = (decimalHours: number | null): string => {
  if (decimalHours === null) return '-';
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
};

export const WakeSleepStats: React.FC<WakeSleepStatsProps> = ({ selectedDate }) => {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });

  const data = useMemo(() => generateMockSleepData(weekStart), [weekStart]);

  const avgWakeTime = useMemo(() => {
    const validTimes = data.filter(d => d.wakeTime !== null).map(d => d.wakeTime as number);
    if (validTimes.length === 0) return null;
    return validTimes.reduce((a, b) => a + b, 0) / validTimes.length;
  }, [data]);

  const avgSleepHours = useMemo(() => {
    const validHours = data.filter(d => d.sleepHours !== null).map(d => d.sleepHours as number);
    if (validHours.length === 0) return null;
    const avg = validHours.reduce((a, b) => a + b, 0) / validHours.length;
    return Math.round(avg * 10) / 10;
  }, [data]);

  const sleepConsistency = useMemo(() => {
    if (!avgSleepHours) return null;
    const validHours = data.filter(d => d.sleepHours !== null).map(d => d.sleepHours as number);
    if (validHours.length < 2) return null;
    const variance = validHours.reduce((sum, h) => sum + Math.pow(h - avgSleepHours, 2), 0) / validHours.length;
    const stdDev = Math.sqrt(variance);
    // Lower std dev = higher consistency (max 100%)
    return Math.max(0, Math.round(100 - (stdDev * 20)));
  }, [data, avgSleepHours]);

  return (
    <Card className="bg-orange-900/20 border-orange-700/40">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="flex items-center justify-between text-orange-300 text-base">
          <div className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Sleep & Wake
          </div>
          <span className="text-sm text-orange-400/70">
            {sleepConsistency !== null ? `${sleepConsistency}% consistent` : '-'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        {/* Wake Time Chart */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Sun className="h-4 w-4 text-amber-400" />
            <span className="text-sm text-orange-200/80">Wake Time</span>
            <span className="text-xs text-orange-400/60 ml-auto">
              Avg: {formatWakeTime(avgWakeTime)}
            </span>
          </div>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: '#fb923c' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[5, 9]}
                  tick={{ fontSize: 9, fill: '#fb923c' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `${Math.floor(value)}:00`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length && payload[0].value) {
                      return (
                        <div className="bg-gray-900 border border-orange-500/30 rounded-lg px-3 py-2 shadow-lg">
                          <p className="text-orange-300 text-xs">{payload[0].payload.day}</p>
                          <p className="text-white text-sm font-bold">
                            {formatWakeTime(payload[0].value as number)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={7} stroke="#f97316" strokeDasharray="3 3" opacity={0.5} />
                <Line
                  type="monotone"
                  dataKey="wakeTime"
                  stroke="#fbbf24"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#fbbf24', stroke: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sleep Hours Chart */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Moon className="h-4 w-4 text-indigo-400" />
            <span className="text-sm text-orange-200/80">Sleep Duration</span>
            <span className="text-xs text-orange-400/60 ml-auto">
              Avg: {avgSleepHours}h
            </span>
          </div>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: '#fb923c' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[4, 10]}
                  tick={{ fontSize: 9, fill: '#fb923c' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `${value}h`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length && payload[0].value) {
                      return (
                        <div className="bg-gray-900 border border-orange-500/30 rounded-lg px-3 py-2 shadow-lg">
                          <p className="text-orange-300 text-xs">{payload[0].payload.day}</p>
                          <p className="text-white text-sm font-bold">
                            {payload[0].value} hours
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={8} stroke="#22c55e" strokeDasharray="3 3" opacity={0.5} label={{ value: 'Target', fill: '#22c55e', fontSize: 10 }} />
                <Line
                  type="monotone"
                  dataKey="sleepHours"
                  stroke="#818cf8"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#818cf8', stroke: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
