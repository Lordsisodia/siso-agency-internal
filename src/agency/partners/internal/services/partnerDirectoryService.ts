import { supabase } from '@/services/integrations/supabase/client';
import type { PartnerSummary } from '../types/partner.types';

interface PartnerDirectoryFilters {
  status: string | null;
  tier: string | null;
  search: string;
}

export interface PartnerDirectoryAggregates {
  activePartners: number;
  totalRevenue: number;
  totalCommission: number;
}

const DEFAULT_AGGREGATES: PartnerDirectoryAggregates = {
  activePartners: 0,
  totalRevenue: 0,
  totalCommission: 0,
};

async function listPartners(filters: PartnerDirectoryFilters) {
  let query = supabase
    .from('partners')
    .select(
      `id, full_name, company_name, status, tier, last_login, commission_rate, override_commission, joined_at, updated_at, user_id`,
    )
    .order('joined_at', { ascending: false });

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters.tier && filters.tier !== 'all') {
    query = query.eq('tier', filters.tier);
  }

  if (filters.search) {
    const term = `%${filters.search.trim()}%`;
    query = query.or(`full_name.ilike.${term},company_name.ilike.${term}`);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return data ?? [];
}

async function fetchReferralAggregates(partnerIds: string[]) {
  if (partnerIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('partner_referrals')
    .select('partner_id, status, estimated_value, actual_value, commission_amount')
    .in('partner_id', partnerIds);

  if (error) {
    throw error;
  }

  return data ?? [];
}

async function fetchCommissionAggregates(partnerIds: string[]) {
  if (partnerIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('partner_commissions')
    .select('partner_id, status, commission_amount')
    .in('partner_id', partnerIds);

  if (error) {
    throw error;
  }

  return data ?? [];
}

async function getPartnersWithAggregates(filters: PartnerDirectoryFilters): Promise<{
  partners: PartnerSummary[];
  aggregates: PartnerDirectoryAggregates;
}> {
  const partners = await listPartners(filters);
  const partnerIds = partners.map((partner) => partner.id);

  const [referrals, commissions] = await Promise.all([
    fetchReferralAggregates(partnerIds),
    fetchCommissionAggregates(partnerIds),
  ]);

  const referralTotals = new Map<string, { count: number; revenue: number }>();
  const commissionTotals = new Map<string, { pending: number; total: number }>();

  referrals.forEach((referral) => {
    const entry = referralTotals.get(referral.partner_id) ?? { count: 0, revenue: 0 };
    entry.count += 1;
    if (typeof referral.actual_value === 'number') {
      entry.revenue += referral.actual_value;
    }
    referralTotals.set(referral.partner_id, entry);
  });

  commissions.forEach((commission) => {
    const entry = commissionTotals.get(commission.partner_id) ?? { pending: 0, total: 0 };
    if (typeof commission.commission_amount === 'number') {
      entry.total += commission.commission_amount;
      if (commission.status === 'pending') {
        entry.pending += commission.commission_amount;
      }
    }
    commissionTotals.set(commission.partner_id, entry);
  });

  const partnerSummaries: PartnerSummary[] = partners.map((partner) => {
    const referral = referralTotals.get(partner.id) ?? { count: 0, revenue: 0 };
    const commission = commissionTotals.get(partner.id) ?? { pending: 0, total: 0 };

    return {
      id: partner.id,
      name: partner.full_name ?? 'Partner',
      companyName: partner.company_name ?? '—',
      status: (partner.status ?? 'pending') as PartnerSummary['status'],
      tier: (partner.tier ?? 'starter') as PartnerSummary['tier'],
      ownerName: partner.user_id ?? undefined,
      totalReferrals: referral.count,
      totalRevenue: referral.revenue,
      commissionOwed: commission.pending,
      lastActiveAt: partner.last_login ?? partner.updated_at ?? partner.joined_at ?? undefined,
    };
  });

  const aggregates = partnerSummaries.reduce(
    (acc, partner) => {
      if (partner.status === 'active') {
        acc.activePartners += 1;
      }
      acc.totalRevenue += partner.totalRevenue ?? 0;
      acc.totalCommission += partner.commissionOwed ?? 0;
      return acc;
    },
    { ...DEFAULT_AGGREGATES },
  );

  return { partners: partnerSummaries, aggregates };
}

export const partnerDirectoryService = {
  getPartnersWithAggregates,
};
