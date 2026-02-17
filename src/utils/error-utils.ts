import { isRedirectError } from 'next/dist/client/components/redirect-error';

export function rethrowRedirectError(error: unknown) {
  if (isRedirectError(error)) throw error;
}
