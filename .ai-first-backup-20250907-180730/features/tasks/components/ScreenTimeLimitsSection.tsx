import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Smartphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Checkbox } from '@/shared/ui/checkbox';
import { format } from 'date-fns';

interface ScreenTimeLimitsSectionProps {
  selectedDate: Date;
}

export const ScreenTimeLimitsSection: React.FC<ScreenTimeLimitsSectionProps> = ({
  selectedDate
}) => {
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem(`lifelock-${dateKey}-screenHabits`);
    return saved ? JSON.parse(saved) : {
      bullshitContentTime: '',
      noWeed: false,
      noScrolling: false
    };
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(`lifelock-${dateKey}-screenHabits`, JSON.stringify(habits));
  }, [habits, dateKey]);

  const habitsCompleted = Number(habits.noWeed) + Number(habits.noScrolling) + (habits.bullshitContentTime ? 1 : 0);
  const habitsProgress = (habitsCompleted / 3) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="bg-yellow-900/20 border-yellow-700/50">
        <CardHeader>
          <CardTitle className="flex items-center text-yellow-400">
            <Smartphone className="h-5 w-5 mr-2" />
            📱 Screen Time Limits
          </CardTitle>
          <p className="text-gray-300 text-sm">(No scrolling outside 1 hr bullshit content.)</p>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-yellow-300 mb-2">
              <span>Screen Time Discipline</span>
              <span>{Math.round(habitsProgress)}%</span>
            </div>
            <div className="w-full bg-yellow-900/30 rounded-full h-2">
              <motion.div 
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${habitsProgress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-white text-sm font-medium">Bullshit Content (1 hr max): Log time:</label>
              <Input
                value={habits.bullshitContentTime}
                onChange={(e) => setHabits(prev => ({ ...prev, bullshitContentTime: e.target.value }))}
                className="mt-1 bg-gray-700 border-gray-600 text-white"
                placeholder="____ min (e.g., during dinner, 6:55 PM–7:55 PM.)"
              />
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={habits.noWeed}
                onCheckedChange={(checked) => setHabits(prev => ({ ...prev, noWeed: !!checked }))}
              />
              <span className="text-white">No Weed, No Vapes: Adhered to? Yes/No</span>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={habits.noScrolling}
                onCheckedChange={(checked) => setHabits(prev => ({ ...prev, noScrolling: !!checked }))}
              />
              <span className="text-white">No Scrolling: Adhered to? Yes/No</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};