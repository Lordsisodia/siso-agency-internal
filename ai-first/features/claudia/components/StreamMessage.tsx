import React from 'react';
import { cn } from '@/lib/utils';

interface StreamMessageProps {
  message: any;
  className?: string;
}

export const StreamMessage: React.FC<StreamMessageProps> = ({ message, className }) => {
  return (
    <div className={cn("p-4 border rounded-lg", className)}>
      <pre className="whitespace-pre-wrap">{JSON.stringify(message, null, 2)}</pre>
    </div>
  );
};