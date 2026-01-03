import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { PARTNER_STATUS_LABELS, PARTNER_TIER_LABELS } from '../../constants/partnerStatus';
import type { PartnerSummary } from '../../types/partner.types';
import { PartnerMetricCard } from '../shared';
import { Award, Users, Wallet, Percent, TrendingUp, Mail } from 'lucide-react';

interface PartnerOverviewTabProps {
  partner: PartnerSummary;
}

export function PartnerOverviewTab({ partner }: PartnerOverviewTabProps) {
  const lastActiveHuman = partner.lastActiveAt
    ? formatDistanceToNow(new Date(partner.lastActiveAt), { addSuffix: true })
    : 'No recent activity';

  const formatCurrency = (value?: number) => {
    if (typeof value === 'number' && value > 0) {
      return `£${value.toLocaleString()}`;
    }
    return '—';
  };

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <PartnerMetricCard
          title="Total Referrals"
          value={partner.totalReferrals?.toString() ?? '0'}
          icon={Users}
          hint={partner.wonReferrals ? `Won · ${partner.wonReferrals}` : undefined}
        />
        <PartnerMetricCard
          title="Conversion Rate"
          value={typeof partner.conversionRate === 'number' ? `${partner.conversionRate}%` : '—'}
          icon={Percent}
          hint="Won referrals / total"
        />
        <PartnerMetricCard
          title="Commission Owed"
          value={formatCurrency(partner.commissionOwed)}
          icon={Wallet}
          hint="Pending payouts"
        />
        <PartnerMetricCard
          title="Commission Paid"
          value={formatCurrency(partner.commissionPaid)}
          icon={TrendingUp}
          hint="Lifetime paid out"
        />
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-semibold text-white">{partner.companyName}</h2>
              <Badge className="border-white/10 bg-white/10 text-xs uppercase tracking-wide text-white/80">
                {PARTNER_STATUS_LABELS[partner.status]}
              </Badge>
              <Badge className="border-white/10 bg-white/10 text-xs uppercase tracking-wide text-white/80">
                {PARTNER_TIER_LABELS[partner.tier]}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
              <span className="inline-flex items-center gap-2">
                <Award className="h-4 w-4 text-siso-orange" />
                Primary Contact · {partner.name}
              </span>
              {partner.ownerName && (
                <span className="inline-flex items-center gap-2">
                  <Users className="h-4 w-4 text-siso-orange" />
                  Owner · {partner.ownerName}
                </span>
              )}
              {partner.ownerEmail && (
                <span className="inline-flex items-center gap-2">
                  <Mail className="h-4 w-4 text-siso-orange" />
                  {partner.ownerEmail}
                </span>
              )}
            </div>
          </div>
          <p className="text-sm text-white/60">{lastActiveHuman}</p>
        </div>
      </section>
    </div>
  );
}
