'use server';

import { supabase } from '@/lib/supabase';

export async function updateContract(contractData: any) {
  const { data, error } = await supabase.rpc('update_contract', { 
    input_data: contractData 
  });
  if (error) {
    console.error('Error updating contract:', error);
    return { success: false, error };
  }
  return data;
}

export async function renewContract(renewalData: { 
  contract_id: string; 
  new_expiry_date: string; 
  terms_notes?: string; 
  initiated_by?: string; 
  is_auto?: boolean; 
}) {
  const { data, error } = await supabase.rpc('renew_contract', { 
    input_data: renewalData 
  });
  if (error) {
    console.error('Error renewing contract:', error);
    return { success: false, error };
  }
  return data;
}

export async function toggleAutoRenewal(contractId: string, autoRenewal: boolean, performedBy?: string) {
  const { data, error } = await supabase.rpc('toggle_auto_renewal', { 
    input_data: { contract_id: contractId, auto_renewal: autoRenewal, performed_by: performedBy } 
  });
  if (error) {
    console.error('Error toggling auto renewal:', error);
    return { success: false, error };
  }
  return data;
}
