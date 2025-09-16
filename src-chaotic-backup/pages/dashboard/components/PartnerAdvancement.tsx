import React from 'react';
import { motion } from 'framer-motion';
import { 
  Award,
  Star,
  CheckCircle,
  ExternalLink,
  Trophy,
  Target,
  Sparkles
} from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';

export interface PartnerAdvancementProps {
  stats: {
    nextTierProgress: number;
    completedReferrals: number;
  };
}

const PartnerAdvancement: React.FC<PartnerAdvancementProps> = ({ stats }) => {
  const leaderboardData = [
    {
      rank: 1,
      name: 'Sarah Johnson',
      tier: 'Platinum',
      earnings: '£15,420',
      tierColor: 'purple',
      rankBg: 'bg-yellow-500'
    },
    {
      rank: 2,
      name: 'Michael Chen',
      tier: 'Gold',
      earnings: '£12,350',
      tierColor: 'yellow',
      rankBg: 'bg-gray-400'
    }
  ];

  const currentUser = {
    rank: 5,
    name: 'You',
    tier: 'Silver',
    earnings: '£8,750',
    tierColor: 'gray',
    rankBg: 'bg-orange-500'
  };

  const goldBenefits = [
    '15% commission rate (vs 12% Silver)',
    'Priority support & dedicated account manager',
    'Access to exclusive Gold partner events'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="row-4"
    >
      <Card 
        className="bg-black/60 backdrop-blur-xl border-yellow-500/20 shadow-2xl hover:border-yellow-500/40 transition-all overflow-hidden cursor-pointer"
        onClick={() => window.location.href = '/partner/leaderboard'}
      >
        <div className="relative">
          {/* Hero Header with Trophy Theme */}
          <div className="relative h-32 bg-gradient-to-br from-yellow-600/30 via-amber-500/20 to-orange-500/30 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.3),transparent_50%)]"></div>
            
            <div className="absolute top-4 right-4">
              <Badge className="bg-yellow-500/30 text-yellow-300 border-yellow-500/40 backdrop-blur-sm">
                🏆 Leaderboard
              </Badge>
            </div>
            
            <div className="absolute bottom-4 left-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30">
                  <Award className="h-5 w-5 text-yellow-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Partner Advancement</h3>
                  <p className="text-sm text-yellow-200">Progress to Gold Tier</p>
                </div>
              </div>
            </div>
            
            {/* Floating rank indicator */}
            <div className="absolute top-4 left-4">
              <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                  #{currentUser.rank}
                </div>
                <span className="text-white text-sm font-medium">Current Rank</span>
              </div>
            </div>
          </div>

          <CardContent className="p-6 space-y-4">
            {/* Current Tier Status */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-silver-400" />
                  <span className="text-sm font-medium text-gray-300">Current Tier: Silver Partner</span>
                </div>
                <span className="text-xs text-gray-400">{stats.nextTierProgress}% to Gold</span>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-yellow-400">Progress to Gold Partner</span>
                  <span className="text-sm font-bold text-white">{stats.nextTierProgress}%</span>
                </div>
                <Progress value={stats.nextTierProgress} className="h-3 mb-3" />
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-400">{stats.completedReferrals}</div>
                    <div className="text-xs text-gray-400">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-400">3</div>
                    <div className="text-xs text-gray-400">Needed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-yellow-400">£500</div>
                    <div className="text-xs text-gray-400">Bonus</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mini Leaderboard Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">Top Performers</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-yellow-400 hover:bg-yellow-500/10 h-6 px-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = '/partner/leaderboard';
                  }}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View All
                </Button>
              </div>
              
              <div className="space-y-2">
                {leaderboardData.map((partner) => (
                  <div 
                    key={partner.rank}
                    className={`flex items-center justify-between p-2 ${
                      partner.rank === 1 
                        ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20' 
                        : 'bg-gray-900/50'
                    } rounded-lg`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 ${partner.rankBg} rounded-full flex items-center justify-center text-xs font-bold ${partner.rank === 1 ? 'text-black' : 'text-white'}`}>
                        {partner.rank}
                      </div>
                      <span className="text-sm text-white">{partner.name}</span>
                      <Badge className={`bg-${partner.tierColor}-500/20 text-${partner.tierColor}-400 text-xs ml-1`}>
                        {partner.tier}
                      </Badge>
                    </div>
                    <span className="text-sm text-green-400 font-medium">{partner.earnings}</span>
                  </div>
                ))}
                
                {/* Current User Row */}
                <div className="flex items-center justify-between p-2 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 ${currentUser.rankBg} rounded-full flex items-center justify-center text-xs font-bold text-white`}>
                      {currentUser.rank}
                    </div>
                    <span className="text-sm text-orange-400 font-medium">{currentUser.name}</span>
                    <Badge className={`bg-${currentUser.tierColor}-500/20 text-${currentUser.tierColor}-400 text-xs ml-1`}>
                      {currentUser.tier}
                    </Badge>
                  </div>
                  <span className="text-sm text-green-400">{currentUser.earnings}</span>
                </div>
              </div>
            </div>

            {/* Tier Benefits Preview */}
            <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-yellow-400">Gold Tier Benefits</span>
              </div>
              <div className="space-y-1 text-xs text-gray-300">
                {goldBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-400" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = '/partner/leaderboard';
                }}
              >
                <Trophy className="h-4 w-4 mr-2" />
                View Rankings
              </Button>
              <Button 
                variant="outline"
                className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = '/partner/referrals';
                }}
              >
                <Target className="h-4 w-4 mr-2" />
                Add Referral
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
};

export default PartnerAdvancement;