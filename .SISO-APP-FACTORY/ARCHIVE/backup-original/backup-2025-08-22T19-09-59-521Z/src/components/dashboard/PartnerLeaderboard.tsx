import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Medal, 
  Award, 
  Crown, 
  Star, 
  TrendingUp, 
  Users, 
  Eye, 
  EyeOff,
  Calendar,
  Filter,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Types
interface Partner {
  id: string;
  name: string;
  avatar?: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  earnings: number;
  referrals: number;
  achievements: Achievement[];
  joinDate: string;
  isCurrentUser?: boolean;
}

interface Achievement {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedDate: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
}

type TimePeriod = 'monthly' | 'quarterly' | 'yearly';
type ViewMode = 'public' | 'anonymous';

// Mock Data
const mockAchievements: Achievement[] = [
  {
    id: 'first-referral',
    name: 'First Steps',
    icon: '🎯',
    description: 'Made your first referral',
    earnedDate: '2024-01-15',
    rarity: 'Common'
  },
  {
    id: 'top-performer',
    name: 'Top Performer',
    icon: '🏆',
    description: 'Reached top 10 this month',
    earnedDate: '2024-01-20',
    rarity: 'Rare'
  },
  {
    id: 'milestone-10',
    name: 'Perfect Ten',
    icon: '💎',
    description: '10 successful referrals',
    earnedDate: '2024-01-25',
    rarity: 'Epic'
  },
  {
    id: 'legend',
    name: 'Legend',
    icon: '👑',
    description: 'Hall of Fame member',
    earnedDate: '2024-01-30',
    rarity: 'Legendary'
  }
];

const mockPartners: Partner[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    tier: 'Platinum',
    earnings: 15420,
    referrals: 28,
    achievements: [mockAchievements[0], mockAchievements[1], mockAchievements[2], mockAchievements[3]],
    joinDate: '2023-06-15',
  },
  {
    id: '2',
    name: 'Michael Chen',
    tier: 'Gold',
    earnings: 12350,
    referrals: 22,
    achievements: [mockAchievements[0], mockAchievements[1], mockAchievements[2]],
    joinDate: '2023-07-20',
  },
  {
    id: '3',
    name: 'You',
    tier: 'Silver',
    earnings: 8750,
    referrals: 15,
    achievements: [mockAchievements[0], mockAchievements[1]],
    joinDate: '2023-09-10',
    isCurrentUser: true,
  },
  {
    id: '4',
    name: 'Emma Rodriguez',
    tier: 'Gold',
    earnings: 11200,
    referrals: 19,
    achievements: [mockAchievements[0], mockAchievements[1], mockAchievements[2]],
    joinDate: '2023-08-05',
  },
  {
    id: '5',
    name: 'David Kim',
    tier: 'Silver',
    earnings: 7890,
    referrals: 13,
    achievements: [mockAchievements[0], mockAchievements[1]],
    joinDate: '2023-10-12',
  },
  {
    id: '6',
    name: 'Lisa Thompson',
    tier: 'Bronze',
    earnings: 4560,
    referrals: 8,
    achievements: [mockAchievements[0]],
    joinDate: '2023-11-18',
  },
  {
    id: '7',
    name: 'James Wilson',
    tier: 'Gold',
    earnings: 10980,
    referrals: 18,
    achievements: [mockAchievements[0], mockAchievements[1], mockAchievements[2]],
    joinDate: '2023-08-22',
  },
  {
    id: '8',
    name: 'Anna Martinez',
    tier: 'Silver',
    earnings: 6750,
    referrals: 11,
    achievements: [mockAchievements[0], mockAchievements[1]],
    joinDate: '2023-12-01',
  }
];

export function PartnerLeaderboard() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('monthly');
  const [viewMode, setViewMode] = useState<ViewMode>('public');
  const [selectedTier, setSelectedTier] = useState<string>('all');

  // Sort partners by earnings
  const sortedPartners = useMemo(() => {
    let filtered = [...mockPartners];
    
    if (selectedTier !== 'all') {
      filtered = filtered.filter(partner => partner.tier.toLowerCase() === selectedTier);
    }
    
    return filtered.sort((a, b) => b.earnings - a.earnings);
  }, [selectedTier]);

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Platinum': return <Crown className="h-5 w-5 text-purple-400" />;
      case 'Gold': return <Trophy className="h-5 w-5 text-yellow-400" />;
      case 'Silver': return <Medal className="h-5 w-5 text-gray-400" />;
      case 'Bronze': return <Award className="h-5 w-5 text-orange-600" />;
      default: return <Star className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Gold': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Silver': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'Bronze': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-6 w-6 text-yellow-400" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Award className="h-6 w-6 text-orange-600" />;
      default: return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
    }
  };

  const getAchievementRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return 'text-purple-400';
      case 'Epic': return 'text-blue-400';
      case 'Rare': return 'text-green-400';
      case 'Common': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const formatEarnings = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getDisplayName = (partner: Partner, index: number) => {
    if (viewMode === 'anonymous' && !partner.isCurrentUser) {
      return `Partner #${index + 1}`;
    }
    return partner.name;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Partner Leaderboard</h1>
          <p className="text-gray-400 mt-1">See how you rank against other partners</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Privacy Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'public' ? 'anonymous' : 'public')}
            className="border-orange-500/30 text-gray-300 hover:bg-orange-500/10"
          >
            {viewMode === 'public' ? (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Public
              </>
            ) : (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Anonymous
              </>
            )}
          </Button>

          {/* Time Period Filter */}
          <Select value={timePeriod} onValueChange={(value: TimePeriod) => setTimePeriod(value)}>
            <SelectTrigger className="w-32 bg-black border-orange-500/30 text-white">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black border-orange-500/30">
              <SelectItem value="monthly" className="text-white hover:bg-orange-500/10">Monthly</SelectItem>
              <SelectItem value="quarterly" className="text-white hover:bg-orange-500/10">Quarterly</SelectItem>
              <SelectItem value="yearly" className="text-white hover:bg-orange-500/10">Yearly</SelectItem>
            </SelectContent>
          </Select>

          {/* Tier Filter */}
          <Select value={selectedTier} onValueChange={setSelectedTier}>
            <SelectTrigger className="w-32 bg-black border-orange-500/30 text-white">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Tiers" />
            </SelectTrigger>
            <SelectContent className="bg-black border-orange-500/30">
              <SelectItem value="all" className="text-white hover:bg-orange-500/10">All Tiers</SelectItem>
              <SelectItem value="platinum" className="text-white hover:bg-orange-500/10">Platinum</SelectItem>
              <SelectItem value="gold" className="text-white hover:bg-orange-500/10">Gold</SelectItem>
              <SelectItem value="silver" className="text-white hover:bg-orange-500/10">Silver</SelectItem>
              <SelectItem value="bronze" className="text-white hover:bg-orange-500/10">Bronze</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-black border border-orange-500/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Your Rank</p>
              <p className="text-2xl font-bold text-white">
                #{sortedPartners.findIndex(p => p.isCurrentUser) + 1}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-black border border-orange-500/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Partners</p>
              <p className="text-2xl font-bold text-white">{sortedPartners.length}</p>
            </div>
            <Users className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-black border border-orange-500/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Your Tier</p>
              <p className="text-2xl font-bold text-white">
                {sortedPartners.find(p => p.isCurrentUser)?.tier || 'Bronze'}
              </p>
            </div>
            {getTierIcon(sortedPartners.find(p => p.isCurrentUser)?.tier || 'Bronze')}
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-black rounded-lg border border-orange-500/20 overflow-hidden">
        <div className="p-6 border-b border-orange-500/20">
          <h2 className="text-xl font-semibold text-white">
            {timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)} Rankings
          </h2>
        </div>
        
        <div className="divide-y divide-orange-500/20">
          <AnimatePresence>
            {sortedPartners.map((partner, index) => (
              <motion.div
                key={partner.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`p-6 hover:bg-orange-500/10 transition-colors ${
                  partner.isCurrentUser ? 'bg-orange-500/10 border-l-4 border-orange-500' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Rank */}
                    <div className="flex items-center justify-center w-12 h-12">
                      {getRankIcon(index + 1)}
                    </div>
                    
                    {/* Avatar & Info */}
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={partner.avatar} alt={partner.name} />
                        <AvatarFallback className="bg-gray-700 text-white">
                          {partner.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-white">
                            {getDisplayName(partner, index)}
                          </h3>
                          {partner.isCurrentUser && (
                            <Badge variant="secondary" className="bg-orange-500/20 text-orange-400">
                              You
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getTierColor(partner.tier)}>
                            {getTierIcon(partner.tier)}
                            <span className="ml-1">{partner.tier}</span>
                          </Badge>
                          
                          <span className="text-gray-400 text-sm">
                            {partner.referrals} referrals
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Earnings & Achievements */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      {formatEarnings(partner.earnings)}
                    </div>
                    
                    {/* Achievements */}
                    <div className="flex items-center justify-end space-x-1 mt-2">
                      {partner.achievements.slice(0, 3).map((achievement) => (
                        <div
                          key={achievement.id}
                          className={`text-lg ${getAchievementRarityColor(achievement.rarity)}`}
                          title={`${achievement.name}: ${achievement.description}`}
                        >
                          {achievement.icon}
                        </div>
                      ))}
                      {partner.achievements.length > 3 && (
                        <span className="text-gray-400 text-sm">
                          +{partner.achievements.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
} 