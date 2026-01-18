import { useMemo, useState } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ClientsEnhancedTable } from './ClientsEnhancedTable';

interface AdminClientsViewProps {
  isAdmin: boolean;
}

const BASE_STATUS_VALUES = [
  'all',
  'Not contacted',
  'Contacted',
  'Waiting on client',
  'Feedback from app',
  'Potential',
  'Onboarding',
  'Active',
  'Completed',
  'Archived',
] as const;

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

function formatStatusLabel(value: string): string {
  return value
    .split(/[\s_-]+/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join(' ');
}

export function AdminClientsView({ isAdmin }: AdminClientsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [metrics, setMetrics] = useState<{ totalCount: number; pipelineValue: number; isLoading: boolean }>({
    totalCount: 0,
    pipelineValue: 0,
    isLoading: true,
  });
  const [statusValues, setStatusValues] = useState<string[]>([]);
  const [tableRefetch, setTableRefetch] = useState<(() => Promise<void>) | null>(null);

  const formattedPipelineValue = useMemo(
    () => currencyFormatter.format(metrics.pipelineValue || 0),
    [metrics.pipelineValue]
  );

  const statusOptions = useMemo(() => {
    const uniqueValues = new Set<string>(BASE_STATUS_VALUES);
    statusValues.forEach((value) => {
      if (value) {
        uniqueValues.add(value);
      }
    });

    return Array.from(uniqueValues).map((value) => ({
      value,
      label: value === 'all' ? 'All clients' : formatStatusLabel(value),
    }));
  }, [statusValues]);

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#08070E] text-white">
      <div className="border-b border-white/5 bg-[#0F0E16]/80 px-2 py-4 backdrop-blur">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white">Client Workspace</h1>
            <p className="text-sm text-white/60">
              {metrics.isLoading
                ? 'Loading clients…'
                : `${metrics.totalCount} records · ${formattedPipelineValue} pipeline`}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => tableRefetch?.()}
            className="border-white/10 bg-white/5 text-white hover:bg-white/10"
            disabled={!tableRefetch}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by company, contact, or project"
              className="h-10 rounded-lg border-white/10 bg-white/5 pl-9 text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:bg-white/10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 w-[200px] rounded-lg border-white/10 bg-white/5 text-sm text-white focus:border-white/30 focus:bg-white/10">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-[#14131D] text-white">
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="capitalize">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 px-0 py-2">
        <ClientsEnhancedTable
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          onSearchChange={setSearchQuery}
          onStatusFilterChange={setStatusFilter}
          onMetricsChange={setMetrics}
          onStatusValuesChange={setStatusValues}
          onRefetchReady={(fn) => setTableRefetch(() => fn)}
        />
      </div>
    </div>
  );
}
