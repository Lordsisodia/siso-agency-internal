
import { supabase } from '@/integrations/supabase/client';
import { Invoice } from './types';
import { transformInvoiceData } from './utils/invoiceTransformers';
import { transformEntityData } from './utils/relationshipUtils';

/**
 * Fetches invoices with related client and payment method data
 * Uses explicit casting to break recursive type chains
 */
export async function fetchInvoices(): Promise<Invoice[]> {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        client:client_id (*),
        payment_method:payment_method_id (*)
      `)
      .order('issue_date', { ascending: false });

    if (error) {
      console.error('Error fetching invoices:', error);
      return [];
    }

    // Use transformEntityData to break deep type instantiation chains
    return transformEntityData<Invoice>(data || [], transformInvoiceData);
  } catch (err) {
    console.error('Unexpected error in fetchInvoices:', err);
    return [];
  }
}

/**
 * Fetches a single invoice by ID with related data
 * Uses explicit type handling to prevent deep instantiation chains
 */
export async function fetchInvoiceById(invoiceId: string): Promise<Invoice | null> {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        client:client_id (*),
        payment_method:payment_method_id (*)
      `)
      .eq('id', invoiceId)
      .single();

    if (error) {
      console.error('Error fetching invoice by ID:', error);
      return null;
    }

    return transformInvoiceData(data);
  } catch (err) {
    console.error('Unexpected error in fetchInvoiceById:', err);
    return null;
  }
}
