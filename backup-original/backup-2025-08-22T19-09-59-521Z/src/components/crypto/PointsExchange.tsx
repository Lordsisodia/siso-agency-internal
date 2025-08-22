
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { ExchangeHeader } from './exchange/ExchangeHeader';
import { TransactionHistory } from './exchange/TransactionHistory';
import { ExchangeForm } from './exchange/ExchangeForm';
import './exchange/exchange-styles.css';

interface Transaction {
  id: string;
  points_exchanged: number;
  tokens_received: number;
  status: string;
  created_at: string;
  transaction_type: string;
}

export const PointsExchange = ({ userPoints }: { userPoints: number }) => {
  const [loading, setLoading] = useState(false);
  const [sisoTokens, setSisoTokens] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('siso_tokens')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setSisoTokens(profile.siso_tokens || 0);
        }

        const { data: txHistory } = await supabase
          .from('user_crypto_history')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (txHistory) {
          setTransactions(txHistory);
        }
      } catch (error: any) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();

    const channel = supabase
      .channel('crypto-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'crypto_transactions',
        },
        (payload) => {
          console.log('Transaction update:', payload);
          fetchUserData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleExchange = async (points: number) => {
    if (!points || points <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Please enter a valid number of points to exchange.",
      });
      return;
    }

    if (points > userPoints) {
      toast({
        variant: "destructive",
        title: "Insufficient points",
        description: "You don't have enough points for this exchange.",
      });
      return;
    }

    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please sign in to exchange points.",
        });
        return;
      }

      const { data, error } = await supabase
        .from('crypto_transactions')
        .insert([{
          user_id: session.user.id,
          points_exchanged: points,
          tokens_received: points / 1000,
          transaction_type: 'exchange'
        }])
        .select()
        .single();

      if (error) throw error;

      if (data.status === 'completed') {
        const container = document.querySelector('.exchange-container');
        if (container) {
          const particle = document.createElement('div');
          particle.className = 'success-particle';
          container.appendChild(particle);
          setTimeout(() => particle.remove(), 1000);
        }

        toast({
          title: "Exchange successful",
          description: `Converted ${points} points to ${points / 1000} SISO tokens.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Exchange failed",
          description: "Failed to process the exchange. Please try again.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Exchange failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 exchange-container relative backdrop-blur-lg bg-siso-bg-alt/30 p-6 rounded-2xl border border-siso-text/10 shadow-xl">
      <ExchangeHeader showHistory={showHistory} setShowHistory={setShowHistory} />
      
      <AnimatePresence mode="wait">
        {showHistory ? (
          <TransactionHistory transactions={transactions} />
        ) : (
          <ExchangeForm
            userPoints={userPoints}
            sisoTokens={sisoTokens}
            loading={loading}
            onExchange={handleExchange}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
