
import { supabase } from '@/integrations/supabase/client';

// Helper function to check existing client data
export const updateExistingClientData = async (): Promise<boolean> => {
  try {
    // Check if there are any existing clients
    const { data: existingClients, error: fetchError } = await supabase
      .from('client_onboarding')
      .select('id, company_name')
      .limit(9);
      
    if (fetchError) {
      console.error('Error checking existing clients:', fetchError);
      return false;
    }
    
    console.log('Found existing client data:', existingClients?.length || 0, 'clients');
    return existingClients && existingClients.length > 0;
  } catch (error) {
    console.error('Error in updateExistingClientData:', error);
    return false;
  }
};

// Helper function to make the current user an admin for easier testing
export const makeCurrentUserAdmin = async (): Promise<boolean> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found');
      return false;
    }
    
    console.log('Attempting to make user an admin:', user.id);
    
    // Check if user already has admin role
    const { data: existingRole, error: checkError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking admin role:', checkError);
      return false;
    }
    
    // If already admin, return true
    if (existingRole) {
      console.log('User is already an admin');
      return true;
    }
    
    console.log('Adding admin role to user');
    
    // Add admin role to user
    const { error: insertError } = await supabase
      .from('user_roles')
      .insert({ user_id: user.id, role: 'admin' });
      
    if (insertError) {
      console.error('Error adding admin role:', insertError);
      return false;
    }
    
    console.log('Successfully made user an admin');
    return true;
  } catch (error) {
    console.error('Error in makeCurrentUserAdmin:', error);
    return false;
  }
};
