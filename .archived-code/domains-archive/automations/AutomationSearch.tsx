import { memo } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface AutomationSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const AutomationSearch = memo(({ value, onChange }: AutomationSearchProps) => {
  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-siso-text/50" />
      <Input
        type="search"
        placeholder="Search automations..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 bg-siso-bg-alt border-siso-border focus:border-siso-red focus:ring-siso-red/20"
      />
    </div>
  );
});

AutomationSearch.displayName = 'AutomationSearch';