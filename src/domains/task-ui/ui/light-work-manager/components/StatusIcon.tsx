import React from 'react';
import { CheckCircle2, CircleDotDashed, CircleAlert, CircleX, Circle } from 'lucide-react';

interface StatusIconProps {
  status: string;
  size?: string;
}

export const StatusIcon: React.FC<StatusIconProps> = ({ status, size = "h-4 w-4" }) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className={`${size} text-green-500`} />;
    case 'in-progress':
      return <CircleDotDashed className={`${size} text-blue-500`} />;
    case 'need-help':
      return <CircleAlert className={`${size} text-yellow-500`} />;
    case 'failed':
      return <CircleX className={`${size} text-red-500`} />;
    default:
      return <Circle className={`${size} text-muted-foreground`} />;
  }
};