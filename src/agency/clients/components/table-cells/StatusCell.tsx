
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusCellProps {
  status: string | null;
}

export function formatStatusLabel(value: string): string {
  return value
    .split(/[\s_-]+/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join(' ');
}

export function normalizeStatusKey(status: string | null | undefined): string {
  if (!status) {
    return 'default';
  }

  return status.trim().toLowerCase().replace(/[\s/-]+/g, '_');
}

interface StatusConfig {
  value: string;
  badgeClassName: string;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  new: { value: 'New', badgeClassName: 'bg-indigo-500/15 text-indigo-100 border-indigo-500/30' },
  potential: { value: 'Potential', badgeClassName: 'bg-amber-500/15 text-amber-100 border-amber-500/30' },
  not_contacted: { value: 'Not contacted', badgeClassName: 'bg-amber-500/20 text-amber-100 border-amber-500/30' },
  contacted: { value: 'Contacted', badgeClassName: 'bg-sky-500/20 text-sky-100 border-sky-500/30' },
  qualifying: { value: 'Qualifying', badgeClassName: 'bg-blue-500/20 text-blue-100 border-blue-500/30' },
  onboarding: { value: 'Onboarding', badgeClassName: 'bg-blue-500/20 text-blue-100 border-blue-500/30' },
  waiting_on_client: { value: 'Waiting on client', badgeClassName: 'bg-purple-500/20 text-purple-100 border-purple-500/30' },
  feedback_from_app: { value: 'Feedback from app', badgeClassName: 'bg-pink-500/20 text-pink-100 border-pink-500/30' },
  in_progress: { value: 'In progress', badgeClassName: 'bg-cyan-500/20 text-cyan-100 border-cyan-500/30' },
  delivery: { value: 'Delivery', badgeClassName: 'bg-orange-500/20 text-orange-100 border-orange-500/30' },
  active: { value: 'Active', badgeClassName: 'bg-emerald-500/20 text-emerald-100 border-emerald-500/30' },
  converted: { value: 'Converted', badgeClassName: 'bg-teal-500/20 text-teal-100 border-teal-500/30' },
  completed: { value: 'Completed', badgeClassName: 'bg-green-500/20 text-green-100 border-green-500/30' },
  archived: { value: 'Archived', badgeClassName: 'bg-slate-600/30 text-slate-100 border-slate-500/30' },
  default: { value: 'Unknown', badgeClassName: 'bg-slate-700/40 text-slate-100 border-slate-600/40' },
};

const statusOptionMap = new Map<string, { value: string; label: string }>();
statusOptionMap.set('', { value: '', label: 'No status' });

Object.entries(STATUS_CONFIG).forEach(([key, config]) => {
  if (key === 'default') {
    return;
  }

  statusOptionMap.set(config.value, { value: config.value, label: config.value });
});

export const CLIENT_STATUS_OPTIONS = Array.from(statusOptionMap.values());

export const StatusCell = ({ status }: StatusCellProps) => {
  const normalizedKey = normalizeStatusKey(status);
  const config = STATUS_CONFIG[normalizedKey] ?? STATUS_CONFIG.default;
  const displayLabel =
    normalizedKey === 'default' && status
      ? formatStatusLabel(status)
      : config.value;

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex min-w-[120px] justify-center rounded-full border border-white/5 px-3 py-1 text-xs font-medium capitalize tracking-wide',
        config.badgeClassName
      )}
    >
      {displayLabel}
    </Badge>
  );
};
