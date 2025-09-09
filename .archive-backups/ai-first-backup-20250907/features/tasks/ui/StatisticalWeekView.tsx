import React from 'react';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle2,
  Circle,
  Zap,
  TrendingUp,
  Target,
  Dumbbell,
  Brain,
  Coffee,
  Moon,
  Award
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { motion, PanInfo, useMotionValue } from 'framer-motion';
import { format, isSameDay } from 'date-fns';
import { calculateDailyPoints, calculateRealDailyPoints, calculateWeekSummary, calculateRealWeekSummary, DailyPoints } from '@/services/dailyPointsService';

interface TaskCard {
  id: string;
  date: Date;
  title: string;
  completed: boolean;
  tasks: {
    id: string;
    title: string;
    completed: boolean;
  }[];
}

interface StatisticalWeekViewProps {
  weekCards: TaskCard[];
  weekStart: Date;
  weekEnd: Date;
  onNavigateWeek: (direction: 'prev' | 'next') => void;
  onCardClick: (card: TaskCard) => void;
  className?: string;
}

export const StatisticalWeekView: React.FC<StatisticalWeekViewProps> = ({
  weekCards,
  weekStart,
  weekEnd,
  onNavigateWeek,
  onCardClick,
  className
}) => {
  const x = useMotionValue(0);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset > 100 || velocity > 500) {
      onNavigateWeek('prev');
    } else if (offset < -100 || velocity < -500) {
      onNavigateWeek('next');
    }
  };

  // Calculate daily points for each day using REAL task data
  const weekDailyPoints = weekCards.map(card => ({
    card,
    points: calculateRealDailyPoints(card)
  }));

  // Calculate week summary using REAL task data
  const weekSummary = calculateRealWeekSummary(weekCards);

  const StatDayCard = ({ card, points, index }: { 
    card: TaskCard; 
    points: DailyPoints; 
    index: number;
  }) => {
    const isToday = isSameDay(card.date, new Date());
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="cursor-pointer"
        onClick={() => onCardClick(card)}
      >
        <Card className={cn(
          'relative overflow-hidden transition-all duration-300 hover:scale-105',
          'bg-gradient-to-br from-gray-800/60 to-gray-900/40 border-gray-700/50',
          isToday && 'ring-2 ring-orange-500/80 border-orange-500/70 shadow-lg shadow-orange-500/20'
        )}>
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-yellow-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          
          <CardHeader className="p-2 pb-1">
            <div className="flex items-start justify-between">
              {/* Left: Day info with inline today badge */}
              <div className="flex items-center space-x-1.5">
                <div>
                  <h3 className="font-bold text-sm text-white leading-none">
                    {format(card.date, 'EEE')}
                  </h3>
                  <p className="text-[10px] text-gray-300 leading-none mt-0.5">
                    {format(card.date, 'MMM d')}
                  </p>
                </div>
                {isToday && (
                  <Badge variant="secondary" className="text-[8px] px-1 py-0.5 bg-orange-500/20 text-orange-300 border-orange-500/40">
                    Today
                  </Badge>
                )}
              </div>
              
              {/* Right: Grade and points summary combined */}
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <div className="text-base font-bold text-white leading-none">{points.totalPoints}</div>
                    <div className="text-[9px] text-gray-400 leading-none">/ {points.maxTotalPoints} pts</div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      'text-xs font-bold px-1.5 py-1',
                      points.grade === 'A+' || points.grade === 'A' ? 'border-emerald-400 text-emerald-300 bg-emerald-500/20' :
                      points.grade === 'B+' || points.grade === 'B' ? 'border-blue-400 text-blue-300 bg-blue-500/20' :
                      points.grade === 'C+' || points.grade === 'C' ? 'border-yellow-400 text-yellow-300 bg-yellow-500/20' :
                      'border-red-400 text-red-300 bg-red-500/20'
                    )}
                  >
                    {points.grade}
                  </Badge>
                </div>
                <div className="text-sm text-orange-400 font-bold mt-0.5">{points.percentage}%</div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-2 pt-0">
            <div className="space-y-2">

              {/* Progress Bar - Thinner */}
              <div className="w-full bg-gray-800/60 rounded-full h-1.5 shadow-inner border border-orange-400/30">
                <div 
                  className="bg-gradient-to-r from-orange-400 via-amber-300 to-emerald-400 h-1.5 rounded-full transition-all duration-700 relative overflow-hidden shadow-lg"
                  style={{ width: `${points.percentage}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/25 to-transparent"></div>
                </div>
              </div>

              {/* Key Statistics - Condensed grid layout */}
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                {/* Morning & Evening */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Coffee className="h-2.5 w-2.5 text-orange-400" />
                    <span className="text-gray-300">Morning</span>
                  </div>
                  {points.morningRoutine.completed ? (
                    <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
                  ) : (
                    <Circle className="h-2.5 w-2.5 text-gray-500" />
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Moon className="h-2.5 w-2.5 text-purple-400" />
                    <span className="text-gray-300">Evening</span>
                  </div>
                  {points.eveningCheckout.completed ? (
                    <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
                  ) : (
                    <Circle className="h-2.5 w-2.5 text-gray-500" />
                  )}
                </div>

                {/* Tasks Summary */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Zap className="h-2.5 w-2.5 text-yellow-400" />
                    <span className="text-gray-300">Light</span>
                  </div>
                  <span className="text-gray-200 font-medium">
                    {points.lightTasks.completed}/{points.lightTasks.total}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Target className="h-2.5 w-2.5 text-red-400" />
                    <span className="text-gray-300">Heavy</span>
                  </div>
                  <span className="text-gray-200 font-medium">
                    {points.heavyTasks.completed}/{points.heavyTasks.total}
                  </span>
                </div>

                {/* Focus Work */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Brain className="h-2.5 w-2.5 text-blue-400" />
                    <span className="text-gray-300">Focus</span>
                  </div>
                  <span className="text-gray-200 font-medium">
                    {points.focusWork.deepWorkHours}h
                  </span>
                </div>

                {/* Health Score */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Dumbbell className="h-2.5 w-2.5 text-green-400" />
                    <span className="text-gray-300">Health</span>
                  </div>
                  <span className="text-gray-200 font-medium">
                    {Math.round((points.healthHabits.points / points.healthHabits.maxPoints) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className={cn('block sm:hidden', className)}>
      <motion.div
        drag="x"
        dragConstraints={{ left: -50, right: 50 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="cursor-grab active:cursor-grabbing"
      >
        <Card className="bg-gradient-to-br from-black/80 via-gray-900/60 to-black/80 backdrop-blur-xl border border-orange-500/30 shadow-lg shadow-orange-500/10">
          <CardHeader className="p-3 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white mb-0.5">
                  <Calendar className="h-3.5 w-3.5 mr-1.5 text-orange-400 inline" />
                  This Week Analytics
                </h2>
                <p className="text-orange-200/80 text-xs">
                  {weekStart && weekEnd && !isNaN(weekStart.getTime()) && !isNaN(weekEnd.getTime()) ? 
                    `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}` : 
                    'Loading...'
                  }
                </p>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigateWeek('prev')}
                  className="h-6 w-6 p-0 bg-black/50 border-orange-500/30 text-orange-300 hover:bg-orange-500/20"
                >
                  <ChevronLeft className="h-2.5 w-2.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigateWeek('next')}
                  className="h-6 w-6 p-0 bg-black/50 border-orange-500/30 text-orange-300 hover:bg-orange-500/20"
                >
                  <ChevronRight className="h-2.5 w-2.5" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-3 pt-0">
            {/* Swipe hint */}
            <div className="flex items-center justify-center mb-2 text-[10px] text-gray-500">
              <Zap className="h-2.5 w-2.5 mr-1" />
              <span>Swipe to navigate weeks</span>
            </div>

            {/* Week Summary Stats */}
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              <div className="text-center p-1.5 bg-gray-800/50 rounded border border-gray-700/50">
                <div className="text-[10px] text-gray-400">Total Points</div>
                <div className="text-xs font-semibold text-orange-400">
                  {weekSummary.totalPoints}
                </div>
              </div>
              <div className="text-center p-1.5 bg-gray-800/50 rounded border border-gray-700/50">
                <div className="text-[10px] text-gray-400">Average</div>
                <div className="text-xs font-semibold text-blue-400">
                  {weekSummary.averageDaily}
                </div>
              </div>
              <div className="text-center p-1.5 bg-gray-800/50 rounded border border-gray-700/50">
                <div className="text-[10px] text-gray-400">Week %</div>
                <div className="text-xs font-semibold text-green-400">
                  {weekSummary.percentage}%
                </div>
              </div>
              <div className="text-center p-1.5 bg-gray-800/50 rounded border border-gray-700/50">
                <div className="text-[10px] text-gray-400">Streaks</div>
                <div className="text-xs font-semibold text-purple-400">
                  {Math.max(...Object.values(weekSummary.streaks))}
                </div>
              </div>
            </div>
            
            {/* Daily Cards Grid - Compact Mobile Layout */}
            <div className="grid grid-cols-1 gap-2">
              {weekDailyPoints.map((item, index) => (
                <StatDayCard 
                  key={item.card.id} 
                  card={item.card} 
                  points={item.points} 
                  index={index} 
                />
              ))}
            </div>

            {/* Weekly Insights - Compact */}
            <div className="mt-3 p-2 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded border border-purple-500/30">
              <div className="flex items-center space-x-1.5 mb-1.5">
                <Award className="h-3 w-3 text-purple-400" />
                <span className="text-xs font-semibold text-purple-200">Week Insights</span>
              </div>
              <div className="text-[10px] text-gray-300 space-y-0.5">
                <div>🔥 Best day: {weekCards[weekSummary.bestDay] ? format(weekCards[weekSummary.bestDay].date, 'EEEE') : 'N/A'}</div>
                <div>💪 Exercise streak: {weekSummary.streaks.exercise} days</div>
                <div>🌅 Morning routine: {weekSummary.streaks.morningRoutine}/7 days</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default StatisticalWeekView;// Cache bust v2.0 - Thu Aug 21 14:41:34 BST 2025
