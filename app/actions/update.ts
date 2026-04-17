'use server';

import { supabase } from '@/lib/supabase';
import { validateContract, validateRenewal } from '@/lib/validation';
import { ContractFormValues } from '@/components/contracts/ContractForm';

export async function updateContract(contractData: ContractFormValues): Promise<{ success: boolean; message?: string; errors?: any }> {
  // Manual server-side validation
  const validation = validateContract(contractData);
  
  if (!validation.isValid) {
    return { 
      success: false, 
      message: Object.values(validation.errors)[0] || 'Invalid contract data',
      errors: validation.errors 
    };
  }

  const { data, error } = await supabase.rpc('update_contract', { 
    input_data: {
      ...contractData,
      contract_issued_date: contractData.contract_issued_date ? new Date(contractData.contract_issued_date).toISOString() : null,
      contract_start_date: contractData.contract_start_date ? new Date(contractData.contract_start_date).toISOString() : null,
      contract_expiry_date: contractData.contract_expiry_date ? new Date(contractData.contract_expiry_date).toISOString() : null,
      contract_signed_date: contractData.contract_signed_date ? new Date(contractData.contract_signed_date).toISOString() : null,
    } as any
  });

  if (error) {
    console.error('Error updating contract:', error);
    return { success: false, message: error.message };
  }
  return data as { success: boolean; message?: string; errors?: any };
}

export async function renewContract(renewalData: { 
  contract_id: string; 
  new_expiry_date: string; 
  terms_notes?: string; 
  initiated_by?: string; 
  is_auto?: boolean; 
}): Promise<{ success: boolean; message?: string; errors?: any }> {
  // Manual server-side validation
  const validation = validateRenewal(renewalData);
  
  if (!validation.isValid) {
    return { 
      success: false, 
      message: Object.values(validation.errors)[0] || 'Invalid renewal data',
      errors: validation.errors 
    };
  }

  const { data, error } = await supabase.rpc('renew_contract', { 
    input_data: renewalData 
  });

  if (error) {
    console.error('Error renewing contract:', error);
    return { success: false, message: error.message };
  }
  return data as { success: boolean; message?: string; errors?: any };
}

export async function toggleAutoRenewal(contractId: string, autoRenewal: boolean, performedBy?: string): Promise<{ success: boolean; message?: string }> {
  const { data, error } = await supabase.rpc('toggle_auto_renewal', { 
    input_data: { contract_id: contractId, auto_renewal: autoRenewal, performed_by: performedBy } 
  });

  if (error) {
    console.error('Error toggling auto renewal:', error);
    return { success: false, message: error.message };
  }
  return data as { success: boolean; message?: string };
}

export async function terminateContract(contractId: string, notes?: string, performedBy?: string): Promise<{ success: boolean; message?: string }> {
  const { data, error } = await supabase.rpc('terminate_contract', { 
    input_data: { contract_id: contractId, termination_notes: notes, performed_by: performedBy } 
  });

  if (error) {
    console.error('Error terminating contract:', error);
    return { success: false, message: error.message };
  }
  return data as { success: boolean; message?: string };
}
