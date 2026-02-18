import { expect, vi } from 'vitest';

// vi.mock() calls are hoisted, so they must appear before any imports that
// use the mocked modules.
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  getVerifiedUserData: vi.fn(),
}));

vi.mock('@/utils/error-utils', () => ({
  rethrowRedirectError: vi.fn(),
}));

import { createConsultation } from '@/app/(protected)/dashboard/consultation-booking/actions';
import { DB } from '@/constants/common';
import * as supabaseServer from '@/lib/supabase/server';
import * as errorUtils from '@/utils/error-utils';

const mockCreateClient = vi.mocked(supabaseServer.createClient);
const mockGetVerifiedUserData = vi.mocked(supabaseServer.getVerifiedUserData);
const mockRethrowRedirectError = vi.mocked(errorUtils.rethrowRedirectError);

const USER_ID = 'user-123';
const USER_DATA = { userId: USER_ID, firstName: 'John', lastName: 'Doe' };
const FORM_DATA = { reason: 'Career advice', scheduled_at: '2026-06-01T10:00:00Z' };

/**
 * Creates a mock Supabase query builder for insert operations.
 *
 * `insert()` returns `this` so that `await supabase.from(...).insert({...})`
 * resolves via the thenable `then` property on the builder.
 */
function createQueryBuilder(resolvedValue: { error?: any }) {
  const builder: any = {
    insert: vi.fn().mockReturnThis(),
    then: (resolve: (value: any) => any, reject?: (reason: any) => any) =>
      Promise.resolve(resolvedValue).then(resolve, reject),
  };
  return builder;
}

describe('createConsultation', () => {
  let mockQueryBuilder: ReturnType<typeof createQueryBuilder>;
  let mockFrom: ReturnType<typeof vi.fn>;

  function setupBuilder(resolvedValue: { error?: any }) {
    mockQueryBuilder = createQueryBuilder(resolvedValue);
    mockFrom = vi.fn().mockReturnValue(mockQueryBuilder);
    mockCreateClient.mockResolvedValue({ from: mockFrom } as any);
  }

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetVerifiedUserData.mockResolvedValue(USER_DATA);
    setupBuilder({ error: null });
  });

  it('returns success when the insert succeeds', async () => {
    const result = await createConsultation(FORM_DATA);

    expect(result).toEqual({ success: true });
  });

  it('returns failure when Supabase returns an error', async () => {
    setupBuilder({ error: { message: 'insert failed' } });

    const result = await createConsultation(FORM_DATA);

    expect(result).toEqual({ success: false });
  });

  it('inserts into the consultations table with all required fields', async () => {
    await createConsultation(FORM_DATA);

    expect(mockFrom).toHaveBeenCalledWith(DB.TABLE_CONSULTATIONS);
    expect(mockQueryBuilder.insert).toHaveBeenCalledWith({
      user_id: USER_DATA.userId,
      first_name: USER_DATA.firstName,
      last_name: USER_DATA.lastName,
      reason: FORM_DATA.reason,
      scheduled_at: FORM_DATA.scheduled_at,
    });
  });

  it('calls rethrowRedirectError and returns failure when an exception is thrown', async () => {
    const thrownError = new Error('unexpected');
    mockCreateClient.mockRejectedValue(thrownError);

    const result = await createConsultation(FORM_DATA);

    expect(mockRethrowRedirectError).toHaveBeenCalledWith(thrownError);
    expect(result).toEqual({ success: false });
  });
});
