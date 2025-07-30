import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Circle,
  Zap,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { format, isSameDay } from 'date-fns';

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

interface MobileWeekViewProps {
  weekCards: TaskCard[];
  weekStart: Date;
  weekEnd: Date;
  onNavigateWeek: (direction: 'prev' | 'next') => void;
  onCardClick: (card: TaskCard) => void;
  className?: string;
}

export const MobileWeekView: React.FC<MobileWeekViewProps> = ({
  weekCards,
  weekStart,
  weekEnd,
  onNavigateWeek,
  onCardClick,
  className
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset > 100 || velocity > 500) {
      // Swipe right - previous week
      onNavigateWeek('prev');
    } else if (offset < -100 || velocity < -500) {
      // Swipe left - next week
      onNavigateWeek('next');
    }
  };

  const MobileWeekCard = ({ card, index }: { card: TaskCard; index: number }) => {
    const isToday = isSameDay(card.date, new Date());
    const completedTasks = card.tasks.filter(task => task.completed).length;
    const totalTasks = card.tasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

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
          card.completed 
            ? 'border-green-500/50 bg-gradient-to-br from-green-900/20 to-gray-800/60 shadow-lg shadow-green-500/10' 
            : 'bg-gradient-to-br from-gray-800/60 to-gray-900/40 border-gray-700/50',
          isToday && 'ring-2 ring-orange-500/80 border-orange-500/70 shadow-lg shadow-orange-500/20'
        )}>
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-yellow-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          
          <CardHeader className="p-3 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-white">
                  {format(card.date, 'EEE')}
                </h3>
                <p className="text-xs text-gray-400">
                  {format(card.date, 'MMM d')}
                </p>
              </div>
              <div className="flex items-center space-x-1">
                {isToday && (
                  <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-300 border-orange-500/40">
                    Today
                  </Badge>
                )}
                {card.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Circle className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-3 pt-0">
            <div className="space-y-2">
              {/* Progress */}
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{completedTasks}/{totalTasks}</span>
                <span>{Math.round(completionRate)}%</span>
              </div>
              
              <div className="w-full bg-black/40 backdrop-blur-sm rounded-full h-2 shadow-inner border border-orange-500/20">
                <div 
                  className="bg-gradient-to-r from-orange-500 via-yellow-400 to-green-500 h-2 rounded-full transition-all duration-700 relative overflow-hidden"
                  style={{ width: `${completionRate}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse"></div>
                </div>
              </div>

              {/* Task Preview */}
              <div className="space-y-1">
                {card.tasks.slice(0, 2).map((task) => (
                  <div key={task.id} className="flex items-center space-x-1 text-xs">
                    {task.completed ? (
                      <CheckCircle2 className="h-2 w-2 text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle className="h-2 w-2 text-gray-400 flex-shrink-0" />
                    )}
                    <span className={cn(
                      'truncate text-xs',
                      task.completed ? 'line-through text-gray-500' : 'text-gray-300'
                    )}>
                      {task.title}
                    </span>
                  </div>
                ))}
                {card.tasks.length > 2 && (
                  <div className="text-xs text-gray-500 ml-3">
                    +{card.tasks.length - 2} more
                  </div>
                )}
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
        ref={containerRef}
        drag="x"
        dragConstraints={{ left: -50, right: 50 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="cursor-grab active:cursor-grabbing"
      >
        <Card className="bg-gradient-to-br from-black/80 via-gray-900/60 to-black/80 backdrop-blur-xl border border-orange-500/30 shadow-lg shadow-orange-500/10">
          <CardHeader className="p-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">
                  <Calendar className="h-4 w-4 mr-2 text-orange-400 inline" />
                  This Week
                </h2>
                <p className="text-orange-200/80 text-sm">
                  {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d')}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigateWeek('prev')}
                  className="h-8 w-8 p-0 bg-black/50 border-orange-500/30 text-orange-300 hover:bg-orange-500/20"
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigateWeek('next')}
                  className="h-8 w-8 p-0 bg-black/50 border-orange-500/30 text-orange-300 hover:bg-orange-500/20"
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 pt-0">
            {/* Swipe hint */}
            <div className="flex items-center justify-center mb-4 text-xs text-gray-500">
              <Zap className="h-3 w-3 mr-1" />
              <span>Swipe to navigate weeks</span>
            </div>

            {/* Week Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center p-2 bg-gray-800/50 rounded-lg">
                <div className="text-xs text-gray-400">Completed</div>
                <div className="text-sm font-semibold text-green-400">
                  {weekCards.reduce((acc, card) => acc + card.tasks.filter(t => t.completed).length, 0)}
                </div>
              </div>
              <div className="text-center p-2 bg-gray-800/50 rounded-lg">
                <div className="text-xs text-gray-400">Total</div>
                <div className="text-sm font-semibold text-orange-400">
                  {weekCards.reduce((acc, card) => acc + card.tasks.length, 0)}
                </div>
              </div>
              <div className="text-center p-2 bg-gray-800/50 rounded-lg">
                <div className="text-xs text-gray-400">Rate</div>
                <div className="text-sm font-semibold text-yellow-400">
                  {Math.round(
                    (weekCards.reduce((acc, card) => acc + card.tasks.filter(t => t.completed).length, 0) /
                    weekCards.reduce((acc, card) => acc + card.tasks.length, 0)) * 100
                  )}%
                </div>
              </div>
            </div>

            {/* Week Cards Grid */}
            <div className="grid grid-cols-2 gap-2">
              {weekCards.map((card, index) => (
                <MobileWeekCard key={card.id} card={card} index={index} />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default MobileWeekView;