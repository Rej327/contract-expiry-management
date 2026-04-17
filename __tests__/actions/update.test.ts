/**
 * Unit Tests: app/actions/update.ts
 * Tests for updateContract, renewContract, toggleAutoRenewal, terminateContract.
 */
import {
  updateContract,
  renewContract,
  toggleAutoRenewal,
  terminateContract,
} from '@/app/actions/update';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockRpc = jest.fn();
jest.mock('@/lib/supabase', () => ({
  supabase: { rpc: (...args: any[]) => mockRpc(...args) },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function validContractPayload(overrides: Record<string, any> = {}) {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 86400000);
  const nextYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

  return {
    contract_id: 'contract-uuid-1',
    contract_employee_id: 'emp-001',
    contract_manager_id: 'mgr-001',
    contract_type: 'FULL_TIME',
    contract_salary: 80000,
    contract_notice_period: '30 Days',
    contract_probation: '3 Months',
    contract_issued_date: now,
    contract_start_date: tomorrow,
    contract_expiry_date: nextYear,
    contract_signed_date: now,
    ...overrides,
  } as any;
}

function futureDate(daysFromNow = 365) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString();
}

// ─── updateContract ───────────────────────────────────────────────────────────

describe('updateContract', () => {
  it('returns success when RPC succeeds', async () => {
    mockRpc.mockResolvedValueOnce({ data: { success: true }, error: null });

    const result = await updateContract(validContractPayload());
    expect(result.success).toBe(true);
    expect(mockRpc).toHaveBeenCalledWith('update_contract', expect.any(Object));
  });

  it('does not call RPC when validation fails', async () => {
    const result = await updateContract(
      validContractPayload({ contract_employee_id: '' }),
    );
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it('returns failure when RPC errors', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'constraint violation' } });

    const result = await updateContract(validContractPayload());
    expect(result.success).toBe(false);
    expect(result.message).toContain('constraint violation');
  });

  it('serialises dates to ISO strings', async () => {
    mockRpc.mockResolvedValueOnce({ data: { success: true }, error: null });
    await updateContract(validContractPayload());

    const callArg = mockRpc.mock.calls[0][1];
    expect(typeof callArg.input_data.contract_issued_date).toBe('string');
    expect(typeof callArg.input_data.contract_start_date).toBe('string');
  });

  it('rejects when expiry is before start date', async () => {
    const start = new Date('2025-06-10');
    const expiry = new Date('2025-06-05'); // before start
    const result = await updateContract(
      validContractPayload({ contract_start_date: start, contract_expiry_date: expiry }),
    );
    expect(result.success).toBe(false);
    expect(result.errors?.contract_expiry_date).toBeDefined();
  });
});

// ─── renewContract ─────────────────────────────────────────────────────────────

describe('renewContract', () => {
  it('returns success for a valid renewal', async () => {
    mockRpc.mockResolvedValueOnce({ data: { success: true }, error: null });

    const result = await renewContract({
      contract_id: 'contract-uuid-1',
      new_expiry_date: futureDate(365),
    });
    expect(result.success).toBe(true);
    expect(mockRpc).toHaveBeenCalledWith('renew_contract', {
      input_data: expect.objectContaining({ contract_id: 'contract-uuid-1' }),
    });
  });

  it('does not call RPC when contract_id is missing', async () => {
    const result = await renewContract({
      contract_id: '',
      new_expiry_date: futureDate(365),
    });
    expect(result.success).toBe(false);
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it('does not call RPC when new_expiry_date is in the past', async () => {
    const result = await renewContract({
      contract_id: 'contract-uuid-1',
      new_expiry_date: '2020-01-01',
    });
    expect(result.success).toBe(false);
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it('returns failure when RPC errors', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'DB error' } });

    const result = await renewContract({
      contract_id: 'contract-uuid-1',
      new_expiry_date: futureDate(365),
    });
    expect(result.success).toBe(false);
  });

  it('passes optional fields (terms_notes, initiated_by, is_auto) to RPC', async () => {
    mockRpc.mockResolvedValueOnce({ data: { success: true }, error: null });

    await renewContract({
      contract_id: 'contract-uuid-1',
      new_expiry_date: futureDate(365),
      terms_notes: 'Extended due to project',
      initiated_by: 'manager@example.com',
      is_auto: true,
    });

    const callArg = mockRpc.mock.calls[0][1];
    expect(callArg.input_data.terms_notes).toBe('Extended due to project');
    expect(callArg.input_data.is_auto).toBe(true);
  });
});

// ─── toggleAutoRenewal ────────────────────────────────────────────────────────

describe('toggleAutoRenewal', () => {
  it('enables auto renewal and returns success', async () => {
    mockRpc.mockResolvedValueOnce({ data: { success: true }, error: null });

    const result = await toggleAutoRenewal('contract-uuid-1', true, 'admin@example.com');
    expect(result.success).toBe(true);
    expect(mockRpc).toHaveBeenCalledWith('toggle_auto_renewal', {
      input_data: {
        contract_id: 'contract-uuid-1',
        auto_renewal: true,
        performed_by: 'admin@example.com',
      },
    });
  });

  it('disables auto renewal and returns success', async () => {
    mockRpc.mockResolvedValueOnce({ data: { success: true }, error: null });

    const result = await toggleAutoRenewal('contract-uuid-1', false);
    expect(result.success).toBe(true);

    const callArg = mockRpc.mock.calls[0][1];
    expect(callArg.input_data.auto_renewal).toBe(false);
  });

  it('returns failure when RPC errors', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'toggle error' } });

    const result = await toggleAutoRenewal('contract-uuid-1', true);
    expect(result.success).toBe(false);
    expect(result.message).toContain('toggle error');
  });
});

// ─── terminateContract ────────────────────────────────────────────────────────

describe('terminateContract', () => {
  it('terminates a contract with notes and performer', async () => {
    mockRpc.mockResolvedValueOnce({ data: { success: true }, error: null });

    const result = await terminateContract(
      'contract-uuid-1',
      'Employee resigned',
      'hr@example.com',
    );
    expect(result.success).toBe(true);
    expect(mockRpc).toHaveBeenCalledWith('terminate_contract', {
      input_data: {
        contract_id: 'contract-uuid-1',
        termination_notes: 'Employee resigned',
        performed_by: 'hr@example.com',
      },
    });
  });

  it('terminates without optional fields', async () => {
    mockRpc.mockResolvedValueOnce({ data: { success: true }, error: null });

    const result = await terminateContract('contract-uuid-1');
    expect(result.success).toBe(true);

    const callArg = mockRpc.mock.calls[0][1];
    expect(callArg.input_data.termination_notes).toBeUndefined();
    expect(callArg.input_data.performed_by).toBeUndefined();
  });

  it('returns failure when RPC errors', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'termination error' } });

    const result = await terminateContract('contract-uuid-1');
    expect(result.success).toBe(false);
    expect(result.message).toContain('termination error');
  });
});
