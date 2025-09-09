
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ValidationErrorsProps {
  errors: string[];
}

export const ValidationErrors = ({ errors }: ValidationErrorsProps) => {
  if (!errors.length) return null;

  return (
    <div className="bg-destructive/10 p-4 rounded-md space-y-2">
      <div className="font-medium text-destructive flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        Validation Errors
      </div>
      <ul className="list-disc pl-5 space-y-1">
        {errors.map((error, index) => (
          <li key={index} className="text-sm text-destructive">
            {error}
          </li>
        ))}
      </ul>
    </div>
  );
};
