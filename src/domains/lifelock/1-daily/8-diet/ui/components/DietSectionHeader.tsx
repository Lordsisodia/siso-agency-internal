/**
 * Diet Section Header Component
 *
 * Reusable section header for diet subsections with icon, title, and optional badge.
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DietSectionHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  className?: string;
}

export const DietSectionHeader: React.FC<DietSectionHeaderProps> = ({
  icon: Icon,
  title,
  subtitle,
  badge,
  className
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex items-center justify-between gap-4', className)}
    >
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
          <Icon className="h-7 w-7 text-green-400" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
          {subtitle && (
            <p className="text-sm text-white/60 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {badge && <div className="flex-shrink-0">{badge}</div>}
    </motion.div>
  );
};

DietSectionHeader.displayName = 'DietSectionHeader';
