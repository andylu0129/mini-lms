'use server';

import { ERRORS } from '@/constants/common';
import { ROUTES } from '@/constants/routes';
import { createClient } from '@/lib/supabase/server';

export async function signUp({
  firstName,
  lastName,
  email,
  password,
  origin,
}: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  origin: string;
}) {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: `${origin}${ROUTES.SIGN_IN}`,
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (error) {
      // Prevent account enumeration by returning a successful response for the user exists error.
      return error.code === ERRORS.CODE_USER_EXISTS
        ? { success: true, error: null }
        : { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : ERRORS.AN_ERROR_OCCURRED,
    };
  }
}
