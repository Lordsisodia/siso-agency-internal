// Partnership Program API Functions
// Complete backend integration with Supabase for all partnership operations

import { supabase } from "@/integrations/supabase/client";
import type {
  PartnerApplication,
  PartnerApplicationData,
  Partner,
  ClientLead,
  ClientLeadData,
  Commission,
  AppPlanPartnership,
  PartnershipStats,
  LeaderboardEntry,
  PartnerStats,
  ApiResponse,
  PaginatedResponse,
  CommissionCalculation
} from "@/types/partnership";

// ==================== APPLICATION MANAGEMENT ====================

/**
 * Submit a new partner application
 */
export async function submitPartnerApplication(
  data: PartnerApplicationData
): Promise<ApiResponse<PartnerApplication>> {
  try {
    // Convert camelCase to snake_case for database
    const dbData = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      company: data.company,
      network_description: data.networkDescription,
      expected_referrals: data.expectedReferrals,
      experience_level: data.experienceLevel,
    };

    const { data: application, error } = await supabase
      .from('partner_applications')
      .insert([dbData])
      .select()
      .single();

    if (error) {
      console.error('Error submitting application:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to submit application'
      };
    }

    // Trigger email notification
    await triggerEmailNotification({
      to: data.email,
      template: 'application_received',
      data: { name: data.name, email: data.email }
    });

    return {
      success: true,
      data: convertApplicationFromDb(application),
      message: 'Application submitted successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to submit application'
    };
  }
}

/**
 * Get application status by email
 */
export async function getApplicationStatus(email: string): Promise<ApiResponse<PartnerApplication | null>> {
  try {
    const { data: application, error } = await supabase
      .from('partner_applications')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      return {
        success: false,
        error: error.message,
        message: 'Error checking application status'
      };
    }

    return {
      success: true,
      data: application ? convertApplicationFromDb(application) : null,
      message: application ? 'Application found' : 'No application found'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// ==================== STATISTICS & ANALYTICS ====================

/**
 * Get partnership program statistics
 */
export async function getPartnershipStats(): Promise<ApiResponse<PartnershipStats>> {
  try {
    // Get active partners count
    const { count: activePartners } = await supabase
      .from('partners')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Get total commissions paid
    const { data: paidCommissions } = await supabase
      .from('commissions')
      .select('commission_amount')
      .eq('status', 'paid');

    const totalCommissionsPaid = paidCommissions?.reduce(
      (sum, commission) => sum + Number(commission.commission_amount), 0
    ) || 0;

    // Get successful projects
    const { count: successfulProjects } = await supabase
      .from('client_leads')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    // Get total applications
    const { count: totalApplications } = await supabase
      .from('partner_applications')
      .select('*', { count: 'exact', head: true });

    // Get approved applications
    const { count: approvedApplications } = await supabase
      .from('partner_applications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');

    const stats: PartnershipStats = {
      activePartners: activePartners || 0,
      totalCommissionsPaid,
      successfulProjects: successfulProjects || 0,
      averageCommission: paidCommissions?.length ? totalCommissionsPaid / paidCommissions.length : 0,
      totalApplications: totalApplications || 0,
      approvalRate: totalApplications ? ((approvedApplications || 0) / totalApplications) * 100 : 0
    };

    return {
      success: true,
      data: stats,
      message: 'Statistics retrieved successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to get statistics'
    };
  }
}

/**
 * Get leaderboard data
 */
export async function getLeaderboardData(
  period: 'monthly' | 'quarterly' | 'yearly' = 'monthly',
  limit: number = 10
): Promise<ApiResponse<LeaderboardEntry[]>> {
  try {
    const { data: partners, error } = await supabase
      .from('partners')
      .select(`
        id,
        name,
        tier,
        total_earnings,
        total_deals
      `)
      .eq('status', 'active')
      .order('total_earnings', { ascending: false })
      .limit(limit);

    if (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to get leaderboard data'
      };
    }

    const leaderboard: LeaderboardEntry[] = partners.map((partner, index) => ({
      partnerId: partner.id,
      partnerName: partner.name,
      tier: partner.tier,
      totalEarnings: Number(partner.total_earnings),
      totalDeals: partner.total_deals,
      rank: index + 1
    }));

    return {
      success: true,
      data: leaderboard,
      message: 'Leaderboard retrieved successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to get leaderboard data'
    };
  }
}

// ==================== PARTNER DASHBOARD ====================

/**
 * Get partner profile
 */
export async function getPartnerProfile(partnerId: string): Promise<ApiResponse<Partner>> {
  try {
    const { data: partner, error } = await supabase
      .from('partners')
      .select('*')
      .eq('id', partnerId)
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
        message: 'Partner not found'
      };
    }

    return {
      success: true,
      data: convertPartnerFromDb(partner),
      message: 'Partner profile retrieved successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get partner statistics
 */
export async function getPartnerStats(partnerId: string): Promise<ApiResponse<PartnerStats>> {
  try {
    // Get partner basic info
    const { data: partner } = await supabase
      .from('partners')
      .select('total_earnings, total_deals, tier')
      .eq('id', partnerId)
      .single();

    // Get pending commissions
    const { data: pendingCommissions } = await supabase
      .from('commissions')
      .select('commission_amount')
      .eq('partner_id', partnerId)
      .eq('status', 'pending');

    const pendingAmount = pendingCommissions?.reduce(
      (sum, commission) => sum + Number(commission.commission_amount), 0
    ) || 0;

    // Get completed deals
    const { count: completedDeals } = await supabase
      .from('client_leads')
      .select('*', { count: 'exact', head: true })
      .eq('partner_id', partnerId)
      .eq('status', 'completed');

    const stats: PartnerStats = {
      totalEarnings: Number(partner?.total_earnings || 0),
      totalDeals: partner?.total_deals || 0,
      pendingCommissions: pendingAmount,
      completedDeals: completedDeals || 0,
      currentTier: partner?.tier || 'Bronze',
      monthlyPerformance: [] // TODO: Implement monthly performance tracking
    };

    return {
      success: true,
      data: stats,
      message: 'Partner statistics retrieved successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get partner commissions
 */
export async function getPartnerCommissions(
  partnerId: string,
  page: number = 1,
  limit: number = 10
): Promise<ApiResponse<PaginatedResponse<Commission>>> {
  try {
    const offset = (page - 1) * limit;

    const { data: commissions, error, count } = await supabase
      .from('commissions')
      .select(`
        *,
        client_leads!inner(client_name, business_name)
      `, { count: 'exact' })
      .eq('partner_id', partnerId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to get commissions'
      };
    }

    const result: PaginatedResponse<Commission> = {
      data: commissions.map(convertCommissionFromDb),
      count: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };

    return {
      success: true,
      data: result,
      message: 'Commissions retrieved successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get partner leads
 */
export async function getPartnerLeads(
  partnerId: string,
  page: number = 1,
  limit: number = 10
): Promise<ApiResponse<PaginatedResponse<ClientLead>>> {
  try {
    const offset = (page - 1) * limit;

    const { data: leads, error, count } = await supabase
      .from('client_leads')
      .select('*', { count: 'exact' })
      .eq('partner_id', partnerId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to get leads'
      };
    }

    const result: PaginatedResponse<ClientLead> = {
      data: leads.map(convertLeadFromDb),
      count: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };

    return {
      success: true,
      data: result,
      message: 'Leads retrieved successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// ==================== LEAD MANAGEMENT ====================

/**
 * Add new client lead
 */
export async function addClientLead(
  partnerId: string,
  leadData: ClientLeadData
): Promise<ApiResponse<ClientLead>> {
  try {
    const dbData = {
      partner_id: partnerId,
      client_name: leadData.clientName,
      client_email: leadData.clientEmail,
      client_phone: leadData.clientPhone,
      business_name: leadData.businessName,
      project_description: leadData.projectDescription,
      estimated_value: leadData.estimatedValue,
    };

    const { data: lead, error } = await supabase
      .from('client_leads')
      .insert([dbData])
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to add lead'
      };
    }

    return {
      success: true,
      data: convertLeadFromDb(lead),
      message: 'Lead added successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// ==================== COMMISSION CALCULATIONS ====================

/**
 * Calculate commission based on project value and tier
 */
export function calculateCommission(
  projectValue: number,
  tier: string = 'Bronze'
): CommissionCalculation {
  // Commission rates by tier
  const rates = {
    Bronze: 15,
    Silver: 17.5,
    Gold: 20,
    Platinum: 22.5
  };

  const commissionRate = rates[tier as keyof typeof rates] || rates.Bronze;
  const commissionAmount = (projectValue * commissionRate) / 100;

  return {
    projectValue,
    commissionRate,
    commissionAmount,
    tier
  };
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Convert database row to PartnerApplication interface
 */
function convertApplicationFromDb(dbRow: any): PartnerApplication {
  return {
    id: dbRow.id,
    name: dbRow.name,
    email: dbRow.email,
    phone: dbRow.phone,
    company: dbRow.company,
    networkDescription: dbRow.network_description,
    expectedReferrals: dbRow.expected_referrals,
    experienceLevel: dbRow.experience_level,
    status: dbRow.status,
    createdAt: dbRow.created_at,
    updatedAt: dbRow.updated_at
  };
}

/**
 * Convert database row to Partner interface
 */
function convertPartnerFromDb(dbRow: any): Partner {
  return {
    id: dbRow.id,
    applicationId: dbRow.application_id,
    name: dbRow.name,
    email: dbRow.email,
    phone: dbRow.phone,
    company: dbRow.company,
    tier: dbRow.tier,
    totalEarnings: Number(dbRow.total_earnings),
    totalDeals: dbRow.total_deals,
    status: dbRow.status,
    createdAt: dbRow.created_at,
    updatedAt: dbRow.updated_at
  };
}

/**
 * Convert database row to ClientLead interface
 */
function convertLeadFromDb(dbRow: any): ClientLead {
  return {
    id: dbRow.id,
    partnerId: dbRow.partner_id,
    clientName: dbRow.client_name,
    clientEmail: dbRow.client_email,
    clientPhone: dbRow.client_phone,
    businessName: dbRow.business_name,
    projectDescription: dbRow.project_description,
    estimatedValue: dbRow.estimated_value ? Number(dbRow.estimated_value) : undefined,
    status: dbRow.status,
    createdAt: dbRow.created_at,
    updatedAt: dbRow.updated_at
  };
}

/**
 * Convert database row to Commission interface
 */
function convertCommissionFromDb(dbRow: any): Commission {
  return {
    id: dbRow.id,
    partnerId: dbRow.partner_id,
    clientLeadId: dbRow.client_lead_id,
    projectValue: Number(dbRow.project_value),
    commissionRate: Number(dbRow.commission_rate),
    commissionAmount: Number(dbRow.commission_amount),
    status: dbRow.status,
    paidAt: dbRow.paid_at,
    createdAt: dbRow.created_at
  };
}

/**
 * Trigger email notification (placeholder for Edge Function)
 */
async function triggerEmailNotification(notification: {
  to: string;
  template: string;
  data: Record<string, any>;
}): Promise<void> {
  try {
    // This will be implemented with Supabase Edge Functions
    console.log('Email notification triggered:', notification);
    
    // TODO: Call Supabase Edge Function for email sending
    // await supabase.functions.invoke('send-email', {
    //   body: notification
    // });
  } catch (error) {
    console.error('Failed to send email notification:', error);
  }
}