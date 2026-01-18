import { useState } from 'react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatIndustryFocus, formatIndustryStatus } from '@/domains/admin/industries/utils/formatters';
import { useIndustriesList } from '@/domains/admin/industries/hooks/useIndustriesList';
import { INDUSTRY_FOCUS_LEVELS, INDUSTRY_STATUS_OPTIONS } from '@/domains/admin/industries/constants';
import type { IndustryWithMeta } from '@/domains/admin/industries/types/industry.types';
import { IndustryDetailSheet } from '@/domains/admin/industries/IndustryDetailSheet';

type SortableColumn = 'name' | 'status' | 'focus_level' | 'updated_at';

export function AdminIndustriesView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [focusFilter, setFocusFilter] = useState<string>('all');
  const [sortColumn, setSortColumn] = useState<SortableColumn>('updated_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryWithMeta | null>(null);

  const {
    industries,
    isLoading,
    totalCount,
    refetch,
  } = useIndustriesList({
    searchQuery,
    statusFilter,
    focusFilter,
    sortColumn,
    sortDirection,
  });

  const handleSort = (column: SortableColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortColumn(column);
    setSortDirection(column === 'name' ? 'asc' : 'desc');
  };

  const renderSortIndicator = (column: SortableColumn) => {
    if (sortColumn !== column) {
      return <span className="text-xs text-white/40">↕</span>;
    }

    return sortDirection === 'asc' ? (
      <span className="text-xs text-white/60">↑</span>
    ) : (
      <span className="text-xs text-white/60">↓</span>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#08070E] text-white">
      <div className="border-b border-white/5 bg-[#0F0E16]/80 px-2 py-4 backdrop-blur">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white">Industry Workspace</h1>
            <p className="text-sm text-white/60">
              {isLoading ? 'Loading industries…' : `${totalCount} industries`}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="border-white/10 bg-white/5 text-white hover:bg-white/10"
            disabled={isLoading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search industries"
              className="h-10 rounded-lg border-white/10 bg-white/5 pl-9 text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:bg-white/10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 rounded-lg border-white/10 bg-white/5 text-sm text-white focus:border-white/30 focus:bg-white/10">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-[#14131D] text-white">
              <SelectItem value="all">All statuses</SelectItem>
              {INDUSTRY_STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status} className="capitalize">
                  {formatIndustryStatus(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={focusFilter} onValueChange={setFocusFilter}>
            <SelectTrigger className="h-10 rounded-lg border-white/10 bg-white/5 text-sm text-white focus:border-white/30 focus:bg-white/10">
              <SelectValue placeholder="All focus levels" />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-[#14131D] text-white">
              <SelectItem value="all">All focus levels</SelectItem>
              {INDUSTRY_FOCUS_LEVELS.map((focus) => (
                <SelectItem key={focus} value={focus} className="capitalize">
                  {formatIndustryFocus(focus)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 px-2 py-4 md:px-6">
        <div className="rounded-lg border border-white/5 bg-[#0F0E16]/60 shadow-xl">
          <div className="overflow-x-auto">
            <Table noWrapper className="min-w-full">
              <TableHeader className="sticky top-0 z-10 bg-[#0F0E16]">
                <TableRow className="bg-white/5 text-xs uppercase tracking-wide text-white/60">
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-2">
                      Industry
                      {renderSortIndicator('name')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('focus_level')}>
                    <div className="flex items-center gap-2">
                      Focus
                      {renderSortIndicator('focus_level')}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-2">
                      Status
                      {renderSortIndicator('status')}
                    </div>
                  </TableHead>
                  <TableHead>Clients</TableHead>
                  <TableHead>Open Tasks</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('updated_at')}>
                    <div className="flex items-center gap-2">
                      Updated
                      {renderSortIndicator('updated_at')}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`loading-${index}`} className="border-white/5">
                      <TableCell colSpan={7}>
                        <Skeleton className="h-12 w-full bg-white/10" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : industries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-sm text-white/60">
                      No industries match your filters yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  industries.map((industry) => (
                    <TableRow
                      key={industry.id}
                      className="cursor-pointer border-white/5 transition-colors hover:bg-white/5"
                      onClick={() => setSelectedIndustry(industry)}
                    >
                      <TableCell className="py-2">
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-white">{industry.name}</p>
                          {industry.description && (
                            <p className="text-xs text-white/50 line-clamp-2">{industry.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge variant="outline" className="text-xs border-white/20 bg-white/10 text-white/80">
                          {formatIndustryFocus(industry.focus_level)}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge className="text-xs bg-white/10 text-white">
                          {formatIndustryStatus(industry.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 text-xs">{industry.clientsCount ?? 0}</TableCell>
                      <TableCell className="py-2 text-xs">{industry.openTasksCount ?? 0}</TableCell>
                      <TableCell className="py-2 text-xs">{industry.documentsCount ?? 0}</TableCell>
                      <TableCell className="py-2 text-xs">
                        {industry.updated_at
                          ? new Date(industry.updated_at).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : '—'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <IndustryDetailSheet
        industryId={selectedIndustry?.id ?? null}
        isOpen={Boolean(selectedIndustry)}
        onClose={() => setSelectedIndustry(null)}
      />
    </div>
  );
}
