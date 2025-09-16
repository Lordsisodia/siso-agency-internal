
import { motion } from 'framer-motion';
import { useDayPeriod } from '@/shared/hooks/useDayPeriod';
import { useUser } from '@/shared/hooks/useUser';
import { Card, CardContent } from '@/shared/ui/card';

export function WelcomeHeader() {
  const { period, greeting, icon: PeriodIcon, gradientClass } = useDayPeriod();
  const { user } = useUser();
  
  const displayName = user?.email ? user.email.split('@')[0] : 'there';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={`relative border-0 bg-gradient-to-r ${gradientClass} backdrop-blur-sm shadow-lg mb-6 overflow-hidden`}>
        <div className="absolute inset-0 bg-grid-white/10 mask-gradient-to-r" />
        <CardContent className="p-6 relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center ring-4 ring-white/30"
              >
                <PeriodIcon className="h-8 w-8 text-white" />
              </motion.div>
              <div>
                <motion.h1 
                  className="text-3xl font-bold text-white"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {greeting}, {displayName}
                </motion.h1>
                <p className="text-white/90 text-lg">
                  Welcome to your dashboard
                </p>
              </div>
            </div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-center space-x-2 bg-white/10 rounded-full px-6 py-3 text-white/90 text-lg backdrop-blur-sm"
            >
              <span>{new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
