import { Trophy, Users, UserPlus, Clock, Award, Medal, TrendingUp, TrendingDown, CircleDollarSign, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from '@/lib/utils';
import { LeaderboardEntry } from './types';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface LeaderboardTableProps {
  leaderboardData: LeaderboardEntry[];
  onUserClick: (entry: LeaderboardEntry) => void;
}

export const LeaderboardTable = ({ leaderboardData, onUserClick }: LeaderboardTableProps) => {
  const navigate = useNavigate();
  
  const getDisplayName = (entry: LeaderboardEntry) => {
    if (entry.profile?.full_name) return entry.profile.full_name;
    if (entry.profile?.email) {
      const emailParts = entry.profile.email.split('@');
      return emailParts[0];
    }
    return 'Anonymous User';
  };

  const formatLastActive = (date: string | undefined) => {
    if (!date) return 'Unknown';
    try {
      // Use format instead of formatDistanceToNow to show actual date
      return format(new Date(date), 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown';
    }
  };

  const getRankBadge = (position: number) => {
    switch (position) {
      case 0:
        return (
          <div className="relative">
            <Award className="h-6 w-6 text-yellow-500" />
            <motion.div
              className="absolute inset-0 rounded-full bg-yellow-500/20"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        );
      case 1:
        return <Medal className="h-6 w-6 text-gray-300" />;
      case 2:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return null;
    }
  };

  // Fixed trend indicators based on project position
  const getTrendIndicator = (index: number) => {
    const trends = [
      { value: -4, isUp: false },
      { value: 5, isUp: true },
      { value: -1, isUp: false },
      { value: -2, isUp: false },
      { value: 4, isUp: true },
      { value: -2, isUp: false },
      { value: -1, isUp: false },
      { value: 1, isUp: true },
      { value: 5, isUp: true },
      { value: 4, isUp: true }
    ];
    
    const trend = trends[index] || { value: 0, isUp: false };
    
    return (
      <span className={cn(
        "inline-flex items-center text-xs",
        trend.isUp ? "text-green-500" : "text-red-500"
      )}>
        {trend.isUp ? (
          <TrendingUp className="w-3 h-3 mr-1" />
        ) : (
          <TrendingDown className="w-3 h-3 mr-1" />
        )}
        {trend.isUp ? '+' : '-'}{Math.abs(trend.value)}
      </span>
    );
  };

  // Function to determine spending level badge
  const getSpendingBadge = (spending: number) => {
    if (spending >= 10000) {
      return <span className="px-2 py-0.5 text-xs bg-purple-500/30 text-purple-200 rounded-full">Premium</span>;
    } else if (spending >= 5000) {
      return <span className="px-2 py-0.5 text-xs bg-yellow-500/30 text-yellow-200 rounded-full">Gold</span>;
    } else if (spending >= 1000) {
      return <span className="px-2 py-0.5 text-xs bg-gray-500/30 text-gray-200 rounded-full">Silver</span>;
    }
    return <span className="px-2 py-0.5 text-xs bg-orange-500/30 text-orange-200 rounded-full">Bronze</span>;
  };
  
  const handleRowClick = (entry: LeaderboardEntry) => {
    // Use project ID format for navigation
    const projectId = entry.id.startsWith('project-') ? entry.id : `project-${entry.id}`;
    navigate(`/client-app/${projectId}`);
    onUserClick(entry);
  };

  // Fixed spending amounts from project data
  const getSpendingAmount = (index: number) => {
    const spendingAmounts = [15000, 5000, 249, 249, 249, 0, 0, 0, 0, 0];
    return spendingAmounts[index] || 0;
  };

  return (
    <div className="relative overflow-x-auto rounded-lg border border-gray-700 bg-black">
      <Table>
        <TableHeader className="sticky top-0 bg-gray-900 z-10">
          <TableRow className="border-b border-gray-800">
            <TableHead className="w-[80px] text-center text-gray-300">Rank</TableHead>
            <TableHead className="text-gray-300">Name</TableHead>
            <TableHead className="text-center text-gray-300">Points</TableHead>
            <TableHead className="text-center text-gray-300">Trend</TableHead>
            <TableHead className="text-center text-gray-300">Spending</TableHead>
            <TableHead className="text-center text-gray-300">Contributions</TableHead>
            <TableHead className="text-center text-gray-300">Referrals</TableHead>
            <TableHead className="text-center text-gray-300">SISO Tokens</TableHead>
            <TableHead className="text-center text-gray-300">Last Active</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaderboardData.map((entry, index) => {
            // Get actual spending amount for this project
            const spendingAmount = getSpendingAmount(index);
            
            return (
              <motion.tr
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={cn(
                  "transition-all duration-200 cursor-pointer group text-white border-b border-gray-800",
                  index === 0 ? "bg-yellow-500/10 hover:bg-yellow-500/20" :
                  index === 1 ? "bg-gray-500/10 hover:bg-gray-500/20" :
                  index === 2 ? "bg-amber-500/10 hover:bg-amber-500/20" :
                  index < 10 ? "bg-gray-800/50 hover:bg-gray-800/70" :
                  "hover:bg-gray-800/30"
                )}
                onClick={() => handleRowClick(entry)}
              >
                <TableCell className="text-center font-medium">
                  <div className="flex items-center justify-center gap-2">
                    {getRankBadge(index)}
                    <span className={cn(
                      "font-bold",
                      index < 3 ? "text-white" : "text-gray-300"
                    )}>
                      {index + 1}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-siso-red to-siso-orange flex items-center justify-center text-white font-bold">
                        {getDisplayName(entry).charAt(0)}
                      </div>
                      {entry.achievements && entry.achievements.length > 0 && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-siso-orange rounded-full flex items-center justify-center text-[10px] text-white">
                          {entry.achievements.length}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{getDisplayName(entry)}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-400">{entry.rank || 'Rookie'}</p>
                        {getSpendingBadge(spendingAmount)}
                        {entry.profile?.bio && (
                          <p className="text-xs text-gray-300">
                            <span className="text-green-500">●</span> {entry.profile.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">{entry.points || 0}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {getTrendIndicator(index)}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <CreditCard className="h-4 w-4 text-siso-text/70" />
                    <span>£{spendingAmount.toLocaleString()}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Users className="h-4 w-4 text-siso-text/70" />
                    <span>{entry.contribution_count || 0}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <UserPlus className="h-4 w-4 text-siso-text/70" />
                    <span>{entry.referral_count || 0}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <CircleDollarSign className="h-4 w-4 text-siso-orange" />
                    <span className="font-medium">{entry.siso_tokens || 0}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center text-siso-text/70">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{formatLastActive(entry.updated_at)}</span>
                  </div>
                </TableCell>
              </motion.tr>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
