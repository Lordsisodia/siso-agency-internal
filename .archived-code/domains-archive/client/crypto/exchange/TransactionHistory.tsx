
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Transaction {
  id: string;
  points_exchanged: number;
  tokens_received: number;
  status: string;
  created_at: string;
  transaction_type: string;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export const TransactionHistory = ({ transactions }: TransactionHistoryProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-black/20 rounded-lg p-4 border border-siso-text/10 backdrop-blur"
    >
      <h3 className="text-lg font-semibold mb-4 text-siso-text-bold">Transaction History</h3>
      <ScrollArea className="h-[300px]">
        <div className="space-y-4">
          {transactions.map((tx) => (
            <motion.div 
              key={tx.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-3 bg-black/30 rounded-lg border border-siso-text/5 hover:border-siso-text/20 transition-all duration-200"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm text-siso-text/80">
                  {tx.points_exchanged.toLocaleString()} Points → {tx.tokens_received.toLocaleString()} Tokens
                </span>
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full font-medium",
                  tx.status === 'completed' && "bg-green-500/20 text-green-400",
                  tx.status === 'failed' && "bg-red-500/20 text-red-400",
                  tx.status === 'pending' && "bg-yellow-500/20 text-yellow-400"
                )}>
                  {tx.status}
                </span>
              </div>
              <div className="text-xs text-siso-text/60 mt-1">
                {new Date(tx.created_at).toLocaleString()}
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </motion.div>
  );
};
