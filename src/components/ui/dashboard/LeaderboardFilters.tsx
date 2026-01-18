import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, Calendar } from 'lucide-react';
import { useState } from 'react';

interface FilterState {
  search: string;
  period: string;
  category: string;
  tier: string;
}

interface LeaderboardFiltersProps {
  onFilterChange: (filters: Partial<FilterState>) => void;
  onPeriodChange: (period: string) => void;
  onSearchChange?: (search: string) => void;
}

export const LeaderboardFilters: React.FC<LeaderboardFiltersProps> = ({
  onFilterChange,
  onPeriodChange,
  onSearchChange
}) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    period: 'month',
    category: 'all',
    tier: 'all'
  });

  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleFilterUpdate = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
    
    if (key === 'period') {
      onPeriodChange(value);
    }
    
    if (key === 'search' && onSearchChange) {
      onSearchChange(value);
    }

    // Update active filters for display
    const active = Object.entries(newFilters)
      .filter(([k, v]) => v !== '' && v !== 'all' && k !== 'search')
      .map(([k, v]) => `${k}:${v}`);
    setActiveFilters(active);
  };

  const clearFilter = (filterKey: string) => {
    const [key] = filterKey.split(':');
    handleFilterUpdate(key as keyof FilterState, key === 'period' ? 'month' : 'all');
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      search: '',
      period: 'month',
      category: 'all',
      tier: 'all'
    };
    setFilters(clearedFilters);
    setActiveFilters([]);
    onFilterChange(clearedFilters);
    onPeriodChange('month');
    if (onSearchChange) onSearchChange('');
  };

  return (
    <Card className="p-4 bg-siso-bg-alt border-siso-border">
      <div className="space-y-4">
        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search partners..."
              value={filters.search}
              onChange={(e) => handleFilterUpdate('search', e.target.value)}
              className="pl-9 bg-siso-bg border-siso-border text-white"
            />
          </div>

          {/* Time Period */}
          <Select value={filters.period} onValueChange={(value) => handleFilterUpdate('period', value)}>
            <SelectTrigger className="w-40 bg-siso-bg border-siso-border text-white">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>

          {/* Category */}
          <Select value={filters.category} onValueChange={(value) => handleFilterUpdate('category', value)}>
            <SelectTrigger className="w-36 bg-siso-bg border-siso-border text-white">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="earnings">Earnings</SelectItem>
              <SelectItem value="referrals">Referrals</SelectItem>
              <SelectItem value="conversions">Conversions</SelectItem>
            </SelectContent>
          </Select>

          {/* Tier */}
          <Select value={filters.tier} onValueChange={(value) => handleFilterUpdate('tier', value)}>
            <SelectTrigger className="w-32 bg-siso-bg border-siso-border text-white">
              <SelectValue placeholder="Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="bronze">Bronze</SelectItem>
              <SelectItem value="silver">Silver</SelectItem>
              <SelectItem value="gold">Gold</SelectItem>
              <SelectItem value="platinum">Platinum</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear All */}
          {activeFilters.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="border-siso-border text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-400">Active filters:</span>
            {activeFilters.map((filter) => {
              const [key, value] = filter.split(':');
              return (
                <Badge
                  key={filter}
                  variant="secondary"
                  className="bg-siso-primary/20 text-siso-primary border-siso-primary/30"
                >
                  <span className="capitalize">{key}: {value}</span>
                  <button
                    onClick={() => clearFilter(filter)}
                    className="ml-1 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        )}

        {/* Quick Filters */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Quick filters:</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFilterUpdate('tier', 'platinum')}
            className="text-purple-400 hover:text-purple-300"
          >
            Platinum Only
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFilterUpdate('category', 'earnings')}
            className="text-green-400 hover:text-green-300"
          >
            Top Earners
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFilterUpdate('period', 'week')}
            className="text-blue-400 hover:text-blue-300"
          >
            This Week
          </Button>
        </div>
      </div>
    </Card>
  );
};