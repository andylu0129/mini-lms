import { expect, vi } from 'vitest';

// Must be called before importing any module that uses the mocked dependency.
// Vitest hoists vi.mock() calls automatically.
vi.mock('next/dist/client/components/redirect-error', () => ({
  isRedirectError: vi.fn(),
}));

import { rethrowRedirectError } from '@/utils/error-utils';
import * as redirectErrorModule from 'next/dist/client/components/redirect-error';

const mockIsRedirectError = vi.mocked(redirectErrorModule.isRedirectError);

describe('rethrowRedirectError', () => {
  beforeEach(() => {
    mockIsRedirectError.mockReset();
  });

  it('calls isRedirectError with the exact error passed in', () => {
    mockIsRedirectError.mockReturnValue(false);
    const error = new Error('test error');

    rethrowRedirectError(error);

    expect(mockIsRedirectError).toHaveBeenCalledOnce();
    expect(mockIsRedirectError).toHaveBeenCalledWith(error);
  });

  it('does not throw when isRedirectError returns false', () => {
    mockIsRedirectError.mockReturnValue(false);

    expect(() => rethrowRedirectError(new Error('regular error'))).not.toThrow();
  });

  it('does not throw for a null error', () => {
    mockIsRedirectError.mockReturnValue(false);

    expect(() => rethrowRedirectError(null)).not.toThrow();
  });

  it('does not throw for an undefined error', () => {
    mockIsRedirectError.mockReturnValue(false);

    expect(() => rethrowRedirectError(undefined)).not.toThrow();
  });

  it('does not throw for a plain string error', () => {
    mockIsRedirectError.mockReturnValue(false);

    expect(() => rethrowRedirectError('error string')).not.toThrow();
  });

  it('rethrows the exact error when isRedirectError returns true', () => {
    mockIsRedirectError.mockReturnValue(true);
    const redirectError = new Error('redirect');

    expect(() => rethrowRedirectError(redirectError)).toThrow(redirectError);
  });
});
