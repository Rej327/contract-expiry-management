/**
 * Unit Tests: app/actions/post.ts
 * Tests for createContract, notifyContract, sendContractNotification,
 * and sendBulkContractNotifications using mocked Supabase + Resend.
 */
import {
  createContract,
  notifyContract,
  sendContractNotification,
  sendBulkContractNotifications,
} from '@/app/actions/post';

// ─── Mocks ────────────────────────────────────────────────────────────────────

// Mock Supabase
const mockRpc = jest.fn();
jest.mock('@/lib/supabase', () => ({
  supabase: { rpc: (...args: any[]) => mockRpc(...args) },
}));

// Mock Resend
const mockEmailSend = jest.fn();
jest.mock('@/lib/resend', () => ({
  resend: { emails: { send: (...args: any[]) => mockEmailSend(...args) } },
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function validContractPayload(overrides: Record<string, any> = {}) {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const nextYear = new Date(now);
  nextYear.setFullYear(now.getFullYear() + 1);

  return {
    contract_employee_id: 'emp-001',
    contract_manager_id: 'mgr-001',
    contract_type: 'FULL_TIME',
    contract_salary: 75000,
    contract_notice_period: '30 Days',
    contract_probation: '3 Months',
    contract_issued_date: now,
    contract_start_date: tomorrow,
    contract_expiry_date: nextYear,
    contract_signed_date: now,
    ...overrides,
  } as any;
}

function makeContractRecord(remainingDays = 25, overrides: Record<string, any> = {}) {
  return {
    contract_id: 'contract-uuid-1',
    employee_first_name: 'John',
    employee_last_name: 'Doe',
    employee_email: 'john.doe@example.com',
    manager_first_name: 'Jane',
    manager_last_name: 'Smith',
    employee_role: 'Engineer',
    contract_expiry_date: '2025-05-10',
    remaining_days: remainingDays,
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

// ── createContract ─────────────────────────────────────────────────────────────

describe('createContract', () => {
  it('returns success when supabase RPC succeeds', async () => {
    mockRpc.mockResolvedValueOnce({ data: { success: true }, error: null });

    const result = await createContract(validContractPayload());
    expect(result.success).toBe(true);
    expect(mockRpc).toHaveBeenCalledWith('create_contract', expect.any(Object));
  });

  it('returns failure with validation errors when payload is invalid', async () => {
    const result = await createContract(
      validContractPayload({ contract_employee_id: '' }),
    );
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    // Supabase should NOT be called when client-side validation fails
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it('returns failure when supabase RPC errors', async () => {
    mockRpc.mockResolvedValueOnce({
      data: null,
      error: { message: 'DB error' },
    });

    const result = await createContract(validContractPayload());
    expect(result.success).toBe(false);
    expect(result.message).toContain('DB error');
  });

  it('serialises Date objects to ISO strings before calling RPC', async () => {
    mockRpc.mockResolvedValueOnce({ data: { success: true }, error: null });

    const now = new Date();
    const payload = validContractPayload({
      contract_issued_date: now,
      contract_start_date: new Date(now.getTime() + 86400000),
      contract_expiry_date: new Date(now.getTime() + 86400000 * 365),
      contract_signed_date: now,
    });

    await createContract(payload);

    const callArg = mockRpc.mock.calls[0][1];
    expect(typeof callArg.input_data.contract_issued_date).toBe('string');
    expect(typeof callArg.input_data.contract_start_date).toBe('string');
    expect(typeof callArg.input_data.contract_expiry_date).toBe('string');
    expect(typeof callArg.input_data.contract_signed_date).toBe('string');
  });
});

// ── sendContractNotification ──────────────────────────────────────────────────

describe('sendContractNotification', () => {
  it('returns success when email and log both succeed', async () => {
    mockEmailSend.mockResolvedValueOnce({ error: null });
    mockRpc.mockResolvedValueOnce({ error: null });

    const result = await sendContractNotification({
      contractId: 'contract-uuid-1',
      to: 'recipient@example.com',
      subject: 'Test Subject',
      html: '<p>Hello</p>',
    });

    expect(result.success).toBe(true);
  });

  it('returns failure when Resend fails', async () => {
    mockEmailSend.mockResolvedValueOnce({ error: { message: 'Resend API error' } });

    const result = await sendContractNotification({
      contractId: 'contract-uuid-1',
      to: 'recipient@example.com',
      subject: 'Test Subject',
      html: '<p>Hello</p>',
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain('Resend');
  });

  it('still returns success even when the Supabase log fails (non-critical)', async () => {
    mockEmailSend.mockResolvedValueOnce({ error: null });
    mockRpc.mockResolvedValueOnce({ error: { message: 'log error' } });

    const result = await sendContractNotification({
      contractId: 'contract-uuid-1',
      to: 'recipient@example.com',
      subject: 'Test Subject',
      html: '<p>Hello</p>',
    });

    expect(result.success).toBe(true);
  });

  it('uses EMAIL as the default channel', async () => {
    mockEmailSend.mockResolvedValueOnce({ error: null });
    mockRpc.mockResolvedValueOnce({ error: null });

    await sendContractNotification({
      contractId: 'contract-uuid-1',
      to: 'recipient@example.com',
      subject: 'Subject',
      html: '<p>body</p>',
    });

    const logCall = mockRpc.mock.calls[0];
    expect(logCall[1].input_data.channel).toBe('EMAIL');
  });

  it('handles unexpected exceptions gracefully', async () => {
    mockEmailSend.mockRejectedValueOnce(new Error('Network timeout'));

    const result = await sendContractNotification({
      contractId: 'contract-uuid-1',
      to: 'recipient@example.com',
      subject: 'Subject',
      html: '<p>body</p>',
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain('Network timeout');
  });
});

// ── notifyContract ────────────────────────────────────────────────────────────

describe('notifyContract', () => {
  it('sends a notification for a contract expiring soon with red colour for <30 days', async () => {
    mockEmailSend.mockResolvedValueOnce({ error: null });
    mockRpc.mockResolvedValueOnce({ error: null });

    const record = makeContractRecord(15); // <30 days
    const result = await notifyContract(record);

    expect(result.success).toBe(true);

    const emailCall = mockEmailSend.mock.calls[0][0];
    expect(emailCall.to).toBe('john.doe@example.com');
    expect(emailCall.subject).toContain('John Doe');
    // Critical (< 30 days) → red colour in HTML
    expect(emailCall.html).toContain('#e03131');
  });

  it('sends notification with orange colour for ≥30 days remaining', async () => {
    mockEmailSend.mockResolvedValueOnce({ error: null });
    mockRpc.mockResolvedValueOnce({ error: null });

    const record = makeContractRecord(45); // ≥30 days
    const result = await notifyContract(record);

    expect(result.success).toBe(true);
    const emailCall = mockEmailSend.mock.calls[0][0];
    expect(emailCall.html).toContain('#e67700');
  });

  it('handles exceptions and returns failure', async () => {
    mockEmailSend.mockRejectedValueOnce(new Error('connection refused'));

    const record = makeContractRecord(10);
    const result = await notifyContract(record);

    expect(result.success).toBe(false);
  });
});

// ── sendBulkContractNotifications ────────────────────────────────────────────

describe('sendBulkContractNotifications', () => {
  it('sends notifications to all records and reports full success', async () => {
    // 3 records → 3 email sends + 3 log RPCs
    mockEmailSend.mockResolvedValue({ error: null });
    mockRpc.mockResolvedValue({ error: null });

    const records = [
      makeContractRecord(30, { contract_id: 'c1', employee_email: 'a@x.com' }),
      makeContractRecord(20, { contract_id: 'c2', employee_email: 'b@x.com' }),
      makeContractRecord(10, { contract_id: 'c3', employee_email: 'c@x.com' }),
    ];

    const result = await sendBulkContractNotifications(records);

    expect(result.success).toBe(true);
    expect(result.results).toHaveLength(3);
    expect(result.message).toContain('3 of 3');
  });

  it('returns success=false when all notifications fail', async () => {
    mockEmailSend.mockResolvedValue({ error: { message: 'Resend failure' } });

    const records = [
      makeContractRecord(10, { contract_id: 'c1' }),
      makeContractRecord(10, { contract_id: 'c2' }),
    ];

    const result = await sendBulkContractNotifications(records);

    expect(result.success).toBe(false);
    expect(result.message).toContain('0 of 2');
  });

  it('returns success=true for partial sends (some succeeded)', async () => {
    // First succeeds, second fails
    mockEmailSend
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: { message: 'timeout' } });
    mockRpc.mockResolvedValue({ error: null });

    const records = [
      makeContractRecord(10, { contract_id: 'c1' }),
      makeContractRecord(10, { contract_id: 'c2' }),
    ];

    const result = await sendBulkContractNotifications(records);

    expect(result.success).toBe(true); // at least 1 succeeded
    expect(result.message).toContain('1 of 2');
  });

  it('handles empty records array gracefully', async () => {
    const result = await sendBulkContractNotifications([]);
    // success is (0 > 0) === false for an empty batch
    expect(result.results).toHaveLength(0);
    expect(result.message).toContain('0 of 0');
  });
});
