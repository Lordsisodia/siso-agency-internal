// Partnership Program TypeScript Types
// Generated from Supabase Database Schema - Agent 3 Task 50

import { Database } from './supabase'

// =====================================================
// PARTNERSHIP PROGRAM CORE TYPES
// =====================================================

export type PartnerApplication = Database['public']['Tables']['partner_applications']['Row']
export type PartnerApplicationInsert = Database['public']['Tables']['partner_applications']['Insert']
export type PartnerApplicationUpdate = Database['public']['Tables']['partner_applications']['Update']

export type Partner = Database['public']['Tables']['partners']['Row']
export type PartnerInsert = Database['public']['Tables']['partners']['Insert']
export type PartnerUpdate = Database['public']['Tables']['partners']['Update']

export type ClientLead = Database['public']['Tables']['client_leads']['Row']
export type ClientLeadInsert = Database['public']['Tables']['client_leads']['Insert']
export type ClientLeadUpdate = Database['public']['Tables']['client_leads']['Update']

export type Commission = Database['public']['Tables']['commissions']['Row']
export type CommissionInsert = Database['public']['Tables']['commissions']['Insert']
export type CommissionUpdate = Database['public']['Tables']['commissions']['Update']

export type AppPlanPartnership = Database['public']['Tables']['app_plans_partnership']['Row']
export type AppPlanPartnershipInsert = Database['public']['Tables']['app_plans_partnership']['Insert']
export type AppPlanPartnershipUpdate = Database['public']['Tables']['app_plans_partnership']['Update']

// =====================================================
// PARTNERSHIP PROGRAM ENUMS
// =====================================================

export type PartnerApplicationStatus = 'pending' | 'approved' | 'rejected' | 'under_review'
export type PartnerStatus = 'active' | 'inactive' | 'suspended' | 'pending'
export type PartnerTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
export type ClientLeadStatus = 'prospect' | 'qualified' | 'proposal_sent' | 'negotiating' | 'closed_won' | 'closed_lost'
export type CommissionStatus = 'pending' | 'approved' | 'paid' | 'disputed' | 'cancelled'
export type AppPlanStatus = 'draft' | 'generated' | 'reviewed' | 'approved' | 'delivered'
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

// =====================================================
// PARTNERSHIP PROGRAM EXTENDED TYPES
// =====================================================

export interface PartnerWithStats extends Partner {
  total_leads: number
  conversion_rate: number
  avg_deal_size: number
  last_activity: string | null
  commission_summary: {
    pending: number
    paid: number
    total: number
  }
}

export interface ClientLeadWithPartner extends ClientLead {
  partner: Partner | null
  commissions: Commission[]
  app_plans: AppPlanPartnership[]
}

export interface CommissionWithDetails extends Commission {
  partner: Partner | null
  client_lead: ClientLead | null
}

export interface PartnerDashboardData {
  partner: PartnerWithStats
  recent_leads: ClientLead[]
  pending_commissions: Commission[]
  performance_metrics: {
    this_month: {
      leads: number
      deals_closed: number
      earnings: number
    }
    last_month: {
      leads: number
      deals_closed: number
      earnings: number
    }
    growth: {
      leads_percent: number
      deals_percent: number
      earnings_percent: number
    }
  }
  tier_progress: {
    current_tier: PartnerTier
    next_tier: PartnerTier | null
    progress_percent: number
    requirements: {
      earnings_needed: number
      deals_needed: number
    }
  }
}

// =====================================================
// PARTNERSHIP PROGRAM API TYPES
// =====================================================

export interface PartnerApplicationRequest {
  name: string
  email: string
  phone?: string
  company?: string
  network_description?: string
  expected_referrals?: number
  experience_level?: ExperienceLevel
}

export interface ClientLeadRequest {
  client_name: string
  client_email?: string
  client_phone?: string
  business_name?: string
  project_description?: string
  estimated_value?: number
}

export interface AppPlanGenerationRequest {
  client_lead_id: string
  business_name: string
  industry?: string
  features?: Record<string, any>
  timeline_estimate?: string
  investment_range?: string
}

// =====================================================
// PARTNERSHIP PROGRAM FORM TYPES
// =====================================================

export interface PartnerApplicationForm {
  name: string
  email: string
  phone: string
  company: string
  network_description: string
  expected_referrals: number
  experience_level: ExperienceLevel
  terms_accepted: boolean
}

export interface ClientLeadForm {
  client_name: string
  client_email: string
  client_phone: string
  business_name: string
  project_description: string
  estimated_value: number
  urgency: 'low' | 'medium' | 'high'
  source: string
}

// =====================================================
// PARTNERSHIP PROGRAM ANALYTICS TYPES
// =====================================================

export interface PartnershipAnalytics {
  overview: {
    total_partners: number
    active_partners: number
    total_leads: number
    conversion_rate: number
    total_commissions_paid: number
    avg_deal_size: number
  }
  partner_performance: {
    top_performers: PartnerWithStats[]
    tier_distribution: Record<PartnerTier, number>
    monthly_growth: {
      new_partners: number
      new_leads: number
      deals_closed: number
    }
  }
  lead_pipeline: {
    by_status: Record<ClientLeadStatus, number>
    by_source: Record<string, number>
    avg_time_to_close: number
    pipeline_value: number
  }
  commission_tracking: {
    pending_amount: number
    paid_this_month: number
    avg_commission_rate: number
    payment_schedule: {
      due_this_week: Commission[]
      due_next_week: Commission[]
      overdue: Commission[]
    }
  }
}

// =====================================================
// PARTNERSHIP PROGRAM NOTIFICATION TYPES
// =====================================================

export interface PartnershipNotification {
  id: string
  type: 'application_received' | 'lead_assigned' | 'commission_earned' | 'payment_processed' | 'tier_upgraded'
  title: string
  message: string
  partner_id?: string
  client_lead_id?: string
  commission_id?: string
  created_at: string
  read: boolean
  action_url?: string
}

// =====================================================
// PARTNERSHIP PROGRAM WEBHOOK TYPES
// =====================================================

export interface PartnershipWebhookPayload {
  event: 'partner.application.submitted' | 'partner.approved' | 'lead.created' | 'commission.paid'
  data: PartnerApplication | Partner | ClientLead | Commission
  timestamp: string
  partner_id?: string
}

// =====================================================
// PARTNERSHIP PROGRAM UTILITY TYPES
// =====================================================

export type PartnershipTableName = 'partner_applications' | 'partners' | 'client_leads' | 'commissions' | 'app_plans_partnership'

export interface PartnershipFilters {
  status?: string[]
  tier?: PartnerTier[]
  date_range?: {
    start: string
    end: string
  }
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface PaginationParams {
  page: number
  limit: number
  total?: number
}

export interface PartnershipApiResponse<T> {
  data: T
  pagination?: PaginationParams
  filters?: PartnershipFilters
  success: boolean
  message?: string
}

// =====================================================
// PARTNERSHIP PROGRAM ERROR TYPES
// =====================================================

export interface PartnershipError {
  code: string
  message: string
  details?: Record<string, any>
  field?: string
}

export type PartnershipValidationError = {
  field: string
  message: string
  code: string
}[]

// =====================================================
// EXPORT ALL TYPES
// =====================================================

export type {
  Database,
  PartnerApplication,
  PartnerApplicationInsert,
  PartnerApplicationUpdate,
  Partner,
  PartnerInsert,
  PartnerUpdate,
  ClientLead,
  ClientLeadInsert,
  ClientLeadUpdate,
  Commission,
  CommissionInsert,
  CommissionUpdate,
  AppPlanPartnership,
  AppPlanPartnershipInsert,
  AppPlanPartnershipUpdate
} 