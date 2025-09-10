import React from 'react';
import { cn } from '@/shared/lib/utils';
import { 
  Activity,
  TrendingUp,
  Star,
  Clock,
  CheckCircle,
  Sun,
  Zap,
  Brain
} from 'lucide-react';

interface TaskSection {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  tasks: {
    id: string;
    title: string;
    completed: boolean;
  }[];
  progress: number;
  completedCount: number;
  totalCount: number;
  metrics?: {
    hoursLogged?: number;
    targetHours?: number;
    streak?: number;
    efficiency?: number;
    completionTime?: string;
  };
}

interface RealLifeLockData {
  routine: any;
  workout: any;
  health: any;
  habits: {
    deep_work_hours?: number;
    light_work_hours?: number;
    habits_data?: any;
  } | null;
  reflections: any;
  deepFocusTasks: any[];
}

interface DailyInsightsProps {
  taskSections: TaskSection[];
  lifeLockData: RealLifeLockData;
  isMobile?: boolean;
  isLoading?: boolean;
}

/**
 * DailyInsights - Stats and insights display
 * 
 * Extracted from InteractiveTodayCard.tsx (1,232 lines → focused component)
 * Handles daily stats, insights, and performance metrics
 */
export const DailyInsights: React.FC<DailyInsightsProps> = ({
  taskSections,
  lifeLockData,
  isMobile = false,
  isLoading = false
}) => {
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
    
    if (insights.length === 0) {
      insights.push("💪 Keep pushing forward!");
    }
    
    return insights[0]; // Return the first insight
  };

  if (isLoading) {
    return null;
  }

  return (
    <>
      {/* Key Metrics Display */}
      <div className={cn(
        'mt-4 grid gap-2 text-xs',
        isMobile ? 'grid-cols-3' : 'grid-cols-2'
      )}>
        <div className="bg-black/20 rounded-lg p-2 text-center">
          <div className="text-orange-400 font-semibold">
            {lifeLockData.habits?.deep_work_hours || 0}h
          </div>
          <div className="text-gray-400">Deep Focus</div>
        </div>
        <div className="bg-black/20 rounded-lg p-2 text-center">
          <div className="text-green-400 font-semibold">
            {lifeLockData.habits?.light_work_hours || 0}h
          </div>
          <div className="text-gray-400">Light Focus</div>
        </div>
        {isMobile && (
          <div className="bg-black/20 rounded-lg p-2 text-center">
            <div className="text-yellow-400 font-semibold">
              {taskSections.length}
            </div>
            <div className="text-gray-400">Sections</div>
          </div>
        )}
      </div>

      {/* Enhanced Quick Stats */}
      {taskSections.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-gray-400">
          <div className="text-center">
            <div className="text-green-400 font-semibold">
              {taskSections.reduce((sum, s) => sum + s.completedCount, 0)}
            </div>
            <div>Completed</div>
          </div>
          <div className="text-center">
            <div className="text-orange-400 font-semibold">
              {taskSections.reduce((sum, s) => sum + (s.totalCount - s.completedCount), 0)}
            </div>
            <div>Remaining</div>
          </div>
          <div className="text-center">
            <div className="text-yellow-400 font-semibold">
              {(lifeLockData.habits?.deep_work_hours || 0) + (lifeLockData.habits?.light_work_hours || 0)}h
            </div>
            <div>Work Hours</div>
          </div>
        </div>
      )}

      {/* Enhanced Daily Insights */}
      <div className="mt-4 p-3 bg-gradient-to-br from-black/20 to-gray-900/20 rounded-lg border border-gray-700/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-white">Daily Insights</span>
          </div>
          <TrendingUp className="h-4 w-4 text-green-400" />
        </div>
        <div className="space-y-1 text-xs text-gray-300">
          {lifeLockData.habits?.deep_work_hours && lifeLockData.habits.deep_work_hours > 6 ? (
            <p className="flex items-center space-x-1">
              <Star className="h-3 w-3 text-yellow-400" />
              <span>Strong focus session today! 🎯</span>
            </p>
          ) : (
            <p className="flex items-center space-x-1">
              <Clock className="h-3 w-3 text-orange-400" />
              <span>Consider scheduling focused work time 📅</span>
            </p>
          )}
          {taskSections.find(s => s.id === 'morning')?.progress === 100 ? (
            <p className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3 text-green-400" />
              <span>Morning routine mastered! 🌅</span>
            </p>
          ) : (
            <p className="flex items-center space-x-1">
              <Sun className="h-3 w-3 text-yellow-400" />
              <span>Consistent morning routine builds momentum 🚀</span>
            </p>
          )}
          {taskSections.find(s => s.id === 'workout')?.progress && taskSections.find(s => s.id === 'workout')!.progress > 0 ? (
            <p className="flex items-center space-x-1">
              <Zap className="h-3 w-3 text-red-400" />
              <span>Physical activity boosts productivity! 💪</span>
            </p>
          ) : (
            <p className="flex items-center space-x-1">
              <Brain className="h-3 w-3 text-purple-400" />
              <span>Physical activity enhances mental clarity 🧠</span>
            </p>
          )}
        </div>
      </div>

      {/* Insight display for mobile header */}
      {!isMobile && (
        <div className="mt-2">
          <p className="text-orange-300 text-xs">
            {generateInsights()}
          </p>
        </div>
      )}
    </>
  );
};