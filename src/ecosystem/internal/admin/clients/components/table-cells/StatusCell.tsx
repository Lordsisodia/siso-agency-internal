
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface StatusCellProps {
  status: string | null;
}

export const StatusCell = ({ status }: StatusCellProps) => {
  switch (status) {
    case 'contacted':
      return <Badge className="bg-blue-500/20 text-blue-400">Contacted</Badge>;
    case 'converted':
      return <Badge className="bg-green-500/20 text-green-400">Converted</Badge>;
    case 'new':
    default:
      return <Badge className="bg-amber-500/20 text-amber-400">New</Badge>;
  }
};
