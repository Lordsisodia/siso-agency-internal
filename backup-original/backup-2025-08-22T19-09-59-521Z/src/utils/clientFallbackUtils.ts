import { ClientData, ClientsListParams, ClientsListResponse } from '@/types/client.types';
import { safeSupabase } from './supabaseHelpers';
import { typeHelpers } from './typeHelpers';

/**
 * Fallback function to fetch clients data using an alternative approach
 * This is used when the primary query builder fails
 */
export const fetchClientsFallback = async (
  params: ClientsListParams,
  from: number,
  to: number
): Promise<ClientsListResponse> => {
  try {
    // Attempt to fetch data directly from the client_onboarding table without complex filtering
    const { data, error, count } = await safeSupabase
      .from('client_onboarding')
      .select('*', { count: 'exact' })
      .order(params.sortColumn || 'updated_at', { 
        ascending: params.sortDirection === 'asc' 
      })
      .range(from, to);
    
    if (error) {
      console.error('Error in fallback client fetch:', error);
      return { clients: [], totalCount: 0 };
    }

    if (!data || !Array.isArray(data)) {
      console.error('No data returned or invalid data format');
      return { clients: [], totalCount: 0 };
    }
    
    // Map the data to the expected format with safe property access
    const clients: ClientData[] = data.map((item: any) => {
      // Guard against item being undefined or null
      if (!item) {
        return {
          id: '',
          full_name: 'Unknown',
          business_name: null,
          status: 'pending',
          current_step: 1,
          total_steps: 5,
          completed_steps: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as ClientData;
      }
      
      // Ensure we're accessing properties safely using typeof checks
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
    
    return {
      clients,
      totalCount: count || clients.length
    };
    
  } catch (fallbackError) {
    console.error('Fallback client fetch also failed:', fallbackError);
    
    // Return empty data as last resort
    return {
      clients: [],
      totalCount: 0
    };
  }
};
