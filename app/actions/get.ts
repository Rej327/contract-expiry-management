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

export async function getContractList(page: number, limit: number = 10, search: string = '') {
  const { data, error } = await supabase.rpc('get_contract_list', { 
    input_data: { page, limit, search } 
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
