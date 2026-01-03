import type { LucideIcon } from 'lucide-react';

export type PartnerStatus = 'pending' | 'approved' | 'active' | 'suspended' | 'rejected';
export type PartnerTier = 'starter' | 'active' | 'performer' | 'elite';

export interface PartnerSummary {
  id: string;
  name: string;
  companyName: string;
  status: PartnerStatus;
  tier: PartnerTier;
  ownerName?: string;
  ownerEmail?: string;
  totalReferrals?: number;
  totalRevenue?: number;
  commissionOwed?: number;
  commissionPaid?: number;
  wonReferrals?: number;
  conversionRate?: number;
  lastActiveAt?: string;
}

export interface PartnerTask {
  id: string;
  partnerId: string;
  title: string;
  status: 'todo' | 'in_progress' | 'blocked' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string | null;
  assigneeName?: string;
}

export interface PartnerReferral {
  id: string;
  partnerId: string;
  clientName: string;
  clientEmail?: string;
  stage: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
  estimatedValue?: number;
  actualValue?: number;
  referredAt?: string;
  referralSource?: string;
  commissionAmount?: number;
  commissionStatus?: 'pending' | 'approved' | 'paid';
}

export interface PartnerDocument {
  id: string;
  partnerId: string;
  title: string;
  documentType: 'notion' | 'drive' | 'pdf' | 'link' | 'other';
  url: string;
  updatedAt?: string;
}

export interface PartnerActivityEvent {
  id: string;
  partnerId: string;
  eventType: 'referral' | 'commission' | 'task' | 'note' | 'status' | 'document';
  occurredAt: string;
  summary: string;
  actor?: string;
}

export interface PartnerTabConfig {
  value: string;
  label: string;
  icon: LucideIcon;
}

export interface CreatePartnerTaskInput {
  title: string;
  priority: PartnerTask['priority'];
  dueDate?: string | null;
  description?: string | null;
}

export interface UpdatePartnerTaskInput {
  status?: PartnerTask['status'];
  priority?: PartnerTask['priority'];
  dueDate?: string | null;
  description?: string | null;
}

export interface CreatePartnerDocumentInput {
  title: string;
  url: string;
  documentType: PartnerDocument['documentType'];
}

export interface CreatePartnerReferralInput {
  clientName: string;
  clientEmail: string;
  companyName?: string;
  clientPhone?: string;
  estimatedValue?: number;
  actualValue?: number;
  stage?: PartnerReferral['stage'];
  referralSource?: string;
  notes?: string;
  referredAt?: string;
  commissionAmount?: number;
  commissionStatus?: PartnerReferral['commissionStatus'];
}

export interface UpdatePartnerReferralInput {
  clientName?: string;
  clientEmail?: string;
  companyName?: string;
  clientPhone?: string;
  estimatedValue?: number;
  actualValue?: number;
  stage?: PartnerReferral['stage'];
  referralSource?: string;
  notes?: string;
  referredAt?: string;
  convertedAt?: string;
  commissionAmount?: number;
  commissionStatus?: PartnerReferral['commissionStatus'];
}

export interface UpsertPartnerCommissionInput {
  referralId: string;
  commissionType?: 'referral' | 'override' | 'bonus';
  baseAmount?: number;
  commissionRate?: number;
  commissionAmount: number;
  status?: 'pending' | 'approved' | 'paid' | 'cancelled';
  paymentMethod?: string;
  transactionId?: string;
  paidAt?: string | null;
}
