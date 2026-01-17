/**
 * Meal Input Component
 *
 * Enhanced meal logging with better visual design and icons
 */

import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Coffee, Soup, UtensilsCrossed, Apple } from 'lucide-react';

interface MealInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

const getMealIcon = (label: string) => {
  switch (label.toLowerCase()) {
    case 'breakfast':
      return Coffee;
    case 'lunch':
      return Soup;
    case 'dinner':
      return UtensilsCrossed;
    case 'snacks':
      return Apple;
    default:
      return UtensilsCrossed;
  }
};

export const MealInput: React.FC<MealInputProps> = ({
  label,
  value,
  onChange,
  placeholder
}) => {
  const Icon = getMealIcon(label);
  const hasContent = value && value.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`bg-gradient-to-br border-2 transition-all duration-300 ${
        hasContent
          ? 'from-green-900/40 to-emerald-900/40 border-green-500/50 shadow-lg shadow-green-500/10'
          : 'from-green-950/30 to-emerald-950/30 border-green-600/30'
      }`}>
        <div className="p-5">
          {/* Header with icon and label */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2.5 rounded-xl transition-all duration-300 ${
              hasContent
                ? 'bg-gradient-to-br from-green-500/30 to-emerald-500/30 border border-green-400/40'
                : 'bg-green-950/50 border border-green-600/30'
            }`}>
              <Icon className={`h-5 w-5 transition-colors ${
                hasContent ? 'text-green-300' : 'text-green-400/60'
              }`} />
            </div>
            <div className="flex-1">
              <label className="text-green-100 font-semibold text-base block">{label}</label>
              {hasContent && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-green-400/80"
                >
                  Logged
                </motion.span>
              )}
            </div>
            {hasContent && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-2 h-2 rounded-full bg-green-400"
              />
            )}
          </div>

          {/* Textarea with enhanced styling */}
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`min-h-[120px] bg-green-950/60 border-green-600/40 text-white placeholder:text-green-200/50
              focus:border-green-400/60 focus:ring-green-400/20 transition-all duration-200
              resize-none rounded-lg text-base leading-relaxed`}
            placeholder={placeholder}
          />

          {/* Character count hint */}
          {value && value.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-xs text-green-400/60 text-right"
            >
              {value.length} {value.length === 1 ? 'character' : 'characters'}
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};
