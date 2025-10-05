/**
 * Leaderboard Template
 * 
 * A comprehensive leaderboard UI template extracted from the economy leaderboards page.
 * Perfect for ranking systems, competitions, and performance tracking.
 * 
 * Key Features:
 * - Animated leaderboard table with rankings
 * - Trophy and medal icons for top performers
 * - Trend indicators with up/down arrows
 * - Customizable stats display (points, spending, tokens, etc.)
 * - Click handlers for row interactions
 * - Responsive design with smooth animations
 * - Search and filter capabilities
 * - Badge system for user tiers
 * 
 * Usage:
 * <LeaderboardTemplate 
 *   title="Partner Rankings"
 *   subtitle="Top performing partners this month"
 *   entries={partnerData}
 *   onUserClick={(user) => navigate(`/partner/${user.id}`)}
 * />
 */

import { useState } from 'react';
import { Trophy, Users, UserPlus, Clock, Award, Medal, TrendingUp, TrendingDown, CircleDollarSign, CreditCard, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface LeaderboardEntry {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  points: number;
  rank?: string;
  spending?: number;
  contributions?: number;
  referrals?: number;
  tokens?: number;
  lastActive?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: number;
  };
  achievements?: string[];
  tier?: 'bronze' | 'silver' | 'gold' | 'premium';
  bio?: string;
}

interface LeaderboardColumn {
  key: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  sortable?: boolean;
  format?: (value: any, entry: LeaderboardEntry) => React.ReactNode;
}

interface LeaderboardTemplateProps {
  /** Title for the leaderboard */
  title?: string;
  /** Subtitle description */
  subtitle?: string;
  /** Array of leaderboard entries */
  entries: LeaderboardEntry[];
  /** Columns to display */
  columns?: LeaderboardColumn[];
  /** Maximum number of entries to show */
  maxEntries?: number;
  /** Whether to show search */
  showSearch?: boolean;
  /** Whether to show filters */
  showFilters?: boolean;
  /** Whether to show rank badges/trophies */
  showRankBadges?: boolean;
  /** Custom CSS classes */
  className?: string;
  /** Click handler for table rows */
  onUserClick?: (entry: LeaderboardEntry) => void;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Currency symbol for spending display */
  currencySymbol?: string;
  /** Token symbol for token display */
  tokenSymbol?: string;
}

export function LeaderboardTemplate({
  title = "Leaderboard",
  subtitle = "Top performers and their achievements",
  entries = [],
  columns,
  maxEntries = 100,
  showSearch = true,
  showFilters = true,
  showRankBadges = true,
  className = "",
  onUserClick,
  searchPlaceholder = "Search users...",
  currencySymbol = "£",
  tokenSymbol = "TOKENS"
}: LeaderboardTemplateProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('points');
  const [filterBy, setFilterBy] = useState('all');

  // Default columns if none provided
  const defaultColumns: LeaderboardColumn[] = [
    { key: 'rank', label: 'Rank', sortable: false },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'points', label: 'Points', icon: Trophy, sortable: true },
    { key: 'trend', label: 'Trend', sortable: false },
    { key: 'spending', label: 'Spending', icon: CreditCard, sortable: true },
    { key: 'contributions', label: 'Contributions', icon: Users, sortable: true },
    { key: 'referrals', label: 'Referrals', icon: UserPlus, sortable: true },
    { key: 'tokens', label: tokenSymbol, icon: CircleDollarSign, sortable: true },
    { key: 'lastActive', label: 'Last Active', icon: Clock, sortable: true }
  ];

  const displayColumns = columns || defaultColumns;

  // Get display name for user
  const getDisplayName = (entry: LeaderboardEntry) => {
    if (entry.name) return entry.name;
    if (entry.email) {
      const emailParts = entry.email.split('@');
      return emailParts[0];
    }
    return 'Anonymous User';
  };

  // Format date display
  const formatLastActive = (date: string | undefined) => {
    if (!date) return 'Unknown';
    try {
      return format(new Date(date), 'MMM d, yyyy');
    } catch (error) {
      return 'Unknown';
    }
  };

  // Get rank badge for top positions
  const getRankBadge = (position: number) => {
    if (!showRankBadges) return null;
    
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

  // Get trend indicator
  const getTrendIndicator = (trend?: { direction: 'up' | 'down' | 'neutral'; value: number }) => {
    if (!trend) return null;
    
    return (
      <span className={cn(
        "inline-flex items-center text-xs",
        trend.direction === 'up' ? "text-green-500" : trend.direction === 'down' ? "text-red-500" : "text-gray-400"
      )}>
        {trend.direction === 'up' ? (
          <TrendingUp className="w-3 h-3 mr-1" />
        ) : trend.direction === 'down' ? (
          <TrendingDown className="w-3 h-3 mr-1" />
        ) : null}
        {trend.direction !== 'neutral' && (
          <>
            {trend.direction === 'up' ? '+' : '-'}{Math.abs(trend.value)}
          </>
        )}
      </span>
    );
  };

  // Get tier badge
  const getTierBadge = (tier?: string, spending?: number) => {
    if (tier) {
      const tierColors = {
        premium: 'bg-purple-500/30 text-purple-200',
        gold: 'bg-yellow-500/30 text-yellow-200',
        silver: 'bg-gray-500/30 text-gray-200',
        bronze: 'bg-orange-500/30 text-orange-200'
      };
      return (
        <span className={`px-2 py-0.5 text-xs rounded-full ${tierColors[tier as keyof typeof tierColors] || tierColors.bronze}`}>
          {tier.charAt(0).toUpperCase() + tier.slice(1)}
        </span>
      );
    }

    // Auto-calculate tier based on spending if no explicit tier
    if (spending !== undefined) {
      if (spending >= 10000) {
        return <span className="px-2 py-0.5 text-xs bg-purple-500/30 text-purple-200 rounded-full">Premium</span>;
      } else if (spending >= 5000) {
        return <span className="px-2 py-0.5 text-xs bg-yellow-500/30 text-yellow-200 rounded-full">Gold</span>;
      } else if (spending >= 1000) {
        return <span className="px-2 py-0.5 text-xs bg-gray-500/30 text-gray-200 rounded-full">Silver</span>;
      }
      return <span className="px-2 py-0.5 text-xs bg-orange-500/30 text-orange-200 rounded-full">Bronze</span>;
    }

    return null;
  };

  // Filter and sort entries
  const filteredEntries = entries
    .filter(entry => {
      const name = getDisplayName(entry).toLowerCase();
      const matchesSearch = name.includes(searchQuery.toLowerCase());
      
      if (filterBy === 'all') return matchesSearch;
      if (filterBy === 'top10') return matchesSearch;
      // Add more filter logic as needed
      
      return matchesSearch;
    })
    .slice(0, maxEntries);

  // Render cell content based on column type
  const renderCellContent = (column: LeaderboardColumn, entry: LeaderboardEntry, index: number) => {
    if (column.format) {
      return column.format((entry as any)[column.key], entry);
    }

    switch (column.key) {
      case 'rank':
        return (
          <div className="flex items-center justify-center gap-2">
            {getRankBadge(index)}
            <span className={cn(
              "font-bold",
              index < 3 ? "text-white" : "text-gray-300"
            )}>
              {index + 1}
            </span>
          </div>
        );

      case 'name':
        return (
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold">
                {getDisplayName(entry).charAt(0)}
              </div>
              {entry.achievements && entry.achievements.length > 0 && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-[10px] text-white">
                  {entry.achievements.length}
                </div>
              )}
            </div>
            <div>
              <p className="text-white font-semibold">{getDisplayName(entry)}</p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-400">{entry.rank || 'Member'}</p>
                {getTierBadge(entry.tier, entry.spending)}
                {entry.bio && (
                  <p className="text-xs text-gray-300">
                    <span className="text-green-500">●</span> {entry.bio}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 'points':
        return (
          <div className="flex items-center justify-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className="font-medium">{entry.points || 0}</span>
          </div>
        );

      case 'trend':
        return getTrendIndicator(entry.trend);

      case 'spending':
        return (
          <div className="flex items-center justify-center gap-2">
            <CreditCard className="h-4 w-4 text-gray-400" />
            <span>{currencySymbol}{(entry.spending || 0).toLocaleString()}</span>
          </div>
        );

      case 'contributions':
        return (
          <div className="flex items-center justify-center gap-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span>{entry.contributions || 0}</span>
          </div>
        );

      case 'referrals':
        return (
          <div className="flex items-center justify-center gap-2">
            <UserPlus className="h-4 w-4 text-gray-400" />
            <span>{entry.referrals || 0}</span>
          </div>
        );

      case 'tokens':
        return (
          <div className="flex items-center justify-center gap-2">
            <CircleDollarSign className="h-4 w-4 text-orange-400" />
            <span className="font-medium">{entry.tokens || 0}</span>
          </div>
        );

      case 'lastActive':
        return (
          <div className="flex items-center justify-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span>{formatLastActive(entry.lastActive)}</span>
          </div>
        );

      default:
        return <span>{(entry as any)[column.key] || '-'}</span>;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-2">
          {title}
        </h1>
        <p className="text-gray-300">{subtitle}</p>
      </div>

      {/* Controls */}
      {(showSearch || showFilters) && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {showSearch && (
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder={searchPlaceholder}
                className="pl-10 bg-black/50 border-gray-700 text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          )}
          
          {showFilters && (
            <div className="flex gap-2">
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-32 bg-black/50 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="top10">Top 10</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32 bg-black/50 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="points">Points</SelectItem>
                  <SelectItem value="spending">Spending</SelectItem>
                  <SelectItem value="tokens">Tokens</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="relative overflow-x-auto rounded-lg border border-gray-700 bg-black">
        <Table>
          <TableHeader className="sticky top-0 bg-gray-900 z-10">
            <TableRow className="border-b border-gray-800">
              {displayColumns.map((column) => (
                <TableHead key={column.key} className="text-center text-gray-300">
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.map((entry, index) => (
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
                onClick={() => onUserClick?.(entry)}
              >
                {displayColumns.map((column) => (
                  <TableCell key={column.key} className="text-center">
                    {renderCellContent(column, entry, index)}
                  </TableCell>
                ))}
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer Stats */}
      <div className="text-center text-gray-400 text-sm">
        Showing {Math.min(filteredEntries.length, maxEntries)} of {entries.length} entries
      </div>
    </div>
  );
}