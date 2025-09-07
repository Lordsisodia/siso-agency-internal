
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Vendor } from './types';

export async function fetchVendors(): Promise<Vendor[]> {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .order('name');
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching vendors:', error);
    toast({
      title: 'Error',
      description: 'Failed to load vendors',
      variant: 'destructive',
    });
    return [];
  }
}

// Add a new vendor
export async function addVendor(vendor: Omit<Vendor, 'id'>): Promise<Vendor | null> {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .insert(vendor)
      .select()
      .single();
      
    if (error) throw error;
    
    toast({
      title: 'Success',
      description: 'Vendor added successfully',
    });
    
    return data;
  } catch (error) {
    console.error('Error adding vendor:', error);
    toast({
      title: 'Error',
      description: 'Failed to add vendor',
      variant: 'destructive',
    });
    return null;
  }
}
