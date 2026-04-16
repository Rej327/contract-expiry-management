"use server";

import { supabase } from "@/lib/supabase";
import { ContractRecord } from "@/components/Dashboard/ContractTable";
import {
  ActivityLog,
  Employee,
  Manager,
  ContractReminder,
  ContractRenewal,
  ActivityRecord,
  NotificationLog,
} from "@/types/types";

export interface DashboardStats {
  total_contracts: number;
  expiring_soon_count: number;
  expired_count: number;
}

export interface ContractDetail extends ContractRecord {
  employee: Employee;
  manager: Manager;
  total_tenure_days: number;
}

export interface ContractDetailResponse {
  contract: ContractDetail;
  reminders: ContractReminder[];
  renewals: ContractRenewal[];
  notifications: NotificationLog[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data, error } = await supabase.rpc("get_contract_dashboard_stats", {
    input_data: {},
  });
  if (error) {
    console.error("Error fetching dashboard stats:", error);
    return { total_contracts: 0, expiring_soon_count: 0, expired_count: 0 };
  }
  return data as unknown as DashboardStats;
}

export async function getContractList(
  page: number,
  limit: number = 10,
  search: string = "",
  sortBy: string = "contract_expiry_date",
  sortOrder: "ASC" | "DESC" = "ASC",
): Promise<{ data: ContractRecord[]; total_count: number }> {
  const { data, error } = await supabase.rpc("get_contract_list", {
    input_data: { page, limit, search, sort_by: sortBy, sort_order: sortOrder },
  });
  if (error) {
    console.error("Error fetching contract list:", error);
    return { data: [], total_count: 0 };
  }
  return data as unknown as { data: ContractRecord[]; total_count: number };
}

export async function getRecentActivityLogs(
  limit: number = 5,
): Promise<ActivityRecord[]> {
  const { data, error } = await supabase.rpc("get_recent_activity_logs", {
    input_data: { limit },
  });
  if (error) {
    console.error("Error fetching recent activity logs:", error);
    return [];
  }
  return data as unknown as ActivityRecord[];
}

export async function getEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase.rpc("get_employees");
  if (error) {
    console.error("Error fetching employees:", error);
    return [];
  }
  return data as unknown as Employee[];
}

export async function getManagers(): Promise<Manager[]> {
  const { data, error } = await supabase.rpc("get_managers");
  if (error) {
    console.error("Error fetching managers:", error);
    return [];
  }
  return data as unknown as Manager[];
}

export async function getContractDetail(
  contractId: string,
): Promise<ContractDetailResponse | null> {
  const { data, error } = await supabase.rpc("get_contract_detail", {
    input_data: { contract_id: contractId },
  });
  if (error) {
    console.error("Error fetching contract detail:", error);
    return null;
  }
  return data as unknown as ContractDetailResponse;
}

export async function getAllContractsForExport(): Promise<ContractRecord[]> {
  const { data, error } = await supabase.rpc("get_contract_list", {
    input_data: { page: 1, limit: 10000 }, // High limit to fetch all records
  });
  if (error) {
    console.error("Error fetching all contracts for export:", error);
    return [];
  }
  const result = data as unknown as {
    data: ContractRecord[];
    total_count: number;
  };
  return result.data;
}

export interface RenewalLogRecord {
  renewal_id: string;
  renewal_previous_expiry: string;
  renewal_new_expiry: string;
  renewal_is_auto: boolean;
  renewal_created_at: string;
  renewal_terms_notes: string;
  contract_type: string;
  contract_renewal_status: string;
  employee_first_name: string;
  employee_last_name: string;
  employee_avatar_url: string;
  employee_role: string;
  manager_first_name: string;
  manager_last_name: string;
}

export interface RenewalLogsResponse {
  data: RenewalLogRecord[];
  total_count: number;
  stats: {
    total_this_month: number;
    avg_extension_months: number;
    success_rate: number;
  };
  page: number;
  limit: number;
}

export async function getRenewalLogs(
  page: number,
  limit: number = 10,
  search: string = "",
): Promise<RenewalLogsResponse> {
  const { data, error } = await supabase.rpc("get_renewal_logs", {
    input_data: { page, limit, search },
  });
  if (error) {
    console.error("Error fetching renewal logs:", error);
    return {
      data: [],
      total_count: 0,
      stats: { total_this_month: 0, avg_extension_months: 0, success_rate: 0 },
      page,
      limit,
    };
  }
  return data as unknown as RenewalLogsResponse;
}
