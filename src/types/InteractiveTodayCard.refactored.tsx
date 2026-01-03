import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Circle, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  Plus,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { FocusSessionTimer } from './FocusSessionTimer';
import { MilkTracker } from './MilkTracker';

// Extracted components
import { MobileSectionCard } from '@/components/shared/InteractiveTodayCard/MobileSectionCard';
import { TaskSectionGrid } from '@/components/shared/InteractiveTodayCard/TaskSectionGrid';
import { QuickActions } from '@/components/shared/InteractiveTodayCard/QuickActions';
import { DailyInsights } from '@/components/shared/InteractiveTodayCard/DailyInsights';

// Extracted hook
import { useLifeLockDataLoader } from '@/lib/hooks/useLifeLockDataLoader';

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

interface InteractiveTodayCardProps {
  card: TaskCard;
  onViewDetails: (card: TaskCard) => void;
  onTaskToggle?: (sectionId: string, taskId: string) => void;
  onQuickAdd?: (sectionId: string) => void;
  onVoiceInput?: () => void;
  onStartTimer?: () => void;
  onQuickPhoto?: () => void;
  className?: string;
  isMobile?: boolean;
}

/**
 * InteractiveTodayCard - REFACTORED VERSION
 * 
 * Reduced from 1,232 lines to ~400 lines (67% reduction)
 * Components extracted:
 * - MobileSectionCard (100 lines)
 * - TaskSectionGrid (200 lines) 
 * - QuickActions (100 lines)
 * - DailyInsights (150 lines)
 * - useLifeLockDataLoader hook (200 lines)
 */
export const InteractiveTodayCard: React.FC<InteractiveTodayCardProps> = ({
  card,
  onViewDetails,
  onTaskToggle,
  onQuickAdd,
  onVoiceInput,
  onStartTimer,
  onQuickPhoto,
  className,
  isMobile = false
}) => {
  // State management (reduced from 10+ useState hooks to 6)
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [showAllSections, setShowAllSections] = useState(!isMobile);
  const [showDeepFocusSession, setShowDeepFocusSession] = useState(false);
  const [showFocusTimer, setShowFocusTimer] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Use extracted data loading hook
  const { 
    lifeLockData, 
    taskSections, 
    overallProgress, 
    isLoading, 
    error,
    updateMilkIntake 
  } = useLifeLockDataLoader(card.date);

  // Event handlers (simplified)
  const handleSectionToggle = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const handleTaskToggle = (sectionId: string, taskId: string) => {
    onTaskToggle?.(sectionId, taskId);
  };

  const handleMilkIntakeUpdate = (newIntake: number) => {
    updateMilkIntake(newIntake);
  };

  // Mobile swipe handlers
  const handlePan = (event: any, info: PanInfo) => {
    if (!isMobile || taskSections.length === 0) return;
    
    const threshold = 50;
    if (info.offset.x > threshold) {
      setCurrentSectionIndex(prev => Math.max(0, prev - 1));
    } else if (info.offset.x < -threshold) {
      setCurrentSectionIndex(prev => Math.min(taskSections.length - 1, prev + 1));
    }
  };

  const navigateToSection = (index: number) => {
    setCurrentSectionIndex(index);
    if (isMobile) {
      setExpandedSection(taskSections[index]?.id || null);
    }
  };

  // Generate insights based on real data
  const generateInsights = () => {
    const insights = [];
    
    if (lifeLockData.habits?.deep_work_hours && lifeLockData.habits.deep_work_hours >= 8) {
      insights.push("🔥 Deep work goal achieved!");
    }
    
    const morningSection = taskSections.find(s => s.id === 'morning');
    if (morningSection && morningSection.progress === 100) {
      insights.push("🌅 Morning routine completed!");
    }
    
    const workoutSection = taskSections.find(s => s.id === 'workout');
    if (workoutSection && workoutSection.progress > 0) {
      insights.push("💪 Workout in progress!");
    }
    
    return insights[0] || "💪 Keep pushing forward!";
  };

  return (
    <div className={cn('w-full', className)} ref={cardRef}>
      <Card className={cn(
        'bg-gradient-to-br from-black/80 via-gray-900/60 to-black/80 backdrop-blur-xl border border-orange-500/30 shadow-xl shadow-orange-500/10 overflow-hidden transition-all duration-300',
        isMobile && 'shadow-lg shadow-orange-500/20'
      )}>
        <CardHeader className={cn('pb-4', isMobile && 'pb-2')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={cn(
                'bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center',
                isMobile ? 'w-8 h-8' : 'w-10 h-10'
              )}>
                <Calendar className={cn('text-white', isMobile ? 'h-4 w-4' : 'h-5 w-5')} />
              </div>
              <div>
                <h3 className={cn(
                  'text-white font-bold',
                  isMobile ? 'text-base' : 'text-lg'
                )}>
                  Today's Progress
                </h3>
                <p className={cn(
                  'text-gray-400',
                  isMobile ? 'text-xs' : 'text-sm'
                )}>
                  {card.date.toLocaleDateString('en-US', { 
                    weekday: isMobile ? 'short' : 'long', 
                    month: isMobile ? 'short' : 'long', 
                    day: 'numeric' 
                  })}
                </p>
                {!isLoading && !isMobile && (
                  <p className="text-orange-300 text-xs mt-1">
                    {generateInsights()}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Mobile: Show compact mode toggle */}
              {isMobile && taskSections.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllSections(!showAllSections)}
                  className="text-gray-400 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
                >
                  {showAllSections ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
              )}
              <Badge 
                variant="outline" 
                className={cn(
                  'font-semibold',
                  isMobile ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1',
                  overallProgress === 100 
                    ? 'border-green-500/50 text-green-400 bg-green-500/10' 
                    : overallProgress > 75
                    ? 'border-orange-500/50 text-orange-400 bg-orange-500/10'
                    : 'border-gray-500/50 text-gray-400 bg-gray-500/10'
                )}
              >
                {Math.round(overallProgress)}%
              </Badge>
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-gray-400 hover:text-white hover:bg-white/10"
                >
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-black/40 backdrop-blur-sm rounded-full h-3 shadow-inner border border-orange-500/20 overflow-hidden">
              <motion.div 
                className="bg-gradient-to-r from-orange-500 via-yellow-400 to-green-500 h-full rounded-full relative overflow-hidden"
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse"></div>
              </motion.div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>
                {isLoading ? (
                  'Loading...'
                ) : (
                  `${taskSections.reduce((sum, s) => sum + s.completedCount, 0)}/${taskSections.reduce((sum, s) => sum + s.totalCount, 0)} tasks completed`
                )}
              </span>
              <span>
                {overallProgress > 75 ? '🔥 Great progress!' : overallProgress > 50 ? '💪 Keep going!' : '🎯 Let\'s do this!'}
              </span>
            </div>
          </div>

          {/* Use DailyInsights component for metrics display */}
          <DailyInsights 
            taskSections={taskSections}
            lifeLockData={lifeLockData}
            isMobile={isMobile}
            isLoading={isLoading}
          />
        </CardHeader>

        <CardContent className="pt-0">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-400">Loading your LifeLock data...</div>
            </div>
          )}

          {/* Mobile: Section Navigation */}
          {isMobile && !isLoading && taskSections.length > 0 && !showAllSections && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateToSection(Math.max(0, currentSectionIndex - 1))}
                    disabled={currentSectionIndex === 0}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-white disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-400">
                    {currentSectionIndex + 1} of {taskSections.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateToSection(Math.min(taskSections.length - 1, currentSectionIndex + 1))}
                    disabled={currentSectionIndex === taskSections.length - 1}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-white disabled:opacity-30"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex space-x-1">
                  {taskSections.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => navigateToSection(index)}
                      className={cn(
                        'w-2 h-2 rounded-full transition-all duration-200',
                        index === currentSectionIndex 
                          ? 'bg-orange-500' 
                          : 'bg-gray-600 hover:bg-gray-500'
                      )}
                    />
                  ))}
                </div>
              </div>
              
              {/* Single Section Display for Mobile */}
              <motion.div
                key={currentSectionIndex}
                onPan={handlePan}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                {taskSections[currentSectionIndex] && (
                  <MobileSectionCard 
                    section={taskSections[currentSectionIndex]}
                    onToggle={handleSectionToggle}
                    onTaskToggle={handleTaskToggle}
                    onQuickAdd={onQuickAdd}
                    isExpanded={true} // Always show tasks on mobile
                  />
                )}
              </motion.div>
            </div>
          )}

          {/* Task Sections Overview - Use TaskSectionGrid component */}
          {!isLoading && taskSections.length > 0 && (!isMobile || showAllSections) && (
            <TaskSectionGrid 
              taskSections={taskSections}
              expandedSection={expandedSection}
              showDeepFocusSession={showDeepFocusSession}
              isMobile={isMobile}
              onSectionToggle={handleSectionToggle}
              onToggleDeepFocusSession={() => setShowDeepFocusSession(!showDeepFocusSession)}
            />
          )}

          {/* No Data State */}
          {!isLoading && taskSections.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No data available for today</p>
              <p className="text-xs mt-1">Start your day by completing some tasks!</p>
            </div>
          )}

          {/* Expanded Section Tasks */}
          <AnimatePresence>
            {expandedSection && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-4"
              >
                {taskSections
                  .filter(section => section.id === expandedSection)
                  .map((section) => (
                    <div key={section.id} className="bg-black/20 rounded-lg p-4 border border-gray-700/50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-semibold flex items-center space-x-2">
                          <section.icon className="h-4 w-4" />
                          <span>{section.title}</span>
                        </h4>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onQuickAdd?.(section.id)}
                          className="text-gray-400 hover:text-white hover:bg-white/10"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {/* Milk Tracker for Health Section */}
                        {section.id === 'health' && lifeLockData.health && (
                          <div className="mb-4">
                            <MilkTracker
                              currentIntake={lifeLockData.health.milk_intake_ml || 0}
                              targetIntake={2000}
                              date={card.date}
                              onUpdate={handleMilkIntakeUpdate}
                              compact={isMobile}
                              className="mb-3"
                            />
                          </div>
                        )}
                        
                        {/* Regular Tasks */}
                        <div className="space-y-2">
                          {section.tasks.map((task) => (
                            <motion.div
                              key={task.id}
                              whileHover={{ x: 4 }}
                              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                              onClick={() => handleTaskToggle(section.id, task.id)}
                            >
                              {task.completed ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                              ) : (
                                <Circle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              )}
                              <span className={cn(
                                'text-sm flex-1',
                                task.completed 
                                  ? 'line-through text-gray-500' 
                                  : 'text-gray-300'
                              )}>
                                {task.title}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Use QuickActions component */}
          <QuickActions 
            card={card}
            showFocusTimer={showFocusTimer}
            isMobile={isMobile}
            onViewDetails={onViewDetails}
            onQuickAdd={onQuickAdd}
            onVoiceInput={onVoiceInput}
            onToggleFocusTimer={() => setShowFocusTimer(!showFocusTimer)}
            onQuickPhoto={onQuickPhoto}
          />

          {/* Focus Session Timer */}
          <AnimatePresence>
            {showFocusTimer && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4"
              >
                <FocusSessionTimer
                  selectedTasks={lifeLockData.deepFocusTasks
                    .filter(task => task.status !== 'done')
                    .map(task => task.id)
                  }
                  onSessionComplete={async (session) => {
                    console.log('Focus session completed:', session);
                    setTimeout(() => {
                      setShowFocusTimer(false);
                    }, 3000);
                  }}
                  onSessionStart={(config) => {
                    console.log('Focus session started:', config);
                  }}
                  compact={isMobile}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractiveTodayCard;