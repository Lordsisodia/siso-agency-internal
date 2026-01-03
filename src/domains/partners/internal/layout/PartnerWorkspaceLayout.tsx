import { PropsWithChildren, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { RefreshCw, Sparkles, TrendingUp, Users, Wallet } from 'lucide-react';
import type { PartnerSummary } from '../types/partner.types';
import { PARTNER_STATUS_BADGES, PARTNER_TIER_LABELS } from '../constants/partnerStatus';

interface PartnerWorkspaceLayoutProps extends PropsWithChildren {
  partner?: PartnerSummary | null;
  isUpdating?: boolean;
  onRefresh?: () => void | Promise<void>;
}

export function PartnerWorkspaceLayout({
  children,
  partner,
  isUpdating,
  onRefresh,
}: PartnerWorkspaceLayoutProps) {
  const statusBadge = partner ? PARTNER_STATUS_BADGES[partner.status] : PARTNER_STATUS_BADGES.pending;

  const headlineMetrics = useMemo(
    () => [
      {
        label: 'Total Referrals',
        icon: Users,
        value: partner?.totalReferrals?.toString() ?? '—',
      },
      {
        label: 'Revenue Influence',
        icon: TrendingUp,
        value: partner?.totalRevenue ? `£${partner.totalRevenue.toLocaleString()}` : '—',
      },
      {
        label: 'Commission Owed',
        icon: Wallet,
        value: partner?.commissionOwed ? `£${partner.commissionOwed.toLocaleString()}` : '£0',
      },
    ],
    [partner],
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#06050F] via-[#0D0C21] to-[#05040B] text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-siso-orange/20 via-transparent to-siso-purple/20 blur-3xl opacity-40 pointer-events-none" />
        <div className="relative z-10 px-6 pt-12 pb-10 max-w-6xl mx-auto">
          <header className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
            <div className="flex flex-col gap-8 lg:flex-row lg:justify-between">
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl md:text-4xl font-semibold bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                    {partner?.companyName ?? 'Partner Workspace'}
                  </h1>
                  {partner && (
                    <Badge className={cn('text-xs uppercase tracking-wide px-3 py-1 border backdrop-blur', statusBadge)}>
                      {partner.status}
                    </Badge>
                  )}
                  {partner && (
                    <Badge className="text-xs uppercase tracking-wide px-3 py-1 border border-white/20 bg-white/10 text-white/80">
                      {PARTNER_TIER_LABELS[partner.tier]}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-white/60 max-w-2xl">
                  Track partner performance, manage outstanding work, and centralize documents in one workspace.
                </p>

                <div className="grid gap-3 sm:grid-cols-3">
                  {headlineMetrics.map(({ label, icon: Icon, value }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Icon className="h-4 w-4 text-siso-orange" />
                        {label}
                      </span>
                      <span className="font-semibold text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-end gap-3">
                <Button
                  variant="outline"
                  className="border-white/20 bg-white/10 hover:bg-white/20 text-white flex items-center gap-2"
                  onClick={() => onRefresh?.()}
                  disabled={isUpdating}
                >
                  <RefreshCw className={cn('h-4 w-4', isUpdating && 'animate-spin')} />
                  Refresh Data
                </Button>
                <div className="flex items-center gap-3 text-xs text-white/60">
                  <Sparkles className="h-4 w-4 text-siso-orange" />
                  Domain · Partners Workspace
                </div>
              </div>
            </div>
          </header>
        </div>
      </div>

      <main className="relative z-10 px-6 pb-32 md:pb-24">
        <div className="max-w-6xl mx-auto space-y-10">{children}</div>
      </main>
    </div>
  );
}
