
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { PaymentMethod } from './types';

export async function fetchPaymentMethods(): Promise<PaymentMethod[]> {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .order('name');
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    toast({
      title: 'Error',
      description: 'Failed to load payment methods',
      variant: 'destructive',
    });
    return [];
  }
}
