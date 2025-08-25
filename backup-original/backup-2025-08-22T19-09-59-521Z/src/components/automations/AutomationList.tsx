import { Automation } from './types';
import { AutomationCard } from './AutomationCard';
import { Skeleton } from '@/components/ui/skeleton';

interface AutomationListProps {
  automations: Automation[] | undefined;
  isLoading: boolean;
  onSelectAutomation: (automation: Automation) => void;
}

export const AutomationList = ({ 
  automations, 
  isLoading, 
  onSelectAutomation 
}: AutomationListProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-32 bg-siso-text/5 rounded-lg border border-siso-text/10" />
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
};