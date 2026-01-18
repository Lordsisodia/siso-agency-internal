import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeaderboardFilters } from '../LeaderboardFilters';
import { LeaderboardTable } from '../LeaderboardTable';
import type { LeaderboardEntry } from '../types';

interface LeaderboardContentProps {
  filteredData: LeaderboardEntry[];
  onUserClick: (user: LeaderboardEntry) => void;
  onSearchChange: (search: string) => void;
  onPeriodChange: (period: string) => void;
  onCategoryChange: (category: string) => void;
}

export const LeaderboardContent = ({
  filteredData,
  onUserClick,
  onSearchChange,
  onPeriodChange,
  onCategoryChange,
}: LeaderboardContentProps) => {
  return (
    <Card className="border-siso-border bg-black text-white">
      <CardHeader className="border-b border-gray-800">
        <CardTitle className="flex items-center justify-between text-white">
          <span className="text-white font-bold">Leaderboard Rankings</span>
          <span className="text-sm font-normal text-gray-300">
            Top {Math.min(filteredData.length, 100)} Users
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="bg-black">
        <LeaderboardFilters
          onSearchChange={onSearchChange}
          onPeriodChange={onPeriodChange}
          onCategoryChange={onCategoryChange}
        />
        <LeaderboardTable 
          leaderboardData={filteredData} 
          onUserClick={onUserClick}
        />
      </CardContent>
    </Card>
  );
};
