/**
 * Day Forecast Component
 *
 * Shows day completion forecast with:
 * - Last task end time
 * - Completion percentage progress bar
 * - All-complete state with Checkout integration
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DayForecastProps {
  lastEndTime: string | null;
  allCompleted: boolean;
  completionPercentage: number;
  completionTime: string | null;
  onGoToCheckout: () => void;
  onAddMoreTasks: () => void;
}

const formatTimeDisplay = (time24: string | null): string => {
  if (!time24) return '--:--';

  const [hoursStr, minutesStr] = time24.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (isNaN(hours) || isNaN(minutes)) return time24;

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const displayMinutes = minutes.toString().padStart(2, '0');

  return `${displayHours}:${displayMinutes} ${period}`;
};

export const DayForecast: React.FC<DayForecastProps> = ({
  lastEndTime,
  allCompleted,
  completionPercentage,
  completionTime,
  onGoToCheckout,
  onAddMoreTasks
}) => {
  const hasTasks = lastEndTime !== null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky bottom-0 left-0 right-0 z-30 bg-black pt-8 pb-4 px-4"
    >
      <div className="max-w-none mx-auto">
        <div
          className={cn(
            'rounded-2xl border backdrop-blur-md p-4 shadow-xl',
            allCompleted
              ? 'bg-green-950/40 border-green-500/30 shadow-green-500/10'
              : 'bg-gray-900/80 border-gray-700/50'
          )}
        >
          {/* Header Row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {allCompleted ? (
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-sky-400" />
                </div>
              )}
              <div>
                <h3 className={cn(
                  'text-sm font-semibold',
                  allCompleted ? 'text-green-300' : 'text-white'
                )}>
                  {allCompleted
                    ? 'All Tasks Complete!'
                    : hasTasks
                      ? 'Day Forecast'
                      : 'No Tasks Scheduled'}
                </h3>
                <p className="text-xs text-gray-400">
                  {allCompleted && completionTime
                    ? `Day finished at ${formatTimeDisplay(completionTime)}`
                    : hasTasks
                      ? `Last task ends: ${formatTimeDisplay(lastEndTime)}`
                      : 'Add tasks to see your day forecast'}
                </p>
              </div>
            </div>

            {/* Completion Percentage Badge */}
            {hasTasks && (
              <div className={cn(
                'px-3 py-1 rounded-full text-xs font-medium',
                allCompleted
                  ? 'bg-green-500/20 text-green-300'
                  : completionPercentage >= 50
                    ? 'bg-blue-500/20 text-blue-300'
                    : 'bg-gray-700/50 text-gray-300'
              )}>
                {completionPercentage}%
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {hasTasks && (
            <div className="mb-4">
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={cn(
                    'h-full rounded-full transition-colors duration-300',
                    allCompleted
                      ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                      : completionPercentage >= 75
                        ? 'bg-gradient-to-r from-blue-500 to-purple-400'
                        : completionPercentage >= 50
                          ? 'bg-gradient-to-r from-purple-500 to-blue-400'
                          : completionPercentage >= 25
                            ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                            : 'bg-gradient-to-r from-gray-600 to-gray-500'
                  )}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[10px] text-gray-500">0%</span>
                <span className="text-[10px] text-gray-500">50%</span>
                <span className="text-[10px] text-gray-500">100%</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {allCompleted ? (
              <Button
                onClick={onGoToCheckout}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white border-0 shadow-lg shadow-green-500/20"
              >
                <span>Go to Checkout</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={onAddMoreTasks}
                  className="flex-1 bg-gray-800/50 border-gray-600/50 text-gray-300 hover:bg-gray-700/50 hover:text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span>Add Tasks</span>
                </Button>
                {completionPercentage > 0 && (
                  <Button
                    variant="outline"
                    onClick={onGoToCheckout}
                    className="flex-1 bg-sky-900/20 border-sky-500/30 text-sky-300 hover:bg-sky-800/30 hover:text-sky-200"
                  >
                    <span>Checkout</span>
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
