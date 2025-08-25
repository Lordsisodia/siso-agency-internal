import React from 'react';
import { Filter, SortAsc, RefreshCw, ListFilter, Zap, Shield, Coins, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuLabel, 
  DropdownMenuRadioGroup, 
  DropdownMenuRadioItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { FeatureFilter, SortOption } from '@/types/feature.types';

interface FeatureControlsProps {
  filter: FeatureFilter;
  setFilter: (filter: FeatureFilter) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  onRetry?: () => void;
  isLoading?: boolean;
  hasError?: boolean;
  categoryFilter: string | null;
  setCategoryFilter: (category: string | null) => void;
}

export function FeatureControls({
  filter,
  setFilter,
  sortBy,
  setSortBy,
  onRetry,
  isLoading,
  hasError,
  categoryFilter,
  setCategoryFilter
}: FeatureControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* Category Filter */}
      <div className="flex items-center gap-2">
        <Button 
          variant={categoryFilter === null ? "default" : "outline"} 
          size="sm" 
          onClick={() => setCategoryFilter(null)}
          className="gap-1 bg-black/40 hover:bg-black/60 border-indigo-500/20"
        >
          <Filter className="h-3.5 w-3.5" />
          All
        </Button>
        
        <Button 
          variant={categoryFilter === 'trading' ? "default" : "outline"} 
          size="sm" 
          onClick={() => setCategoryFilter('trading')}
          className="gap-1 bg-black/40 hover:bg-black/60 border-indigo-500/20"
        >
          <Zap className="h-3.5 w-3.5 text-blue-400" />
          Trading
        </Button>
        
        <Button 
          variant={categoryFilter === 'security' ? "default" : "outline"} 
          size="sm" 
          onClick={() => setCategoryFilter('security')}
          className="gap-1 bg-black/40 hover:bg-black/60 border-indigo-500/20"
        >
          <Shield className="h-3.5 w-3.5 text-purple-400" />
          Security
        </Button>
        
        <Button 
          variant={categoryFilter === 'community' ? "default" : "outline"} 
          size="sm" 
          onClick={() => setCategoryFilter('community')}
          className="gap-1 bg-black/40 hover:bg-black/60 border-indigo-500/20"
        >
          <Users className="h-3.5 w-3.5 text-green-400" />
          Community
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {/* Sort dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1 text-siso-text bg-black/40 hover:bg-black/60 border-indigo-500/20">
              <SortAsc className="h-4 w-4" />
              Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Sort By</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <DropdownMenuRadioItem value="priority">Priority</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="title">Name (A-Z)</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="timeline">Timeline</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Retry button - only show when there's an error */}
        {hasError && onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry} 
            disabled={isLoading}
            className="gap-1 text-siso-text bg-black/40 hover:bg-black/60 border-indigo-500/20"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}
