import { format } from 'date-fns';
import { ClientData, ClientStatus } from '@/types/client.types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import { Skeleton } from '@/shared/ui/skeleton';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib/utils';

interface AirtableClientsTableProps {
  clients: ClientData[];
  isLoading: boolean;
}

const statusBadgeStyles: Record<ClientStatus | 'default', string> = {
  potential: 'bg-gray-500/20 text-gray-300 border-transparent',
  onboarding: 'bg-yellow-500/20 text-yellow-300 border-transparent',
  active: 'bg-green-500/20 text-green-300 border-transparent',
  completed: 'bg-blue-500/20 text-blue-300 border-transparent',
  archived: 'bg-slate-700/50 text-slate-400 border-transparent',
  default: 'bg-slate-700/50 text-slate-300 border-transparent',
};

export function AirtableClientsTable({ clients, isLoading }: AirtableClientsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full rounded bg-gray-800/60" />
        ))}
      </div>
    );
  }

  if (!clients.length) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-gray-800 bg-gray-900/60 text-sm text-gray-400">
        No clients match your filters yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-800">
            <TableHead className="text-gray-400">Name</TableHead>
            <TableHead className="text-gray-400">Type</TableHead>
            <TableHead className="text-gray-400">Status</TableHead>
            <TableHead className="text-right text-gray-400">Value</TableHead>
            <TableHead className="text-gray-400">Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => {
            const status = (client.status?.toLowerCase() || 'default') as ClientStatus | 'default';
            const formattedUpdatedAt = client.updated_at
              ? format(new Date(client.updated_at), 'MMM d, yyyy')
              : '—';

            return (
              <TableRow key={client.id} className="border-gray-900">
                <TableCell className="font-medium text-white">
                  {client.business_name || client.full_name || 'Untitled Client'}
                </TableCell>
                <TableCell className="text-gray-300">{client.type || '—'}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn('capitalize', statusBadgeStyles[status])}>
                    {client.status || 'Unknown'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-gray-200">
                  {client.estimated_price != null ? `$${client.estimated_price.toLocaleString()}` : '—'}
                </TableCell>
                <TableCell className="text-gray-300">{formattedUpdatedAt}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
