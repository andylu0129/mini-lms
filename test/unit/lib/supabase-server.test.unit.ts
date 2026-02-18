import { expect, vi } from 'vitest';

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}));

// redirect() in Next.js throws internally to halt execution. This is to replicate
// the behaviour that the function under test stops after the redirect call.
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

import { ROUTES } from '@/constants/routes';
import { clearAuthCookies, getVerifiedUserData } from '@/lib/supabase/server';
import * as supabaseSSR from '@supabase/ssr';
import * as nextHeaders from 'next/headers';
import * as nextNavigation from 'next/navigation';

const mockCookies = vi.mocked(nextHeaders.cookies);
const mockCreateServerClient = vi.mocked(supabaseSSR.createServerClient);
const mockRedirect = vi.mocked(nextNavigation.redirect);

beforeEach(() => {
  vi.clearAllMocks();
  mockRedirect.mockImplementation(() => {
    throw new Error('NEXT_REDIRECT');
  });
});

describe('clearAuthCookies', () => {
  function buildCookieStore(allCookies: Array<{ name: string; value: string }>) {
    const mockDelete = vi.fn();
    const store = { getAll: vi.fn().mockReturnValue(allCookies), delete: mockDelete, set: vi.fn() };
    mockCookies.mockResolvedValue(store as any);
    return mockDelete;
  }

  it('deletes every cookie whose name starts with "sb-"', async () => {
    const mockDelete = buildCookieStore([
      { name: 'sb-access-token', value: 'abc' },
      { name: 'sb-refresh-token', value: 'xyz' },
    ]);

    await clearAuthCookies();

    expect(mockDelete).toHaveBeenCalledTimes(2);
    expect(mockDelete).toHaveBeenCalledWith('sb-access-token');
    expect(mockDelete).toHaveBeenCalledWith('sb-refresh-token');
  });

  it('does not delete cookies whose names do not start with "sb-"', async () => {
    const mockDelete = buildCookieStore([
      { name: 'session', value: 'abc' },
      { name: 'theme', value: 'dark' },
    ]);

    await clearAuthCookies();

    expect(mockDelete).not.toHaveBeenCalled();
  });

  it('only deletes sb- cookies when the store contains a mix', async () => {
    const mockDelete = buildCookieStore([
      { name: 'sb-token', value: 'abc' },
      { name: 'session', value: 'xyz' },
      { name: 'sb-other', value: '123' },
    ]);

    await clearAuthCookies();

    expect(mockDelete).toHaveBeenCalledTimes(2);
    expect(mockDelete).toHaveBeenCalledWith('sb-token');
    expect(mockDelete).toHaveBeenCalledWith('sb-other');
  });

  it('does nothing when the cookie store is empty', async () => {
    const mockDelete = buildCookieStore([]);

    await clearAuthCookies();

    expect(mockDelete).not.toHaveBeenCalled();
  });
});

describe('getVerifiedUserData', () => {
  let mockGetUser: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Provide a minimal cookie store so createClient() can initialise.
    mockCookies.mockResolvedValue({ getAll: vi.fn().mockReturnValue([]), set: vi.fn() } as any);

    mockGetUser = vi.fn();
    mockCreateServerClient.mockReturnValue({ auth: { getUser: mockGetUser } } as any);
  });

  it('returns userId, firstName, and lastName when the user is valid', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123', user_metadata: { first_name: 'John', last_name: 'Doe' } } },
      error: null,
    });

    const result = await getVerifiedUserData();

    expect(result).toEqual({ userId: 'user-123', firstName: 'John', lastName: 'Doe' });
  });

  it('returns undefined for firstName and lastName when user_metadata has no names', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123', user_metadata: {} } },
      error: null,
    });

    const result = await getVerifiedUserData();

    expect(result.userId).toBe('user-123');
    expect(result.firstName).toBeUndefined();
    expect(result.lastName).toBeUndefined();
  });

  it('redirects to sign-in when user is null', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    await expect(getVerifiedUserData()).rejects.toThrow('NEXT_REDIRECT');
    expect(mockRedirect).toHaveBeenCalledWith(ROUTES.SIGN_IN);
  });

  it('redirects to sign-in when user id is falsy', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: '', user_metadata: {} } },
      error: null,
    });

    await expect(getVerifiedUserData()).rejects.toThrow('NEXT_REDIRECT');
    expect(mockRedirect).toHaveBeenCalledWith(ROUTES.SIGN_IN);
  });

  it('redirects to sign-in when Supabase returns an error', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' },
    });

    await expect(getVerifiedUserData()).rejects.toThrow('NEXT_REDIRECT');
    expect(mockRedirect).toHaveBeenCalledWith(ROUTES.SIGN_IN);
  });
});
