/**
 * Meal Input Component
 *
 * Reusable textarea for meal logging (breakfast, lunch, dinner, snacks)
 */

import React from 'react';
import { Textarea } from '@/shared/ui/textarea';

interface MealInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export const MealInput: React.FC<MealInputProps> = ({
  label,
  value,
  onChange,
  placeholder
}) => {
  return (
    <div>
      <label className="text-white text-sm font-medium">{label}:</label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 bg-pink-900/40 border-pink-600/50 text-white placeholder:text-pink-200/60 focus:border-pink-400 focus:ring-pink-400/20"
        placeholder={placeholder}
      />
    </div>
  );
};
