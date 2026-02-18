import { expect, vi } from 'vitest';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

import { SignIn } from '@/app/auth/sign-in/actions';
import { ERRORS } from '@/constants/common';
import * as supabaseServer from '@/lib/supabase/server';

const mockCreateClient = vi.mocked(supabaseServer.createClient);

const credentials = { email: 'user@example.com', password: 'Password1!' };

describe('SignIn', () => {
  let mockSignInWithPassword: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockSignInWithPassword = vi.fn();
    mockCreateClient.mockResolvedValue({
      auth: { signInWithPassword: mockSignInWithPassword },
    } as any);
  });

  it('returns success when Supabase reports no error', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });

    const result = await SignIn(credentials);

    expect(result).toEqual({ success: true, error: null });
  });

  it('forwards email and password to signInWithPassword', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });

    await SignIn(credentials);

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: credentials.email,
      password: credentials.password,
    });
  });

  it('returns failure with Supabase error message', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: { message: 'Invalid credentials' } });

    const result = await SignIn(credentials);

    expect(result).toEqual({ success: false, error: 'Invalid credentials' });
  });

  it('returns failure with error message when an Error is thrown', async () => {
    mockCreateClient.mockRejectedValue(new Error('Network error'));

    const result = await SignIn(credentials);

    expect(result).toEqual({ success: false, error: 'Network error' });
  });

  it('returns generic error message when a non-Error is thrown', async () => {
    mockCreateClient.mockRejectedValue('unexpected string');

    const result = await SignIn(credentials);

    expect(result).toEqual({ success: false, error: ERRORS.AN_ERROR_OCCURRED });
  });
});
