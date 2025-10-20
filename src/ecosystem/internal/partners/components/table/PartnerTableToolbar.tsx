import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

interface PartnerTableToolbarProps {
  filters: {
    status: string | null;
    tier: string | null;
  search: string;
  };
  onFiltersChange: (filters: PartnerTableToolbarProps['filters']) => void;
  onAddPartner?: () => void;
  onRefresh?: () => void;
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'rejected', label: 'Rejected' },
];

const TIER_OPTIONS = [
  { value: '', label: 'All Tiers' },
  { value: 'starter', label: 'Starter' },
  { value: 'active', label: 'Active' },
  { value: 'performer', label: 'Performer' },
  { value: 'elite', label: 'Elite' },
];

export function PartnerTableToolbar({ filters, onFiltersChange, onAddPartner, onRefresh }: PartnerTableToolbarProps) {
  const handleUpdate = (next: Partial<PartnerTableToolbarProps['filters']>) => {
    onFiltersChange({ ...filters, ...next });
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={filters.search}
          onChange={(event) => handleUpdate({ search: event.target.value })}
          placeholder="Search partners or companies"
          className="bg-black/40 text-white placeholder:text-white/40"
        />
        <select
          value={filters.status ?? ''}
          onChange={(event) => handleUpdate({ status: event.target.value || null })}
          className="h-10 rounded-md border border-white/10 bg-black/40 px-3 text-sm text-white outline-none"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value} className="bg-slate-900 text-white">
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={filters.tier ?? ''}
          onChange={(event) => handleUpdate({ tier: event.target.value || null })}
          className="h-10 rounded-md border border-white/10 bg-black/40 px-3 text-sm text-white outline-none"
        >
          {TIER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value} className="bg-slate-900 text-white">
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" className="text-white" onClick={onRefresh}>
          Refresh
        </Button>
        <Button className="bg-siso-orange text-black" onClick={onAddPartner}>
          Add Partner
        </Button>
      </div>
    </div>
  );
}
