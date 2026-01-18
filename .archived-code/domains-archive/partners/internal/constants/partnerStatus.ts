import type { PartnerStatus, PartnerTier } from '../types/partner.types';

export const PARTNER_STATUS_LABELS: Record<PartnerStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  active: 'Active',
  suspended: 'Suspended',
  rejected: 'Rejected',
};

export const PARTNER_TIER_LABELS: Record<PartnerTier, string> = {
  starter: 'Starter',
  active: 'Active',
  performer: 'Performer',
  elite: 'Elite',
};

export const PARTNER_STATUS_BADGES: Record<PartnerStatus, string> = {
  pending: 'bg-amber-500/20 text-amber-100 border-amber-400/40',
  approved: 'bg-emerald-500/20 text-emerald-100 border-emerald-400/40',
  active: 'bg-indigo-500/20 text-indigo-100 border-indigo-400/40',
  suspended: 'bg-red-500/20 text-red-100 border-red-400/40',
  rejected: 'bg-slate-500/20 text-slate-100 border-slate-400/40',
};
