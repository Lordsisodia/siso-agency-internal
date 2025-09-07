import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sunrise, 
  Target, 
  CheckCircle2,
  Circle,
  Coffee,
  Book,
  Dumbbell,
  Brain,
  Calendar,
  Clock,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Textarea } from '@/shared/ui/textarea';
import { MobileTodayCard } from '../mobile/MobileTodayCard';
import { InteractiveTodayCard } from './InteractiveTodayCard';
import { CustomTaskInput } from '../forms/CustomTaskInput';
import { TabProps } from '../DayTabContainer';

interface Habit {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
  streak: number;
}

const defaultHabits: Habit[] = [
  { id: 'hydrate', name: 'Drink water', icon: Coffee, completed: false, streak: 3 },
  { id: 'exercise', name: 'Morning exercise', icon: Dumbbell, completed: false, streak: 2 },
  { id: 'meditate', name: 'Meditation', icon: Brain, completed: false, streak: 5 },
  { id: 'read', name: 'Reading', icon: Book, completed: false, streak: 1 },
];

export const MorningRoutineTab: React.FC<TabProps> = ({
  user,
  todayCard,
  refreshTrigger,
  onRefresh,
  onTaskToggle,
  onQuickAdd,
  onCustomTaskAdd,
  onCardClick
}) => {
  const [habits, setHabits] = useState<Habit[]>(defaultHabits);
  const [dailyIntention, setDailyIntention] = useState('');
  const [morningNotes, setMorningNotes] = useState('');

  const toggleHabit = (habitId: string) => {
    setHabits(prev => prev.map(habit => 
      habit.id === habitId 
        ? { 
            ...habit, 
            completed: !habit.completed,
            streak: !habit.completed ? habit.streak + 1 : Math.max(0, habit.streak - 1)
          }
        : habit
    ));
  };

  const completedHabits = habits.filter(h => h.completed).length;
  const completionRate = (completedHabits / habits.length) * 100;

  return (
    <div className="p-4 space-y-6 bg-gradient-to-br from-black via-gray-900 to-black min-h-full">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
            <Sunrise className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Good Morning</h1>
            <p className="text-gray-400 text-sm">Start your day with intention</p>
          </div>
        </div>
        
        {/* Time & Date */}
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-300">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </motion.div>

      {/* Daily Intention */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 border-orange-400/30 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-orange-400" />
              <h3 className="text-lg font-semibold text-white">Today's Intention</h3>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="What's your main focus for today? Set your daily intention..."
              value={dailyIntention}
              onChange={(e) => setDailyIntention(e.target.value)}
              className="bg-gray-800/60 border-gray-600/50 text-white placeholder-gray-500 resize-none"
              rows={3}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Morning Habits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 border-green-400/30 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <h3 className="text-lg font-semibold text-white">Morning Habits</h3>
              </div>
              <Badge 
                className="bg-green-500/20 text-green-300 border-green-500/40"
              >
                {completedHabits}/{habits.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Progress Bar */}
            <div className="w-full bg-gray-800/60 backdrop-blur-sm rounded-full h-3 shadow-inner border border-green-400/30">
              <motion.div 
                className="bg-gradient-to-r from-green-400 via-emerald-300 to-green-500 h-3 rounded-full shadow-lg relative overflow-hidden"
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent"></div>
              </motion.div>
            </div>

            {/* Habit List */}
            <div className="space-y-2">
              {habits.map((habit, index) => {
                const Icon = habit.icon;
                return (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    onClick={() => toggleHabit(habit.id)}
                    className={`
                      flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200
                      ${habit.completed 
                        ? 'bg-green-500/20 border-green-400/50 shadow-md shadow-green-500/10' 
                        : 'bg-gray-800/40 border-gray-700/50 hover:border-green-400/30 hover:bg-green-500/10'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`
                        p-2 rounded-lg transition-colors
                        ${habit.completed ? 'bg-green-500/30' : 'bg-gray-700/50'}
                      `}>
                        <Icon className={`h-4 w-4 ${habit.completed ? 'text-green-300' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <span className={`
                          font-medium transition-colors
                          ${habit.completed ? 'text-green-300 line-through' : 'text-white'}
                        `}>
                          {habit.name}
                        </span>
                        <div className="text-xs text-gray-400">
                          {habit.streak} day streak
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {habit.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Today's Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <MobileTodayCard
          card={todayCard}
          onViewDetails={onCardClick}
          onQuickAdd={onQuickAdd}
          onTaskToggle={onTaskToggle}
          onCustomTaskAdd={onCustomTaskAdd}
        />
      </motion.div>

      {/* Quick Task Addition */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 border-blue-400/30 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Plus className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Add Morning Task</h3>
            </div>
          </CardHeader>
          <CardContent>
            {onCustomTaskAdd && (
              <CustomTaskInput 
                onAddTask={onCustomTaskAdd}
                placeholder="Add a task for this morning..."
              />
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Morning Notes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 border-purple-400/30 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Book className="h-5 w-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Morning Notes</h3>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Capture your morning thoughts, ideas, or plans..."
              value={morningNotes}
              onChange={(e) => setMorningNotes(e.target.value)}
              className="bg-gray-800/60 border-gray-600/50 text-white placeholder-gray-500 resize-none"
              rows={4}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Morning Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col sm:flex-row gap-3 pt-4"
      >
        <Button 
          onClick={onQuickAdd}
          className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-3 rounded-xl shadow-lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Quick Add Task
        </Button>
        
        <Button 
          onClick={() => onCardClick?.(todayCard)}
          variant="outline"
          className="flex-1 border-orange-400/50 text-orange-300 hover:bg-orange-500/20 font-semibold py-3 rounded-xl"
        >
          <Calendar className="h-5 w-5 mr-2" />
          View Day Plan
        </Button>
      </motion.div>
    </div>
  );
};