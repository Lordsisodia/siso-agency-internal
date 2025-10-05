
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Flame, Calendar, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export const LoginStreakTracker = ({ userId }: { userId: string }) => {
  const { toast } = useToast();

  useEffect(() => {
    const updateLoginStreak = async () => {
      try {
        const { data: existingStreak, error: streakError } = await supabase
          .from('login_streaks')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (streakError) throw streakError;

        const now = new Date();
        const lastLogin = existingStreak?.last_login ? new Date(existingStreak.last_login) : null;
        const isNewDay = !lastLogin || 
          (now.getDate() !== lastLogin.getDate() || 
           now.getMonth() !== lastLogin.getMonth() || 
           now.getFullYear() !== lastLogin.getFullYear());

        if (isNewDay) {
          const isConsecutiveDay = lastLogin && 
            (now.getTime() - lastLogin.getTime()) < (36 * 60 * 60 * 1000);

          if (!existingStreak) {
            const { error: insertError } = await supabase
              .from('login_streaks')
              .insert([{ user_id: userId }]);

            if (insertError) throw insertError;

            const { error: pointsError } = await supabase
              .from('points_log')
              .insert([
                {
                  user_id: userId,
                  action: 'daily_login',
                  points_earned: 5
                }
              ]);

            if (pointsError) throw pointsError;

            toast({
              title: "Welcome!",
              description: "You earned 5 points for your first login!",
            });
          } else if (isConsecutiveDay) {
            const newStreak = existingStreak.current_streak + 1;
            const newLongestStreak = Math.max(newStreak, existingStreak.longest_streak);
            
            const { error: updateError } = await supabase
              .from('login_streaks')
              .update({ 
                current_streak: newStreak,
                longest_streak: newLongestStreak,
                last_login: now.toISOString()
              })
              .eq('user_id', userId);

            if (updateError) throw updateError;

            const { error: pointsError } = await supabase
              .from('points_log')
              .insert([
                {
                  user_id: userId,
                  action: 'daily_login',
                  points_earned: 5
                }
              ]);

            if (pointsError) throw pointsError;

            if (newStreak % 7 === 0) {
              const { error: streakBonusError } = await supabase
                .from('points_log')
                .insert([
                  {
                    user_id: userId,
                    action: 'login_streak',
                    points_earned: 50
                  }
                ]);

              if (streakBonusError) throw streakBonusError;

              toast({
                title: "Streak Bonus!",
                description: "You earned 50 points for maintaining a 7-day login streak!",
              });
            } else {
              toast({
                title: "Daily Login!",
                description: `You earned 5 points! Current streak: ${newStreak} days`,
              });
            }
          } else {
            const { error: updateError } = await supabase
              .from('login_streaks')
              .update({ 
                current_streak: 1,
                last_login: now.toISOString()
              })
              .eq('user_id', userId);

            if (updateError) throw updateError;

            const { error: pointsError } = await supabase
              .from('points_log')
              .insert([
                {
                  user_id: userId,
                  action: 'daily_login',
                  points_earned: 5
                }
              ]);

            if (pointsError) throw pointsError;

            toast({
              title: "Welcome Back!",
              description: "You earned 5 points for logging in today!",
            });
          }
        }
      } catch (error: any) {
        console.error('Error updating login streak:', error);
        toast({
          variant: "destructive",
          title: "Error updating streak",
          description: error.message,
        });
      }
    };

    if (userId) {
      updateLoginStreak();
    }
  }, [userId]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex flex-col gap-4 p-6 bg-black/20 rounded-xl backdrop-blur-sm border border-siso-text/10 hover:border-siso-orange/50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-2"
            initial={{ x: -20 }}
            animate={{ x: 0 }}
          >
            <Flame className="w-5 h-5 text-siso-orange" />
            <h3 className="text-lg font-semibold text-siso-text-bold">Login Streak</h3>
          </motion.div>
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2"
          >
            <Calendar className="w-4 h-4 text-siso-text/70" />
            <span className="text-sm text-siso-text/70">Daily Check-in</span>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex flex-col items-center p-4 rounded-lg bg-siso-text/5 border border-siso-text/10"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, -10, 10, 0] 
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <Flame className="w-8 h-8 text-siso-orange mb-2" />
            </motion.div>
            <span className="text-sm text-siso-text/70">Current Streak</span>
            <motion.span 
              className="text-2xl font-bold text-siso-text-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {/* Display current streak here */}
              7 Days
            </motion.span>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex flex-col items-center p-4 rounded-lg bg-siso-text/5 border border-siso-text/10"
          >
            <motion.div
              animate={{ 
                y: [0, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <Trophy className="w-8 h-8 text-yellow-500 mb-2" />
            </motion.div>
            <span className="text-sm text-siso-text/70">Longest Streak</span>
            <motion.span 
              className="text-2xl font-bold text-siso-text-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {/* Display longest streak here */}
              14 Days
            </motion.span>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex flex-col items-center p-4 rounded-lg bg-siso-text/5 border border-siso-text/10"
          >
            <motion.div
              animate={{ 
                rotate: [0, 360] 
              }}
              transition={{ 
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
              className="relative"
            >
              <div className="w-8 h-8 rounded-full border-2 border-siso-orange border-t-transparent mb-2" />
            </motion.div>
            <span className="text-sm text-siso-text/70">Next Bonus In</span>
            <motion.span 
              className="text-2xl font-bold text-siso-text-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {/* Display days until next bonus */}
              2 Days
            </motion.span>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
