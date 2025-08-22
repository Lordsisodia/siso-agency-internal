import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Award, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PartnerRanking {
  rank: number;
  name: string;
  avatar?: string;
  spending: number;
  transactions?: number;
  trend: { value: number; direction: 'up' | 'down' | 'same' };
  badge: 'bronze' | 'silver' | 'gold' | 'platinum';
  achievements?: number;
  referrals?: number;
  conversions?: number;
  conversionRate?: number;
}

interface LeaderboardTableProps {
  rankings: PartnerRanking[];
  currentUser?: any;
  onPartnerClick?: (partner: PartnerRanking) => void;
  showAdminControls?: boolean;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  rankings,
  currentUser,
  onPartnerClick,
  showAdminControls = false
}) => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-orange-600" />;
      default:
        return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
    }
  };

  const getTrendIcon = (trend: PartnerRanking['trend']) => {
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'platinum':
        return 'bg-purple-600 text-white';
      case 'gold':
        return 'bg-yellow-500 text-black';
      case 'silver':
        return 'bg-gray-400 text-black';
      case 'bronze':
        return 'bg-orange-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="space-y-2">
      {rankings.map((partner) => (
        <Card
          key={partner.rank}
          className={cn(
            "p-4 bg-siso-bg-alt border-siso-border hover:bg-siso-bg transition-colors cursor-pointer",
            partner.rank <= 3 && "ring-2 ring-siso-primary/20"
          )}
          onClick={() => onPartnerClick?.(partner)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Rank */}
              <div className="w-8 flex justify-center">
                {getRankIcon(partner.rank)}
              </div>

              {/* Avatar and Name */}
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={partner.avatar} alt={partner.name} />
                  <AvatarFallback className="bg-siso-primary text-white">
                    {partner.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-white">{partner.name}</h3>
                  <div className="flex items-center gap-2">
                    <Badge className={cn("text-xs", getBadgeColor(partner.badge))}>
                      {partner.badge}
                    </Badge>
                    {partner.achievements && (
                      <span className="text-xs text-gray-400">
                        {partner.achievements} achievements
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6">
              {/* Earnings */}
              <div className="text-right">
                <p className="text-lg font-bold text-white">
                  ${partner.spending.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">Earnings</p>
              </div>

              {/* Referrals (if available) */}
              {partner.referrals !== undefined && (
                <div className="text-right">
                  <p className="text-lg font-bold text-white">{partner.referrals}</p>
                  <p className="text-xs text-gray-400">Referrals</p>
                </div>
              )}

              {/* Conversion Rate (if available) */}
              {partner.conversionRate !== undefined && (
                <div className="text-right">
                  <p className="text-lg font-bold text-white">{partner.conversionRate.toFixed(1)}%</p>
                  <p className="text-xs text-gray-400">Conv. Rate</p>
                </div>
              )}

              {/* Trend */}
              <div className="flex items-center gap-1">
                {getTrendIcon(partner.trend)}
                <span className={cn(
                  "text-sm font-medium",
                  partner.trend.direction === 'up' ? 'text-green-500' :
                  partner.trend.direction === 'down' ? 'text-red-500' : 'text-gray-500'
                )}>
                  {partner.trend.direction !== 'same' && (partner.trend.direction === 'up' ? '+' : '')}{partner.trend.value}%
                </span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};