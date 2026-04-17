/**
 * Unit Tests: app/actions/delete.ts
 * Tests for deleteContract.
 */
import { deleteContract } from '@/app/actions/delete';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockRpc = jest.fn();
jest.mock('@/lib/supabase', () => ({
  supabase: { rpc: (...args: any[]) => mockRpc(...args) },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── deleteContract ───────────────────────────────────────────────────────────

describe('deleteContract', () => {
  it('calls the delete_contract RPC with the correct contract ID', async () => {
    mockRpc.mockResolvedValueOnce({ data: { success: true }, error: null });

    await deleteContract('contract-uuid-1');

    expect(mockRpc).toHaveBeenCalledWith('delete_contract', {
      input_data: { contract_id: 'contract-uuid-1' },
    });
  });

  it('returns success=true on successful deletion', async () => {
    mockRpc.mockResolvedValueOnce({ data: { success: true }, error: null });

    const result = await deleteContract('contract-uuid-1');
    expect(result.success).toBe(true);
  });

  it('returns success=false and an error message when RPC errors', async () => {
    mockRpc.mockResolvedValueOnce({
      data: null,
      error: { message: 'Row not found' },
    });

    const result = await deleteContract('nonexistent-uuid');
    expect(result.success).toBe(false);
    expect(result.message).toContain('Row not found');
  });

  it('returns success=false with a generic message when error has no message', async () => {
    mockRpc.mockResolvedValueOnce({
      data: null,
      error: {},
    });

    const result = await deleteContract('contract-uuid-1');
    expect(result.success).toBe(false);
  });

  it('works correctly with different UUID formats', async () => {
    const uuids = [
      '123e4567-e89b-12d3-a456-426614174000',
      'c7bbb2b5-28bc-4030-aa1b-de4bba370ef0',
      'aaaabbbb-cccc-dddd-eeee-ffffffffffff',
    ];

    for (const uuid of uuids) {
      mockRpc.mockResolvedValueOnce({ data: { success: true }, error: null });
      const result = await deleteContract(uuid);
      expect(result.success).toBe(true);
    }

    expect(mockRpc).toHaveBeenCalledTimes(3);
  });

  it('only calls RPC once per invocation (no side-effect double calls)', async () => {
    mockRpc.mockResolvedValueOnce({ data: { success: true }, error: null });

    await deleteContract('contract-uuid-1');

    expect(mockRpc).toHaveBeenCalledTimes(1);
  });
});
