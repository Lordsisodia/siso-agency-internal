
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePoints = (userId?: string | undefined) => {
  const [points, setPoints] = useState(0);
  const [rank, setRank] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [spendingData, setSpendingData] = useState({
    totalSpent: 0,
    tier: 'Bronze',
    recentTransactions: []
  });

  useEffect(() => {
    if (!userId) return;

    const fetchPointsData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch leaderboard entry for the user to get points and rank
        const { data: leaderboardEntry, error: leaderboardError } = await supabase
          .from('leaderboard_entries')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (leaderboardError && leaderboardError.code !== 'PGRST116') {
          console.error('Error fetching leaderboard data:', leaderboardError);
        }

        if (leaderboardEntry) {
          setPoints(leaderboardEntry.points || 0);
          
          // Determine rank based on level
          const level = leaderboardEntry.level || 1;
          if (level >= 10) setRank('Master');
          else if (level >= 7) setRank('Expert');
          else if (level >= 4) setRank('Advanced');
          else if (level >= 2) setRank('Intermediate');
          else setRank('Beginner');
        }

        // Fetch transaction history
        const { data: transactionData, error: transactionError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (transactionError) {
          console.error('Error fetching transaction data:', transactionError);
        }

        if (transactionData) {
          setTransactions(transactionData);
          
          // Calculate total spending (mock calculation based on transaction data)
          const totalSpent = transactionData.reduce((sum, transaction) => {
            if (transaction.transaction_type === 'purchase') {
              return sum + (transaction.amount || 0);
            }
            return sum;
          }, 0);
          
          // Determine spending tier
          let tier = 'Bronze';
          if (totalSpent >= 10000) tier = 'Premium';
          else if (totalSpent >= 5000) tier = 'Gold';
          else if (totalSpent >= 1000) tier = 'Silver';
          
          setSpendingData({
            totalSpent,
            tier,
            recentTransactions: transactionData.slice(0, 5)
          });
        }
      } catch (error) {
        console.error('Error in usePoints hook:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPointsData();
  }, [userId]);

  // Function to award points (would connect to backend)
  const awardPoints = async (actionType: string, pointsToAward: number = 10) => {
    if (!userId) return false;
    
    try {
      // First, record the transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          user_id: userId,
          amount: pointsToAward,
          transaction_type: 'points_earned',
          metadata: { action_type: actionType }
        }]);
      
      if (transactionError) {
        console.error('Error recording transaction:', transactionError);
        return false;
      }
      
      // Then, update the user's points in leaderboard_entries
      const { error: updateError } = await supabase
        .from('leaderboard_entries')
        .update({ 
          points: points + pointsToAward,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (updateError) {
        console.error('Error updating points:', updateError);
        return false;
      }
      
      // Update local state
      setPoints(prevPoints => prevPoints + pointsToAward);
      return true;
    } catch (error) {
      console.error('Error awarding points:', error);
      return false;
    }
  };

  return {
    points,
    rank,
    isLoading,
    transactions,
    spendingData,
    awardPoints
  };
};
