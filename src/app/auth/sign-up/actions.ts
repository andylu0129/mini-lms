"use server";

import { createClient } from "@/lib/supabase/server";

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
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/login`,
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}
