import { expect, vi } from 'vitest';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

import { signUp } from '@/app/auth/sign-up/actions';
import { ERRORS } from '@/constants/common';
import { ROUTES } from '@/constants/routes';
import * as supabaseServer from '@/lib/supabase/server';

const mockCreateClient = vi.mocked(supabaseServer.createClient);

const validInput = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  password: 'Password1!',
  origin: 'https://example.com',
};

describe('signUp', () => {
  let mockAuthSignUp: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockAuthSignUp = vi.fn();
    mockCreateClient.mockResolvedValue({
      auth: { signUp: mockAuthSignUp },
    } as any);
  });

  it('returns success when Supabase reports no error', async () => {
    mockAuthSignUp.mockResolvedValue({ error: null });

    const result = await signUp(validInput);

    expect(result).toEqual({ success: true, error: null });
  });

  it('passes the correct payload to supabase.auth.signUp', async () => {
    mockAuthSignUp.mockResolvedValue({ error: null });

    await signUp(validInput);

    expect(mockAuthSignUp).toHaveBeenCalledWith({
      email: validInput.email,
      password: validInput.password,
      options: {
        emailRedirectTo: `${validInput.origin}${ROUTES.SIGN_IN}`,
        data: {
          first_name: validInput.firstName,
          last_name: validInput.lastName,
        },
      },
    });
  });

  it('constructs emailRedirectTo by appending the sign-in route to origin', async () => {
    mockAuthSignUp.mockResolvedValue({ error: null });
    const customOrigin = 'https://myapp.com';

    await signUp({ ...validInput, origin: customOrigin });

    expect(mockAuthSignUp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          emailRedirectTo: `${customOrigin}${ROUTES.SIGN_IN}`,
        }),
      }),
    );
  });

  it('returns success when user already exists to prevent account enumeration', async () => {
    mockAuthSignUp.mockResolvedValue({ error: { code: ERRORS.CODE_USER_EXISTS } });

    const result = await signUp(validInput);

    expect(result).toEqual({ success: true, error: null });
  });

  it('returns failure with Supabase error message', async () => {
    const mockErrorMessage = 'Mock error message';
    mockAuthSignUp.mockResolvedValue({ error: { message: mockErrorMessage } });

    const result = await signUp(validInput);

    expect(result).toEqual({ success: false, error: mockErrorMessage });
  });

  it('returns failure with error message when an Error is thrown', async () => {
    mockCreateClient.mockRejectedValue(new Error('Network failure'));

    const result = await signUp(validInput);

    expect(result).toEqual({ success: false, error: 'Network failure' });
  });

  it('returns generic error message when a non-Error is thrown', async () => {
    mockCreateClient.mockRejectedValue(42);

    const result = await signUp(validInput);

    expect(result).toEqual({ success: false, error: ERRORS.AN_ERROR_OCCURRED });
  });
});
