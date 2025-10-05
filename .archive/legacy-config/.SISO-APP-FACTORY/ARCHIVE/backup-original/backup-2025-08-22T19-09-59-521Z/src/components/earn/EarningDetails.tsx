
import { Star, Info, Trophy } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';
import { usePoints } from '@/hooks/usePoints';
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface TaskRequirements {
  description?: string;
  [key: string]: any;
}

interface EarningTask {
  action: string;
  points: string;
  cooldown_minutes?: number;
  requirements?: TaskRequirements;
}

interface EarningDetailsProps {
  title: string;
  description: string;
  items: EarningTask[];
}

// [Analysis] Added success celebration animation for better user engagement
const triggerSuccessAnimation = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
};

export const EarningDetails = ({ title, description, items }: EarningDetailsProps) => {
  const [userId, setUserId] = useState<string | null>(null);
  const { awardPoints } = usePoints(userId || undefined);
  const { toast } = useToast();
  const [taskConfigs, setTaskConfigs] = useState<Record<string, any>>({});
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUserId(session?.user?.id || null);
    });

    const fetchTaskConfigs = async () => {
      const { data, error } = await supabase
        .from('point_configurations')
        .select('*');
      
      if (data) {
        const configMap = data.reduce((acc, config) => ({
          ...acc,
          [config.action]: config
        }), {});
        setTaskConfigs(configMap);
      }
    };

    fetchTaskConfigs();

    return () => subscription.unsubscribe();
  }, []);

  const handleTaskClick = async (action: string) => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please sign in to earn points",
      });
      return;
    }

    try {
      const dbAction = action.toLowerCase().replace(/ /g, '_') as any;
      await awardPoints(dbAction);
      
      setCompletedTasks(prev => [...prev, action]);
      triggerSuccessAnimation();
      
      toast({
        title: "Points Awarded! 🎉",
        description: `You've earned points for ${action}`,
      });
    } catch (error) {
      console.error('Error awarding points:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to award points at this time",
      });
    }
  };

  const formatCooldown = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutes`;
    if (minutes === 60) return '1 hour';
    if (minutes === 1440) return '24 hours';
    return `${Math.floor(minutes / 60)} hours`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold bg-gradient-to-r from-siso-red to-siso-orange bg-clip-text text-transparent"
        >
          {title}
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-siso-text/80 leading-relaxed max-w-2xl"
        >
          {description}
        </motion.p>
      </div>

      <div className="grid gap-4">
        <AnimatePresence>
          {items.map((item, index) => {
            const taskConfig = taskConfigs[item.action.toLowerCase().replace(/ /g, '_')];
            const isCompleted = completedTasks.includes(item.action);
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Card 
                      onClick={() => handleTaskClick(item.action)}
                      className={cn(
                        "p-4 border-siso-border hover:border-siso-border-hover",
                        "bg-gradient-to-r from-siso-text/5 to-transparent",
                        "hover:from-siso-text/10 transition-all duration-300",
                        "group cursor-pointer relative overflow-hidden",
                        isCompleted && "border-siso-orange/30"
                      )}
                    >
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300",
                            isCompleted 
                              ? "bg-gradient-to-br from-siso-orange/20 to-siso-red/20" 
                              : "bg-gradient-to-br from-siso-red/10 to-siso-orange/10 group-hover:from-siso-red/20 group-hover:to-siso-orange/20"
                          )}>
                            {isCompleted ? (
                              <Trophy className="w-5 h-5 text-siso-orange" />
                            ) : (
                              <Star className="w-5 h-5 text-siso-orange" />
                            )}
                          </div>
                          <span className="text-siso-text group-hover:text-siso-text-bold transition-colors duration-300">
                            {item.action}
                          </span>
                          <Info className="w-4 h-4 text-siso-text/50 group-hover:text-siso-text/70" />
                        </div>
                        <span className="px-3 py-1 rounded-full bg-gradient-to-r from-siso-red/10 to-siso-orange/10 
                          text-siso-orange font-semibold text-sm group-hover:from-siso-red/20 group-hover:to-siso-orange/20 
                          transition-all duration-300">
                          {item.points}
                        </span>
                      </div>
                      {isCompleted && (
                        <div className="absolute inset-0 bg-gradient-to-r from-siso-orange/5 to-transparent" />
                      )}
                    </Card>
                  </HoverCardTrigger>
                  <HoverCardContent 
                    className="w-80 bg-siso-bg-alt border-siso-border"
                    align="start"
                  >
                    <div className="space-y-2">
                      <h4 className="font-semibold text-siso-text-bold">{item.action}</h4>
                      {taskConfig?.requirements?.description && (
                        <p className="text-sm text-siso-text/80">
                          {taskConfig.requirements.description}
                        </p>
                      )}
                      {taskConfig?.cooldown_minutes && (
                        <p className="text-xs text-siso-text/60">
                          Cooldown: {formatCooldown(taskConfig.cooldown_minutes)}
                        </p>
                      )}
                      <div className="pt-2 text-xs text-siso-text/60">
                        Reward: {item.points}
                      </div>
                      {isCompleted && (
                        <div className="pt-1 text-xs text-siso-orange">
                          ✨ Completed
                        </div>
                      )}
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
