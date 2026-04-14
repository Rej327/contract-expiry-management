'use server';

import { supabase } from '@/lib/supabase';

export async function deleteContract(contractId: string) {
  const { data, error } = await supabase.rpc('delete_contract', { 
    input_data: { contract_id: contractId } 
  });
  if (error) {
    console.error('Error deleting contract:', error);
    return { success: false, error };
  }
  return data;
}
