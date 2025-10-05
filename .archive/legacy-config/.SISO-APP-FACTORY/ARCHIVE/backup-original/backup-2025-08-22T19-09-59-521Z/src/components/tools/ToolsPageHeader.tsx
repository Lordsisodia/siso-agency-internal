
import { FloatingOrbs } from '@/components/effects/FloatingOrbs';
import { HeaderTitle } from './layout/header/HeaderTitle';
import { StatsDisplay } from './layout/header/StatsDisplay';
import { SearchSection } from './layout/header/SearchSection';

interface ToolsPageHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  totalTools?: number;
  categoryStats?: { [key: string]: number };
}

export function ToolsPageHeader({ 
  searchQuery, 
  onSearchChange,
  totalTools = 0,
  categoryStats = {}
}: ToolsPageHeaderProps) {
  return (
    <div className="space-y-8 px-6 py-8">
      <div className="relative">
        {/* Background effects */}
        <FloatingOrbs />
        <div className="absolute inset-0 bg-gradient-radial from-siso-orange/20 via-transparent to-transparent opacity-30 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-siso-red/10 via-transparent to-transparent animate-pulse" />
        </div>

        {/* Content */}
        <div className="relative z-10 space-y-6">
          <HeaderTitle />
          <StatsDisplay 
            totalTools={totalTools || 0} 
            categoryStats={categoryStats || {}} 
          />
          <SearchSection 
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
          />
        </div>
      </div>
    </div>
  );
}
