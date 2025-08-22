import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Plus, 
  Minus, 
  Milk, 
  Target, 
  TrendingUp,
  CheckCircle,
  Droplets
} from 'lucide-react';
import { LifeLockService } from '@/ai-first/core/task.service';

interface MilkTrackerProps {
  currentIntake: number;
  targetIntake?: number;
  date: Date;
  onUpdate?: (newIntake: number) => void;
  className?: string;
  compact?: boolean;
}

export const MilkTracker: React.FC<MilkTrackerProps> = ({
  currentIntake,
  targetIntake = 2000, // 2L default target
  date,
  onUpdate,
  className,
  compact = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number>(0);

  const progressPercentage = Math.min((currentIntake / targetIntake) * 100, 100);
  const isCompleted = currentIntake >= targetIntake;
  const remainingMl = Math.max(targetIntake - currentIntake, 0);

  const handleIncrement = async (amount: number) => {
    if (isLoading) return;
    
    setIsLoading(true);
    const newIntake = Math.max(0, currentIntake + amount);
    
    try {
      const success = await LifeLockService.updateMilkIntake(date, newIntake);
      if (success) {
        onUpdate?.(newIntake);
        setLastUpdate(Date.now());
      }
    } catch (error) {
      console.error('Failed to update milk intake:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatVolume = (ml: number) => {
    if (ml >= 1000) {
      return `${(ml / 1000).toFixed(1)}L`;
    }
    return `${ml}ml`;
  };

  const getProgressColor = () => {
    if (isCompleted) return 'from-green-500 to-blue-500';
    if (progressPercentage > 75) return 'from-blue-500 to-cyan-400';
    if (progressPercentage > 50) return 'from-cyan-500 to-blue-400';
    return 'from-gray-500 to-cyan-500';
  };

  const quickIncrements = [50, 100, 250, 500];

  if (compact) {
    return (
      <div className={cn('flex items-center justify-between p-3 bg-black/20 rounded-lg border border-cyan-500/30', className)}>
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-full bg-cyan-500/20">
            <Milk className="h-4 w-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-sm font-medium text-white">
              {formatVolume(currentIntake)} / {formatVolume(targetIntake)}
            </div>
            <div className="text-xs text-gray-400">
              {isCompleted ? 'Goal reached!' : `${formatVolume(remainingMl)} remaining`}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {quickIncrements.slice(0, 2).map((amount) => (
            <Button
              key={amount}
              size="sm"
              variant="ghost"
              onClick={() => handleIncrement(amount)}
              disabled={isLoading}
              className="h-8 w-12 text-xs text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300"
            >
              +{amount}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card className={cn('bg-gradient-to-br from-black/60 to-cyan-900/20 border-cyan-500/30', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-cyan-500/20">
              <Milk className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Milk Goal</h3>
              <p className="text-sm text-gray-400">Daily target: {formatVolume(targetIntake)}</p>
            </div>
          </div>
          <div className="text-right">
            <Badge 
              variant="outline"
              className={cn(
                'font-bold',
                isCompleted 
                  ? 'border-green-500/50 text-green-400 bg-green-500/10' 
                  : 'border-cyan-500/50 text-cyan-400 bg-cyan-500/10'
              )}
            >
              {Math.round(progressPercentage)}%
            </Badge>
            {isCompleted && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center justify-center mt-1"
              >
                <CheckCircle className="h-4 w-4 text-green-400" />
              </motion.div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-300">
            <span>{formatVolume(currentIntake)}</span>
            <span>{formatVolume(targetIntake)}</span>
          </div>
          <div className="w-full bg-black/40 rounded-full h-3 overflow-hidden border border-cyan-500/20">
            <motion.div 
              className={cn(
                'h-full rounded-full bg-gradient-to-r',
                getProgressColor()
              )}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <div className="w-full h-full bg-gradient-to-r from-white/20 to-transparent" />
            </motion.div>
          </div>
          <div className="text-center text-xs text-gray-400">
            {isCompleted ? (
              <span className="text-green-400 font-medium">🎉 Daily goal achieved!</span>
            ) : (
              <span>{formatVolume(remainingMl)} remaining to reach goal</span>
            )}
          </div>
        </div>

        {/* Quick Add Buttons */}
        <div className="space-y-3">
          <div className="flex items-center justify-center space-x-1 text-xs text-gray-400">
            <Droplets className="h-3 w-3" />
            <span>Quick add amounts</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {quickIncrements.map((amount) => (
              <motion.div key={amount} whileTap={{ scale: 0.95 }}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleIncrement(amount)}
                  disabled={isLoading}
                  className={cn(
                    'w-full h-12 flex flex-col items-center justify-center',
                    'border-cyan-500/30 text-cyan-300 bg-cyan-500/10',
                    'hover:bg-cyan-500/20 hover:border-cyan-500/50 hover:text-cyan-200',
                    'transition-all duration-200'
                  )}
                >
                  <Plus className="h-3 w-3 mb-1" />
                  <span className="text-xs font-medium">{amount}ml</span>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Undo Last Addition */}
        {currentIntake > 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
            <span className="text-xs text-gray-400">Current: {formatVolume(currentIntake)}</span>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleIncrement(-50)}
                disabled={isLoading || currentIntake === 0}
                className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/20 text-xs px-2 py-1 h-7"
              >
                <Minus className="h-3 w-3 mr-1" />
                50ml
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleIncrement(-currentIntake)}
                disabled={isLoading || currentIntake === 0}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/20 text-xs px-2 py-1 h-7"
              >
                Reset
              </Button>
            </div>
          </div>
        )}

        {/* Success Animation */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/30"
            >
              <div className="flex items-center justify-center space-x-2 text-green-400">
                <Target className="h-4 w-4" />
                <span className="text-sm font-medium">Daily milk goal achieved!</span>
                <TrendingUp className="h-4 w-4" />
              </div>
              <p className="text-xs text-green-300 mt-1">
                Great job staying hydrated! 🥛
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default MilkTracker;