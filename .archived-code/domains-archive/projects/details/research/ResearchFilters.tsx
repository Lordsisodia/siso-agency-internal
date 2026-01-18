
import { Search, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ResearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

export function ResearchFilters({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange
}: ResearchFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 h-4 w-4" />
          <Input 
            type="text" 
            placeholder="Search documents..." 
            className="pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-md text-white w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative">
                <Select value={sortBy} onValueChange={onSortChange}>
                  <SelectTrigger className="w-10 h-10 p-0 justify-center border-white/10 bg-black/40">
                    <Filter className="h-4 w-4 text-neutral-400" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updated">Latest Updated</SelectItem>
                    <SelectItem value="title">Alphabetical</SelectItem>
                    <SelectItem value="category">By Category</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TooltipTrigger>
            <TooltipContent>Sort documents</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
