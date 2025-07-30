
import { History, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

interface ExchangeHeaderProps {
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
}

export const ExchangeHeader = ({ showHistory, setShowHistory }: ExchangeHeaderProps) => {
  return (
    <motion.div 
      className="flex items-center justify-between"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-bold bg-gradient-to-r from-siso-red to-siso-orange bg-clip-text text-transparent">
        Swap Points
      </h2>
      <div className="flex items-center gap-2">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowHistory(!showHistory)}
          className="p-2 hover:bg-siso-text/5 rounded-lg transition-colors relative group" 
          title="Transaction History"
        >
          <History className="w-5 h-5 text-siso-text/60 relative z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-siso-red/10 to-siso-orange/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 hover:bg-siso-text/5 rounded-lg transition-colors relative group" 
          title="Exchange Settings"
        >
          <Settings className="w-5 h-5 text-siso-text/60 relative z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-siso-red/10 to-siso-orange/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.button>
      </div>
    </motion.div>
  );
};
