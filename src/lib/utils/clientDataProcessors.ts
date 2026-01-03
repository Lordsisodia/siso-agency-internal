import { ClientData } from '@/types/client.types';

/**
 * Process client detail data from the API response to ClientData format
 */
export const processClientDetail = (data: any, clientId: string): ClientData => {
  // Safely extract profile data with a default empty object
  const profileData = data.profiles || {};
  
  // Process the data to get a flattened structure
  const clientData: ClientData = {
    id: data.id || clientId,
    status: safePropertyAccess(data, 'status', 'pending'),
    current_step: safePropertyAccess(data, 'current_step', 1),
    total_steps: safePropertyAccess(data, 'total_steps', 5),
    completed_steps: Array.isArray(safePropertyAccess(data, 'completed_steps', [])) 
      ? safePropertyAccess(data, 'completed_steps', []) 
      : [],
    created_at: safePropertyAccess(data, 'created_at', new Date().toISOString()),
    updated_at: safePropertyAccess(data, 'updated_at', new Date().toISOString()),
    full_name: safePropertyAccess(data, 'contact_name', 'Unknown'),
    email: null,
    business_name: safePropertyAccess(data, 'company_name', null),
    avatar_url: null,
    phone: null,
    // Additional fields for the detailed view
    website_url: safePropertyAccess(data, 'website_url', null),
    professional_role: null,
    bio: null,
    // Project-related fields
    project_name: safePropertyAccess(data, 'project_name', null),
    company_niche: safePropertyAccess(data, 'company_niche', null),
    development_url: null,
    mvp_build_status: null,
    notion_plan_url: null,
    payment_status: null,
    estimated_price: null,
    initial_contact_date: null,
    start_date: null,
    estimated_completion_date: null,
    todos: Array.isArray(data.todos) ? data.todos : [],
    next_steps: null,
    key_research: null,
    priority: safePropertyAccess(data, 'priority', null),
    // Keep original fields
    contact_name: safePropertyAccess(data, 'contact_name', null),
    company_name: safePropertyAccess(data, 'company_name', null)
  };
  
  return clientData;
};

/**
 * Helper function to create a default client data object with minimal required fields
 */
export function createDefaultClientData(clientId: string): ClientData {
  return {
    id: clientId,
    status: 'pending',
    current_step: 1,
    total_steps: 5,
    completed_steps: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    full_name: 'Unknown',
    email: null,
    business_name: null,
    avatar_url: null,
    phone: null,
    website_url: null,
    professional_role: null,
    bio: null,
    project_name: null,
    company_niche: null,
    development_url: null,
    mvp_build_status: null,
    notion_plan_url: null,
    payment_status: null,
    estimated_price: null,
    initial_contact_date: null,
    start_date: null,
    estimated_completion_date: null,
    todos: [],
    next_steps: null,
    key_research: null,
    priority: null,
    contact_name: null,
    company_name: null
  };
}

/**
 * Safe property access utility function
 */
export function safePropertyAccess(obj: any, path: string, defaultValue: any): any {
  try {
    if (!obj) return defaultValue;
    return obj[path] !== undefined ? obj[path] : defaultValue;
  } catch (error) {
    return defaultValue;
  }
}
