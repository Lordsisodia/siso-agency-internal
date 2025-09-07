
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MilestoneCardProps {
  title: string;
  date: string;
  description: React.ReactNode;
  payment?: {
    amount: number;
    trigger: string;
  };
  status: 'completed' | 'in-progress' | 'upcoming';
  deliverables: string[];
  criteria: string[];
}

export function MilestoneCard({
  title,
  date,
  description,
  payment,
  status,
  deliverables,
  criteria
}: MilestoneCardProps) {
  return (
    <div className="bg-black/20 rounded-lg p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-medium text-white">{title}</h3>
          <p className="text-sm text-siso-text mt-1">{date}</p>
        </div>
        <Badge 
          variant={
            status === 'completed' ? 'success' : 
            status === 'in-progress' ? 'info' : 
            'secondary'
          }
        >
          {status === 'completed' ? 'Completed' :
           status === 'in-progress' ? 'In Progress' :
           'Upcoming'}
        </Badge>
      </div>

      {payment && (
        <div className="bg-green-500/20 text-green-400 rounded-md p-3 text-sm">
          <span className="font-medium">Payment: </span>
          £{payment.amount.toLocaleString()}
          <p className="text-xs mt-1 text-green-500/80">{payment.trigger}</p>
        </div>
      )}

      <div className="space-y-3">
        <h4 className="font-medium text-white">Deliverables:</h4>
        <ul className="list-disc list-inside space-y-1 text-siso-text text-sm">
          {deliverables.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-white">Completion Criteria:</h4>
        <ul className="list-disc list-inside space-y-1 text-siso-text text-sm">
          {criteria.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
