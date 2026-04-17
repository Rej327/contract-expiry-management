/**
 * Unit Tests: app/actions/get.ts
 * Tests for getDashboardStats, getContractList, getContractDetail,
 * getRecentActivityLogs, getEmployees, getManagers,
 * getAllContractsForExport, getRenewalLogs, getAllRenewalLogsForExport.
 */
import {
  getDashboardStats,
  getContractList,
  getContractDetail,
  getRecentActivityLogs,
  getEmployees,
  getManagers,
  getAllContractsForExport,
  getRenewalLogs,
  getAllRenewalLogsForExport,
} from '@/app/actions/get';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockRpc = jest.fn();
jest.mock('@/lib/supabase', () => ({
  supabase: { rpc: (...args: any[]) => mockRpc(...args) },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const STATS_FIXTURE = { total_contracts: 42, expiring_soon_count: 5, expired_count: 2 };
const CONTRACT_RECORD = {
  contract_id: 'c-001',
  employee_first_name: 'Alice',
  employee_last_name: 'Liddell',
  contract_expiry_date: '2025-12-31',
  contract_status: 'ACTIVE',
  remaining_days: 90,
};
const EMPLOYEE_FIXTURE = [
  { employee_id: 'emp-001', employee_first_name: 'Bob', employee_last_name: 'Builder', employee_role: 'Engineer' },
];
const MANAGER_FIXTURE = [
  { manager_id: 'mgr-001', manager_first_name: 'Carol', manager_last_name: 'White' },
];
const RENEWAL_LOG_FIXTURE = {
  renewal_id: 'ren-001',
  renewal_previous_expiry: '2024-12-31',
  renewal_new_expiry: '2025-12-31',
  renewal_is_auto: false,
  renewal_created_at: '2024-11-01T10:00:00Z',
  renewal_terms_notes: '',
  contract_type: 'FULL_TIME',
  contract_renewal_status: 'RENEWED',
  employee_first_name: 'Alice',
  employee_last_name: 'Liddell',
  employee_avatar_url: '',
  employee_role: 'Engineer',
  manager_first_name: 'Carol',
  manager_last_name: 'White',
  contract_status: 'ACTIVE',
};

// ─── getDashboardStats ────────────────────────────────────────────────────────

describe('getDashboardStats', () => {
  it('returns stats data on success', async () => {
    mockRpc.mockResolvedValueOnce({ data: STATS_FIXTURE, error: null });

    const data = await getDashboardStats();
    expect(data).toEqual(STATS_FIXTURE);
    expect(mockRpc).toHaveBeenCalledWith('get_contract_dashboard_stats', { input_data: {} });
  });

  it('returns zeroed stats on error', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'DB error' } });

    const data = await getDashboardStats();
    expect(data).toEqual({ total_contracts: 0, expiring_soon_count: 0, expired_count: 0 });
  });
});

// ─── getContractList ──────────────────────────────────────────────────────────

describe('getContractList', () => {
  it('returns contract list with correct pagination params', async () => {
    const response = { data: [CONTRACT_RECORD], total_count: 1 };
    mockRpc.mockResolvedValueOnce({ data: response, error: null });

    const result = await getContractList(1, 10, '', 'contract_expiry_date', 'ASC');
    expect(result.data).toHaveLength(1);
    expect(result.total_count).toBe(1);
    expect(mockRpc).toHaveBeenCalledWith('get_contract_list', {
      input_data: { page: 1, limit: 10, search: '', sort_by: 'contract_expiry_date', sort_order: 'ASC' },
    });
  });

  it('passes search term correctly', async () => {
    const response = { data: [], total_count: 0 };
    mockRpc.mockResolvedValueOnce({ data: response, error: null });

    await getContractList(1, 10, 'Alice');
    const callArg = mockRpc.mock.calls[0][1];
    expect(callArg.input_data.search).toBe('Alice');
  });

  it('returns empty list on error', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'DB error' } });

    const result = await getContractList(1, 10);
    expect(result.data).toEqual([]);
    expect(result.total_count).toBe(0);
  });
});

// ─── getContractDetail ────────────────────────────────────────────────────────

describe('getContractDetail', () => {
  it('returns contract detail on success', async () => {
    const detailResponse = {
      contract: { ...CONTRACT_RECORD, employee: EMPLOYEE_FIXTURE[0], manager: MANAGER_FIXTURE[0], total_tenure_days: 365 },
      reminders: [],
      renewals: [],
      notifications: [],
    };
    mockRpc.mockResolvedValueOnce({ data: detailResponse, error: null });

    const result = await getContractDetail('c-001');
    expect(result).not.toBeNull();
    expect(result?.contract.contract_id).toBe('c-001');
    expect(mockRpc).toHaveBeenCalledWith('get_contract_detail', {
      input_data: { contract_id: 'c-001' },
    });
  });

  it('returns null on error', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'not found' } });

    const result = await getContractDetail('nonexistent-id');
    expect(result).toBeNull();
  });
});

// ─── getRecentActivityLogs ────────────────────────────────────────────────────

describe('getRecentActivityLogs', () => {
  it('returns activity logs with correct limit', async () => {
    const logs = [{ activity_id: 'a1', activity_action: 'CREATED', manager_first_name: 'Carol', manager_last_name: 'White' }];
    mockRpc.mockResolvedValueOnce({ data: logs, error: null });

    const result = await getRecentActivityLogs(5);
    expect(result).toHaveLength(1);
    expect(mockRpc).toHaveBeenCalledWith('get_recent_activity_logs', { input_data: { limit: 5 } });
  });

  it('returns empty array on error', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'DB error' } });

    const result = await getRecentActivityLogs();
    expect(result).toEqual([]);
  });

  it('defaults to a limit of 5', async () => {
    mockRpc.mockResolvedValueOnce({ data: [], error: null });
    await getRecentActivityLogs();
    expect(mockRpc.mock.calls[0][1].input_data.limit).toBe(5);
  });
});

// ─── getEmployees ────────────────────────────────────────────────────────────

describe('getEmployees', () => {
  it('returns employee list on success', async () => {
    mockRpc.mockResolvedValueOnce({ data: EMPLOYEE_FIXTURE, error: null });

    const result = await getEmployees();
    expect(result).toHaveLength(1);
    expect(result[0].employee_id).toBe('emp-001');
    expect(mockRpc).toHaveBeenCalledWith('get_employees');
  });

  it('returns empty array on error', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'DB error' } });

    const result = await getEmployees();
    expect(result).toEqual([]);
  });
});

// ─── getManagers ───────────────────────────────────────────────────────────────

describe('getManagers', () => {
  it('returns manager list on success', async () => {
    mockRpc.mockResolvedValueOnce({ data: MANAGER_FIXTURE, error: null });

    const result = await getManagers();
    expect(result).toHaveLength(1);
    expect(result[0].manager_id).toBe('mgr-001');
    expect(mockRpc).toHaveBeenCalledWith('get_managers');
  });

  it('returns empty array on error', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'err' } });

    const result = await getManagers();
    expect(result).toEqual([]);
  });
});

// ─── getAllContractsForExport ──────────────────────────────────────────────────

describe('getAllContractsForExport', () => {
  it('fetches with a very large limit to get all records', async () => {
    mockRpc.mockResolvedValueOnce({
      data: { data: [CONTRACT_RECORD], total_count: 1 },
      error: null,
    });

    const result = await getAllContractsForExport();
    expect(result).toHaveLength(1);

    const callArg = mockRpc.mock.calls[0][1];
    expect(callArg.input_data.limit).toBeGreaterThan(1000);
  });

  it('returns empty array on error', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'export error' } });

    const result = await getAllContractsForExport();
    expect(result).toEqual([]);
  });
});

// ─── getRenewalLogs ───────────────────────────────────────────────────────────

describe('getRenewalLogs', () => {
  const EMPTY_RESPONSE = {
    data: [],
    total_count: 0,
    stats: { total_this_month: 0, avg_extension_months: 0, success_rate: 0 },
    page: 1,
    limit: 10,
  };

  it('returns renewal logs on success', async () => {
    const response = { ...EMPTY_RESPONSE, data: [RENEWAL_LOG_FIXTURE], total_count: 1 };
    mockRpc.mockResolvedValueOnce({ data: response, error: null });

    const result = await getRenewalLogs(1);
    expect(result.data).toHaveLength(1);
    expect(result.total_count).toBe(1);
    expect(mockRpc).toHaveBeenCalledWith('get_renewal_logs', expect.any(Object));
  });

  it('passes optional filters correctly (status, type, isAuto)', async () => {
    mockRpc.mockResolvedValueOnce({ data: EMPTY_RESPONSE, error: null });

    await getRenewalLogs(1, 10, '', 'RENEWED', 'FULL_TIME', true);
    const callArg = mockRpc.mock.calls[0][1];
    expect(callArg.input_data.status).toBe('RENEWED');
    expect(callArg.input_data.type).toBe('FULL_TIME');
    expect(callArg.input_data.is_auto).toBe(true);
  });

  it('sends null for unset optional filters', async () => {
    mockRpc.mockResolvedValueOnce({ data: EMPTY_RESPONSE, error: null });

    await getRenewalLogs(1);
    const callArg = mockRpc.mock.calls[0][1];
    expect(callArg.input_data.status).toBeNull();
    expect(callArg.input_data.type).toBeNull();
    expect(callArg.input_data.is_auto).toBeNull();
    expect(callArg.input_data.embedding).toBeNull();
  });

  it('serialises embedding array to bracket-notation string', async () => {
    mockRpc.mockResolvedValueOnce({ data: EMPTY_RESPONSE, error: null });

    await getRenewalLogs(1, 10, '', undefined, undefined, undefined, 'renewal_created_at', 'DESC', [0.1, 0.2, 0.3]);
    const callArg = mockRpc.mock.calls[0][1];
    expect(callArg.input_data.embedding).toBe('[0.1,0.2,0.3]');
  });

  it('returns empty response on error', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'err' } });

    const result = await getRenewalLogs(1);
    expect(result.data).toEqual([]);
    expect(result.total_count).toBe(0);
  });
});

// ─── getAllRenewalLogsForExport ────────────────────────────────────────────────

describe('getAllRenewalLogsForExport', () => {
  it('fetches all renewals with a very high limit', async () => {
    const response = {
      data: [RENEWAL_LOG_FIXTURE],
      total_count: 1,
      stats: { total_this_month: 1, avg_extension_months: 6, success_rate: 100 },
    };
    mockRpc.mockResolvedValueOnce({ data: response, error: null });

    const result = await getAllRenewalLogsForExport();
    expect(result).toHaveLength(1);
    const callArg = mockRpc.mock.calls[0][1];
    expect(callArg.input_data.limit).toBeGreaterThan(1000);
  });

  it('returns empty array on error', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'export error' } });

    const result = await getAllRenewalLogsForExport();
    expect(result).toEqual([]);
  });
});
