import { memo } from 'react';
import { Automation } from './types';
import { AutomationCard } from './AutomationCard';
import { Skeleton } from '@/components/ui/skeleton';

interface AutomationGridProps {
  automations: Automation[] | undefined;
  isLoading: boolean;
  onSelectAutomation: (automation: Automation) => void;
}

export const AutomationGrid = memo(({ 
  automations, 
  isLoading, 
  onSelectAutomation 
}: AutomationGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="relative group">
            <Skeleton className="h-32 bg-gradient-to-br from-siso-text/5 to-siso-text/10 border border-siso-text/10 rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-siso-text/10 to-transparent -translate-x-full animate-shimmer" />
            </Skeleton>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {automations?.map((automation) => (
        <AutomationCard
          key={automation.id}
          automation={automation}
          onClick={onSelectAutomation}
        />
      ))}
    </div>
  );
});

AutomationGrid.displayName = 'AutomationGrid';