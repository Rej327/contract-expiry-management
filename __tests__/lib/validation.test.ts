/**
 * Unit Tests: lib/validation.ts
 * Tests for validateContract and validateRenewal
 */
import { validateContract, validateRenewal } from '@/lib/validation';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeValidContractValues(overrides: Record<string, any> = {}) {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const nextYear = new Date(now);
  nextYear.setFullYear(now.getFullYear() + 1);

  return {
    contract_employee_id: 'emp-001',
    contract_manager_id: 'mgr-001',
    contract_type: 'FULL_TIME',
    contract_salary: 60000,
    contract_notice_period: '30 Days',
    contract_probation: '3 Months',
    contract_issued_date: now,
    contract_start_date: tomorrow,
    contract_expiry_date: nextYear,
    contract_signed_date: now,
    ...overrides,
  };
}

// ─── validateContract ─────────────────────────────────────────────────────────

describe('validateContract', () => {
  describe('Required fields', () => {
    it('returns valid for a fully populated contract', () => {
      const result = validateContract(makeValidContractValues() as any);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('requires contract_employee_id', () => {
      const result = validateContract(
        makeValidContractValues({ contract_employee_id: '' }) as any,
      );
      expect(result.isValid).toBe(false);
      expect(result.errors.contract_employee_id).toBeDefined();
    });

    it('requires contract_manager_id', () => {
      const result = validateContract(
        makeValidContractValues({ contract_manager_id: '' }) as any,
      );
      expect(result.isValid).toBe(false);
      expect(result.errors.contract_manager_id).toBeDefined();
    });

    it('requires contract_type', () => {
      const result = validateContract(
        makeValidContractValues({ contract_type: '' }) as any,
      );
      expect(result.isValid).toBe(false);
      expect(result.errors.contract_type).toBeDefined();
    });

    it('requires contract_notice_period', () => {
      const result = validateContract(
        makeValidContractValues({ contract_notice_period: '' }) as any,
      );
      expect(result.isValid).toBe(false);
      expect(result.errors.contract_notice_period).toBeDefined();
    });

    it('requires contract_probation', () => {
      const result = validateContract(
        makeValidContractValues({ contract_probation: '' }) as any,
      );
      expect(result.isValid).toBe(false);
      expect(result.errors.contract_probation).toBeDefined();
    });
  });

  describe('Salary validation', () => {
    it('rejects null salary', () => {
      const result = validateContract(
        makeValidContractValues({ contract_salary: null }) as any,
      );
      expect(result.isValid).toBe(false);
      expect(result.errors.contract_salary).toBeDefined();
    });

    it('rejects undefined salary', () => {
      const result = validateContract(
        makeValidContractValues({ contract_salary: undefined }) as any,
      );
      expect(result.isValid).toBe(false);
      expect(result.errors.contract_salary).toBeDefined();
    });

    it('rejects negative salary', () => {
      const result = validateContract(
        makeValidContractValues({ contract_salary: -1 }) as any,
      );
      expect(result.isValid).toBe(false);
      expect(result.errors.contract_salary).toBeDefined();
    });

    it('accepts salary of 0 (volunteer / unpaid)', () => {
      const result = validateContract(
        makeValidContractValues({ contract_salary: 0 }) as any,
      );
      expect(result.isValid).toBe(true);
    });

    it('accepts positive salary', () => {
      const result = validateContract(
        makeValidContractValues({ contract_salary: 120000 }) as any,
      );
      expect(result.isValid).toBe(true);
    });
  });

  describe('Date validation', () => {
    it('rejects missing issued date', () => {
      const result = validateContract(
        makeValidContractValues({ contract_issued_date: null }) as any,
      );
      expect(result.isValid).toBe(false);
      expect(result.errors.contract_issued_date).toBeDefined();
    });

    it('rejects missing start date', () => {
      const result = validateContract(
        makeValidContractValues({ contract_start_date: null }) as any,
      );
      expect(result.isValid).toBe(false);
      expect(result.errors.contract_start_date).toBeDefined();
    });

    it('rejects missing expiry date', () => {
      const result = validateContract(
        makeValidContractValues({ contract_expiry_date: null }) as any,
      );
      expect(result.isValid).toBe(false);
      expect(result.errors.contract_expiry_date).toBeDefined();
    });

    it('rejects missing signed date', () => {
      const result = validateContract(
        makeValidContractValues({ contract_signed_date: null }) as any,
      );
      expect(result.isValid).toBe(false);
      expect(result.errors.contract_signed_date).toBeDefined();
    });

    it('rejects expiry date equal to start date', () => {
      const date = new Date('2025-06-01T00:00:00Z');
      const result = validateContract(
        makeValidContractValues({
          contract_start_date: date,
          contract_expiry_date: date,
        }) as any,
      );
      expect(result.isValid).toBe(false);
      expect(result.errors.contract_expiry_date).toBeDefined();
    });

    it('rejects expiry date before start date', () => {
      const start = new Date('2025-06-01');
      const expiry = new Date('2025-05-01');
      const result = validateContract(
        makeValidContractValues({
          contract_start_date: start,
          contract_expiry_date: expiry,
        }) as any,
      );
      expect(result.isValid).toBe(false);
      expect(result.errors.contract_expiry_date).toBeDefined();
    });

    it('rejects start date before issued date', () => {
      const issued = new Date('2025-06-10');
      const start = new Date('2025-06-01'); // before issued
      const result = validateContract(
        makeValidContractValues({
          contract_issued_date: issued,
          contract_start_date: start,
        }) as any,
      );
      expect(result.isValid).toBe(false);
      expect(result.errors.contract_start_date).toBeDefined();
    });

    it('accepts start date equal to issued date', () => {
      const date = new Date('2025-06-01');
      const nextYear = new Date('2026-06-01');
      const result = validateContract(
        makeValidContractValues({
          contract_issued_date: date,
          contract_start_date: date,
          contract_expiry_date: nextYear,
        }) as any,
      );
      expect(result.isValid).toBe(true);
    });
  });

  describe('Multiple errors', () => {
    it('accumulates multiple errors when multiple fields are invalid', () => {
      const result = validateContract({
        contract_employee_id: '',
        contract_manager_id: '',
        contract_type: '',
        contract_salary: -100,
        contract_notice_period: '',
        contract_probation: '',
        contract_issued_date: null,
        contract_start_date: null,
        contract_expiry_date: null,
        contract_signed_date: null,
      } as any);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThan(3);
    });
  });
});

// ─── validateRenewal ──────────────────────────────────────────────────────────

describe('validateRenewal', () => {
  it('returns valid for a well-formed renewal', () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const result = validateRenewal({
      contract_id: 'contract-uuid-1',
      new_expiry_date: future.toISOString(),
    });
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('requires contract_id', () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const result = validateRenewal({
      contract_id: '',
      new_expiry_date: future.toISOString(),
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.contract_id).toBeDefined();
  });

  it('rejects a null new_expiry_date', () => {
    const result = validateRenewal({
      contract_id: 'contract-uuid-1',
      new_expiry_date: null,
    } as any);
    expect(result.isValid).toBe(false);
    expect(result.errors.new_expiry_date).toBeDefined();
  });

  it('rejects an invalid date string', () => {
    const result = validateRenewal({
      contract_id: 'contract-uuid-1',
      new_expiry_date: 'not-a-date',
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.new_expiry_date).toBeDefined();
  });

  it('rejects a past expiry date', () => {
    const past = new Date('2020-01-01');
    const result = validateRenewal({
      contract_id: 'contract-uuid-1',
      new_expiry_date: past.toISOString(),
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.new_expiry_date).toBeDefined();
  });

  it('rejects today as expiry date (not strictly in the future)', () => {
    const today = new Date();
    const result = validateRenewal({
      contract_id: 'contract-uuid-1',
      new_expiry_date: today.toISOString(),
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.new_expiry_date).toBeDefined();
  });

  it('accepts a date exactly one day in the future', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const result = validateRenewal({
      contract_id: 'contract-uuid-1',
      new_expiry_date: tomorrow.toISOString(),
    });
    expect(result.isValid).toBe(true);
  });
});
