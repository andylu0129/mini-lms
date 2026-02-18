import { expect, vi } from 'vitest';

// vi.mock() calls are hoisted, so they must appear before any imports that
// use the mocked modules.
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  clearAuthCookies: vi.fn(),
  getVerifiedUserData: vi.fn(),
}));

vi.mock('@/utils/error-utils', () => ({
  rethrowRedirectError: vi.fn(),
}));

import {
  getConsultationList,
  getConsultationStats,
  markConsultation,
  signOut,
} from '@/app/(protected)/dashboard/actions';
import { DB } from '@/constants/common';
import * as supabaseServer from '@/lib/supabase/server';
import * as errorUtils from '@/utils/error-utils';

const mockCreateClient = vi.mocked(supabaseServer.createClient);
const mockClearAuthCookies = vi.mocked(supabaseServer.clearAuthCookies);
const mockGetVerifiedUserData = vi.mocked(supabaseServer.getVerifiedUserData);
const mockRethrowRedirectError = vi.mocked(errorUtils.rethrowRedirectError);

const USER_ID = 'user-123';

/**
 * Creates a mock Supabase query builder that supports method chaining.
 *
 * - Chainable methods (select, eq, ilike, update, order) return `this` so the
 *   chain can continue.
 * - `range()` is the terminal call in getConsultationList, so it returns a
 *   resolved Promise directly.
 * - The builder itself is also thenable (has `then`) so that `await builder`
 *   works — this covers markConsultation which awaits the last `.eq()` call.
 */
function createQueryBuilder(resolvedValue: { data?: any; error?: any }) {
  const builder: any = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockResolvedValue(resolvedValue),
    then: (resolve: (value: any) => any, reject?: (reason: any) => any) =>
      Promise.resolve(resolvedValue).then(resolve, reject),
  };
  return builder;
}

// Reset mock call counts before each test without wiping implementations,
// since each describe block's beforeEach re-assigns implementations anyway.
beforeEach(() => {
  vi.clearAllMocks();
});

describe('signOut', () => {
  let mockSupabaseSignOut: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockSupabaseSignOut = vi.fn().mockResolvedValue({});
    mockCreateClient.mockResolvedValue({ auth: { signOut: mockSupabaseSignOut } } as any);
    mockClearAuthCookies.mockResolvedValue(undefined);
  });

  it('calls supabase.auth.signOut', async () => {
    await signOut();

    expect(mockSupabaseSignOut).toHaveBeenCalledOnce();
  });

  it('calls clearAuthCookies after successful signOut', async () => {
    await signOut();

    expect(mockClearAuthCookies).toHaveBeenCalledOnce();
  });

  it('still calls clearAuthCookies when supabase.auth.signOut throws', async () => {
    mockSupabaseSignOut.mockRejectedValue(new Error('signOut failed'));

    await signOut();

    expect(mockClearAuthCookies).toHaveBeenCalledOnce();
  });
});

describe('getConsultationList', () => {
  let mockQueryBuilder: ReturnType<typeof createQueryBuilder>;
  let mockFrom: ReturnType<typeof vi.fn>;

  function setupBuilder(resolvedValue: { data?: any; error?: any }) {
    mockQueryBuilder = createQueryBuilder(resolvedValue);
    mockFrom = vi.fn().mockReturnValue(mockQueryBuilder);
    mockCreateClient.mockResolvedValue({ from: mockFrom } as any);
  }

  beforeEach(() => {
    mockGetVerifiedUserData.mockResolvedValue({ userId: USER_ID, firstName: 'John', lastName: 'Doe' });
    setupBuilder({ data: [], error: null });
  });

  describe('return values', () => {
    it('returns success with data when the query succeeds', async () => {
      const data = [{ id: '1' }, { id: '2' }];
      setupBuilder({ data, error: null });

      const result = await getConsultationList({ offset: 0, limit: 5 });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
    });

    it('sets hasMore to true when returned row count equals limit', async () => {
      const data = Array(5).fill({ id: '1' });
      setupBuilder({ data, error: null });

      const result = await getConsultationList({ offset: 0, limit: 5 });

      expect(result.hasMore).toBe(true);
    });

    it('sets hasMore to false when returned row count is less than limit', async () => {
      const data = [{ id: '1' }, { id: '2' }];
      setupBuilder({ data, error: null });

      const result = await getConsultationList({ offset: 0, limit: 5 });

      expect(result.hasMore).toBe(false);
    });

    it('returns failure when Supabase returns an error', async () => {
      setupBuilder({ data: null, error: { message: 'DB error' } });

      const result = await getConsultationList({ offset: 0, limit: 5 });

      expect(result).toEqual({ success: false, data: [], hasMore: false });
    });

    it('calls rethrowRedirectError and returns failure when an exception is thrown', async () => {
      const thrownError = new Error('unexpected');
      mockCreateClient.mockRejectedValue(thrownError);

      const result = await getConsultationList({ offset: 0, limit: 5 });

      expect(mockRethrowRedirectError).toHaveBeenCalledWith(thrownError);
      expect(result).toEqual({ success: false, data: [], hasMore: false });
    });

    it('returns failure when data is null with no error (data.length throws)', async () => {
      setupBuilder({ data: null, error: null });

      const result = await getConsultationList({ offset: 0, limit: 5 });

      expect(result).toEqual({ success: false, data: [], hasMore: false });
    });
  });

  describe('query construction', () => {
    it('queries from the correct view scoped to the user id', async () => {
      await getConsultationList({ offset: 0, limit: 5 });

      expect(mockFrom).toHaveBeenCalledWith(DB.VIEW_CONSULTATIONS_WITH_STATUS);
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('user_id', USER_ID);
    });

    it('calls range with the correct offset and inclusive upper bound', async () => {
      await getConsultationList({ offset: 10, limit: 5 });

      expect(mockQueryBuilder.range).toHaveBeenCalledWith(10, 14);
    });

    it('orders results by scheduled_at descending', async () => {
      await getConsultationList({ offset: 0, limit: 5 });

      expect(mockQueryBuilder.order).toHaveBeenCalledWith('scheduled_at', { ascending: false });
    });

    it('applies ilike filter when search is a non-empty string', async () => {
      await getConsultationList({ offset: 0, limit: 5, search: 'career' });

      expect(mockQueryBuilder.ilike).toHaveBeenCalledWith('reason', '%career%');
    });

    it('trims whitespace from search before applying ilike', async () => {
      await getConsultationList({ offset: 0, limit: 5, search: '  career  ' });

      expect(mockQueryBuilder.ilike).toHaveBeenCalledWith('reason', '%career%');
    });

    it('does not apply ilike when search is an empty string', async () => {
      await getConsultationList({ offset: 0, limit: 5, search: '' });

      expect(mockQueryBuilder.ilike).not.toHaveBeenCalled();
    });

    it('does not apply ilike when search is only whitespace', async () => {
      await getConsultationList({ offset: 0, limit: 5, search: '   ' });

      expect(mockQueryBuilder.ilike).not.toHaveBeenCalled();
    });

    it('applies status eq filter when filter is not "all"', async () => {
      await getConsultationList({ offset: 0, limit: 5, filter: 'pending' });

      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('status', 'pending');
    });

    it('does not apply status eq filter when filter is "all"', async () => {
      await getConsultationList({ offset: 0, limit: 5, filter: 'all' });

      const statusCall = mockQueryBuilder.eq.mock.calls.find((call: string[]) => call[0] === 'status');
      expect(statusCall).toBeUndefined();
    });

    it('does not apply status eq filter when filter is undefined', async () => {
      await getConsultationList({ offset: 0, limit: 5 });

      const statusCall = mockQueryBuilder.eq.mock.calls.find((call: string[]) => call[0] === 'status');
      expect(statusCall).toBeUndefined();
    });
  });
});

describe('markConsultation', () => {
  let mockQueryBuilder: ReturnType<typeof createQueryBuilder>;
  let mockFrom: ReturnType<typeof vi.fn>;

  function setupBuilder(resolvedValue: { error?: any }) {
    mockQueryBuilder = createQueryBuilder(resolvedValue);
    mockFrom = vi.fn().mockReturnValue(mockQueryBuilder);
    mockCreateClient.mockResolvedValue({ from: mockFrom } as any);
  }

  beforeEach(() => {
    mockGetVerifiedUserData.mockResolvedValue({ userId: USER_ID, firstName: 'John', lastName: 'Doe' });
    setupBuilder({ error: null });
  });

  it('returns success when the update succeeds', async () => {
    const result = await markConsultation({ id: 'c-1', is_completed: true });

    expect(result).toEqual({ success: true });
  });

  it('returns failure when Supabase returns an error', async () => {
    setupBuilder({ error: { message: 'update failed' } });

    const result = await markConsultation({ id: 'c-1', is_completed: false });

    expect(result).toEqual({ success: false });
  });

  it('targets the consultations table with the correct is_completed value', async () => {
    await markConsultation({ id: 'c-1', is_completed: true });

    expect(mockFrom).toHaveBeenCalledWith(DB.TABLE_CONSULTATIONS);
    expect(mockQueryBuilder.update).toHaveBeenCalledWith({ is_completed: true });
  });

  it('scopes the update to the consultation id and user id', async () => {
    await markConsultation({ id: 'c-42', is_completed: false });

    expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'c-42');
    expect(mockQueryBuilder.eq).toHaveBeenCalledWith('user_id', USER_ID);
  });

  it('calls rethrowRedirectError and returns failure when an exception is thrown', async () => {
    const thrownError = new Error('unexpected');
    mockCreateClient.mockRejectedValue(thrownError);

    const result = await markConsultation({ id: 'c-1', is_completed: true });

    expect(mockRethrowRedirectError).toHaveBeenCalledWith(thrownError);
    expect(result).toEqual({ success: false });
  });
});

describe('getConsultationStats', () => {
  let mockRpc: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockRpc = vi.fn();
    mockGetVerifiedUserData.mockResolvedValue({ userId: USER_ID, firstName: 'John', lastName: 'Doe' });
    mockCreateClient.mockResolvedValue({ rpc: mockRpc } as any);
  });

  it('returns success with data when the RPC succeeds', async () => {
    const statsData = [{ total: 10, complete: 5, incomplete: 3, upcoming: 2, pending: 0 }];
    mockRpc.mockResolvedValue({ data: statsData, error: null });

    const result = await getConsultationStats();

    expect(result).toEqual({ success: true, data: statsData });
  });

  it('calls the correct RPC function with the user id', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null });

    await getConsultationStats();

    expect(mockRpc).toHaveBeenCalledWith(DB.PL_PGSQL_GET_CONSULTATION_COUNTS_BY_STATUS, {
      user_id: USER_ID,
    });
  });

  it('returns failure with empty data when Supabase returns an error', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'RPC error' } });

    const result = await getConsultationStats();

    expect(result).toEqual({ success: false, data: [] });
  });

  it('returns success with empty array when data is null and there is no error', async () => {
    mockRpc.mockResolvedValue({ data: null, error: null });

    const result = await getConsultationStats();

    expect(result).toEqual({ success: true, data: [] });
  });

  it('calls rethrowRedirectError and returns failure when an exception is thrown', async () => {
    const thrownError = new Error('unexpected');
    mockCreateClient.mockRejectedValue(thrownError);

    const result = await getConsultationStats();

    expect(mockRethrowRedirectError).toHaveBeenCalledWith(thrownError);
    expect(result).toEqual({ success: false, data: [] });
  });
});
