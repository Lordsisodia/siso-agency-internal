import type { LucideIcon } from 'lucide-react';

interface PartnerMetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
}

export function PartnerMetricCard({ title, value, icon: Icon, hint }: PartnerMetricCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur text-white/80">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">{title}</p>
          <p className="text-xl font-semibold text-white">{value}</p>
          {hint && <p className="text-xs text-white/50">{hint}</p>}
        </div>
        <Icon className="h-5 w-5 text-siso-orange" />
      </div>
    </div>
  );
}
