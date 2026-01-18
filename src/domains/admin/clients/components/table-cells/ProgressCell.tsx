import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ProgressCellProps {
  progress: string;
}

export const ProgressCell = ({ progress }: ProgressCellProps) => {
  const getProgressBadge = (status: string) => {
    switch(status) {
      case 'Not Started':
        return <Badge className="bg-gray-800/60 text-gray-300 hover:bg-gray-800/80 border-gray-700/30">Not Started</Badge>;
      case 'MVP Building':
        return <Badge className="bg-blue-900/60 text-blue-300 hover:bg-blue-900/80 border-blue-700/30">MVP Building</Badge>;
      case 'MVP Built':
        return <Badge className="bg-purple-900/60 text-purple-300 hover:bg-purple-900/80 border-purple-700/30">MVP Built</Badge>;
      case 'In Progress':
        return <Badge className="bg-yellow-900/60 text-yellow-300 hover:bg-yellow-900/80 border-yellow-700/30">In Progress</Badge>;
      case 'Production':
        return <Badge className="bg-green-900/60 text-green-300 hover:bg-green-900/80 border-green-700/30">Production</Badge>;
      case 'Completed':
        return <Badge className="bg-green-900/60 text-green-300 hover:bg-green-900/80 border-green-700/30">Completed</Badge>;
      case 'In Development':
        return <Badge className="bg-orange-900/60 text-orange-300 hover:bg-orange-900/80 border-orange-700/30">In Development</Badge>;
      default:
        return <Badge variant="outline" className="border-gray-600 text-gray-300">{status}</Badge>;
    }
  };

  return getProgressBadge(progress);
}; 