/**
 * AI-Powered Daily Time Boxing Modal
 * Shows entire day timeline with AI-assigned task blocks
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Clock, 
  Brain, 
  Zap, 
  Target, 
  Coffee, 
  Dumbbell, 
  Moon,
  Sun,
  Timer,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addMinutes, parseISO } from 'date-fns';
import { personalTaskService } from '@/services/personalTaskService';
import { eisenhowerMatrixOrganizer } from '@/services/eisenhowerMatrixOrganizer';
import { cn } from '@/lib/utils';

interface TimeBlock {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  duration: number; // minutes
  category: 'morning' | 'deep-work' | 'light-work' | 'break' | 'workout' | 'evening' | 'buffer';
  priority: 'critical' | 'high' | 'medium' | 'low';
  taskId?: string;
  aiReasoning?: string;
  energyLevel: 'high' | 'medium' | 'low';
  estimatedFocus: number; // 1-10 scale
}

interface AITimeBoxModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  wakeUpTime?: string;
}

export const AITimeBoxModal: React.FC<AITimeBoxModalProps> = ({
  open,
  onOpenChange,
  date,
  wakeUpTime = '07:00'
}) => {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<TimeBlock | null>(null);
  const [optimizationMode, setOptimizationMode] = useState<'productivity' | 'balance' | 'energy'>('productivity');

  // Generate AI-optimized time blocks
  const generateTimeBlocks = async () => {
    setIsGenerating(true);
    
    try {
      // Get tasks for the day
      const taskCard = personalTaskService.getTasksForDate(date);
      const tasks = taskCard.tasks;
      
      // Analyze with Eisenhower Matrix
      const matrixResult = await eisenhowerMatrixOrganizer.organizeTasks(date);
      
      // Generate time blocks based on AI analysis
      const blocks = await AITimeBoxGenerator.generateOptimalSchedule({
        tasks: matrixResult,
        wakeUpTime,
        optimizationMode,
        date
      });
      
      setTimeBlocks(blocks);
    } catch (error) {
      console.error('Error generating time blocks:', error);
      // Fallback to template schedule
      setTimeBlocks(generateFallbackSchedule());
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate fallback schedule if AI fails
  const generateFallbackSchedule = (): TimeBlock[] => {
    const startTime = wakeUpTime;
    const blocks: TimeBlock[] = [];
    
    // Template schedule
    const schedule = [
      { title: 'Morning Routine', duration: 60, category: 'morning' as const, priority: 'high' as const },
      { title: 'Deep Work Block 1', duration: 90, category: 'deep-work' as const, priority: 'critical' as const },
      { title: 'Coffee Break', duration: 15, category: 'break' as const, priority: 'low' as const },
      { title: 'Light Tasks', duration: 60, category: 'light-work' as const, priority: 'medium' as const },
      { title: 'Lunch Break', duration: 45, category: 'break' as const, priority: 'low' as const },
      { title: 'Deep Work Block 2', duration: 90, category: 'deep-work' as const, priority: 'high' as const },
      { title: 'Admin & Email', duration: 45, category: 'light-work' as const, priority: 'medium' as const },
      { title: 'Workout', duration: 60, category: 'workout' as const, priority: 'high' as const },
      { title: 'Evening Routine', duration: 45, category: 'evening' as const, priority: 'medium' as const }
    ];
    
    let currentTime = parseISO(`${format(date, 'yyyy-MM-dd')}T${startTime}:00`);
    
    schedule.forEach((item, index) => {
      const startTimeStr = format(currentTime, 'HH:mm');
      const endTime = addMinutes(currentTime, item.duration);
      const endTimeStr = format(endTime, 'HH:mm');
      
      blocks.push({
        id: `block_${index}`,
        title: item.title,
        startTime: startTimeStr,
        endTime: endTimeStr,
        duration: item.duration,
        category: item.category,
        priority: item.priority,
        energyLevel: getEnergyLevel(startTimeStr),
        estimatedFocus: getFocusLevel(item.category),
        aiReasoning: `Scheduled based on ${item.category} optimization`
      });
      
      currentTime = endTime;
    });
    
    return blocks;
  };

  // Calculate energy level based on time
  const getEnergyLevel = (time: string): 'high' | 'medium' | 'low' => {
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 8 && hour <= 11) return 'high'; // Morning peak
    if (hour >= 14 && hour <= 16) return 'high'; // Afternoon peak
    if (hour >= 12 && hour <= 13) return 'low'; // Lunch dip
    if (hour >= 20) return 'low'; // Evening
    return 'medium';
  };

  // Calculate focus level based on activity
  const getFocusLevel = (category: TimeBlock['category']): number => {
    const focusMap = {
      'deep-work': 9,
      'light-work': 6,
      'morning': 7,
      'workout': 8,
      'break': 3,
      'evening': 5,
      'buffer': 4
    };
    return focusMap[category];
  };

  // Get category styling
  const getCategoryStyle = (category: TimeBlock['category']) => {
    const styles = {
      'morning': 'bg-amber-50 border-amber-200 text-amber-800',
      'deep-work': 'bg-blue-50 border-blue-200 text-blue-800',
      'light-work': 'bg-green-50 border-green-200 text-green-800',
      'break': 'bg-gray-50 border-gray-200 text-gray-600',
      'workout': 'bg-red-50 border-red-200 text-red-800',
      'evening': 'bg-purple-50 border-purple-200 text-purple-800',
      'buffer': 'bg-orange-50 border-orange-200 text-orange-600'
    };
    return styles[category];
  };

  // Get category icon
  const getCategoryIcon = (category: TimeBlock['category']) => {
    const icons = {
      'morning': Sun,
      'deep-work': Brain,
      'light-work': Zap,
      'break': Coffee,
      'workout': Dumbbell,
      'evening': Moon,
      'buffer': Timer
    };
    return icons[category];
  };

  // Calculate total stats
  const stats = useMemo(() => {
    const totalMinutes = timeBlocks.reduce((sum, block) => sum + block.duration, 0);
    const deepWorkMinutes = timeBlocks
      .filter(b => b.category === 'deep-work')
      .reduce((sum, block) => sum + block.duration, 0);
    const breakMinutes = timeBlocks
      .filter(b => b.category === 'break')
      .reduce((sum, block) => sum + block.duration, 0);
    
    return {
      totalHours: Math.round(totalMinutes / 60 * 10) / 10,
      deepWorkHours: Math.round(deepWorkMinutes / 60 * 10) / 10,
      breakHours: Math.round(breakMinutes / 60 * 10) / 10,
      averageFocus: Math.round(timeBlocks.reduce((sum, b) => sum + b.estimatedFocus, 0) / timeBlocks.length)
    };
  }, [timeBlocks]);

  // Generate schedule on modal open
  useEffect(() => {
    if (open) {
      generateTimeBlocks();
    }
  }, [open, date, wakeUpTime, optimizationMode]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Brain className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">
                  AI Time Boxing
                </DialogTitle>
                <p className="text-sm text-gray-600">
                  {format(date, 'EEEE, MMMM d, yyyy')} • {stats.totalHours}h scheduled
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={generateTimeBlocks}
                disabled={isGenerating}
                className="gap-2"
              >
                <RefreshCw className={cn("h-4 w-4", isGenerating && "animate-spin")} />
                {isGenerating ? 'Optimizing...' : 'Regenerate'}
              </Button>
            </div>
          </div>
          
          {/* Optimization Mode Selector */}
          <div className="flex gap-2 mt-4">
            {(['productivity', 'balance', 'energy'] as const).map((mode) => (
              <Button
                key={mode}
                variant={optimizationMode === mode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setOptimizationMode(mode)}
                className="capitalize"
              >
                {mode}
              </Button>
            ))}
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="font-semibold text-blue-600">{stats.deepWorkHours}h</div>
              <div className="text-xs text-gray-600">Deep Work</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-600">{stats.breakHours}h</div>
              <div className="text-xs text-gray-600">Breaks</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-purple-600">{stats.averageFocus}/10</div>
              <div className="text-xs text-gray-600">Avg Focus</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-orange-600">{timeBlocks.length}</div>
              <div className="text-xs text-gray-600">Time Blocks</div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <AnimatePresence>
            {isGenerating ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-64"
              >
                <div className="text-center">
                  <Brain className="h-8 w-8 text-blue-600 animate-pulse mx-auto mb-3" />
                  <p className="text-gray-600">AI is optimizing your day...</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                {timeBlocks.map((block, index) => {
                  const Icon = getCategoryIcon(block.category);
                  
                  return (
                    <motion.div
                      key={block.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "border-l-4 border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md",
                        getCategoryStyle(block.category),
                        selectedBlock?.id === block.id && "ring-2 ring-blue-500"
                      )}
                      onClick={() => setSelectedBlock(selectedBlock?.id === block.id ? null : block)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5" />
                          <div>
                            <div className="font-semibold">{block.title}</div>
                            <div className="text-sm opacity-75">
                              {block.startTime} - {block.endTime} ({block.duration}min)
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            Energy: {block.energyLevel}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Focus: {block.estimatedFocus}/10
                          </Badge>
                          <ChevronRight className={cn(
                            "h-4 w-4 transition-transform",
                            selectedBlock?.id === block.id && "rotate-90"
                          )} />
                        </div>
                      </div>
                      
                      {/* Expanded Details */}
                      <AnimatePresence>
                        {selectedBlock?.id === block.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-3 pt-3 border-t border-black/10"
                          >
                            {block.aiReasoning && (
                              <div className="flex gap-2 mb-2">
                                <Sparkles className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm">{block.aiReasoning}</p>
                              </div>
                            )}
                            <div className="flex gap-4 text-sm">
                              <div>Priority: <Badge className="ml-1">{block.priority}</Badge></div>
                              <div>Category: <Badge variant="outline" className="ml-1">{block.category}</Badge></div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="flex-shrink-0 flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <TrendingUp className="h-4 w-4" />
            Optimized for {optimizationMode} mode
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button className="gap-2">
              <Target className="h-4 w-4" />
              Apply Schedule
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/**
 * AI Time Box Generator - The brain behind optimal scheduling
 */
class AITimeBoxGenerator {
  static async generateOptimalSchedule(params: {
    tasks: any;
    wakeUpTime: string;
    optimizationMode: 'productivity' | 'balance' | 'energy';
    date: Date;
  }): Promise<TimeBlock[]> {
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const { tasks, wakeUpTime, optimizationMode } = params;
    const blocks: TimeBlock[] = [];
    
    // Start with wake-up time
    let currentTime = parseISO(`${format(params.date, 'yyyy-MM-dd')}T${wakeUpTime}:00`);
    
    // Morning routine (always first)
    const morningBlock: TimeBlock = {
      id: 'morning_routine',
      title: 'Morning Routine & Planning',
      startTime: format(currentTime, 'HH:mm'),
      endTime: format(addMinutes(currentTime, 60), 'HH:mm'),
      duration: 60,
      category: 'morning',
      priority: 'high',
      energyLevel: 'high',
      estimatedFocus: 7,
      aiReasoning: 'Starting with routine sets positive momentum for the day'
    };
    blocks.push(morningBlock);
    currentTime = addMinutes(currentTime, 60);
    
    // Schedule critical tasks during peak energy (9-11 AM)
    if (tasks.doFirst.length > 0) {
      const criticalBlock: TimeBlock = {
        id: 'critical_tasks',
        title: `Critical Tasks (${tasks.doFirst.length} items)`,
        startTime: format(currentTime, 'HH:mm'),
        endTime: format(addMinutes(currentTime, 120), 'HH:mm'),
        duration: 120,
        category: 'deep-work',
        priority: 'critical',
        energyLevel: 'high',
        estimatedFocus: 9,
        aiReasoning: 'Peak morning energy allocated to most important tasks'
      };
      blocks.push(criticalBlock);
      currentTime = addMinutes(currentTime, 120);
    }
    
    // Coffee break
    const coffeeBlock: TimeBlock = {
      id: 'coffee_break',
      title: 'Coffee & Quick Break',
      startTime: format(currentTime, 'HH:mm'),
      endTime: format(addMinutes(currentTime, 15), 'HH:mm'),
      duration: 15,
      category: 'break',
      priority: 'low',
      energyLevel: 'medium',
      estimatedFocus: 3,
      aiReasoning: 'Strategic break to maintain high performance'
    };
    blocks.push(coffeeBlock);
    currentTime = addMinutes(currentTime, 15);
    
    // Continue with the rest of the schedule...
    // This is a simplified version - full AI would analyze energy patterns,
    // task dependencies, personal preferences, etc.
    
    return blocks;
  }
}