/**
 * CalorieTracker - Bar chart showing daily calorie intake with target line
 */

import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Target, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CalorieTrackerProps {
  selectedDate: Date;
}

interface DayCalorieData {
  day: string;
  fullDate: Date;
  calories: number;
  isToday: boolean;
}

const DEFAULT_TARGET = 2200;

// Mock data generator - in production this would come from actual nutrition tracking
const generateMockCalorieData = (weekStart: Date, today: Date): DayCalorieData[] => {
  const mockCalories = [2200, 2100, 2300, 2000, 2500, 2100, 2200];

  return Array.from({ length: 7 }, (_, i) => ({
    day: format(addDays(weekStart, i), 'EEE'),
    fullDate: addDays(weekStart, i),
    calories: mockCalories[i] ?? 0,
    isToday: isSameDay(addDays(weekStart, i), today),
  }));
};

export const CalorieTracker: React.FC<CalorieTrackerProps> = ({ selectedDate }) => {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const today = new Date();
  const [targetCalories, setTargetCalories] = useState(DEFAULT_TARGET);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [tempTarget, setTempTarget] = useState(String(DEFAULT_TARGET));

  const data = useMemo(() => generateMockCalorieData(weekStart, today), [weekStart, today]);

  const stats = useMemo(() => {
    const total = data.reduce((sum, d) => sum + d.calories, 0);
    const avg = Math.round(total / 7);
    const daysOnTarget = data.filter(d => d.calories <= targetCalories && d.calories > 0).length;
    const todayCalories = data.find(d => d.isToday)?.calories ?? 0;
    return { total, avg, daysOnTarget, todayCalories };
  }, [data, targetCalories]);

  const handleSaveTarget = () => {
    const newTarget = parseInt(tempTarget, 10);
    if (!isNaN(newTarget) && newTarget > 0) {
      setTargetCalories(newTarget);
    }
    setIsEditingTarget(false);
  };

  const getCalorieColor = (calories: number): string => {
    const diff = calories - targetCalories;
    if (diff <= -200) return '#22c55e'; // Under target (green)
    if (diff <= 200) return '#f59e0b'; // Near target (amber)
    return '#ef4444'; // Over target (red)
  };

  return (
    <Card className="bg-orange-900/20 border-orange-700/40">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="flex items-center justify-between text-orange-300 text-base">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            Calorie Tracking
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-orange-400/70">
              {stats.daysOnTarget}/7 days on target
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-orange-400/70 hover:text-orange-300 hover:bg-orange-900/30"
              onClick={() => setIsEditingTarget(!isEditingTarget)}
            >
              {isEditingTarget ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        {/* Target Editor */}
        {isEditingTarget && (
          <div className="mb-4 p-3 bg-orange-900/30 rounded-lg border border-orange-700/30">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-400" />
              <span className="text-sm text-orange-200">Daily Target:</span>
              <Input
                type="number"
                value={tempTarget}
                onChange={(e) => setTempTarget(e.target.value)}
                className="w-24 h-8 bg-orange-900/50 border-orange-700/50 text-white text-sm"
              />
              <span className="text-sm text-orange-400/70">kcal</span>
              <Button
                size="sm"
                className="h-8 ml-auto bg-orange-600 hover:bg-orange-500 text-white"
                onClick={handleSaveTarget}
              >
                Save
              </Button>
            </div>
          </div>
        )}

        {/* Today's Quick Stat */}
        <div className="flex items-center justify-between mb-4 p-3 bg-orange-900/30 rounded-lg">
          <div>
            <p className="text-xs text-orange-400/70 uppercase tracking-wide">Today</p>
            <p className={`text-2xl font-bold ${
              stats.todayCalories > targetCalories ? 'text-red-400' : 'text-orange-300'
            }`}>
              {stats.todayCalories}
              <span className="text-sm font-normal text-orange-400/70 ml-1">kcal</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-orange-400/70 uppercase tracking-wide">Target</p>
            <p className="text-xl font-bold text-orange-300">{targetCalories}</p>
          </div>
        </div>

        {/* Calorie Chart */}
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
                    const data = payload[0].payload as DayCalorieData;
                    const diff = data.calories - targetCalories;
                    return (
                      <div className="bg-gray-900 border border-orange-500/30 rounded-lg px-3 py-2 shadow-lg">
                        <p className="text-orange-300 text-sm font-medium">
                          {format(data.fullDate, 'EEEE, MMM d')}
                        </p>
                        <p className="text-white text-lg font-bold">{data.calories} kcal</p>
                        <p className={`text-xs ${
                          diff > 0 ? 'text-red-400' : diff < -200 ? 'text-green-400' : 'text-amber-400'
                        }`}>
                          {diff > 0 ? `+${diff} over target` : diff < -200 ? `${Math.abs(diff)} under target` : 'On target'}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                y={targetCalories}
                stroke="#f97316"
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{
                  value: `Target: ${targetCalories}`,
                  fill: '#f97316',
                  fontSize: 10,
                  position: 'right'
                }}
              />
              <Bar dataKey="calories" radius={[4, 4, 0, 0]} maxBarSize={35}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getCalorieColor(entry.calories)}
                    stroke={entry.isToday ? '#fb923c' : 'none'}
                    strokeWidth={entry.isToday ? 2 : 0}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-orange-700/30">
          <div className="text-center">
            <p className="text-xs text-orange-400/70 uppercase tracking-wide">Daily Average</p>
            <p className="text-xl font-bold text-orange-300">{stats.avg}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-orange-400/70 uppercase tracking-wide">Weekly Total</p>
            <p className="text-xl font-bold text-orange-300">{stats.total}</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-orange-700/30">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span className="text-xs text-orange-400/70">Under</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-amber-500" />
            <span className="text-xs text-orange-400/70">On Target</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span className="text-xs text-orange-400/70">Over</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
