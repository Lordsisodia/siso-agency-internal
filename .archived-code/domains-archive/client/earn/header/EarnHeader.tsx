
import { Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { HeaderProps } from '@/types/earning';

export const EarnHeader = ({ navigate }: HeaderProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-8"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="flex items-center justify-center gap-3 mb-4"
      >
        <Trophy className="w-12 h-12 text-siso-orange animate-bounce" />
        <h1 className="text-4xl font-bold bg-gradient-to-r from-siso-red to-siso-orange bg-clip-text text-transparent">
          How to Earn SISO Points
        </h1>
      </motion.div>
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-lg text-siso-text/80 max-w-2xl mx-auto mb-6"
      >
        Maximize your points by completing daily activities and contributing to the community. 
        Every action counts towards your progress!
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          onClick={() => navigate('/leaderboards')}
          className="bg-gradient-to-r from-siso-red to-siso-orange hover:from-siso-red/90 hover:to-siso-orange/90 
            text-white font-semibold px-6 py-2 rounded-lg transition-all duration-300 transform hover:scale-105"
        >
          View Leaderboard
        </Button>
      </motion.div>
    </motion.div>
  );
};
