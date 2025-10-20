import { useEffect, useMemo } from 'react';
import { createColumnHelper, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { Badge } from '@/shared/ui/badge';
import { AirtableTable } from '@/shared/common/AirtableTable';
import type { PartnerSummary } from '../../types/partner.types';
import { PARTNER_STATUS_BADGES, PARTNER_STATUS_LABELS } from '../../constants/partnerStatus';

interface PartnerDirectoryTableProps {
  partners: PartnerSummary[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenPartner?: (partnerId: string) => void;
}

const columnHelper = createColumnHelper<PartnerSummary>();

export function PartnerDirectoryTable({ partners, searchQuery, onSearchChange, onOpenPartner }: PartnerDirectoryTableProps) {
  const columns = useMemo(
    () => [
      columnHelper.accessor(
        (row) => `${row.name ?? ''} ${row.companyName ?? ''}`,
        {
          id: 'full_name',
          header: 'Partner',
          cell: (info) => (
            <div className="space-y-1">
              <p className="font-semibold text-white">{info.row.original.companyName}</p>
              <p className="text-xs text-white/60">{info.row.original.name}</p>
            </div>
          ),
          size: 280,
        },
      ),
      columnHelper.accessor('tier', {
        header: 'Tier',
        cell: (info) => (
          <Badge className="border-white/10 bg-white/10 text-xs uppercase tracking-wide text-white/80">
            {info.getValue()}
          </Badge>
        ),
        size: 120,
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => (
          <Badge className={`border-white/10 text-xs uppercase tracking-wide ${PARTNER_STATUS_BADGES[info.getValue()]}`}>
            {PARTNER_STATUS_LABELS[info.getValue()]}
          </Badge>
        ),
        size: 160,
      }),
      columnHelper.accessor('totalReferrals', {
        header: 'Referrals',
        cell: (info) => info.getValue() ?? 0,
        size: 120,
      }),
      columnHelper.accessor('totalRevenue', {
        header: 'Revenue Influence',
        cell: (info) => (info.getValue() ? `£${info.getValue()!.toLocaleString()}` : '—'),
        size: 160,
      }),
      columnHelper.accessor('commissionOwed', {
        header: 'Commission Owed',
        cell: (info) => (info.getValue() ? `£${info.getValue()!.toLocaleString()}` : '£0'),
        size: 150,
      }),
      columnHelper.accessor('lastActiveAt', {
        header: 'Last Active',
        cell: (info) => (info.getValue() ? new Date(info.getValue()!).toLocaleDateString() : '—'),
        size: 160,
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Open',
        cell: (info) => (
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition hover:bg-white/20"
            onClick={() => onOpenPartner?.(info.row.original.id)}
          >
            ↗
          </button>
        ),
        size: 80,
      }),
    ],
    [onOpenPartner],
  );

  const table = useReactTable({
    data: partners,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
  });

  useEffect(() => {
    table.getColumn('full_name')?.setFilterValue(searchQuery);
  }, [searchQuery, table]);

  return (
    <AirtableTable
      table={table}
      columns={columns}
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      deleteSelectedTitle="Delete partners"
    />
  );
}
