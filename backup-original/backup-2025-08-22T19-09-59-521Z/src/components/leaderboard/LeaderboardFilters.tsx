import { Search, Filter, Calendar, Award } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface LeaderboardFiltersProps {
  onSearchChange: (search: string) => void;
  onPeriodChange: (period: string) => void;
  onCategoryChange: (category: string) => void;
}

export const LeaderboardFilters = ({
  onSearchChange,
  onPeriodChange,
  onCategoryChange,
}: LeaderboardFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search users..."
          className="pl-10 bg-gray-900 border-gray-700 text-white placeholder-gray-400"
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-gray-400" />
          <Select
            defaultValue="week"
            onValueChange={onPeriodChange}
          >
            <SelectTrigger className="w-[140px] bg-gray-900 border-gray-700 text-white">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700 text-white">
              <SelectItem value="today" className="text-white hover:bg-gray-800">Today</SelectItem>
              <SelectItem value="week" className="text-white hover:bg-gray-800">This Week</SelectItem>
              <SelectItem value="month" className="text-white hover:bg-gray-800">This Month</SelectItem>
              <SelectItem value="year" className="text-white hover:bg-gray-800">This Year</SelectItem>
              <SelectItem value="all" className="text-white hover:bg-gray-800">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-1.5">
          <Award className="h-4 w-4 text-gray-400" />
          <Select
            defaultValue="all"
            onValueChange={onCategoryChange}
          >
            <SelectTrigger className="w-[140px] bg-gray-900 border-gray-700 text-white">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700 text-white">
              <SelectItem value="all" className="text-white hover:bg-gray-800">All Categories</SelectItem>
              <SelectItem value="points" className="text-white hover:bg-gray-800">Points</SelectItem>
              <SelectItem value="spending" className="text-white hover:bg-gray-800">Spending</SelectItem>
              <SelectItem value="contributions" className="text-white hover:bg-gray-800">Contributions</SelectItem>
              <SelectItem value="referrals" className="text-white hover:bg-gray-800">Referrals</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          variant="outline" 
          size="icon"
          className="bg-gray-900 border-gray-700 text-white h-10 w-10 hover:bg-gray-800"
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
