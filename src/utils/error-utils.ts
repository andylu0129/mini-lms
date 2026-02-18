import { isRedirectError } from 'next/dist/client/components/redirect-error';

export const rethrowRedirectError = (error: unknown) => {
  if (isRedirectError(error)) {
    throw error;
  }
};
