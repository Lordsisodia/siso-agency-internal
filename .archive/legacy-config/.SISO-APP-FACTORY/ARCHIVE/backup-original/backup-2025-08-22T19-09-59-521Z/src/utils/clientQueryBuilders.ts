
import { supabase } from '@/integrations/supabase/client';
import { ClientData, ClientsListParams } from '@/types/client.types';
import { safeSupabase } from './supabaseHelpers';

/**
 * Builds a Supabase query for fetching client data based on provided parameters
 */
export const buildClientListQuery = ({ 
  searchQuery = '', 
  statusFilter = 'all',
  sortColumn = 'updated_at',
  sortDirection = 'desc'
}: Partial<ClientsListParams>) => {
  
  let query = safeSupabase
    .from('client_onboarding')
    .select('*', { count: 'exact' });
  
  // Apply text search
  if (searchQuery) {
    query = query.or(`
      contact_name.ilike.%${searchQuery}%,
      company_name.ilike.%${searchQuery}%,
      website_url.ilike.%${searchQuery}%,
      company_niche.ilike.%${searchQuery}%,
      project_name.ilike.%${searchQuery}%
    `);
  }
  
  // Apply status filter
  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }
  
  // Apply sorting
  if (sortColumn && sortDirection) {
    query = query.order(sortColumn, { ascending: sortDirection === 'asc' });
  }
  
  return query;
};

/**
 * Processes raw client data from the database into the required ClientData format
 */
export const processClientData = (data: any[]): ClientData[] => {
  if (!data || !Array.isArray(data)) {
    return [];
  }
  
  return data.map(item => {
    if (!item) return {} as ClientData;
    
    // Safely access properties
    const id = typeof item.id === 'string' ? item.id : '';
    const contactName = typeof item.contact_name === 'string' ? item.contact_name : 'Unknown';
    const companyName = typeof item.company_name === 'string' ? item.company_name : null;
    const status = typeof item.status === 'string' ? item.status : 'pending';
    const currentStep = typeof item.current_step === 'number' ? item.current_step : 1;
    const totalSteps = typeof item.total_steps === 'number' ? item.total_steps : 5;
    const completedSteps = Array.isArray(item.completed_steps) ? item.completed_steps : [];
    const createdAt = typeof item.created_at === 'string' ? item.created_at : new Date().toISOString();
    const updatedAt = typeof item.updated_at === 'string' ? item.updated_at : new Date().toISOString();
    const websiteUrl = typeof item.website_url === 'string' ? item.website_url : null;
    const projectName = typeof item.project_name === 'string' ? item.project_name : null;
    const companyNiche = typeof item.company_niche === 'string' ? item.company_niche : null;
    
    return {
      id,
      full_name: contactName,
      email: null,
      business_name: companyName,
      phone: null,
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${contactName.substring(0, 2)}`,
      status,
      current_step: currentStep,
      total_steps: totalSteps,
      completed_steps: completedSteps,
      created_at: createdAt,
      updated_at: updatedAt,
      website_url: websiteUrl,
      professional_role: null,
      bio: null,
      project_name: projectName,
      company_niche: companyNiche,
      development_url: websiteUrl,
      mvp_build_status: null,
      notion_plan_url: null,
      payment_status: null,
      estimated_price: null,
      initial_contact_date: createdAt,
      start_date: null,
      estimated_completion_date: null
    };
  });
};
