
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowDown, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ExchangeFormProps {
  userPoints: number;
  sisoTokens: number;
  loading: boolean;
  onExchange: (points: number) => Promise<void>;
}

export const ExchangeForm = ({ userPoints, sisoTokens, loading, onExchange }: ExchangeFormProps) => {
  const [pointsToExchange, setPointsToExchange] = useState('');

  const handleQuickSelect = (percentage: number) => {
    const amount = Math.floor((userPoints * percentage) / 100);
    setPointsToExchange(amount.toString());
  };

  const tokensToReceive = pointsToExchange ? parseInt(pointsToExchange) / 1000 : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <div className="text-sm text-siso-text/60 uppercase tracking-wider">From</div>
        <motion.div 
          className="bg-black/20 rounded-lg p-4 border border-siso-text/10 hover:border-siso-text/20 transition-all duration-300 relative group backdrop-blur"
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-siso-red/5 to-siso-orange/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <motion.div 
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-siso-red to-siso-orange flex items-center justify-center relative"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="text-white font-semibold text-sm">SP</span>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-siso-red to-siso-orange blur-lg opacity-50" />
                </motion.div>
                <span className="font-semibold text-siso-text-bold">SISO Points</span>
              </div>
              <div className="text-sm text-siso-text/60">
                Balance: {userPoints.toLocaleString()}
              </div>
            </div>
            <Input
              type="number"
              value={pointsToExchange}
              onChange={(e) => setPointsToExchange(e.target.value)}
              placeholder="0.0"
              className="bg-transparent border-none text-2xl font-bold text-siso-text-bold placeholder:text-siso-text/30 focus-visible:ring-0 relative z-10"
            />
            <div className="flex gap-2 mt-2">
              {[25, 50, 75, 100].map((percentage) => (
                <motion.button
                  key={percentage}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleQuickSelect(percentage)}
                  className="px-2 py-1 text-xs rounded-md bg-white/5 hover:bg-white/10 text-siso-text-bold transition-colors relative group"
                >
                  {percentage}%
                  <div className="absolute inset-0 bg-gradient-to-r from-siso-red/10 to-siso-orange/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div 
        className="flex justify-center -my-2"
        animate={{ 
          rotate: loading ? 360 : 0,
        }}
        transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: "linear" }}
      >
        <motion.div 
          className="w-10 h-10 rounded-full bg-black/20 border border-siso-text/10 flex items-center justify-center relative group backdrop-blur"
          whileHover={{ scale: 1.1, rotate: 180 }}
          transition={{ duration: 0.3 }}
        >
          <ArrowDown className="w-5 h-5 text-siso-text/60 relative z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-siso-red/10 to-siso-orange/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>
      </motion.div>

      <div className="space-y-2">
        <div className="text-sm text-siso-text/60 uppercase tracking-wider">To</div>
        <motion.div 
          className="bg-black/20 rounded-lg p-4 border border-siso-text/10 hover:border-siso-text/20 transition-all duration-300 relative group backdrop-blur"
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-siso-red/5 to-siso-orange/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <motion.div 
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-siso-red to-siso-orange flex items-center justify-center relative"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="text-white font-semibold text-sm">ST</span>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-siso-red to-siso-orange blur-lg opacity-50" />
                </motion.div>
                <span className="font-semibold text-siso-text-bold">SISO Tokens</span>
              </div>
              <div className="text-sm text-siso-text/60">
                Balance: {sisoTokens.toLocaleString()}
              </div>
            </div>
            <Input
              type="text"
              value={tokensToReceive ? tokensToReceive.toLocaleString() : ''}
              readOnly
              placeholder="0.0"
              className="bg-transparent border-none text-2xl font-bold text-siso-text-bold placeholder:text-siso-text/30 focus-visible:ring-0 relative z-10"
            />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm text-center p-2 rounded-lg bg-black/10 backdrop-blur relative overflow-hidden group"
      >
        <div className="relative z-10">1 SISO Token = 1,000 SISO Points</div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          onClick={() => onExchange(parseInt(pointsToExchange))}
          disabled={loading || !pointsToExchange}
          className={cn(
            "w-full h-12 bg-gradient-to-r from-siso-red to-siso-orange relative group overflow-hidden",
            "hover:from-siso-red/90 hover:to-siso-orange/90",
            "text-white font-semibold rounded-lg transition-all duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-5 h-5" />
            </motion.div>
          ) : (
            <>
              <span className="relative z-10">Swap Points for Tokens</span>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
};
