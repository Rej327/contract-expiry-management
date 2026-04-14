'use server';

import { supabase } from '@/lib/supabase';

export async function getDashboardStats() {
  const { data, error } = await supabase.rpc('get_contract_dashboard_stats', { input_data: {} });
  if (error) {
    console.error('Error fetching dashboard stats:', error);
    return { critical_count: 0, warning_count: 0, total_contracts: 0 };
  }
  return data;
}

export async function getContractList(
  page: number, 
  limit: number = 10, 
  search: string = '', 
  sortBy: string = 'contract_expiry_date', 
  sortOrder: 'ASC' | 'DESC' = 'ASC'
) {
  const { data, error } = await supabase.rpc('get_contract_list', { 
    input_data: { page, limit, search, sort_by: sortBy, sort_order: sortOrder } 
  });
  if (error) {
    console.error('Error fetching contract list:', error);
    return { data: [], total_count: 0 };
  }
  return data;
}

export async function getRecentActivityLogs(limit: number = 5) {
  const { data, error } = await supabase.rpc('get_recent_activity_logs', { 
    input_data: { limit } 
  });
  if (error) {
    console.error('Error fetching recent activity logs:', error);
    return [];
  }
  return data;
}

export async function getEmployees() {
  const { data, error } = await supabase.rpc('get_employees');
  if (error) {
    console.error('Error fetching employees:', error);
    return [];
  }
  return data;
}

export async function getManagers() {
  const { data, error } = await supabase.rpc('get_managers');
  if (error) {
    console.error('Error fetching managers:', error);
    return [];
  }
  return data;
}

export async function getContractDetail(contractId: string) {
  const { data, error } = await supabase.rpc('get_contract_detail', { 
    input_data: { contract_id: contractId } 
  });
  if (error) {
    console.error('Error fetching contract detail:', error);
    return null;
  }
  return data;
}
